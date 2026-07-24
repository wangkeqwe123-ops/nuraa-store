import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HomepageMedia } from "@/components/home/homepage-media";
import {
  localizeHomepageSection,
  type HomepageContentSection,
} from "@/features/homepage/homepage.repository";
import type { Locale } from "@/i18n/config";
import { getBrandContent } from "@/lib/brand-content";

export function CollectionSection({
  locale,
  sections,
}: {
  locale: Locale;
  sections: HomepageContentSection[];
}) {
  const { collections } = getBrandContent(locale);

  return (
    <section id="collections" className="scroll-mt-24 bg-[#eee8dc] px-5 py-20 text-[#17251f] lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-12 grid gap-6 md:grid-cols-[1.1fr_.9fr] md:items-end lg:mb-16">
          <h2 className="font-display max-w-[12ch] text-balance text-5xl font-medium leading-[0.94] tracking-[-0.025em] md:text-7xl">
            {collections.title}
          </h2>
          <p className="max-w-[54ch] text-pretty text-base leading-7 text-[#17251f]/72 md:justify-self-end lg:text-lg lg:leading-8">
            {collections.body}
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.16fr_.92fr_.92fr]">
          {sections.map((section, index) => {
            const item = collections.items[index];
            const content = localizeHomepageSection(section, locale);
            const title = locale === "ar" && !section.titleAr && item ? item[0] : content.title;
            const notes = locale === "ar" && !section.subtitleAr && item ? item[1] : content.subtitle;
            const story = item?.[2] || content.subtitle;
            const link = content.ctaLink.replace(/^\/en(?=\/)/, `/${locale}`) || `/${locale}/products`;
            const cta = content.ctaText || (locale === "ar" ? "اكتشفوا المجموعة" : "Explore collection");

            return (
              <Link
                href={link}
                key={section.id}
                aria-label={`${cta}: ${title}`}
                className="group relative min-h-[500px] overflow-hidden bg-[#d9d1c4] sm:min-h-[580px] lg:min-h-[660px]"
              >
                <HomepageMedia
                  section={section}
                  alt={title}
                  sizes="(max-width:1023px) 100vw,34vw"
                  className="transition duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white lg:p-9">
                  <p className="text-xs leading-5 text-white/72">{notes}</p>
                  <h3 className="font-display mt-2 text-balance text-4xl font-medium leading-none lg:text-5xl">
                    {title}
                  </h3>
                  <p className="mt-4 max-w-[38ch] text-sm leading-6 text-white/76">{story}</p>
                  <span className="mt-7 inline-flex min-h-11 items-center gap-2 border-b border-white/65 pb-1 text-sm font-medium transition-colors duration-300 group-hover:border-white">
                    {cta}<ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
