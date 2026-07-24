"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { StorefrontProduct } from "@/features/catalog/catalog.repository";
import type { Locale } from "@/i18n/config";

export function ProductCarousel({
  products,
  locale,
}: {
  products: StorefrontProduct[];
  locale: Locale;
}) {
  const track = useRef<HTMLDivElement>(null);
  const move = (direction: number) => {
    track.current?.scrollBy({
      left: direction * track.current.clientWidth * 0.72,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };
  const previousLabel = locale === "ar" ? "المنتجات السابقة" : "Previous products";
  const nextLabel = locale === "ar" ? "المنتجات التالية" : "Next products";

  return (
    <div>
      <div
        ref={track}
        className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
        aria-label={locale === "ar" ? "منتجات نُورا المختارة" : "Featured NURAA fragrances"}
      >
        {products.map((product, index) => {
          const copy = product[locale];
          const notes = [...copy.topNotes, ...copy.heartNotes, ...copy.baseNotes].slice(0, 3).join(" · ");
          const href = `/${locale}/products/${product.slug}`;

          return (
            <article key={product.id} className="group min-w-[82vw] snap-start sm:min-w-[48vw] lg:min-w-[32%]">
              <Link href={href} className="block">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#eeeae2]">
                  <Image
                    src={product.image}
                    alt={copy.name}
                    fill
                    priority={index === 0}
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    sizes="(max-width:640px) 82vw,(max-width:1024px) 48vw,32vw"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex min-h-12 translate-y-full items-center justify-between bg-[#17251f] px-5 text-sm font-medium text-white transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none">
                    {locale === "ar" ? "اكتشفوا العطر" : "Discover the fragrance"}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </div>
                <div className="py-6">
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <p className="text-sm text-[#7b4d35]">{copy.scentFamily || copy.category}</p>
                      <h3 className="font-display mt-1 text-balance text-3xl font-medium leading-tight text-[#17251f] lg:text-4xl">
                        {copy.name}
                      </h3>
                    </div>
                    <div className="shrink-0 pt-1 text-end text-sm font-medium text-[#17251f]">
                      <p>{product.price.toLocaleString()} SAR</p>
                      {product.compareAtPrice ? (
                        <p className="mt-1 text-xs text-[#17251f]/48 line-through">
                          {product.compareAtPrice.toLocaleString()} SAR
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-3 min-h-6 text-sm text-[#17251f]/64">{notes || copy.shortDescription}</p>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
      {products.length > 3 ? (
        <div className="mt-7 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => move(locale === "ar" ? 1 : -1)}
            aria-label={previousLabel}
            className="grid size-12 place-items-center border border-[#17251f]/28 text-[#17251f] transition-colors duration-300 hover:bg-[#17251f] hover:text-white"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => move(locale === "ar" ? -1 : 1)}
            aria-label={nextLabel}
            className="grid size-12 place-items-center border border-[#17251f]/28 text-[#17251f] transition-colors duration-300 hover:bg-[#17251f] hover:text-white"
          >
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
