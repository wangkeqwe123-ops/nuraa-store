import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { listStorefrontProducts } from "@/features/catalog/catalog.repository";
import { isLocale } from "@/i18n/config";

export const dynamic="force-dynamic";
export default async function Products({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params;
  if(!isLocale(locale)) notFound();
  const products=await listStorefrontProducts();
  const text=locale==="ar"?{home:"الرئيسية",eyebrow:"نُـورا / المتجر",title:"عطور صنعت للبيت",body:"اكتشفوا عطوراً منزلية مستوحاة من العود والورد والعنبر ومن دفء الضيافة العربية.",filter:"جميع العطور",count:"منتجات",empty:"لا توجد منتجات متاحة حالياً."}:{home:"Home",eyebrow:"NURAA / Shop",title:"Fragrance made for home",body:"Discover home fragrances inspired by oud, rose, amber and the warmth of Arabian hospitality.",filter:"All fragrances",count:"products",empty:"No products are available yet."};
  return <section id="catalog" className="scroll-mt-24 bg-[#fbfaf6]"><div className="mx-auto min-h-[70vh] max-w-[1500px] px-5 py-12 lg:px-10 lg:py-24">
    <Link href={`/${locale}`} className="inline-flex min-h-11 items-center gap-2 text-[11px] font-semibold uppercase tracking-[.15em] text-[#1f342b]/55 transition-colors hover:text-[#1f342b]"><ChevronLeft className={locale==="ar"?"rotate-180":""} size={14}/><Home size={13}/>{text.home}</Link>
    <div className="mt-12 max-w-3xl"><p className="text-[11px] font-semibold uppercase tracking-[.24em] text-[#7b4d35]">{text.eyebrow}</p><h1 className="font-display mt-4 text-6xl font-semibold leading-[.9] text-[#1f342b] md:text-8xl">{text.title}</h1><p className="mt-6 max-w-xl text-lg leading-8 text-[#1f342b]/60">{text.body}</p></div>
    <div className="my-12 flex items-center justify-between border-y border-[#1f342b]/14 py-4 text-[11px] font-medium uppercase tracking-[.16em] text-[#1f342b]/65"><span>{text.filter}</span><span>{products.length} {text.count}</span></div>
    {products.length?<div className="grid gap-x-5 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{products.map((product,index)=><ProductCard key={product.id} product={product} locale={locale} priority={index<2}/>)}</div>:<div className="py-24 text-center text-[#1f342b]/50">{text.empty}</div>}
  </div></section>;
}
