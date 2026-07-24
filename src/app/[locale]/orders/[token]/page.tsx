import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  CircleX,
  Clock3,
  PackageCheck,
  Truck,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  getCommerceOrderStatus,
  type CommerceOrderStatus,
} from "@/features/orders/order-status";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

const statusIcons = {
  PENDING: Clock3,
  PAID: CheckCircle2,
  PROCESSING: PackageCheck,
  SHIPPED: Truck,
  COMPLETED: CheckCircle2,
  CANCELLED: CircleX,
} satisfies Record<CommerceOrderStatus, typeof Clock3>;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  if (!isLocale(locale)) notFound();

  const order = await db.order.findUnique({
    where: { publicToken: token },
    include: { items: true, shipment: true },
  });
  if (!order) notFound();

  const isArabic = locale === "ar";
  const commerceStatus = getCommerceOrderStatus(order);
  const StatusIcon = statusIcons[commerceStatus];
  const numberFormatter = new Intl.NumberFormat(
    isArabic ? "ar-SA" : "en-SA",
    { maximumFractionDigits: 2 },
  );
  const copy = isArabic
    ? {
        eyebrow: "تم استلام الطلب",
        title: "شكراً لاختياركم نُورا",
        description:
          "تم إنشاء طلبكم بنجاح. سنراجع التفاصيل ونتواصل معكم لتأكيد الخطوة التالية.",
        number: "رقم الطلب",
        status: "حالة الطلب",
        total: "الإجمالي",
        items: "المنتجات",
        delivery: "التوصيل القياسي داخل السعودية",
        deliveryTime: "2–5 أيام عمل بعد تأكيد الطلب",
        continue: "متابعة التسوق",
        statuses: {
          PENDING: "بانتظار التأكيد",
          PAID: "تم الدفع",
          PROCESSING: "قيد التجهيز",
          SHIPPED: "تم الشحن",
          COMPLETED: "مكتمل",
          CANCELLED: "ملغي",
        },
      }
    : {
        eyebrow: "Order received",
        title: "Thank you for choosing NURAA",
        description:
          "Your order has been created successfully. We will review the details and contact you to confirm the next step.",
        number: "Order number",
        status: "Order status",
        total: "Total",
        items: "Items",
        delivery: "Standard shipping across Saudi Arabia",
        deliveryTime: "2–5 business days after order confirmation",
        continue: "Continue shopping",
        statuses: {
          PENDING: "Pending confirmation",
          PAID: "Paid",
          PROCESSING: "Processing",
          SHIPPED: "Shipped",
          COMPLETED: "Completed",
          CANCELLED: "Cancelled",
        },
      };

  return (
    <main className="bg-[#fbfaf6] px-5 py-16 text-[#1b1d1a] md:py-24">
      <section className="mx-auto max-w-3xl">
        <div className="text-center">
          <StatusIcon
            className={`mx-auto size-11 ${
              commerceStatus === "CANCELLED"
                ? "text-red-800"
                : "text-[#1f342b]"
            }`}
            strokeWidth={1.5}
          />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[.2em] text-[#7b4d35]">
            {copy.eyebrow}
          </p>
          <h1 className="font-display mx-auto mt-4 max-w-2xl text-balance text-[clamp(3rem,7vw,5rem)] leading-none tracking-[-.025em] text-[#1f342b]">
            {copy.title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty leading-7 text-black/58">
            {copy.description}
          </p>
        </div>

        <dl className="mt-12 grid border-y border-black/12 sm:grid-cols-3 sm:divide-x sm:divide-black/12 rtl:sm:divide-x-reverse">
          <OrderFact label={copy.number} value={order.orderNumber} />
          <OrderFact
            label={copy.status}
            value={copy.statuses[commerceStatus]}
          />
          <OrderFact
            label={copy.total}
            value={`${numberFormatter.format(Number(order.totalAmount))} SAR`}
          />
        </dl>

        <div className="mt-10 bg-[#eee8de] p-6 sm:p-8">
          <h2 className="font-display text-3xl text-[#1f342b]">
            {copy.items}
          </h2>
          <div className="mt-5 divide-y divide-black/12">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4">
                {item.imageUrl ? (
                  <div className="relative size-20 shrink-0 bg-white">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="size-20 shrink-0 bg-white" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="mt-1 text-xs text-black/48">
                    {numberFormatter.format(item.quantity)} ×{" "}
                    {numberFormatter.format(Number(item.unitPrice))} SAR
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {numberFormatter.format(Number(item.lineTotal))} SAR
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-3 border-t border-black/12 pt-5 text-sm leading-6 text-black/58">
            <Truck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium text-black/75">{copy.delivery}</p>
              <p>{copy.deliveryTime}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href={`/${locale}/products`}
            className="inline-flex min-h-12 items-center bg-[#17251f] px-8 text-xs font-semibold uppercase tracking-[.14em] text-white transition-opacity hover:opacity-85"
          >
            {copy.continue}
          </Link>
        </div>
      </section>
    </main>
  );
}

function OrderFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-5 text-center">
      <dt className="text-xs text-black/48">{label}</dt>
      <dd className="mt-2 font-medium">{value}</dd>
    </div>
  );
}
