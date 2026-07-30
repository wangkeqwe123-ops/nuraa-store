import { notFound } from "next/navigation";
import { BestSellerSection } from "@/components/home/best-seller-section";
import { BrandStorySection } from "@/components/home/brand-story-section";
import { CollectionSection } from "@/components/home/collection-section";
import { GiftSection } from "@/components/home/gift-section";
import { HeroSection } from "@/components/home/hero-section";
import { JournalSection } from "@/components/home/journal-section";
import { TrustSection } from "@/components/home/trust-section";
import { listFeaturedStorefrontProducts } from "@/features/catalog/catalog.repository";
import { listHomepageSections } from "@/features/homepage/homepage.repository";
import { getSiteSettings } from "@/features/site-settings/site-settings.repository";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [featuredProducts, sections, siteSettings] = await Promise.all([
    listFeaturedStorefrontProducts(),
    listHomepageSections(),
    getSiteSettings(),
  ]);
  const hero = sections.find((section) => section.sectionKey === "hero_banner");
  const story = sections.find((section) => section.sectionKey === "brand_story");
  const collections = sections.filter((section) => section.sectionKey.startsWith("collection_"));
  const gifts = sections.filter((section) => section.sectionKey.startsWith("gift_"));
  const journal = sections.find((section) => section.sectionKey === "journal_section");

  return (
    <>
      {hero ? <HeroSection locale={locale} section={hero} /> : null}
      {collections.length ? <CollectionSection locale={locale} sections={collections} /> : null}
      <BestSellerSection locale={locale} products={featuredProducts} />
      {story ? <BrandStorySection locale={locale} section={story} /> : null}
      {gifts.length ? <GiftSection locale={locale} sections={gifts} /> : null}
      <TrustSection
        locale={locale}
        whatsappNumber={siteSettings.whatsappNumber}
        whatsappMessageTemplate={siteSettings.whatsappMessageTemplate}
      />
      {journal ? <JournalSection locale={locale} section={journal} /> : null}
    </>
  );
}
