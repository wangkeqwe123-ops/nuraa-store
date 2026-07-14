import Image from "next/image";
import type { StorefrontMedia } from "@/features/catalog/catalog.repository";

export function ProductStorySection({ story, occasions, giftDescription, media, locale }: { story: string; occasions: string[]; giftDescription: string; media?: StorefrontMedia; locale: "en" | "ar" }) {
  const labels = locale === "ar" ? { eyebrow: "حكاية العطر", title: "صُنع للحظات البيت", moments: "لحظات الاستخدام", gift: "تقديم الهدايا" } : { eyebrow: "The fragrance story", title: "Made for the moments at home", moments: "Made for", gift: "Gift presentation" };
  return (
    <section className="grid min-h-[680px] lg:grid-cols-2">
      <div className="relative min-h-[480px] bg-[#eeeae3]">{media ? (media.type === "VIDEO" ? <video src={media.url} autoPlay muted loop playsInline className="size-full object-cover" /> : <Image src={media.url} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw,50vw" />) : null}</div>
      <div className="flex items-center bg-white px-7 py-20 md:px-16 lg:px-[7vw]"><div className="max-w-xl"><p className="text-xs uppercase tracking-[.22em] text-black/45">{labels.eyebrow}</p><h2 className="font-display mt-5 text-5xl leading-tight md:text-6xl">{labels.title}</h2><p className="mt-8 text-lg leading-8 text-black/60">{story}</p>{occasions.length ? <div className="mt-10 border-t border-black/15 pt-7"><p className="text-xs uppercase tracking-[.17em] text-black/45">{labels.moments}</p><p className="mt-3 font-display text-2xl">{occasions.join(" · ")}</p></div> : null}{giftDescription ? <div className="mt-8"><p className="text-xs uppercase tracking-[.17em] text-black/45">{labels.gift}</p><p className="mt-3 leading-7 text-black/55">{giftDescription}</p></div> : null}</div></div>
    </section>
  );
}
