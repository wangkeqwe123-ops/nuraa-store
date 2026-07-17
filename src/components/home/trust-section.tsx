import { Gift, MapPinCheck, Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getBrandContent } from "@/lib/brand-content";

const icons=[Sparkles,MapPinCheck,Gift];
export function TrustSection({ locale }: { locale: Locale }) { const { trust }=getBrandContent(locale); return <section className="border-y border-[#1f342b]/12 bg-[#eee8dc] px-5 py-24 lg:px-10 lg:py-28"><div className="mx-auto grid max-w-[1500px] gap-12 md:grid-cols-3">{trust.map(([title,body],i)=>{const Icon=icons[i];return <div key={title} className="text-center md:border-e md:border-[#1f342b]/16 md:last:border-0"><Icon className="mx-auto text-[#7b4d35]" strokeWidth={1.1}/><h3 className="font-display mt-5 text-3xl font-medium text-[#1f342b]">{title}</h3><p className="mx-auto mt-3 max-w-sm text-base leading-7 text-[#1f342b]/58">{body}</p></div>})}</div></section>; }
