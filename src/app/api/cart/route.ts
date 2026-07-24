import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  CART_COOKIE,
  CART_MAX_ITEM_QUANTITY,
  CART_TTL_DAYS,
  getActiveCart,
  serializeCart,
} from "@/features/cart/cart.service";
import { isLocale } from "@/i18n/config";

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(CART_MAX_ITEM_QUANTITY),
  locale: z.enum(["en", "ar"]).default("en"),
});
const changeSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).max(CART_MAX_ITEM_QUANTITY),
  locale: z.enum(["en", "ar"]).default("en"),
});
const expiry = () => new Date(Date.now() + CART_TTL_DAYS * 86400000);

function withCartCookie(response: NextResponse, token?: string) {
  if (token) response.cookies.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiry(),
  });
  return response;
}

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale = localeParam && isLocale(localeParam) ? localeParam : undefined;
  return NextResponse.json(
    await serializeCart(request.cookies.get(CART_COOKIE)?.value, locale),
  );
}

export async function POST(request: NextRequest) {
  const parsed = addSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
  const product = await db.product.findFirst({
    where: { id: parsed.data.productId, status: "ACTIVE", deletedAt: null },
    select: { id: true, stock: true },
  });
  if (!product || product.stock < 1) return NextResponse.json({ error: "Product is unavailable" }, { status: 409 });

  const existingToken = request.cookies.get(CART_COOKIE)?.value;
  const existingCart = await getActiveCart(existingToken);
  let cartId = existingCart?.id;
  let token: string | undefined;
  if (!cartId) {
    token = randomBytes(32).toString("hex");
    const cart = await db.cart.create({ data: { token, locale: parsed.data.locale === "ar" ? "AR" : "EN", expiresAt: expiry() } });
    cartId = cart.id;
  }
  const existing = await db.cartItem.findUnique({ where: { cartId_productId: { cartId, productId: product.id } } });
  const quantity = Math.min(
    product.stock,
    CART_MAX_ITEM_QUANTITY,
    (existing?.quantity ?? 0) + parsed.data.quantity,
  );
  await db.$transaction([
    db.cartItem.upsert({
      where: { cartId_productId: { cartId, productId: product.id } },
      update: { quantity },
      create: { cartId, productId: product.id, quantity },
    }),
    db.cart.update({ where: { id: cartId }, data: { expiresAt: expiry(), locale: parsed.data.locale === "ar" ? "AR" : "EN" } }),
  ]);
  return withCartCookie(
    NextResponse.json(
      await serializeCart(token ?? existingToken, parsed.data.locale),
      { status: 201 },
    ),
    token,
  );
}

export async function PATCH(request: NextRequest) {
  const parsed = changeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart change" }, { status: 400 });
  const token = request.cookies.get(CART_COOKIE)?.value;
  const cart = await getActiveCart(token);
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  const item = await db.cartItem.findFirst({ where: { id: parsed.data.itemId, cartId: cart.id }, include: { product: { select: { stock: true, status: true, deletedAt: true } } } });
  if (!item) return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  if (item.product.status !== "ACTIVE" || item.product.deletedAt || item.product.stock < 1) {
    return NextResponse.json({ error: "Product is unavailable" }, { status: 409 });
  }
  await db.$transaction([
    db.cartItem.update({
      where: { id: item.id },
      data: {
        quantity: Math.min(
          parsed.data.quantity,
          item.product.stock,
          CART_MAX_ITEM_QUANTITY,
        ),
      },
    }),
    db.cart.update({
      where: { id: cart.id },
      data: {
        expiresAt: expiry(),
        locale: parsed.data.locale === "ar" ? "AR" : "EN",
      },
    }),
  ]);
  return NextResponse.json(await serializeCart(token, parsed.data.locale));
}

export async function DELETE(request: NextRequest) {
  const parsed = z.object({
    itemId: z.string().min(1),
    locale: z.enum(["en", "ar"]).default("en"),
  }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
  const token = request.cookies.get(CART_COOKIE)?.value;
  const cart = await getActiveCart(token);
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  await db.cartItem.deleteMany({ where: { id: parsed.data.itemId, cartId: cart.id } });
  return NextResponse.json(await serializeCart(token, parsed.data.locale));
}
