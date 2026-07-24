export const commerceOrderStatuses = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type CommerceOrderStatus = (typeof commerceOrderStatuses)[number];

export type OrderStatusSource = {
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
};

export function getCommerceOrderStatus(
  order: OrderStatusSource,
): CommerceOrderStatus {
  if (order.status === "CANCELLED") return "CANCELLED";
  if (
    order.status === "COMPLETED"
    || order.fulfillmentStatus === "DELIVERED"
  ) {
    return "COMPLETED";
  }
  if (order.fulfillmentStatus === "SHIPPED") return "SHIPPED";
  if (order.fulfillmentStatus === "PROCESSING") return "PROCESSING";
  if (
    order.paymentStatus === "PAID"
    || order.status === "CONFIRMED"
  ) {
    return "PAID";
  }
  return "PENDING";
}

export function commerceStatusLabel(status: CommerceOrderStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
