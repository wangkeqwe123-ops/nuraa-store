import "server-only";

import type { Locale } from "@/i18n/config";
import { db } from "@/lib/db";

export type HomepageContentSection = {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  mediaType: "IMAGE" | "VIDEO";
  desktopMediaUrl: string | null;
  mobileMediaUrl: string | null;
  buttonText: string;
  buttonLink: string;
  ctaTextEn: string;
  ctaTextAr: string;
  ctaLink: string;
  status: "ACTIVE" | "INACTIVE";
  sortOrder: number;
};

export type LocalizedHomepageContent = {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
};

function mapHomepageSection(row: Awaited<ReturnType<typeof db.homepageSection.findFirstOrThrow>>): HomepageContentSection {
  return {
    id: row.id,
    sectionKey: row.sectionKey,
    title: row.title,
    subtitle: row.subtitle ?? "",
    titleEn: row.titleEn ?? "",
    titleAr: row.titleAr ?? "",
    subtitleEn: row.subtitleEn ?? "",
    subtitleAr: row.subtitleAr ?? "",
    mediaType: row.mediaType,
    desktopMediaUrl: row.desktopMediaUrl,
    mobileMediaUrl: row.mobileMediaUrl,
    buttonText: row.buttonText ?? "",
    buttonLink: row.buttonLink ?? "",
    ctaTextEn: row.ctaTextEn ?? "",
    ctaTextAr: row.ctaTextAr ?? "",
    ctaLink: row.ctaLink ?? "",
    status: row.status,
    sortOrder: row.sortOrder,
  };
}

export function localizeHomepageSection(
  section: HomepageContentSection,
  locale: Locale,
): LocalizedHomepageContent {
  const isArabic = locale === "ar";

  return {
    title: isArabic
      ? section.titleAr || section.titleEn || section.title
      : section.titleEn || section.title,
    subtitle: isArabic
      ? section.subtitleAr || section.subtitleEn || section.subtitle
      : section.subtitleEn || section.subtitle,
    ctaText: isArabic
      ? section.ctaTextAr || section.ctaTextEn || section.buttonText
      : section.ctaTextEn || section.buttonText,
    ctaLink: section.ctaLink || section.buttonLink,
  };
}

export async function listHomepageSections() {
  const rows = await db.homepageSection.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return rows.map(mapHomepageSection);
}

export async function getHomepageSection(sectionKey: string) {
  const row = await db.homepageSection.findUnique({ where: { sectionKey } });
  return row ? mapHomepageSection(row) : null;
}
