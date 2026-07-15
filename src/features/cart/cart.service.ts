import "server-only";
import { db } from "@/lib/db";

export const CART_COOKIE = "nuraa_cart";
export const CART_TTL_DAYS = 30;

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
    include: {
      product: {
        include: {
          translations: true,
          media: { orderBy: { sortOrder: "asc" as const } },
        },
      },
    },
  },
};

export async function getActiveCart(token?: string | null) {
  if (!token) return null;
  return db.cart.findFirst({
    where: { token, status: "ACTIVE", expiresAt: { gt: new Date() } },
    include: cartInclude,
  });
}

export async function serializeCart(token?: string | null) {
  const cart = await getActiveCart(token);
  if (!cart) return { id: null, itemCount: 0, subtotal: 0, currency: "SAR", items: [] };
  const items = cart.items.map((item) => {
    const locale = cart.locale === "AR" ? "AR" : "EN";
    const translation = item.product.translations.find((entry) => entry.locale === locale)
      ?? item.product.translations.find((entry) => entry.locale === "EN");
    const image = item.product.media.find((entry) => entry.type === "MAIN_IMAGE" && entry.isPrimary)?.url
      ?? item.product.media.find((entry) => entry.type === "MAIN_IMAGE")?.url
      ?? item.product.media[0]?.url
      ?? "/images/products/placeholder.jpg";
    const price = Number(item.product.price);
    return {
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      sku: item.product.sku,
      name: translation?.name ?? item.product.slug,
      image,
      price,
      currency: item.product.currency,
      stock: item.product.stock,
      available: item.product.status === "ACTIVE" && !item.product.deletedAt && item.product.stock > 0,
      quantity: item.quantity,
      lineTotal: price * item.quantity,
    };
  });
  return {
    id: cart.id,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
    currency: items[0]?.currency ?? "SAR",
    items,
  };
}

export type StorefrontCart = Awaited<ReturnType<typeof serializeCart>>;
