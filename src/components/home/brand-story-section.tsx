import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getBrandContent } from "@/lib/brand-content";
import { Reveal } from "@/components/home/reveal";
import type { HomepageContentSection } from "@/features/homepage/homepage.repository";
import { HomepageMedia } from "@/components/home/homepage-media";

export function BrandStorySection({locale,section}:{locale:Locale;section:HomepageContentSection}) { const {story}=getBrandContent(locale);const link=section.buttonLink.replace(/^\/en(?=\/)/,`/${locale}`)||`/${locale}/products`;return <section id="story" className="scroll-mt-24 bg-[#F5F5F3] px-6 py-32 lg:px-10 lg:py-40"><div className="mx-auto max-w-[1500px]"><Reveal>
  <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-0"><div className="relative aspect-[4/3] overflow-hidden bg-[#E6E2DB]"><HomepageMedia section={section} alt={section.title} className="transition duration-[1600ms] ease-out hover:scale-[1.025]"/></div><div className="px-0 text-center lg:px-20"><p className="text-sm uppercase tracking-[.18em] text-black/50">{story.eyebrow}</p><h2 className="font-display mt-5 text-6xl font-medium leading-[.95] text-black md:text-7xl">{section.title}</h2><p className="mt-8 text-lg leading-8 text-black/65">{story.body}</p><p className="mt-5 text-lg leading-8 text-black/65">{section.subtitle||story.body2}</p><Link href={link} className="maison-link mt-10 inline-flex items-center gap-2 border-b border-black pb-2 text-sm text-black">{section.buttonText||story.cta}<ArrowUpRight size={16}/></Link></div></div>
  <div className="mt-20 grid border-y border-black/20 md:grid-cols-3">{story.pillars.map(([title,body],i)=><div key={title} className="px-1 py-10 md:px-10 md:first:ps-0 md:not-first:border-s md:not-first:border-black/20"><span className="font-display text-2xl text-black/45">0{i+1}</span><h3 className="font-display mt-3 text-3xl font-medium text-black">{title}</h3><p className="mt-3 max-w-sm text-base leading-7 text-black/58">{body}</p></div>)}</div>
</Reveal></div></section>; }
