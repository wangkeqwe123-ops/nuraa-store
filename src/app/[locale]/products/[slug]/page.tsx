import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { CustomerTrust } from "@/components/product-detail/customer-trust";
import { DeliveryReturns } from "@/components/product-detail/delivery-returns";
import { FragranceComposition } from "@/components/product-detail/fragrance-composition";
import { ProductHowToUse } from "@/components/product-detail/product-how-to-use";
import { ProductMediaViewer } from "@/components/product-detail/product-media-viewer";
import { ProductPurchasePanel } from "@/components/product-detail/product-purchase-panel";
import { ProductStorySection } from "@/components/product-detail/product-story-section";
import { RecommendedProducts } from "@/components/product-detail/recommended-products";
import { getStorefrontProduct, listRecommendedProducts } from "@/features/catalog/catalog.repository";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await getStorefrontProduct(slug);
  if (!product) return {};
  const copy = product[locale];
  return {
    title: copy.metaTitle || copy.name,
    description: copy.metaDescription || copy.shortDescription || copy.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const product = await getStorefrontProduct(slug);
  if (!product) notFound();

  const recommended = await listRecommendedProducts(product.id);
  const copy = product[locale];
  const alternateName = locale === "en" ? product.ar.name : product.en.name;
  const editorialMedia = product.media.find((item) => item.type === "DETAIL_IMAGE");
  const labels = locale === "ar"
    ? { back: "العودة إلى العطور", stock: "متوفر", low: "قطع متبقية", sold: "غير متوفر", reviews: "تقييماً" }
    : { back: "Back to fragrances", stock: "In stock", low: "left in stock", sold: "Out of stock", reviews: "reviews" };
  const stockLabel = product.stock < 1 ? labels.sold : product.stock <= 5 ? `${product.stock} ${labels.low}` : labels.stock;

  return (
    <main className="bg-[#fcfbf8] text-black">
      <section className="mx-auto max-w-[1500px] px-5 py-8 md:px-10 md:py-14">
        <Link href={`/${locale}/products`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[.16em] text-black/50 transition hover:text-black"><ChevronLeft className={locale === "ar" ? "rotate-180" : ""} size={15} />{labels.back}</Link>
        <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
          <ProductMediaViewer media={product.media} name={copy.name} />
          <div className="lg:sticky lg:top-28 lg:self-start lg:py-5">
            <div className="flex items-center justify-between gap-5 border-b border-black/12 pb-5">
              <p className="text-xs uppercase tracking-[.2em] text-black/48">{product.fragranceFamily || copy.scentFamily || copy.category}</p>
              <p className="flex items-center gap-1 text-sm"><Star className="size-3.5 fill-black" /> {product.rating.toFixed(1)} <span className="text-black/40">({product.reviewCount} {labels.reviews})</span></p>
            </div>
            <h1 className="font-display mt-8 text-5xl font-medium leading-[.94] md:text-7xl">{copy.name}</h1>
            {alternateName ? <p className="mt-4 text-xl text-black/45" dir={locale === "en" ? "rtl" : "ltr"}>{alternateName}</p> : null}
            <p className="mt-8 max-w-xl text-lg leading-8 text-black/62">{copy.shortDescription || copy.description}</p>
            <div className="mt-8 flex items-end justify-between gap-4 border-t border-black/12 pt-6">
              <div className="flex items-baseline gap-3"><span className="text-xl font-medium">{product.price.toLocaleString()} {product.currency}</span>{product.compareAtPrice ? <span className="text-sm text-black/35 line-through">{product.compareAtPrice.toLocaleString()} {product.currency}</span> : null}</div>
              <span className={`text-xs uppercase tracking-[.12em] ${product.stock > 0 ? "text-emerald-800" : "text-black/40"}`}>{stockLabel}</span>
            </div>
            <ProductPurchasePanel stock={product.stock} locale={locale} />
            <p className="mt-6 border-t border-black/12 pt-5 text-sm leading-7 text-black/48">{copy.description}</p>
          </div>
        </div>
      </section>

      <CustomerTrust locale={locale} />
      <FragranceComposition copy={copy} locale={locale} />
      <ProductStorySection story={copy.story || copy.description} occasions={copy.usageOccasions} giftDescription={copy.giftDescription} media={editorialMedia} locale={locale} />
      <ProductHowToUse usage={copy.usage} locale={locale} />
      <DeliveryReturns locale={locale} />
      <RecommendedProducts products={recommended} locale={locale} />
    </main>
  );
}
