"use client";

import type { ReactNode } from "react";
import { trackStorefrontEvent } from "@/components/analytics/analytics-tracker";
import { buildWhatsAppUrl } from "@/features/whatsapp/whatsapp";
import { cn } from "@/lib/utils";

export type WhatsAppEntrySource =
  | "floating"
  | "product_purchase"
  | "checkout_help"
  | "home_trust";

export function WhatsAppLink({
  phone,
  message,
  includeCurrentUrl = false,
  source,
  productId,
  className,
  children,
  ariaLabel,
}: {
  phone: string;
  message: string;
  includeCurrentUrl?: boolean;
  source: WhatsAppEntrySource;
  productId?: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const href = buildWhatsAppUrl(phone, message);

  if (!phone || !href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      data-whatsapp-source={source}
      onClick={(event) => {
        if (includeCurrentUrl) {
          event.currentTarget.href = buildWhatsAppUrl(
            phone,
            `${message.trim()}\n${window.location.href}`,
          );
        }
        void trackStorefrontEvent(
          "WHATSAPP_CLICK",
          productId,
          undefined,
          source,
        );
      }}
      className={cn(className)}
    >
      {children}
    </a>
  );
}
