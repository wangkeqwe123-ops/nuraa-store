import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CustomerTrust } from "@/components/product-detail/customer-trust";
import { DeliveryReturns } from "@/components/product-detail/delivery-returns";
import { FragranceComposition } from "@/components/product-detail/fragrance-composition";
import { ProductHowToUse } from "@/components/product-detail/product-how-to-use";
import { ProductDetails } from "@/components/product-detail/product-details";
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
  const title = (copy.metaTitle || copy.name).replace(/\s*\|\s*NURAA$/i, "");
  return {
    title,
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
  const editorialMedia =
    product.media.find((item) => item.type === "LIFESTYLE_IMAGE")
    ?? product.media.find((item) => item.type === "DETAIL_IMAGE");
  const labels = locale === "ar"
    ? {
        back: "العودة إلى العطور",
        stock: "متوفر",
        low: "قطع متبقية",
        sold: "غير متوفر",
        collection: "المجموعة",
        family: "العائلة العطرية",
      }
    : {
        back: "Back to fragrances",
        stock: "In stock",
        low: "left in stock",
        sold: "Out of stock",
        collection: "Collection",
        family: "Fragrance family",
      };
  const stockLabel = product.stock < 1 ? labels.sold : product.stock <= 5 ? `${product.stock} ${labels.low}` : labels.stock;

  return (
    <main className="bg-[#fbfaf6] text-[#1b1d1a]">
      <section className="mx-auto max-w-[1560px] px-5 py-6 sm:px-6 md:px-10 md:py-10">
        <Link href={`/${locale}/products`} className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-black/58 transition hover:text-black"><ChevronLeft className={locale === "ar" ? "rotate-180" : ""} size={15} />{labels.back}</Link>
        <div className="mt-5 grid gap-10 lg:grid-cols-[1.12fr_.88fr] lg:gap-[clamp(3rem,6vw,7rem)]">
          <ProductMediaViewer media={product.media} name={copy.name} />
          <div className="lg:sticky lg:top-28 lg:self-start lg:py-3">
            <p className="text-sm font-semibold tracking-[.26em] text-[#7b4d35]" translate="no">NURAA</p>
            <h1 className="font-display mt-6 max-w-[13ch] text-balance text-[clamp(3rem,5vw,5rem)] font-medium leading-[.94] tracking-[-.025em]">{copy.name}</h1>
            {alternateName ? <p className="mt-4 text-xl text-black/45" dir={locale === "en" ? "rtl" : "ltr"}>{alternateName}</p> : null}

            <dl className="mt-8 grid grid-cols-2 gap-x-6 border-y border-black/12 py-5">
              <div>
                <dt className="text-xs text-black/45">{labels.collection}</dt>
                <dd className="mt-2 text-sm font-medium">{copy.category || "NURAA"}</dd>
              </div>
              <div>
                <dt className="text-xs text-black/45">{labels.family}</dt>
                <dd className="mt-2 text-sm font-medium">{product.fragranceFamily || copy.scentFamily || "—"}</dd>
              </div>
            </dl>

            <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-black/66">{copy.shortDescription || copy.description}</p>
            <div className="mt-8 flex items-end justify-between gap-4 border-t border-black/12 pt-6">
              <div className="flex items-baseline gap-3"><span className="text-xl font-medium">{product.price.toLocaleString()} {product.currency}</span>{product.compareAtPrice ? <span className="text-sm text-black/35 line-through">{product.compareAtPrice.toLocaleString()} {product.currency}</span> : null}</div>
              <span className={`text-xs uppercase tracking-[.12em] ${product.stock > 0 ? "text-emerald-800" : "text-black/40"}`}>{stockLabel}</span>
            </div>
            <ProductPurchasePanel productId={product.id} stock={product.stock} locale={locale} />
          </div>
        </div>
      </section>

      <CustomerTrust locale={locale} />
      <FragranceComposition copy={copy} locale={locale} />
      <ProductStorySection
        story={copy.story || copy.description}
        inspiration={copy.description}
        occasions={copy.usageOccasions}
        atmosphere={copy.giftDescription || copy.shortDescription}
        media={editorialMedia}
        locale={locale}
      />
      <ProductDetails
        ingredients={product.ingredients}
        size={product.size}
        burnTime={product.burnTime}
        material={product.material}
        careInstructions={product.careInstructions}
        locale={locale}
      />
      <ProductHowToUse usage={copy.usage} locale={locale} />
      <DeliveryReturns locale={locale} />
      <RecommendedProducts products={recommended} locale={locale} />
    </main>
  );
}
