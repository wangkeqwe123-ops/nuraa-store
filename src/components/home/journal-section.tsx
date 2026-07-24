import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { localizeHomepageSection, type HomepageContentSection } from "@/features/homepage/homepage.repository";
import { HomepageMedia } from "@/components/home/homepage-media";
import { Reveal } from "@/components/home/reveal";

export function JournalSection({locale,section}:{locale:Locale;section:HomepageContentSection}){const content=localizeHomepageSection(section,locale);const link=content.ctaLink.replace(/^\/en(?=\/)/,`/${locale}`)||`/${locale}/products`;return <section id="journal" className="scroll-mt-24 bg-black px-6 py-32 text-white lg:px-10 lg:py-40"><div className="mx-auto max-w-[1500px]"><Reveal><div className="grid items-center gap-14 lg:grid-cols-[1.15fr_.85fr]"><div className="relative aspect-[16/10] overflow-hidden bg-white/10"><HomepageMedia section={section} alt={content.title} sizes="(max-width:1023px) 100vw,58vw" className="transition duration-[1600ms] ease-out hover:scale-[1.025]"/></div><div className="lg:px-16"><p className="text-sm uppercase tracking-[.18em] text-white/50">NURAA Journal</p><h2 className="font-display mt-5 text-6xl font-medium leading-none md:text-8xl">{content.title}</h2><p className="mt-7 max-w-xl text-lg leading-8 text-white/65">{content.subtitle}</p><Link href={link} className="maison-link mt-10 inline-flex items-center gap-2 border-b border-white pb-2 text-sm">{content.ctaText||"Read the story"}<ArrowUpRight size={16}/></Link></div></div></Reveal></div></section>}
