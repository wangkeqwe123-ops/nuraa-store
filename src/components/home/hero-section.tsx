import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getBrandContent } from "@/lib/brand-content";
import type { HomepageContentSection } from "@/features/homepage/homepage.repository";
import { HomepageMedia } from "@/components/home/homepage-media";

export function HeroSection({ locale,section }: { locale: Locale;section:HomepageContentSection }) { const {hero}=getBrandContent(locale);const link=section.buttonLink.replace(/^\/en(?=\/)/,`/${locale}`)||"#collections";return <section className="relative min-h-[88svh] overflow-hidden bg-black text-white lg:min-h-[calc(100svh-2rem)]">
  <HomepageMedia section={section} alt={section.title} priority className="hero-slow-zoom"/>
  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.74)_0%,rgba(0,0,0,.42)_40%,rgba(0,0,0,.06)_75%)] rtl:bg-[linear-gradient(270deg,rgba(0,0,0,.74)_0%,rgba(0,0,0,.42)_40%,rgba(0,0,0,.06)_75%)]"/>
  <div className="relative mx-auto flex min-h-[88svh] max-w-[1500px] items-end px-7 py-20 lg:min-h-[calc(100svh-2rem)] lg:items-center lg:px-12"><div className="max-w-3xl animate-rise"><p className="text-sm uppercase tracking-[.24em] text-white/80">{hero.eyebrow}</p><h1 className="font-display mt-7 text-6xl font-medium leading-[.9] sm:text-7xl lg:text-[7.2rem]">{section.title}</h1><p className="mt-9 max-w-xl text-lg font-light leading-8 text-white/78 lg:text-xl">{section.subtitle||hero.body}</p><div className="mt-12 flex flex-wrap gap-9"><Link href={link} className="maison-link inline-flex items-center gap-2 border-b border-white pb-2 text-sm tracking-[.04em]">{section.buttonText||hero.primary}<ArrowUpRight size={16}/></Link><Link href="#story" className="maison-link inline-flex items-center gap-2 border-b border-white/55 pb-2 text-sm tracking-[.04em]">{hero.secondary}</Link></div></div></div>
  <div className="absolute bottom-0 end-0 hidden border-s border-t border-white/20 bg-[#402A1E]/75 px-8 py-5 text-[10px] uppercase tracking-[.22em] backdrop-blur-sm lg:block">Riyadh · Saudi Arabia</div>
</section>; }
