import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getBrandContent } from "@/lib/brand-content";
import { Reveal } from "@/components/home/reveal";
import type { HomepageContentSection } from "@/features/homepage/homepage.repository";
import { HomepageMedia } from "@/components/home/homepage-media";

export function GiftSection({locale,sections}:{locale:Locale;sections:HomepageContentSection[]}) { const {gifts}=getBrandContent(locale); return <section id="gifts" className="scroll-mt-24 bg-white px-6 py-32 lg:px-10 lg:py-40"><div className="mx-auto max-w-[1500px]"><Reveal>
  <div className="mb-16 max-w-4xl"><p className="text-sm uppercase tracking-[.18em] text-black/50">{gifts.eyebrow}</p><h2 className="font-display mt-4 text-6xl font-medium leading-none text-black md:text-8xl">{gifts.title}</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-black/60">{gifts.body}</p></div>
  <div className="grid gap-px border border-black/20 bg-black/20 sm:grid-cols-2 lg:grid-cols-4">{sections.map(section=>{const link=section.buttonLink.replace(/^\/en(?=\/)/,`/${locale}`)||`/${locale}/products`;return <Link href={link} key={section.id} className="group bg-white p-4"><div className="relative aspect-[4/5] overflow-hidden bg-[#EEEAE3]"><HomepageMedia section={section} alt={section.title} className="image-reveal transition duration-[1400ms] ease-out group-hover:scale-[1.035]"/><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"/><h3 className="font-display absolute bottom-6 start-6 text-4xl font-medium text-white">{section.title}</h3></div><div className="flex items-start justify-between gap-4 px-1 py-5"><p className="text-base leading-7 text-black/60">{section.subtitle}</p><ArrowUpRight className="mt-1 shrink-0 text-black transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" size={18}/></div></Link>})}</div>
  <Link href={`/${locale}/products`} className="mx-auto mt-14 flex w-fit items-center gap-2 border-b border-black pb-2 text-sm text-black">{gifts.cta}<ArrowUpRight size={16}/></Link>
</Reveal></div></section>; }
