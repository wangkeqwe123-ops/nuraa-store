import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3 } from "lucide-react";
import { db } from "@/lib/db";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  if (!isLocale(locale)) notFound();
  const order = await db.order.findUnique({ where: { publicToken: token }, include: { items: true, shipment: true } });
  if (!order) notFound();
  const paid = order.paymentStatus === "PAID";
  const copy = locale === "ar" ? { paid:"تم تأكيد طلبك", pending:"بانتظار تأكيد الدفع", thanks:"شكراً لاختياركم نورا.", number:"رقم الطلب", total:"الإجمالي", status:"حالة التوصيل", back:"متابعة التسوق" } : { paid:"Your order is confirmed", pending:"Payment confirmation pending", thanks:"Thank you for choosing NURAA.", number:"Order number", total:"Total", status:"Delivery status", back:"Continue shopping" };
  return <main className="bg-[#fcfbf8] px-5 py-20 text-black md:py-28"><section className="mx-auto max-w-2xl border border-black/12 bg-white p-7 text-center md:p-12">{paid?<CheckCircle2 className="mx-auto size-12 text-emerald-700"/>:<Clock3 className="mx-auto size-12 text-amber-700"/>}<h1 className="font-display mt-6 text-4xl md:text-6xl">{paid?copy.paid:copy.pending}</h1><p className="mt-4 text-black/55">{copy.thanks}</p><dl className="mt-10 divide-y divide-black/10 border-y border-black/10 text-start"><div className="flex justify-between py-4"><dt className="text-black/50">{copy.number}</dt><dd className="font-medium">{order.orderNumber}</dd></div><div className="flex justify-between py-4"><dt className="text-black/50">{copy.total}</dt><dd className="font-medium">{Number(order.totalAmount).toLocaleString()} {order.currency}</dd></div><div className="flex justify-between py-4"><dt className="text-black/50">{copy.status}</dt><dd className="font-medium">{order.fulfillmentStatus}</dd></div></dl><Link href={`/${locale}/products`} className="mt-9 inline-block border-b border-black pb-1 text-sm uppercase tracking-[.14em]">{copy.back}</Link></section></main>;
}
