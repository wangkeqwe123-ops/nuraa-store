import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct } from "@/features/catalog/catalog.repository";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product, locale, priority=false }: { product: StorefrontProduct; locale: Locale; priority?: boolean }) {
  const t=product[locale];
  return <article className="luxury-card group bg-[#f8f4eb]">
    <Link href={`/${locale}/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-[#e9e0d1]">
      <Image src={product.image} alt={t.name} fill priority={priority} className="object-cover transition duration-700 group-hover:scale-[1.045]" sizes="(max-width:768px) 88vw,(max-width:1200px) 45vw,30vw"/>
      {product.tag&&<Badge className="absolute start-4 top-4 rounded-none border-0 bg-[#fbfaf6] px-3 py-1.5 text-[10px] uppercase tracking-[.16em] text-[#1f342b]">{locale==="ar"?"الأكثر مبيعاً":"Bestseller"}</Badge>}
    </Link>
    <div className="p-5"><p className="text-[10px] font-medium uppercase tracking-[.2em] text-[#7b4d35]">{t.scentFamily||t.category}</p><h3 className="font-display mt-2 text-3xl font-semibold text-[#1f342b]">{t.name}</h3><p className="mt-2 line-clamp-1 text-sm text-[#1f342b]/55">{[...t.topNotes,...t.heartNotes,...t.baseNotes].slice(0,3).join(" · ")||t.description}</p><div className="mt-5 flex items-center justify-between border-t border-[#1f342b]/12 pt-4"><p className="text-sm font-semibold text-[#1f342b]">{product.price} SAR</p><Link href={`/${locale}/products/${product.slug}`} className="flex min-h-11 items-center gap-1 text-[11px] font-semibold uppercase tracking-[.14em] text-[#1f342b]">{locale==="ar"?"اكتشفوا":"Discover"}<ArrowUpRight size={14}/></Link></div></div>
  </article>;
}
