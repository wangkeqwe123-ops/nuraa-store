import "server-only";

export type PaymentMode = "MOCK" | "UNCONFIGURED";

export function paymentMode(): PaymentMode {
  if (process.env.NODE_ENV !== "production" && (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase() === "mock") return "MOCK";
  return "UNCONFIGURED";
}

export function paymentReadiness() {
  const mode = paymentMode();
  return {
    mode,
    ready: mode === "MOCK",
    message: mode === "MOCK"
      ? "Development payment simulator"
      : "A Saudi payment provider must be configured before production checkout can be enabled.",
  };
}
