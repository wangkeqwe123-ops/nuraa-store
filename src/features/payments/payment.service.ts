import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  getPaymentProvider,
} from "./payment-provider-registry";
import type {
  CreatePaymentResult,
  JsonValue,
  PaymentState,
  PaymentStatus,
} from "./payment-provider";

type CreatePaymentCommand = {
  orderId: string;
  provider: string;
  idempotencyKey: string;
  returnUrl?: string;
  cancelUrl?: string;
};

type RefundPaymentCommand = {
  paymentId: string;
  idempotencyKey: string;
  reason?: string;
};

type HandlePaymentWebhookCommand = {
  provider: string;
  headers: Readonly<Record<string, string>>;
  rawBody: string | Uint8Array;
};

function normalizeProviderName(name: string) {
  return name.trim().toUpperCase();
}

function jsonInput(value: JsonValue | Record<string, JsonValue>) {
  return value as Prisma.InputJsonValue;
}

function paymentRecordResult(payment: {
  id: string;
  provider: string;
  providerPaymentId: string | null;
  status: PaymentStatus;
  failureReason: string | null;
  paidAt: Date | null;
}) {
  return {
    paymentId: payment.id,
    provider: payment.provider,
    providerPaymentId: payment.providerPaymentId,
    status: payment.status,
    failureReason: payment.failureReason,
    paidAt: payment.paidAt,
  };
}

function stateUpdate(state: PaymentState) {
  return {
    providerPaymentId: state.providerPaymentId,
    status: state.status,
    ...(state.status === "PAID"
      ? { paidAt: state.paidAt ?? new Date() }
      : {}),
    failureReason:
      state.status === "FAILED" ? (state.failureReason ?? "Payment failed") : null,
    ...(state.metadata ? { metadata: jsonInput(state.metadata) } : {}),
  };
}

async function syncOrderPaymentState(
  tx: Prisma.TransactionClient,
  orderId: string,
  status: PaymentStatus,
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: { status: true, paymentStatus: true },
  });
  if (!order) throw new Error("Order not found while syncing payment");

  if (status === "PAID") {
    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        ...(order.status === "PENDING_PAYMENT" ? { status: "CONFIRMED" } : {}),
      },
    });
    await tx.inventoryReservation.updateMany({
      where: { orderId, status: "ACTIVE" },
      data: { status: "CONSUMED" },
    });
    return;
  }

  if (status === "REFUNDED") {
    await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: "REFUNDED" },
    });
    return;
  }

  // A delayed event from an older attempt must not downgrade a completed
  // payment or refund on the order.
  if (order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED") {
    return;
  }

  await tx.order.update({
    where: { id: orderId },
    data: { paymentStatus: status },
  });
}

async function persistProviderState(paymentId: string, state: PaymentState) {
  return db.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: stateUpdate(state),
    });
    await syncOrderPaymentState(tx, payment.orderId, state.status);
    return payment;
  });
}

export async function createPayment(
  command: CreatePaymentCommand,
): Promise<CreatePaymentResult & { paymentId: string }> {
  const providerName = normalizeProviderName(command.provider);
  const provider = getPaymentProvider(providerName);
  const order = await db.order.findUnique({
    where: { id: command.orderId },
    include: { customer: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.status === "CANCELLED" || order.status === "COMPLETED") {
    throw new Error(`Payment cannot be created for a ${order.status} order`);
  }

  const payment = await db.payment.upsert({
    where: { idempotencyKey: command.idempotencyKey },
    update: {},
    create: {
      orderId: order.id,
      provider: providerName,
      status: "PENDING",
      amount: order.totalAmount,
      currency: order.currency,
      idempotencyKey: command.idempotencyKey,
    },
  });

  if (payment.orderId !== order.id || payment.provider !== providerName) {
    throw new Error("Idempotency key is already assigned to another payment");
  }
  if (payment.providerPaymentId) {
    return {
      paymentId: payment.id,
      providerPaymentId: payment.providerPaymentId,
      status: payment.status,
      paidAt: payment.paidAt ?? undefined,
      failureReason: payment.failureReason ?? undefined,
    };
  }

  let result: CreatePaymentResult;
  try {
    result = await provider.createPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      money: {
        amount: order.totalAmount.toFixed(2),
        currency: order.currency,
      },
      customer: {
        id: order.customer.id,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      idempotencyKey: command.idempotencyKey,
      returnUrl: command.returnUrl,
      cancelUrl: command.cancelUrl,
      metadata: { orderNumber: order.orderNumber },
    });
  } catch (error) {
    const failureReason =
      error instanceof Error ? error.message : "Payment provider request failed";
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failureReason },
    });
    throw error;
  }

  // Provider success and local persistence are intentionally separate. A
  // database failure must never relabel a provider-approved payment as failed.
  await persistProviderState(payment.id, result);
  return { paymentId: payment.id, ...result };
}

export async function verifyPayment(paymentId: string) {
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment not found");
  if (!payment.providerPaymentId) {
    throw new Error("Payment has no provider payment identifier");
  }

  const provider = getPaymentProvider(payment.provider);
  const result = await provider.verifyPayment({
    providerPaymentId: payment.providerPaymentId,
    orderId: payment.orderId,
  });
  const updated = await persistProviderState(payment.id, result);
  return paymentRecordResult(updated);
}

export async function refundPayment(command: RefundPaymentCommand) {
  const payment = await db.payment.findUnique({ where: { id: command.paymentId } });
  if (!payment) throw new Error("Payment not found");
  if (payment.status !== "PAID") {
    throw new Error("Only a paid payment can be refunded");
  }
  if (!payment.providerPaymentId) {
    throw new Error("Payment has no provider payment identifier");
  }

  const provider = getPaymentProvider(payment.provider);
  const result = await provider.refundPayment({
    providerPaymentId: payment.providerPaymentId,
    orderId: payment.orderId,
    money: {
      amount: payment.amount.toFixed(2),
      currency: payment.currency,
    },
    idempotencyKey: command.idempotencyKey,
    reason: command.reason,
  });
  const updated = await persistProviderState(payment.id, result);
  return paymentRecordResult(updated);
}

export async function handlePaymentWebhook(
  command: HandlePaymentWebhookCommand,
) {
  const providerName = normalizeProviderName(command.provider);
  const provider = getPaymentProvider(providerName);
  const event = await provider.handleWebhook({
    headers: command.headers,
    rawBody: command.rawBody,
  });

  return db.$transaction(async (tx) => {
    const existing = await tx.webhookEvent.findUnique({
      where: {
        provider_externalEventId: {
          provider: providerName,
          externalEventId: event.externalEventId,
        },
      },
    });
    if (existing?.processedAt) {
      return { duplicate: true, matched: true, eventId: existing.id };
    }

    const webhookEvent = await tx.webhookEvent.upsert({
      where: {
        provider_externalEventId: {
          provider: providerName,
          externalEventId: event.externalEventId,
        },
      },
      update: {
        eventType: event.eventType,
        payload: jsonInput(event.payload),
      },
      create: {
        provider: providerName,
        externalEventId: event.externalEventId,
        eventType: event.eventType,
        payload: jsonInput(event.payload),
      },
    });

    const payment = await tx.payment.findUnique({
      where: { providerPaymentId: event.providerPaymentId },
    });
    if (!payment || payment.provider !== providerName) {
      return { duplicate: false, matched: false, eventId: webhookEvent.id };
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: stateUpdate(event),
    });
    await syncOrderPaymentState(tx, payment.orderId, event.status);
    await tx.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processedAt: new Date() },
    });

    return {
      duplicate: false,
      matched: true,
      eventId: webhookEvent.id,
      paymentId: payment.id,
      status: event.status,
    };
  });
}
