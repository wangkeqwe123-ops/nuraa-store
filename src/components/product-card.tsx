import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct } from "@/features/catalog/catalog.repository";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product, locale, priority=false }: { product: StorefrontProduct; locale: Locale; priority?: boolean }) {
  const t=product[locale];
  return <article className="luxury-card group bg-[#FBF6EC]">
    <Link href={`/${locale}/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-[#E9DECC]">
      <Image src={product.image} alt={t.name} fill priority={priority} className="object-cover transition duration-700 group-hover:scale-[1.035]" sizes="(max-width:768px) 100vw,33vw"/>
      {product.tag&&<Badge className="absolute start-4 top-4 rounded-none bg-[#FBF6EC] px-3 py-1.5 text-[10px] uppercase tracking-[.16em] text-[#4A3022]">{locale==="ar"?"الأكثر مبيعاً":"Bestseller"}</Badge>}
    </Link>
    <div className="p-5"><p className="text-[10px] uppercase tracking-[.2em] text-[#9A7137]">{t.scentFamily||t.category}</p><h3 className="font-display mt-2 text-2xl font-semibold text-[#4A3022]">{t.name}</h3><p className="mt-2 line-clamp-1 text-sm text-[#4A3022]/55">{[...t.topNotes,...t.heartNotes,...t.baseNotes].slice(0,3).join(" · ")||t.description}</p><div className="mt-5 flex items-center justify-between border-t border-[#6B4934]/12 pt-4"><p className="text-sm font-medium">{product.price} SAR</p><Link href={`/${locale}/products/${product.slug}`} className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[.14em] text-[#4A3022]">{locale==="ar"?"اكتشفوا":"Discover"}<ArrowUpRight size={14}/></Link></div></div>
  </article>;
}
