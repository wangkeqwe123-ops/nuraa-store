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
  return <section id="catalog" className="scroll-mt-24 bg-[#fbfaf7]"><div className="mx-auto min-h-[70vh] max-w-[1560px] px-5 py-8 sm:px-6 lg:px-10 lg:py-14">
    <Link href={`/${locale}`} className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-[#17251f]/62 transition-colors hover:text-[#17251f]"><ChevronLeft className={locale==="ar"?"size-3.5 rotate-180":"size-3.5"} aria-hidden="true"/><Home className="size-3.5" aria-hidden="true"/>{text.home}</Link>
    <div className="mt-10 grid gap-7 border-b border-[#17251f]/16 pb-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)] lg:items-end lg:pb-16">
      <div><p className="text-sm font-medium text-[#7b4d35]">{text.eyebrow}</p><h1 className="font-display mt-4 max-w-4xl text-[clamp(3.8rem,7vw,6.5rem)] font-semibold leading-[.88] tracking-[-.025em] text-[#17251f]">{text.title}</h1></div>
      <p className="max-w-xl text-lg leading-8 text-[#17251f]/68 lg:justify-self-end lg:pb-2">{text.body}</p>
    </div>
    <div className="mb-10 flex min-h-16 items-center justify-between border-b border-[#17251f]/12 text-xs font-medium text-[#17251f]/68"><span>{text.filter}</span><span>{products.length} {text.count}</span></div>
    {products.length?<div className="grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">{products.map((product,index)=><ProductCard key={product.id} product={product} locale={locale} priority={index<3}/>)}</div>:<div className="py-24 text-center text-[#17251f]/55">{text.empty}</div>}
  </div></section>;
}
