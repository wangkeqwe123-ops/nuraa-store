"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StorefrontCart } from "@/features/cart/cart.service";
import type { Locale } from "@/i18n/config";

const FREE_DELIVERY_THRESHOLD = 250;
const MAX_ITEM_QUANTITY = 20;

type CartMutation =
  | { method: "PATCH"; itemId: string; quantity: number }
  | { method: "DELETE"; itemId: string };

export function CartPage({
  locale,
  initialCart,
}: {
  locale: Locale;
  initialCart: StorefrontCart;
}) {
  const [cart, setCart] = useState(initialCart);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const isArabic = locale === "ar";
  const ContinueIcon = isArabic ? ArrowLeft : ArrowRight;
  const numberFormatter = new Intl.NumberFormat(isArabic ? "ar-SA" : "en-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const copy = isArabic
    ? {
        eyebrow: "حقيبتك",
        title: "مختاراتك",
        item: "منتج",
        items: "منتجات",
        empty: "حقيبتك فارغة حالياً.",
        emptyDescription: "اكتشف عطوراً صُممت لتمنح المنزل حضوراً هادئاً ودافئاً.",
        shop: "اكتشف العطور",
        continueShopping: "متابعة التسوق",
        quantity: "الكمية",
        decrease: "تقليل الكمية",
        increase: "زيادة الكمية",
        remove: "إزالة المنتج",
        subtotal: "المجموع الفرعي",
        delivery: "تظهر رسوم التوصيل والضرائب قبل إتمام الطلب.",
        checkout: "متابعة إلى إتمام الطلب",
        unavailable: "الكمية المطلوبة غير متوفرة حالياً",
        error: "تعذر تحديث حقيبتك. يرجى المحاولة مرة أخرى.",
        summary: "ملخص الطلب",
        secure: "تُحفظ محتويات حقيبتك بأمان لمدة 30 يوماً.",
        freeDelivery: "أصبح طلبك مؤهلاً للتوصيل المجاني داخل السعودية.",
        remaining: "أضف {amount} SAR للحصول على توصيل مجاني داخل السعودية.",
      }
    : {
        eyebrow: "Your bag",
        title: "Your selection",
        item: "item",
        items: "items",
        empty: "Your bag is currently empty.",
        emptyDescription: "Discover fragrances composed to bring warmth and quiet presence to the home.",
        shop: "Discover fragrances",
        continueShopping: "Continue shopping",
        quantity: "Quantity",
        decrease: "Decrease quantity",
        increase: "Increase quantity",
        remove: "Remove item",
        subtotal: "Subtotal",
        delivery: "Delivery and applicable taxes are shown before you place your order.",
        checkout: "Continue to checkout",
        unavailable: "The requested quantity is currently unavailable",
        error: "We could not update your bag. Please try again.",
        summary: "Order summary",
        secure: "Your bag is stored securely for 30 days.",
        freeDelivery: "Your order qualifies for complimentary delivery across KSA.",
        remaining: "Add {amount} SAR for complimentary delivery across KSA.",
      };

  const formatPrice = (value: number, currency = "SAR") =>
    `${numberFormatter.format(value)} ${currency}`;

  async function mutateCart(mutation: CartMutation) {
    setPendingId(mutation.itemId);
    setError("");

    try {
      const { method, ...payload } = mutation;
      const response = await fetch("/api/cart", {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, locale }),
      });
      if (!response.ok) throw new Error("Cart mutation failed");

      setCart(await response.json());
      window.dispatchEvent(new CustomEvent("nuraa:cart-updated"));
    } catch {
      setError(copy.error);
    } finally {
      setPendingId(null);
    }
  }

  const remainingForFreeDelivery = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD - cart.subtotal,
  );
  const deliveryProgress = Math.min(
    100,
    (cart.subtotal / FREE_DELIVERY_THRESHOLD) * 100,
  );
  const itemLabel = cart.itemCount === 1 ? copy.item : copy.items;

  return (
    <main className="min-h-[70vh] bg-[#fbfaf6] text-[#1b1d1a]">
      <section className="mx-auto max-w-[1320px] px-5 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-black/12 pb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7b4d35]">
              {copy.eyebrow}
            </p>
            <h1 className="font-display mt-3 text-[clamp(3.25rem,7vw,5.75rem)] leading-none tracking-[-.025em] text-[#1f342b]">
              {copy.title}
            </h1>
          </div>
          {cart.items.length ? (
            <p className="pb-1 text-sm text-black/55">
              {numberFormatter.format(cart.itemCount)} {itemLabel}
            </p>
          ) : null}
        </div>

        {!cart.items.length ? (
          <div className="mx-auto flex max-w-xl flex-col items-center py-20 text-center md:py-28">
            <div className="grid size-14 place-items-center rounded-full bg-[#17251f] text-white">
              <ShoppingBag className="size-5" aria-hidden="true" />
            </div>
            <h2 className="font-display mt-7 text-3xl text-[#1f342b]">
              {copy.empty}
            </h2>
            <p className="mt-4 max-w-md text-pretty leading-7 text-black/58">
              {copy.emptyDescription}
            </p>
            <Button
              nativeButton={false}
              render={<Link href={`/${locale}/products`} />}
              className="mt-9 h-12 rounded-none bg-[#17251f] px-8 text-xs uppercase tracking-[.14em] text-white hover:bg-[#17251f]/88"
            >
              {copy.shop}
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
            <div>
              <div className="divide-y divide-black/12 border-y border-black/12">
                {cart.items.map((item) => {
                  const isPending = pendingId === item.id;
                  const maximum = Math.min(item.stock, MAX_ITEM_QUANTITY);

                  return (
                    <article
                      key={item.id}
                      aria-busy={isPending}
                      className="grid grid-cols-[104px_minmax(0,1fr)] gap-5 py-6 sm:grid-cols-[148px_minmax(0,1fr)] sm:gap-7 sm:py-8"
                    >
                      <Link
                        href={`/${locale}/products/${item.slug}`}
                        className="group relative aspect-[4/5] overflow-hidden bg-[#eee8de]"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                          sizes="(max-width: 640px) 104px, 148px"
                        />
                      </Link>

                      <div className="flex min-w-0 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#7b4d35]" translate="no">
                              NURAA
                            </p>
                            <Link
                              href={`/${locale}/products/${item.slug}`}
                              className="font-display mt-2 block text-balance text-2xl leading-tight text-[#1f342b] underline-offset-4 hover:underline sm:text-3xl"
                            >
                              {item.name}
                            </Link>
                            <p className="mt-3 text-sm text-black/55">
                              {formatPrice(item.price, item.currency)}
                            </p>
                            {!item.available ? (
                              <p className="mt-3 flex items-center gap-2 text-xs text-red-800">
                                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                                {copy.unavailable}
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              void mutateCart({ method: "DELETE", itemId: item.id })
                            }
                            disabled={isPending}
                            aria-label={`${copy.remove}: ${item.name}`}
                            className="grid size-11 shrink-0 place-items-center text-black/45 transition-colors hover:bg-black/5 hover:text-black disabled:cursor-wait disabled:opacity-40"
                          >
                            {isPending ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </button>
                        </div>

                        <div className="mt-auto flex flex-wrap items-end justify-between gap-5 pt-6">
                          <div>
                            <p className="mb-2 text-[10px] uppercase tracking-[.16em] text-black/48">
                              {copy.quantity}
                            </p>
                            <div className="flex items-center border border-black/20 bg-white">
                              <button
                                type="button"
                                disabled={isPending || item.quantity <= 1}
                                onClick={() =>
                                  void mutateCart({
                                    method: "PATCH",
                                    itemId: item.id,
                                    quantity: item.quantity - 1,
                                  })
                                }
                                aria-label={`${copy.decrease}: ${item.name}`}
                                className="grid size-11 place-items-center transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <span
                                className="w-11 text-center text-sm tabular-nums"
                                aria-live="polite"
                              >
                                {isPending ? (
                                  <Loader2 className="mx-auto size-3.5 animate-spin" />
                                ) : (
                                  numberFormatter.format(item.quantity)
                                )}
                              </span>
                              <button
                                type="button"
                                disabled={isPending || item.quantity >= maximum}
                                onClick={() =>
                                  void mutateCart({
                                    method: "PATCH",
                                    itemId: item.id,
                                    quantity: item.quantity + 1,
                                  })
                                }
                                aria-label={`${copy.increase}: ${item.name}`}
                                className="grid size-11 place-items-center transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-base font-semibold tabular-nums text-[#1f342b]">
                            {formatPrice(item.lineTotal, item.currency)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <Link
                href={`/${locale}/products`}
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#1f342b] underline-offset-4 hover:underline"
              >
                {isArabic ? (
                  <ArrowRight className="size-4" aria-hidden="true" />
                ) : (
                  <ArrowLeft className="size-4" aria-hidden="true" />
                )}
                {copy.continueShopping}
              </Link>
            </div>

            <aside className="h-fit bg-[#eee8de] p-6 sm:p-8 lg:sticky lg:top-32">
              <h2 className="font-display text-3xl text-[#1f342b]">
                {copy.summary}
              </h2>
              <div className="mt-7 flex justify-between gap-6 border-y border-black/12 py-5 text-base">
                <span>{copy.subtotal}</span>
                <strong className="tabular-nums">
                  {formatPrice(cart.subtotal, cart.currency)}
                </strong>
              </div>

              <div className="mt-6">
                <div
                  className="h-1.5 overflow-hidden bg-black/10"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={FREE_DELIVERY_THRESHOLD}
                  aria-valuenow={Math.min(cart.subtotal, FREE_DELIVERY_THRESHOLD)}
                >
                  <div
                    className="h-full bg-[#7b4d35] transition-[width] duration-500 ease-out"
                    style={{ width: `${deliveryProgress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-black/60">
                  {remainingForFreeDelivery === 0
                    ? copy.freeDelivery
                    : copy.remaining.replace(
                        "{amount}",
                        numberFormatter.format(remainingForFreeDelivery),
                      )}
                </p>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="mt-5 flex gap-2 bg-red-50 p-3 text-sm leading-6 text-red-900"
                >
                  <AlertCircle className="mt-1 size-4 shrink-0" aria-hidden="true" />
                  {error}
                </p>
              ) : null}

              <p className="mt-5 text-sm leading-6 text-black/55">
                {copy.delivery}
              </p>
              <Button
                disabled={
                  pendingId !== null || cart.items.some((item) => !item.available)
                }
                nativeButton={false}
                render={<Link href={`/${locale}/checkout`} />}
                className="mt-6 h-14 w-full rounded-none bg-[#17251f] text-xs uppercase tracking-[.14em] text-white hover:bg-[#17251f]/88"
              >
                {copy.checkout}
                <ContinueIcon className="ms-2 size-4" aria-hidden="true" />
              </Button>
              <p className="mt-4 flex gap-2 text-xs leading-5 text-black/48">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {copy.secure}
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
