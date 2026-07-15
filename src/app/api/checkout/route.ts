import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { CART_COOKIE, getActiveCart } from "@/features/cart/cart.service";
import { paymentReadiness } from "@/features/checkout/payment-provider";

const schema = z.object({
  locale: z.enum(["en", "ar"]),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().regex(/^\+9665\d{8}$/),
  city: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(120),
  street: z.string().trim().min(2).max(200),
  building: z.string().trim().min(1).max(50),
  apartment: z.string().trim().max(50).optional().default(""),
  postalCode: z.string().trim().regex(/^\d{5}$/),
  notes: z.string().trim().max(500).optional().default(""),
  visitorId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  utmSource: z.string().max(100).nullable().optional(),
  utmCampaign: z.string().max(200).nullable().optional(),
  utmContent: z.string().max(200).nullable().optional(),
});

const orderNumber = () => `NUR-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
const riyadhDate = () => {
  const value = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return new Date(`${value}T00:00:00.000Z`);
};

export async function POST(request: NextRequest) {
  const readiness = paymentReadiness();
  if (!readiness.ready) return NextResponse.json({ error: readiness.message, code: "PAYMENT_NOT_CONFIGURED" }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your contact and Saudi delivery address.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  const data = parsed.data;
  const token = request.cookies.get(CART_COOKIE)?.value;
  const cart = await getActiveCart(token);
  if (!cart || !cart.items.length) return NextResponse.json({ error: "Your bag is empty." }, { status: 409 });

  for (const item of cart.items) {
    if (item.product.status !== "ACTIVE" || item.product.deletedAt || item.product.stock < item.quantity) {
      return NextResponse.json({ error: "One or more products are unavailable or have insufficient stock." }, { status: 409 });
    }
  }
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const freeThreshold = Number(process.env.STORE_FREE_SHIPPING_THRESHOLD_SAR ?? 250);
  const standardShipping = Number(process.env.STORE_SHIPPING_FEE_SAR ?? 25);
  const taxRate = Number(process.env.STORE_TAX_RATE ?? 0);
  const shippingAmount = subtotal >= freeThreshold ? 0 : standardShipping;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const totalAmount = subtotal + shippingAmount + taxAmount;
  const publicToken = randomBytes(32).toString("hex");
  const number = orderNumber();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const order = await db.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email: data.email.toLowerCase() },
      update: { name: data.name, phone: data.phone, locale: data.locale === "ar" ? "AR" : "EN" },
      create: { name: data.name, email: data.email.toLowerCase(), phone: data.phone, locale: data.locale === "ar" ? "AR" : "EN" },
    });
    for (const item of cart.items) {
      const updated = await tx.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity }, status: "ACTIVE", deletedAt: null }, data: { stock: { decrement: item.quantity } } });
      if (updated.count !== 1) throw new Error("INSUFFICIENT_STOCK");
    }
    const created = await tx.order.create({
      data: {
        orderNumber: number,
        publicToken,
        cartId: cart.id,
        customerId: customer.id,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        subtotal,
        shippingAmount,
        taxAmount,
        totalAmount,
        locale: data.locale === "ar" ? "AR" : "EN",
        customerName: data.name,
        customerEmail: data.email.toLowerCase(),
        customerPhone: data.phone,
        shippingAddress: { country: "SA", city: data.city, district: data.district, street: data.street, building: data.building, apartment: data.apartment, postalCode: data.postalCode },
        utmSource: data.utmSource?.toLowerCase() || null,
        utmCampaign: data.utmCampaign || null,
        utmContent: data.utmContent || null,
        notes: data.notes || null,
        items: { create: cart.items.map((item) => {
          const translation = item.product.translations.find((entry) => entry.locale === (data.locale === "ar" ? "AR" : "EN")) ?? item.product.translations[0];
          const image = item.product.media.find((entry) => entry.type === "MAIN_IMAGE" && entry.isPrimary)?.url ?? item.product.media[0]?.url;
          const unitPrice = Number(item.product.price);
          return { productId: item.productId, sku: item.product.sku, productName: translation?.name ?? item.product.slug, imageUrl: image, unitPrice, quantity: item.quantity, lineTotal: unitPrice * item.quantity };
        }) },
        payments: { create: { provider: "MOCK", status: "PAID", amount: totalAmount, idempotencyKey: `mock:${number}`, providerPaymentId: `mock_${randomBytes(8).toString("hex")}`, paidAt: new Date(), metadata: { environment: "development" } } },
        shipment: { create: {} },
        reservations: { create: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity, status: "CONSUMED", expiresAt })) },
      },
      include: { items: true },
    });
    await tx.cart.update({ where: { id: cart.id }, data: { status: "CONVERTED" } });
    if (data.visitorId && data.sessionId) {
      const date = riyadhDate();
      for (const item of created.items) {
        const fingerprint = createHash("sha256").update([data.utmSource?.toLowerCase() || null, null, data.utmCampaign || null, data.utmContent || null].join("|")).digest("hex");
        const traffic = await tx.trafficSource.upsert({ where: { fingerprint }, update: {}, create: { fingerprint, channel: data.utmSource?.toLowerCase().includes("tiktok") ? "TIKTOK" : "DIRECT", utmSource: data.utmSource?.toLowerCase() || null, utmCampaign: data.utmCampaign || null, utmContent: data.utmContent || null } });
        await tx.analyticsEvent.create({ data: { eventType: "PURCHASE", visitorId: data.visitorId, sessionId: data.sessionId, productId: item.productId, orderReference: number, quantity: item.quantity, revenue: item.lineTotal, currency: "SAR", path: `/${data.locale}/orders/${publicToken}`, trafficSourceId: traffic.id, deduplicationKey: `${number}:${item.productId}` } });
        await tx.productAnalytics.upsert({ where: { productId_date: { productId: item.productId!, date } }, create: { productId: item.productId!, date, purchases: 1, unitsSold: item.quantity, revenue: item.lineTotal }, update: { purchases: { increment: 1 }, unitsSold: { increment: item.quantity }, revenue: { increment: item.lineTotal } } });
      }
    }
    return created;
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") return null;
    throw error;
  });
  if (!order) return NextResponse.json({ error: "Stock changed while creating the order. Please review your bag." }, { status: 409 });
  return NextResponse.json({ ok: true, orderNumber: order.orderNumber, redirectUrl: `/${data.locale}/orders/${publicToken}` }, { status: 201 });
}
