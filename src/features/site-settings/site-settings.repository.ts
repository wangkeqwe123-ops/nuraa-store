import "server-only";

import { cache } from "react";
import { db } from "@/lib/db";

export type PublicSiteSettings = {
  whatsappNumber: string;
  whatsappMessageTemplate: string;
  supportEmail: string;
  whatsappEnabled: boolean;
};

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hello NURAA, I would like to know more about your fragrances.";

export function normalizeWhatsAppNumber(value: string) {
  return value.replace(/\D/g, "");
}

export const getSiteSettings = cache(
  async (): Promise<PublicSiteSettings> => {
    const settings = await db.siteSetting.findUnique({
      where: { id: "default" },
    });
    const whatsappNumber = normalizeWhatsAppNumber(
      settings?.whatsappNumber ?? "",
    );

    return {
      whatsappNumber,
      whatsappMessageTemplate:
        settings?.whatsappMessageTemplate.trim()
        || DEFAULT_WHATSAPP_MESSAGE,
      supportEmail: settings?.supportEmail.trim() ?? "",
      whatsappEnabled:
        whatsappNumber.length >= 8 && whatsappNumber.length <= 15,
    };
  },
);
