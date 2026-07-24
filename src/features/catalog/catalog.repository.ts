import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { ProductMediaType } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export type StorefrontMedia = {
  id: string;
  url: string;
  type: ProductMediaType;
  sortOrder: number;
  isPrimary: boolean;
};

type ProductCopy = {
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  usage: string;
  scentFamily: string;
  fragranceNotes: string[];
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  usageOccasions: string[];
  story: string;
  giftDescription: string;
  metaTitle: string;
  metaDescription: string;
};

export type StorefrontProduct = {
  id: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  stock: number;
  fragranceFamily: string;
  size: string;
  burnTime: string;
  material: string;
  ingredients: string;
  careInstructions: string;
  image: string;
  media: StorefrontMedia[];
  tag?: "new" | "bestseller";
  rating: number;
  reviewCount: number;
  en: ProductCopy;
  ar: ProductCopy;
};

const include = {
  translations: true,
  media: { orderBy: { sortOrder: "asc" as const } },
  category: { include: { translations: true } },
} satisfies Prisma.ProductInclude;
type ProductRow = Prisma.ProductGetPayload<{ include: typeof include }>;

function mapProduct(product: ProductRow): StorefrontProduct {
  const translation = (locale: "EN" | "AR") => product.translations.find((item) => item.locale === locale);
  const category = (locale: "EN" | "AR") => product.category?.translations.find((item) => item.locale === locale)?.name ?? product.category?.slug ?? "";
  const en = translation("EN");
  const ar = translation("AR");
  const copy = (item: typeof en, locale: "EN" | "AR"): ProductCopy => ({
    name: item?.name ?? "",
    category: category(locale),
    shortDescription: item?.shortDescription ?? "",
    description: item?.description ?? "",
    benefits: item?.benefits ?? [],
    usage: item?.usage ?? "",
    scentFamily: product.fragranceFamily ?? item?.scentFamily ?? "",
    fragranceNotes: item?.fragranceNotes ?? [],
    topNotes: item?.topNotes ?? [],
    heartNotes: item?.heartNotes ?? [],
    baseNotes: item?.baseNotes ?? [],
    usageOccasions: item?.usageOccasions ?? [],
    story: item?.story ?? "",
    giftDescription: item?.giftDescription ?? "",
    metaTitle: item?.metaTitle ?? "",
    metaDescription: item?.metaDescription ?? "",
  });
  const media = product.media.map((item) => ({ id: item.id, url: item.url, type: item.type, sortOrder: item.sortOrder, isPrimary: item.isPrimary }));
  const primary = media.find((item) => item.type === "MAIN_IMAGE" && item.isPrimary) ?? media.find((item) => item.type === "MAIN_IMAGE") ?? media.find((item) => item.type === "DETAIL_IMAGE");

  return {
    id: product.id,
    slug: product.slug,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    currency: product.currency,
    stock: product.stock,
    fragranceFamily: product.fragranceFamily ?? en?.scentFamily ?? "",
    size: product.size ?? "",
    burnTime: product.burnTime ?? "",
    material: product.material ?? "",
    ingredients: product.ingredients ?? "",
    careInstructions: product.careInstructions ?? "",
    image: primary?.url ?? "/images/products/placeholder.jpg",
    media,
    tag: product.isFeatured ? "bestseller" : undefined,
    rating: Number(product.rating),
    reviewCount: product.reviewCount,
    en: copy(en, "EN"),
    ar: copy(ar, "AR"),
  };
}

export async function listStorefrontProducts() {
  const rows = await db.product.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    include,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapProduct);
}

export async function listFeaturedStorefrontProducts(limit = 8) {
  const rows = await db.product.findMany({
    where: { status: "ACTIVE", deletedAt: null, isFeatured: true },
    include,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map(mapProduct);
}

export async function getStorefrontProduct(slug: string) {
  const row = await db.product.findFirst({ where: { slug, status: "ACTIVE", deletedAt: null }, include });
  return row ? mapProduct(row) : null;
}

export async function listRecommendedProducts(productId: string, limit = 3) {
  const source = await db.product.findUnique({
    where: { id: productId },
    select: { categoryId: true, fragranceFamily: true },
  });
  const rows = await db.product.findMany({
    where: {
      id: { not: productId },
      status: "ACTIVE",
      deletedAt: null,
      OR: [
        ...(source?.fragranceFamily ? [{ fragranceFamily: source.fragranceFamily }] : []),
        ...(source?.categoryId ? [{ categoryId: source.categoryId }] : []),
        { isFeatured: true },
      ],
    },
    include,
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit * 3,
  });
  return rows
    .sort((left, right) => {
      const leftScore =
        Number(Boolean(source?.fragranceFamily && left.fragranceFamily === source.fragranceFamily)) * 4
        + Number(Boolean(source?.categoryId && left.categoryId === source.categoryId)) * 2
        + Number(left.isFeatured);
      const rightScore =
        Number(Boolean(source?.fragranceFamily && right.fragranceFamily === source.fragranceFamily)) * 4
        + Number(Boolean(source?.categoryId && right.categoryId === source.categoryId)) * 2
        + Number(right.isFeatured);
      return rightScore - leftScore;
    })
    .slice(0, limit)
    .map(mapProduct);
}
