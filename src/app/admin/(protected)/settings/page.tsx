import { PageHeader } from "@/components/admin/page-header";
import {
  DEFAULT_WHATSAPP_MESSAGE,
  getSiteSettings,
} from "@/features/site-settings/site-settings.repository";
import { SiteSettingsForm } from "./site-settings-form";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeader
        eyebrow="Store configuration"
        title="Settings"
        description="Manage the customer contact details used across the NURAA storefront."
      />
      <SiteSettingsForm
        whatsappNumber={settings.whatsappNumber}
        whatsappMessageTemplate={
          settings.whatsappMessageTemplate || DEFAULT_WHATSAPP_MESSAGE
        }
        supportEmail={settings.supportEmail}
      />
    </>
  );
}
