import { notFound } from "next/navigation";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getHomepageSection,
  localizeHomepageSection,
} from "@/features/homepage/homepage.repository";
import { isLocale } from "@/i18n/config";

// Header announcement and footer brand content are operator-managed CMS data.
// Render at request time so publishing does not require a new storefront build.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [announcementSection, footerSection] = await Promise.all([
    getHomepageSection("announcement_bar"),
    getHomepageSection("footer_brand"),
  ]);
  const announcement = announcementSection?.status === "ACTIVE"
    ? localizeHomepageSection(announcementSection, locale)
    : null;
  const footerBrand = footerSection?.status === "ACTIVE"
    ? localizeHomepageSection(footerSection, locale)
    : null;

  return (
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="store-shell">
      <AnalyticsTracker />
      <SiteHeader
        locale={locale}
        announcement={announcementSection
          ? announcement
            ? { text: announcement.title, href: announcement.ctaLink }
            : null
          : undefined}
      />
      <main id="main-content">{children}</main>
      <SiteFooter
        locale={locale}
        brand={footerBrand ? {
          name: footerBrand.title,
          description: footerBrand.subtitle,
          ctaText: footerBrand.ctaText,
          ctaLink: footerBrand.ctaLink,
        } : null}
      />
    </div>
  );
}
