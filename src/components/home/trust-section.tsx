import { Gift, MapPinCheck, Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getBrandContent } from "@/lib/brand-content";

const icons=[Sparkles,MapPinCheck,Gift];
export function TrustSection({ locale }: { locale: Locale }) { const { trust }=getBrandContent(locale); return <section className="border-y border-black/15 bg-[#F1EEE8] px-6 py-28 lg:px-10 lg:py-32"><div className="mx-auto grid max-w-[1500px] gap-12 md:grid-cols-3">{trust.map(([title,body],i)=>{const Icon=icons[i];return <div key={title} className="text-center md:border-e md:border-black/20 md:last:border-0"><Icon className="mx-auto text-black" strokeWidth={1.1}/><h3 className="font-display mt-5 text-3xl font-medium text-black">{title}</h3><p className="mx-auto mt-3 max-w-sm text-base leading-7 text-black/58">{body}</p></div>})}</div></section>; }
