import { notFound } from "next/navigation";
import { CheckoutPage } from "@/components/checkout/checkout-page";
import { getSiteSettings } from "@/features/site-settings/site-settings.repository";
import { isLocale } from "@/i18n/config";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const shippingFee = environmentNumber("STORE_SHIPPING_FEE_SAR", 25);
  const freeShippingThreshold = environmentNumber(
    "STORE_FREE_SHIPPING_THRESHOLD_SAR",
    250,
  );
  const taxRate = environmentNumber("STORE_TAX_RATE", 0);
  const siteSettings = await getSiteSettings();
  return (
    <CheckoutPage
      locale={locale}
      shippingFee={shippingFee}
      freeShippingThreshold={freeShippingThreshold}
      taxRate={taxRate}
      whatsappNumber={siteSettings.whatsappNumber}
      whatsappMessageTemplate={siteSettings.whatsappMessageTemplate}
    />
  );
}

function environmentNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}
