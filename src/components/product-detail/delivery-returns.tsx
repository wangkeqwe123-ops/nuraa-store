import { RotateCcw, Truck } from "lucide-react";

export function DeliveryReturns({ locale }: { locale: "en" | "ar" }) {
  const content = locale === "ar"
    ? [{ title: "التوصيل داخل السعودية", body: "توصيل متتبع إلى جميع مناطق المملكة. تظهر المدة والتكلفة النهائية عند إطلاق إتمام الطلب.", Icon: Truck }, { title: "سياسة الإرجاع", body: "يمكن طلب الإرجاع للمنتجات غير المفتوحة وفق سياسة نورا بعد تفعيل الشراء.", Icon: RotateCcw }]
    : [{ title: "Saudi Arabia delivery", body: "Tracked delivery across the Kingdom. Final timing and cost will be shown when checkout launches.", Icon: Truck }, { title: "Return policy", body: "Unopened products may be returned in accordance with the NURAA policy once purchasing is enabled.", Icon: RotateCcw }];
  return <section className="border-y border-black/15 bg-white"><div className="mx-auto grid max-w-7xl md:grid-cols-2">{content.map(({ title, body, Icon }) => <div key={title} className="flex gap-5 border-black/15 px-7 py-12 first:border-b md:px-12 md:first:border-b-0 md:first:border-r"><Icon className="size-5 shrink-0" strokeWidth={1.4} /><div><h3 className="font-display text-2xl">{title}</h3><p className="mt-3 max-w-lg text-sm leading-7 text-black/55">{body}</p></div></div>)}</div></section>;
}
