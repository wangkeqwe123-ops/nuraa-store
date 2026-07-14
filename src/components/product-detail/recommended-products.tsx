import { ProductCard } from "@/components/product-card";
import type { StorefrontProduct } from "@/features/catalog/catalog.repository";

export function RecommendedProducts({ products, locale }: { products: StorefrontProduct[]; locale: "en" | "ar" }) {
  if (!products.length) return null;
  return <section className="px-6 py-24 md:py-36"><div className="mx-auto max-w-7xl"><p className="text-center text-xs uppercase tracking-[.22em] text-black/45">NURAA</p><h2 className="font-display mt-4 text-center text-5xl md:text-6xl">{locale === "ar" ? "اكتشفوا أيضاً" : "You may also like"}</h2><div className="mt-14 grid gap-px bg-black/15 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <div key={product.id} className="bg-white"><ProductCard product={product} locale={locale} /></div>)}</div></div></section>;
}
