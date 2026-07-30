export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type Money = {
  /**
   * A base-unit decimal string, for example "249.00".
   * Strings avoid floating-point drift at provider boundaries.
   */
  amount: string;
  currency: string;
};

export type PaymentCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type CreatePaymentInput = {
  orderId: string;
  orderNumber: string;
  money: Money;
  customer: PaymentCustomer;
  idempotencyKey: string;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, JsonValue>;
};

export type PaymentState = {
  providerPaymentId: string;
  status: PaymentStatus;
  paidAt?: Date;
  failureReason?: string;
  metadata?: Record<string, JsonValue>;
};

export type CreatePaymentResult = PaymentState & {
  redirectUrl?: string;
  clientSecret?: string;
};

export type VerifyPaymentInput = {
  providerPaymentId: string;
  orderId: string;
};

export type VerifyPaymentResult = PaymentState;

export type RefundPaymentInput = {
  providerPaymentId: string;
  orderId: string;
  money: Money;
  idempotencyKey: string;
  reason?: string;
};

export type RefundPaymentResult = PaymentState;

export type PaymentWebhookInput = {
  headers: Readonly<Record<string, string>>;
  rawBody: string | Uint8Array;
};

export type PaymentWebhookResult = PaymentState & {
  externalEventId: string;
  eventType: string;
  payload: Record<string, JsonValue>;
};

/**
 * Contract implemented by every concrete payment adapter.
 *
 * The domain service owns database writes and order state changes. Providers
 * only translate between a PSP API and these normalized payment types.
 */
export interface PaymentProvider {
  readonly name: string;

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
  refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;
  handleWebhook(input: PaymentWebhookInput): Promise<PaymentWebhookResult>;
}
