import { CreditCard, Gift, ShieldCheck, Truck } from "lucide-react";

export function CustomerTrust({ locale }: { locale: "en" | "ar" }) {
  const labels = locale === "ar" ? ["عطر فاخر", "توصيل سعودي", "دفع آمن", "تغليف هدايا"] : ["Premium fragrance", "Saudi delivery", "Secure payment", "Gift packaging"];
  const icons = [ShieldCheck, Truck, CreditCard, Gift];
  return <section className="bg-black px-6 py-14 text-white"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 md:grid-cols-4">{labels.map((label, index) => { const Icon = icons[index]; return <div key={label} className="flex flex-col items-center gap-4 border-white/15 text-center md:border-r md:last:border-r-0"><Icon className="size-5" strokeWidth={1.25} /><p className="text-xs uppercase tracking-[.16em] text-white/75">{label}</p></div>; })}</div></section>;
}
