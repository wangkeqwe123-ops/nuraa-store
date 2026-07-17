import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getBrandContent } from "@/lib/brand-content";
import { Reveal } from "@/components/home/reveal";
import type { HomepageContentSection } from "@/features/homepage/homepage.repository";
import { HomepageMedia } from "@/components/home/homepage-media";
import { ScrubText } from "@/components/home/scrub-text";

export function BrandStorySection({locale,section}:{locale:Locale;section:HomepageContentSection}) { const {story}=getBrandContent(locale);const link=section.buttonLink.replace(/^\/en(?=\/)/,`/${locale}`)||`/${locale}/products`;return <section id="story" className="scroll-mt-24 bg-[#fbfaf6] px-5 py-28 lg:px-10 lg:py-40"><div className="mx-auto max-w-[1500px]"><Reveal>
  <div className="grid gap-12 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-0"><div className="relative aspect-[4/5] max-h-[820px] overflow-hidden bg-[#e5ded2] lg:aspect-[5/6]"><HomepageMedia section={section} alt={section.title} className="transition duration-[1600ms] ease-out hover:scale-[1.025]"/><div className="absolute inset-5 border border-white/35"/></div><div className="px-0 lg:px-[clamp(3rem,7vw,8rem)]"><p className="text-xs font-medium uppercase tracking-[.24em] text-[#7b4d35]">{story.eyebrow}</p><h2 className="font-display mt-5 text-6xl font-medium leading-[.9] text-[#1b1d1a] md:text-8xl">{section.title}</h2><ScrubText text={story.body} className="mt-8 text-xl leading-9 text-[#1b1d1a]/68"/><p className="mt-5 text-base leading-8 text-[#1b1d1a]/58">{section.subtitle||story.body2}</p><Link href={link} className="maison-link mt-10 inline-flex min-h-11 items-center gap-2 border-b border-[#1b1d1a] text-sm text-[#1b1d1a]">{section.buttonText||story.cta}<ArrowUpRight size={16}/></Link></div></div>
  <div className="mt-20 grid border-y border-black/20 md:grid-cols-3">{story.pillars.map(([title,body],i)=><div key={title} className="px-1 py-10 md:px-10 md:first:ps-0 md:not-first:border-s md:not-first:border-black/20"><span className="font-display text-2xl text-black/45">0{i+1}</span><h3 className="font-display mt-3 text-3xl font-medium text-black">{title}</h3><p className="mt-3 max-w-sm text-base leading-7 text-black/58">{body}</p></div>)}</div>
</Reveal></div></section>; }
