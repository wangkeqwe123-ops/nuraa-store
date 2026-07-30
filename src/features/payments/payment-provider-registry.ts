import "server-only";

import type { PaymentProvider } from "./payment-provider";

const providers = new Map<string, PaymentProvider>();

function normalizeProviderName(name: string) {
  return name.trim().toUpperCase();
}

export function registerPaymentProvider(provider: PaymentProvider) {
  const name = normalizeProviderName(provider.name);
  if (!name) throw new Error("Payment provider name is required");
  if (providers.has(name)) {
    throw new Error(`Payment provider "${name}" is already registered`);
  }
  providers.set(name, provider);
}

export function getPaymentProvider(name: string) {
  const normalizedName = normalizeProviderName(name);
  const provider = providers.get(normalizedName);
  if (!provider) {
    throw new Error(`Payment provider "${normalizedName}" is not registered`);
  }
  return provider;
}

export function hasPaymentProvider(name: string) {
  return providers.has(normalizeProviderName(name));
}
