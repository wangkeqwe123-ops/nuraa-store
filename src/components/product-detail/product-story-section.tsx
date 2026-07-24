import Image from "next/image";
import type { StorefrontMedia } from "@/features/catalog/catalog.repository";

export function ProductStorySection({
  story,
  inspiration,
  occasions,
  atmosphere,
  media,
  locale,
  unoptimized = false,
}: {
  story: string;
  inspiration: string;
  occasions: string[];
  atmosphere: string;
  media?: StorefrontMedia;
  locale: "en" | "ar";
  unoptimized?: boolean;
}) {
  const labels = locale === "ar"
    ? {
        title: "حكاية العطر",
        inspiration: "مصدر الإلهام",
        moments: "لحظات الاستخدام",
        atmosphere: "الأجواء",
      }
    : {
        title: "The fragrance story",
        inspiration: "Inspiration",
        moments: "Made for",
        atmosphere: "Atmosphere",
      };

  return (
    <section className="grid bg-[#f3efe7] lg:min-h-[720px] lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative min-h-[460px] bg-[#e8e2d8] lg:min-h-full">
        {media ? (
          media.type === "VIDEO" ? (
            <video src={media.url} autoPlay muted loop playsInline className="size-full object-cover" />
          ) : (
            <Image
              src={media.url}
              alt=""
              fill
              quality={90}
              unoptimized={unoptimized}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 53vw"
            />
          )
        ) : null}
      </div>
      <div className="flex items-center px-7 py-20 md:px-16 lg:px-[clamp(4rem,7vw,8rem)]">
        <div className="max-w-xl">
          <h2 className="font-display text-balance text-5xl leading-[.98] tracking-[-.025em] md:text-7xl">
            {labels.title}
          </h2>
          <p className="mt-8 text-pretty text-lg leading-8 text-black/68">{story}</p>
          <dl className="mt-12 border-t border-black/15">
            {inspiration ? (
              <div className="grid gap-3 border-b border-black/15 py-6 md:grid-cols-[130px_1fr]">
                <dt className="text-sm font-medium">{labels.inspiration}</dt>
                <dd className="leading-7 text-black/58">{inspiration}</dd>
              </div>
            ) : null}
            {occasions.length ? (
              <div className="grid gap-3 border-b border-black/15 py-6 md:grid-cols-[130px_1fr]">
                <dt className="text-sm font-medium">{labels.moments}</dt>
                <dd className="font-display text-xl">{occasions.join(" · ")}</dd>
              </div>
            ) : null}
            {atmosphere ? (
              <div className="grid gap-3 border-b border-black/15 py-6 md:grid-cols-[130px_1fr]">
                <dt className="text-sm font-medium">{labels.atmosphere}</dt>
                <dd className="leading-7 text-black/58">{atmosphere}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </section>
  );
}
