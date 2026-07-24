"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  commerceOrderStatuses,
  getCommerceOrderStatus,
  type CommerceOrderStatus,
} from "@/features/orders/order-status";

const updateSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(commerceOrderStatuses),
  carrier: z.string().trim().max(80).optional(),
  trackingNumber: z.string().trim().max(120).optional(),
});

const statusRank: Record<Exclude<CommerceOrderStatus, "CANCELLED">, number> = {
  PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  COMPLETED: 4,
};

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid order update");

  const {
    orderId,
    status: targetStatus,
    carrier,
    trackingNumber,
  } = parsed.data;
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { reservations: true },
  });
  if (!order) throw new Error("Order not found");

  const currentStatus = getCommerceOrderStatus(order);
  if (currentStatus === "CANCELLED") {
    throw new Error("Cancelled orders cannot be changed");
  }
  if (
    targetStatus !== "CANCELLED"
    && statusRank[targetStatus] < statusRank[currentStatus]
  ) {
    throw new Error("Order status cannot move backwards");
  }
  if (
    (targetStatus === "SHIPPED" || targetStatus === "COMPLETED")
    && !trackingNumber
  ) {
    throw new Error("A tracking number is required before shipping");
  }

  await db.$transaction(async (tx) => {
    if (targetStatus === "CANCELLED") {
      const restorableReservations = order.reservations.filter(
        (reservation) => reservation.status !== "RELEASED",
      );
      for (const reservation of restorableReservations) {
        await tx.product.update({
          where: { id: reservation.productId },
          data: { stock: { increment: reservation.quantity } },
        });
      }
      await tx.inventoryReservation.updateMany({
        where: {
          orderId,
          status: { in: ["ACTIVE", "CONSUMED"] },
        },
        data: { status: "RELEASED" },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
      return;
    }

    const isPaid = statusRank[targetStatus] >= statusRank.PAID;
    const fulfillmentStatus =
      targetStatus === "COMPLETED"
        ? "DELIVERED"
        : targetStatus === "SHIPPED"
          ? "SHIPPED"
          : targetStatus === "PROCESSING"
            ? "PROCESSING"
            : "UNFULFILLED";
    const orderStatus =
      targetStatus === "PENDING"
        ? "PENDING_PAYMENT"
        : targetStatus === "COMPLETED"
          ? "COMPLETED"
          : "CONFIRMED";
    const shipmentStatus =
      targetStatus === "COMPLETED"
        ? "DELIVERED"
        : targetStatus === "SHIPPED"
          ? "SHIPPED"
          : "PENDING";
    const now = new Date();

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus,
        paymentStatus: isPaid ? "PAID" : "PENDING",
        fulfillmentStatus,
      },
    });

    await tx.shipment.upsert({
      where: { orderId },
      create: {
        orderId,
        carrier: carrier || null,
        trackingNumber: trackingNumber || null,
        status: shipmentStatus,
        shippedAt:
          shipmentStatus === "SHIPPED" || shipmentStatus === "DELIVERED"
            ? now
            : null,
        deliveredAt: shipmentStatus === "DELIVERED" ? now : null,
      },
      update: {
        carrier: carrier || null,
        trackingNumber: trackingNumber || null,
        status: shipmentStatus,
        ...(shipmentStatus === "SHIPPED" ? { shippedAt: now } : {}),
        ...(shipmentStatus === "DELIVERED"
          ? { shippedAt: now, deliveredAt: now }
          : {}),
      },
    });

    if (isPaid && order.paymentStatus !== "PAID") {
      await tx.payment.upsert({
        where: { idempotencyKey: `admin:${orderId}` },
        update: { status: "PAID", paidAt: now },
        create: {
          orderId,
          provider: "MANUAL",
          status: "PAID",
          amount: order.totalAmount,
          currency: order.currency,
          idempotencyKey: `admin:${orderId}`,
          paidAt: now,
          metadata: { source: "admin-order-status" },
        },
      });
    }
    if (isPaid) {
      await tx.inventoryReservation.updateMany({
        where: { orderId, status: "ACTIVE" },
        data: { status: "CONSUMED" },
      });
    }
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
