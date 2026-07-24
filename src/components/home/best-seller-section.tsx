import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCarousel } from "@/components/home/product-carousel";
import { Reveal } from "@/components/home/reveal";
import type { StorefrontProduct } from "@/features/catalog/catalog.repository";
import type { Locale } from "@/i18n/config";
import { getBrandContent } from "@/lib/brand-content";

export function BestSellerSection({
  locale,
  products,
}: {
  locale: Locale;
  products: StorefrontProduct[];
}) {
  const { best } = getBrandContent(locale);

  return (
    <section id="best-sellers" className="bg-[#fbfaf7] px-5 py-24 text-[#17251f] lg:px-10 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <div className="mb-12 grid gap-7 border-b border-[#17251f]/14 pb-10 md:grid-cols-[1.15fr_.85fr] md:items-end lg:mb-16">
            <h2 className="font-display max-w-[12ch] text-balance text-5xl font-medium leading-[0.94] tracking-[-0.025em] md:text-7xl">
              {best.title}
            </h2>
            <div className="md:justify-self-end">
              <p className="max-w-[50ch] text-pretty text-base leading-7 text-[#17251f]/70 lg:text-lg lg:leading-8">
                {best.body}
              </p>
              <Link
                className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-[#17251f] pb-1 text-sm font-medium"
                href={`/${locale}/products`}
              >
                {best.all}<ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
          {products.length ? (
            <ProductCarousel products={products} locale={locale} />
          ) : (
            <p className="py-16 text-center text-[#17251f]/64">
              {locale === "ar" ? "ستظهر المنتجات المختارة هنا قريباً." : "Featured fragrances will appear here soon."}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
