"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeWhatsAppNumber } from "@/features/site-settings/site-settings.repository";

const settingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .max(30)
    .refine((value) => {
      const number = normalizeWhatsAppNumber(value);
      return !value || (number.length >= 8 && number.length <= 15);
    }, "Enter an international number with 8 to 15 digits."),
  whatsappMessageTemplate: z.string().trim().min(1).max(800),
  supportEmail: z.string().trim().email().max(200),
});

export type SettingsActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function saveSiteSettings(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Review the highlighted settings and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.siteSetting.upsert({
    where: { id: "default" },
    update: {
      whatsappNumber: normalizeWhatsAppNumber(parsed.data.whatsappNumber),
      whatsappMessageTemplate: parsed.data.whatsappMessageTemplate,
      supportEmail: parsed.data.supportEmail.toLowerCase(),
    },
    create: {
      id: "default",
      whatsappNumber: normalizeWhatsAppNumber(parsed.data.whatsappNumber),
      whatsappMessageTemplate: parsed.data.whatsappMessageTemplate,
      supportEmail: parsed.data.supportEmail.toLowerCase(),
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/en", "layout");
  revalidatePath("/ar", "layout");
  return {
    status: "success",
    message: "Site contact settings saved.",
  };
}
