import { RotateCcw, Truck } from "lucide-react";

export function DeliveryReturns({ locale }: { locale: "en" | "ar" }) {
  const content = locale === "ar"
    ? [
        {
          title: "التوصيل داخل السعودية",
          body: "توصيل متتبع إلى جميع مناطق المملكة خلال 2–5 أيام عمل. تظهر التكلفة النهائية عند إتمام الطلب.",
          Icon: Truck,
        },
        {
          title: "سياسة الاستبدال والإرجاع",
          body: "يمكن طلب إرجاع المنتجات غير المفتوحة خلال 7 أيام من الاستلام، وفق شروط سياسة NURAA.",
          Icon: RotateCcw,
        },
      ]
    : [
        {
          title: "Saudi Arabia delivery",
          body: "Tracked delivery across the Kingdom in an estimated 2–5 business days. Final cost is shown at checkout.",
          Icon: Truck,
        },
        {
          title: "Returns & exchanges",
          body: "Unopened products can be requested for return within 7 days of delivery, subject to the NURAA return policy.",
          Icon: RotateCcw,
        },
      ];

  return (
    <section className="border-y border-black/15 bg-[#f3efe7]">
      <div className="mx-auto grid max-w-6xl md:grid-cols-2">
        {content.map(({ title, body, Icon }) => (
          <div key={title} className="flex gap-5 border-black/15 px-7 py-12 first:border-b md:px-12 md:first:border-b-0 md:first:border-r rtl:md:first:border-l rtl:md:first:border-r-0">
            <Icon className="size-5 shrink-0" strokeWidth={1.4} />
            <div>
              <h3 className="font-display text-2xl">{title}</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-black/58">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
