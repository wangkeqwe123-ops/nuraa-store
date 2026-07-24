import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HomepageMedia } from "@/components/home/homepage-media";
import {
  localizeHomepageSection,
  type HomepageContentSection,
} from "@/features/homepage/homepage.repository";
import type { Locale } from "@/i18n/config";

export function HeroSection({
  locale,
  section,
}: {
  locale: Locale;
  section: HomepageContentSection;
}) {
  const content = localizeHomepageSection(section, locale);
  const title = locale === "ar" ? "فن العطر العربي" : "The Art of Arabian Fragrance";
  const cta = locale === "ar" ? "اكتشفوا المجموعة" : "Explore Collection";
  const link = content.ctaLink.replace(/^\/en(?=\/)/, `/${locale}`) || "#collections";

  return (
    <section
      data-hero
      className="bg-[#fbfaf7] px-4 py-6 text-[#17251f] sm:px-6 sm:py-8 lg:px-8 lg:py-0 xl:px-12"
    >
      <div className="mx-auto grid max-w-[1440px] overflow-hidden bg-[#f4f1ea] lg:h-[560px] lg:grid-cols-[45%_55%] lg:grid-rows-1">
        <div
          data-hero-media
          className="relative order-1 aspect-[4/3] min-h-[280px] overflow-hidden bg-[#eee8dc] sm:aspect-[16/10] lg:col-start-2 lg:row-start-1 lg:h-full lg:min-h-0 lg:aspect-auto"
        >
          <HomepageMedia
            section={section}
            alt={title}
            priority
            quality={90}
            sizes="(min-width: 1536px) 792px, (min-width: 1024px) 55vw, 100vw"
            className="size-full object-contain p-3 sm:p-5 lg:p-7"
          />
        </div>

        <div className="order-2 flex items-center px-6 py-12 sm:px-10 sm:py-14 lg:col-start-1 lg:row-start-1 lg:px-[clamp(3rem,6vw,6.5rem)] lg:py-12">
          <div className="animate-rise max-w-[31rem]">
            <p
              className="text-sm font-semibold tracking-[0.28em] text-[#7b4d35]"
              translate="no"
            >
              NURAA
            </p>
            <h1 className="font-display mt-5 max-w-[12ch] text-balance text-[clamp(2.65rem,11vw,4.25rem)] font-medium leading-[0.97] tracking-[-0.03em] lg:mt-6 lg:max-w-[11ch] lg:text-[clamp(3.25rem,4.2vw,4.75rem)] lg:leading-[0.94]">
              {title}
            </h1>
            <Link
              href={link}
              className="mt-8 inline-flex min-h-12 items-center gap-3 border-b border-[#17251f] pb-1 text-sm font-medium transition-opacity duration-300 ease-out hover:opacity-60 lg:mt-10"
            >
              {cta}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
