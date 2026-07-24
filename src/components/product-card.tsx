import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct } from "@/features/catalog/catalog.repository";

export function ProductCard({ product, locale, priority = false }: { product: StorefrontProduct; locale: Locale; priority?: boolean }) {
  const copy = product[locale];
  const notes = [...copy.topNotes, ...copy.heartNotes, ...copy.baseNotes].slice(0, 3).join(" · ");

  return (
    <article className="group">
      <Link href={`/${locale}/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-[#ece8df]">
        <Image
          src={product.image}
          alt={copy.name}
          fill
          priority={priority}
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          sizes="(max-width:768px) 92vw,(max-width:1200px) 46vw,31vw"
        />
        {product.tag ? (
          <span className="absolute start-4 top-4 bg-[#fbfaf7] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-[#17251f]">
            {locale === "ar" ? "الأكثر مبيعاً" : "Bestseller"}
          </span>
        ) : null}
        <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between bg-[#17251f] px-5 py-4 text-sm text-white transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0 motion-reduce:transition-none">
          {locale === "ar" ? "اكتشفوا العطر" : "Discover the fragrance"}
          <ArrowUpRight aria-hidden="true" />
        </span>
      </Link>
      <div className="pt-5">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#7b4d35]">{copy.scentFamily || copy.category}</p>
            <h2 className="font-display mt-1 text-[clamp(1.75rem,2.4vw,2.35rem)] font-semibold leading-tight text-[#17251f]">
              <Link href={`/${locale}/products/${product.slug}`}>{copy.name}</Link>
            </h2>
          </div>
          <p className="shrink-0 pt-1 text-sm font-semibold text-[#17251f]">{product.price.toLocaleString()} SAR</p>
        </div>
        <p className="mt-2 min-h-6 text-sm text-[#17251f]/62">{notes || copy.description}</p>
      </div>
    </article>
  );
}
