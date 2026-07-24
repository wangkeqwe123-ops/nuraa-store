import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { CART_COOKIE, getActiveCart } from "@/features/cart/cart.service";

const saudiPhone = z
  .string()
  .trim()
  .regex(/^(?:\+9665\d{8}|05\d{8})$/)
  .transform((value) =>
    value.startsWith("05") ? `+966${value.slice(1)}` : value,
  );

const checkoutSchema = z.object({
  locale: z.enum(["en", "ar"]),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: saudiPhone,
  country: z.literal("SA"),
  city: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(120),
  street: z.string().trim().min(2).max(200),
  building: z.string().trim().min(1).max(50),
  apartment: z.string().trim().max(50).optional().default(""),
  postalCode: z.string().trim().regex(/^\d{5}$/),
  shippingMethod: z.literal("STANDARD"),
  notes: z.string().trim().max(500).optional().default(""),
  utmSource: z.string().max(100).nullable().optional(),
  utmCampaign: z.string().max(200).nullable().optional(),
  utmContent: z.string().max(200).nullable().optional(),
});

const orderNumber = () =>
  `NUR-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;

const money = (value: number) => Math.round(value * 100) / 100;

function positiveEnvironmentNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export async function POST(request: NextRequest) {
  const parsed = checkoutSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check your contact and Saudi delivery address.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const cartToken = request.cookies.get(CART_COOKIE)?.value;
  const cart = await getActiveCart(cartToken);
  if (!cart || !cart.items.length) {
    return NextResponse.json(
      { error: "Your bag is empty or has already been submitted." },
      { status: 409 },
    );
  }

  for (const item of cart.items) {
    if (
      item.product.status !== "ACTIVE"
      || item.product.deletedAt
      || item.product.stock < item.quantity
      || item.product.currency !== "SAR"
    ) {
      return NextResponse.json(
        {
          error:
            "One or more products are unavailable or have insufficient stock.",
        },
        { status: 409 },
      );
    }
  }

  const subtotal = money(
    cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    ),
  );
  const freeThreshold = positiveEnvironmentNumber(
    "STORE_FREE_SHIPPING_THRESHOLD_SAR",
    250,
  );
  const standardShipping = positiveEnvironmentNumber(
    "STORE_SHIPPING_FEE_SAR",
    25,
  );
  const taxRate = positiveEnvironmentNumber("STORE_TAX_RATE", 0);
  const shippingAmount = subtotal >= freeThreshold ? 0 : standardShipping;
  const taxAmount = money(subtotal * taxRate);
  const totalAmount = money(subtotal + shippingAmount + taxAmount);
  const publicToken = randomBytes(32).toString("hex");
  const number = orderNumber();
  const reservationExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const order = await db
    .$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { email: data.email.toLowerCase() },
        update: {
          name: data.name,
          phone: data.phone,
          locale: data.locale === "ar" ? "AR" : "EN",
        },
        create: {
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone,
          locale: data.locale === "ar" ? "AR" : "EN",
        },
      });

      for (const item of cart.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
            status: "ACTIVE",
            deletedAt: null,
          },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) throw new Error("INSUFFICIENT_STOCK");
      }

      const created = await tx.order.create({
        data: {
          orderNumber: number,
          publicToken,
          cartId: cart.id,
          customerId: customer.id,
          status: "PENDING_PAYMENT",
          paymentStatus: "PENDING",
          fulfillmentStatus: "UNFULFILLED",
          subtotal,
          shippingAmount,
          taxAmount,
          totalAmount,
          currency: "SAR",
          locale: data.locale === "ar" ? "AR" : "EN",
          customerName: data.name,
          customerEmail: data.email.toLowerCase(),
          customerPhone: data.phone,
          shippingAddress: {
            country: data.country,
            city: data.city,
            district: data.district,
            street: data.street,
            building: data.building,
            apartment: data.apartment || null,
            postalCode: data.postalCode,
            shippingMethod: data.shippingMethod,
          },
          utmSource: data.utmSource?.toLowerCase() || null,
          utmCampaign: data.utmCampaign || null,
          utmContent: data.utmContent || null,
          notes: data.notes || null,
          items: {
            create: cart.items.map((item) => {
              const translation =
                item.product.translations.find(
                  (entry) =>
                    entry.locale === (data.locale === "ar" ? "AR" : "EN"),
                )
                ?? item.product.translations.find(
                  (entry) => entry.locale === "EN",
                );
              const image =
                item.product.media.find(
                  (entry) =>
                    entry.type === "MAIN_IMAGE" && entry.isPrimary,
                )?.url
                ?? item.product.media.find(
                  (entry) => entry.type === "MAIN_IMAGE",
                )?.url
                ?? item.product.media[0]?.url;
              const unitPrice = Number(item.product.price);
              return {
                productId: item.productId,
                sku: item.product.sku,
                productName: translation?.name ?? item.product.slug,
                imageUrl: image,
                unitPrice,
                quantity: item.quantity,
                lineTotal: money(unitPrice * item.quantity),
              };
            }),
          },
          shipment: { create: { status: "PENDING" } },
          reservations: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              status: "ACTIVE",
              expiresAt: reservationExpiresAt,
            })),
          },
        },
        select: { id: true, orderNumber: true },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { status: "CONVERTED" },
      });
      return created;
    })
    .catch((error: unknown) => {
      if (
        error instanceof Error
        && (
          error.message === "INSUFFICIENT_STOCK"
          || error.message.includes("Unique constraint")
        )
      ) {
        return null;
      }
      throw error;
    });

  if (!order) {
    return NextResponse.json(
      {
        error:
          "Stock changed while creating the order. Please review your bag.",
      },
      { status: 409 },
    );
  }

  const response = NextResponse.json(
    {
      ok: true,
      orderNumber: order.orderNumber,
      redirectUrl: `/${data.locale}/orders/${publicToken}`,
    },
    { status: 201 },
  );
  response.cookies.delete(CART_COOKIE);
  return response;
}
