"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Minus, Plus } from "lucide-react";
import { trackStorefrontEvent } from "@/components/analytics/analytics-tracker";
import { Button } from "@/components/ui/button";
import { WhatsAppConfigNotice } from "@/components/whatsapp/whatsapp-config-notice";
import { WhatsAppLink } from "@/components/whatsapp/whatsapp-link";

export function ProductPurchasePanel({
  productId,
  productName,
  price,
  currency,
  stock,
  locale,
  whatsappNumber,
  whatsappMessageTemplate,
  showWhatsAppConfigHint = false,
}: {
  productId: string;
  productName: string;
  price: number;
  currency: string;
  stock: number;
  locale: "en" | "ar";
  whatsappNumber: string;
  whatsappMessageTemplate: string;
  showWhatsAppConfigHint?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const labels = locale === "ar"
    ? {
        quantity: "الكمية",
        add: "أضف إلى الحقيبة",
        adding: "جارٍ الإضافة",
        out: "غير متوفر حالياً",
        added: "تمت الإضافة إلى حقيبتك.",
        viewBag: "عرض الحقيبة",
        error: "تعذرت إضافة المنتج. حاول مرة أخرى.",
        shipping: "توصيل متتبع داخل السعودية خلال 2–5 أيام عمل",
        decrease: "تقليل الكمية",
        increase: "زيادة الكمية",
        whatsapp: "اشترِ عبر واتساب",
      }
    : {
        quantity: "Quantity",
        add: "Add to bag",
        adding: "Adding",
        out: "Currently unavailable",
        added: "Added to your bag.",
        viewBag: "View bag",
        error: "We could not add this item. Please try again.",
        shipping: "Tracked Saudi delivery · Estimated 2–5 business days",
        decrease: "Decrease quantity",
        increase: "Increase quantity",
        whatsapp: "Buy via WhatsApp",
      };
  const formattedPrice = new Intl.NumberFormat(
    locale === "ar" ? "ar-SA" : "en-SA",
    { maximumFractionDigits: 2 },
  ).format(price);
  const whatsappMessage = locale === "ar"
    ? `مرحباً نورا،\nأود معرفة المزيد عن:\n${productName}\nالسعر: ${formattedPrice} ${currency}`
    : `${whatsappMessageTemplate}\n\nI want to know more about:\n${productName}\nPrice: ${formattedPrice} ${currency}`;

  async function addToBag() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantity, locale }),
      });
      if (!response.ok) throw new Error("Cart request failed");
      await trackStorefrontEvent("ADD_TO_CART", productId);
      window.dispatchEvent(new CustomEvent("nuraa:cart-updated"));
      setMessage(labels.added);
    } catch {
      setMessage(labels.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-9">
      <div className="mb-4 flex items-center justify-between border-y border-black/12 py-4">
        <span className="text-xs uppercase tracking-[.14em] text-black/55">
          {labels.quantity}
        </span>
        <div className="flex items-center border border-black/20">
          <button
            type="button"
            disabled={quantity <= 1 || pending}
            className="grid size-11 place-items-center transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            aria-label={labels.decrease}
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-11 text-center text-sm tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            disabled={quantity >= Math.min(stock, 20) || pending}
            className="grid size-11 place-items-center transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() =>
              setQuantity((value) => Math.min(stock, 20, value + 1))
            }
            aria-label={labels.increase}
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <Button
        type="button"
        disabled={stock < 1 || pending}
        onClick={addToBag}
        className="h-14 w-full rounded-none bg-black text-xs uppercase tracking-[.2em] text-white hover:bg-black/80"
      >
        {stock > 0 ? (pending ? labels.adding : labels.add) : labels.out}
      </Button>

      {whatsappNumber ? (
        <WhatsAppLink
          phone={whatsappNumber}
          message={whatsappMessage}
          includeCurrentUrl
          source="product_purchase"
          productId={productId}
          ariaLabel={`${labels.whatsapp}: ${productName}`}
          className="mt-3 inline-flex h-14 w-full items-center justify-center gap-2 border border-[#17251f] bg-transparent text-xs font-semibold uppercase tracking-[.16em] text-[#17251f] transition-colors hover:bg-[#17251f] hover:text-white"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          {labels.whatsapp}
        </WhatsAppLink>
      ) : showWhatsAppConfigHint ? (
        <WhatsAppConfigNotice locale={locale} />
      ) : null}

      {message ? (
        <div
          className="mt-3 flex items-center justify-center gap-3 text-xs"
          role="status"
        >
          <span className="text-black/55">{message}</span>
          {message === labels.added ? (
            <Link
              href={`/${locale}/cart`}
              className="font-semibold text-[#17251f] underline underline-offset-4"
            >
              {labels.viewBag}
            </Link>
          ) : null}
        </div>
      ) : null}
      <p className="mt-4 text-center text-xs leading-5 text-black/48">
        {labels.shipping}
      </p>
    </div>
  );
}
