import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct } from "@/features/catalog/catalog.repository";
import { getBrandContent } from "@/lib/brand-content";
import { ProductCarousel } from "@/components/home/product-carousel";
import { Reveal } from "@/components/home/reveal";

export function BestSellerSection({ locale, products }: { locale: Locale; products: StorefrontProduct[] }) { const { best }=getBrandContent(locale); return <section id="best-sellers" className="bg-white px-6 py-32 lg:px-10 lg:py-40"><div className="mx-auto max-w-[1500px]"><Reveal>
  <div className="mb-16 flex items-end justify-between gap-8"><div><p className="text-sm uppercase tracking-[.18em] text-black/50">{best.eyebrow}</p><h2 className="font-display mt-4 text-6xl font-medium text-black md:text-8xl">{best.title}</h2><p className="mt-5 max-w-xl text-lg leading-8 text-black/60">{best.body}</p></div><Link className="hidden items-center gap-2 border-b border-black pb-2 text-sm text-black md:flex" href={`/${locale}/products`}>{best.all}<ArrowUpRight size={16}/></Link></div>
  {products.length?<ProductCarousel products={products} locale={locale}/>:<p className="py-16 text-center text-black/50">Products coming soon.</p>}
</Reveal></div></section>; }
