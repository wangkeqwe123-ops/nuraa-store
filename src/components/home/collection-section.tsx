import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getBrandContent } from "@/lib/brand-content";
import { Reveal } from "@/components/home/reveal";
import type { HomepageContentSection } from "@/features/homepage/homepage.repository";
import { HomepageMedia } from "@/components/home/homepage-media";

export function CollectionSection({locale,sections}:{locale:Locale;sections:HomepageContentSection[]}) { const {collections}=getBrandContent(locale); return <section id="collections" className="scroll-mt-24 bg-[#F1EEE8] px-6 py-32 text-black lg:px-10 lg:py-40"><div className="mx-auto max-w-[1500px]"><Reveal>
  <div className="mb-16 grid gap-7 md:grid-cols-2 md:items-end"><div><p className="text-sm uppercase tracking-[.18em] text-black/55">{collections.eyebrow}</p><h2 className="font-display mt-4 text-6xl font-medium md:text-8xl">{collections.title}</h2></div><p className="max-w-lg text-lg leading-8 text-black/60 md:justify-self-end">{collections.body}</p></div>
  <div className="grid gap-px overflow-hidden border border-black/20 bg-black/20 lg:grid-cols-3">{sections.map((section,i)=>{const body=collections.items[i]?.[2]||section.subtitle;const link=section.buttonLink.replace(/^\/en(?=\/)/,`/${locale}`)||`/${locale}/products`;return <Link href={link} key={section.id} className="group bg-[#FCFBF8] p-5"><div className="relative aspect-[4/5] overflow-hidden bg-[#E6E2DB]"><HomepageMedia section={section} alt={section.title} className="transition duration-[1400ms] ease-out group-hover:scale-[1.035]"/><span className="absolute bottom-5 end-5 grid size-12 place-items-center rounded-full border border-white bg-white text-black transition duration-500 group-hover:bg-black group-hover:text-white"><ArrowUpRight size={18}/></span></div><div className="px-1 py-6"><p className="text-xs uppercase tracking-[.14em] text-black/50">{section.subtitle}</p><h3 className="font-display mt-3 text-4xl font-medium">{section.title}</h3><p className="mt-3 text-base leading-7 text-black/58">{body}</p></div></Link>})}</div>
</Reveal></div></section>; }
