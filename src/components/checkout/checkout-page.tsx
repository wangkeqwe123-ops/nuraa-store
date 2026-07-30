"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  Loader2,
  LockKeyhole,
  MessageCircle,
  PackageCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getStorefrontAnalyticsContext,
  trackStorefrontEvent,
} from "@/components/analytics/analytics-tracker";
import type { Locale } from "@/i18n/config";
import { WhatsAppLink } from "@/components/whatsapp/whatsapp-link";

type Cart = {
  itemCount: number;
  subtotal: number;
  currency: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    lineTotal: number;
    available: boolean;
  }>;
};

export function CheckoutPage({
  locale,
  shippingFee,
  freeShippingThreshold,
  taxRate,
  whatsappNumber,
  whatsappMessageTemplate,
}: {
  locale: Locale;
  shippingFee: number;
  freeShippingThreshold: number;
  taxRate: number;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
}) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const isArabic = locale === "ar";
  const numberFormatter = new Intl.NumberFormat(isArabic ? "ar-SA" : "en-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const copy = isArabic
    ? {
        eyebrow: "إتمام الطلب",
        title: "بيانات التوصيل",
        contact: "معلومات العميل",
        address: "عنوان التوصيل داخل السعودية",
        name: "الاسم الكامل",
        email: "البريد الإلكتروني",
        phone: "رقم الجوال",
        country: "الدولة",
        countryValue: "المملكة العربية السعودية",
        city: "المدينة",
        district: "الحي",
        street: "عنوان الشارع",
        building: "رقم المبنى",
        apartment: "رقم الشقة (اختياري)",
        postal: "الرمز البريدي",
        notes: "ملاحظات التوصيل (اختياري)",
        shippingMethod: "طريقة التوصيل",
        standard: "التوصيل القياسي",
        standardTime: "من 2 إلى 5 أيام عمل",
        summary: "ملخص الطلب",
        quantity: "الكمية",
        subtotal: "المجموع الفرعي",
        shipping: "رسوم التوصيل",
        tax: "الضريبة",
        total: "الإجمالي",
        free: "مجاني",
        shippingNote: `توصيل مجاني للطلبات فوق ${numberFormatter.format(freeShippingThreshold)} SAR.`,
        placeOrder: "تأكيد الطلب",
        placingOrder: "جارٍ إنشاء الطلب",
        secure:
          "سيتم إنشاء الطلب للتأكيد. لا يتم تحصيل أي دفعة إلكترونية في هذه الخطوة.",
        empty: "حقيبتك فارغة",
        back: "العودة إلى الحقيبة",
        loadError: "تعذر تحميل حقيبتك. يرجى المحاولة مرة أخرى.",
        checkoutError: "تعذر إنشاء الطلب. يرجى مراجعة البيانات والمحاولة مرة أخرى.",
      }
    : {
        eyebrow: "Checkout",
        title: "Delivery details",
        contact: "Customer information",
        address: "Saudi delivery address",
        name: "Full name",
        email: "Email address",
        phone: "Mobile number",
        country: "Country",
        countryValue: "Saudi Arabia",
        city: "City",
        district: "District",
        street: "Street address",
        building: "Building number",
        apartment: "Apartment (optional)",
        postal: "Postal code",
        notes: "Delivery notes (optional)",
        shippingMethod: "Shipping method",
        standard: "Standard shipping",
        standardTime: "2–5 business days",
        summary: "Order summary",
        quantity: "Quantity",
        subtotal: "Subtotal",
        shipping: "Shipping fee",
        tax: "Tax",
        total: "Total",
        free: "Free",
        shippingNote: `Complimentary delivery on orders over ${numberFormatter.format(freeShippingThreshold)} SAR.`,
        placeOrder: "Place order",
        placingOrder: "Creating order",
        secure:
          "Your order will be created for confirmation. Online payment is not collected at this step.",
        empty: "Your bag is empty",
        back: "Back to bag",
        loadError: "We could not load your bag. Please try again.",
        checkoutError:
          "We could not create your order. Review your details and try again.",
      };
  const whatsappCopy = isArabic
    ? {
        title: "هل تحتاج إلى مساعدة لإتمام طلبك؟",
        action: "تواصل مع نورا",
        message: "مرحباً نورا، أحتاج إلى مساعدة لإتمام طلبي.",
      }
    : {
        title: "Need help placing your order?",
        action: "Chat with NURAA",
        message: `${whatsappMessageTemplate}\n\nI need help placing my order.`,
      };

  useEffect(() => {
    void fetch(`/api/cart?locale=${locale}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Cart request failed");
        return response.json();
      })
      .then(setCart)
      .catch(() => setError(copy.loadError));
    void trackStorefrontEvent("CHECKOUT_START");
  }, [copy.loadError, locale]);

  const formatPrice = (value: number) =>
    `${numberFormatter.format(value)} SAR`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...payload,
          locale,
          ...getStorefrontAnalyticsContext(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error ?? copy.checkoutError);
      }
      window.location.assign(result.redirectUrl);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : copy.checkoutError,
      );
      setPending(false);
    }
  }

  if (!cart && !error) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#fbfaf6]">
        <Loader2
          className="size-6 animate-spin text-[#1f342b]"
          aria-label={copy.placingOrder}
        />
      </div>
    );
  }

  if (!cart) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[#fbfaf6] px-5 text-center">
        <div>
          <AlertCircle className="mx-auto size-8 text-red-800" />
          <h1 className="font-display mt-5 text-4xl text-[#1f342b]">
            {copy.loadError}
          </h1>
          <Link
            className="mt-8 inline-flex min-h-11 items-center border-b border-[#1f342b]"
            href={`/${locale}/cart`}
          >
            {copy.back}
          </Link>
        </div>
      </main>
    );
  }

  if (!cart.items.length) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[#fbfaf6] px-5 text-center">
        <div>
          <PackageCheck className="mx-auto size-9 text-[#1f342b]" />
          <h1 className="font-display mt-5 text-5xl text-[#1f342b]">
            {copy.empty}
          </h1>
          <Link
            className="mt-8 inline-flex min-h-11 items-center border-b border-[#1f342b]"
            href={`/${locale}/cart`}
          >
            {copy.back}
          </Link>
        </div>
      </main>
    );
  }

  const shipping = cart.subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const tax = Math.round(cart.subtotal * taxRate * 100) / 100;
  const total = cart.subtotal + shipping + tax;

  return (
    <main className="bg-[#f3f0e9] text-[#1b1d1a]">
      <section className="mx-auto max-w-[1240px] px-5 py-14 sm:px-6 md:px-10 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7b4d35]">
          {copy.eyebrow}
        </p>
        <h1 className="font-display mt-3 text-[clamp(3.25rem,7vw,5.75rem)] leading-none tracking-[-.025em] text-[#1f342b]">
          {copy.title}
        </h1>

        <form
          onSubmit={submit}
          className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14"
        >
          <div className="space-y-8">
            <section className="bg-white p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-[#17251f] text-xs font-semibold text-white">
                  1
                </span>
                <h2 className="font-display text-3xl text-[#1f342b]">
                  {copy.contact}
                </h2>
              </div>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field
                  label={copy.name}
                  name="name"
                  autoComplete="name"
                />
                <Field
                  label={copy.email}
                  name="email"
                  type="email"
                  autoComplete="email"
                  dir="ltr"
                />
                <Field
                  label={copy.phone}
                  name="phone"
                  type="tel"
                  placeholder="+9665XXXXXXXX"
                  autoComplete="tel"
                  dir="ltr"
                  className="sm:col-span-2"
                />
              </div>
            </section>

            <section className="bg-white p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-[#17251f] text-xs font-semibold text-white">
                  2
                </span>
                <h2 className="font-display text-3xl text-[#1f342b]">
                  {copy.address}
                </h2>
              </div>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="country-display">{copy.country}</Label>
                  <div
                    id="country-display"
                    className="mt-2 flex h-12 items-center border border-black/16 bg-[#f8f6f1] px-3 text-sm text-black/65"
                  >
                    {copy.countryValue}
                  </div>
                  <input type="hidden" name="country" value="SA" />
                </div>
                <Field
                  label={copy.city}
                  name="city"
                  autoComplete="address-level2"
                />
                <Field
                  label={copy.district}
                  name="district"
                  autoComplete="address-level3"
                />
                <Field
                  label={copy.street}
                  name="street"
                  autoComplete="street-address"
                  className="sm:col-span-2"
                />
                <Field
                  label={copy.building}
                  name="building"
                  autoComplete="address-line2"
                />
                <Field
                  label={copy.apartment}
                  name="apartment"
                  required={false}
                />
                <Field
                  label={copy.postal}
                  name="postalCode"
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  autoComplete="postal-code"
                  dir="ltr"
                />
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">{copy.notes}</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    maxLength={500}
                    className="mt-2 min-h-24 rounded-none border-black/16 bg-white"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-[#17251f] text-xs font-semibold text-white">
                  3
                </span>
                <h2 className="font-display text-3xl text-[#1f342b]">
                  {copy.shippingMethod}
                </h2>
              </div>
              <label className="mt-7 flex cursor-pointer items-center gap-4 border border-[#17251f] p-4">
                <input
                  type="radio"
                  name="shippingMethod"
                  value="STANDARD"
                  defaultChecked
                  className="size-4 accent-[#17251f]"
                />
                <Truck className="size-5 text-[#7b4d35]" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold">
                    {copy.standard}
                  </span>
                  <span className="mt-1 block text-xs text-black/50">
                    {copy.standardTime}
                  </span>
                </span>
                <span className="text-sm font-medium">
                  {shipping === 0 ? copy.free : formatPrice(shipping)}
                </span>
              </label>
            </section>
          </div>

          <aside className="h-fit bg-[#eee8de] p-6 sm:p-8 lg:sticky lg:top-32">
            <h2 className="font-display text-3xl text-[#1f342b]">
              {copy.summary}
            </h2>
            <div className="mt-6 space-y-5">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-white">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-medium leading-6">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-black/48">
                      {copy.quantity} ×{" "}
                      {numberFormatter.format(item.quantity)}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-7 space-y-3 border-t border-black/12 pt-5 text-sm">
              <SummaryRow
                label={copy.subtotal}
                value={formatPrice(cart.subtotal)}
              />
              <SummaryRow
                label={copy.shipping}
                value={shipping === 0 ? copy.free : formatPrice(shipping)}
              />
              {tax > 0 ? (
                <SummaryRow label={copy.tax} value={formatPrice(tax)} />
              ) : null}
              <p className="text-xs leading-5 text-black/48">
                {copy.shippingNote}
              </p>
              <div className="flex justify-between border-t border-black/12 pt-4 text-lg font-semibold">
                <span>{copy.total}</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-5 flex gap-2 bg-red-50 p-3 text-sm leading-6 text-red-900"
              >
                <AlertCircle
                  className="mt-1 size-4 shrink-0"
                  aria-hidden="true"
                />
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={
                pending || cart.items.some((item) => !item.available)
              }
              className="mt-6 h-14 w-full rounded-none bg-[#17251f] text-xs uppercase tracking-[.14em] text-white hover:bg-[#17251f]/88"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {copy.placingOrder}
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  {copy.placeOrder}
                </>
              )}
            </Button>
            <p className="mt-4 flex gap-2 text-xs leading-5 text-black/48">
              <LockKeyhole
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              {copy.secure}
            </p>
            {whatsappNumber ? (
              <div className="mt-6 border-t border-black/12 pt-6 text-center">
                <p className="text-sm font-medium text-[#17251f]">
                  {whatsappCopy.title}
                </p>
                <WhatsAppLink
                  phone={whatsappNumber}
                  message={whatsappCopy.message}
                  includeCurrentUrl
                  source="checkout_help"
                  ariaLabel={whatsappCopy.action}
                  className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 border border-[#17251f] bg-transparent px-4 text-sm font-semibold text-[#17251f] transition-colors hover:bg-[#17251f] hover:text-white"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {whatsappCopy.action}
                </WhatsAppLink>
              </div>
            ) : null}
          </aside>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
  className = "",
  ...props
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  inputMode?: "numeric";
  pattern?: string;
  autoComplete?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-2 h-12 rounded-none border-black/16 bg-white"
        {...props}
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-5">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
