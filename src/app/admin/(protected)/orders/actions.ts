"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  orderId: z.string().min(1),
  fulfillmentStatus: z.enum(["UNFULFILLED", "PROCESSING", "SHIPPED", "DELIVERED"]),
  carrier: z.string().trim().max(80).optional(),
  trackingNumber: z.string().trim().max(120).optional(),
});

export async function updateFulfillment(formData: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid fulfillment update");
  const { orderId, fulfillmentStatus, carrier, trackingNumber } = parsed.data;
  const order = await db.order.findUnique({ where: { id: orderId }, select: { paymentStatus: true } });
  if (!order) throw new Error("Order not found");
  if (order.paymentStatus !== "PAID") throw new Error("Only paid orders can be fulfilled");
  const shipmentStatus = fulfillmentStatus === "DELIVERED" ? "DELIVERED" : fulfillmentStatus === "SHIPPED" ? "SHIPPED" : "PENDING";
  const now = new Date();
  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { fulfillmentStatus, status: fulfillmentStatus === "DELIVERED" ? "COMPLETED" : "CONFIRMED" } }),
    db.shipment.upsert({
      where: { orderId },
      create: { orderId, carrier: carrier || null, trackingNumber: trackingNumber || null, status: shipmentStatus, shippedAt: shipmentStatus === "SHIPPED" || shipmentStatus === "DELIVERED" ? now : null, deliveredAt: shipmentStatus === "DELIVERED" ? now : null },
      update: { carrier: carrier || null, trackingNumber: trackingNumber || null, status: shipmentStatus, ...(shipmentStatus === "SHIPPED" ? { shippedAt: now } : {}), ...(shipmentStatus === "DELIVERED" ? { shippedAt: now, deliveredAt: now } : {}) },
    }),
  ]);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
