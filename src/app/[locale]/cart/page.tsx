import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { CartPage } from "@/components/cart/cart-page";
import { CART_COOKIE, serializeCart } from "@/features/cart/cart.service";
import { isLocale } from "@/i18n/config";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const cookieStore = await cookies();
  const cart = await serializeCart(cookieStore.get(CART_COOKIE)?.value, locale);
  return <CartPage locale={locale} initialCart={cart} />;
}
