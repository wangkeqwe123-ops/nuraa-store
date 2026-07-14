import { AlertCircle } from "lucide-react";

export function ProductHowToUse({ usage, locale }: { usage: string; locale: "en" | "ar" }) {
  const labels = locale === "ar"
    ? { eyebrow: "طقوس نورا", title: "طريقة الاستخدام", caution: "للاستخدام الخارجي فقط. يُحفظ بعيداً عن الأطفال والحرارة المباشرة، وتوقف عن الاستخدام عند حدوث تهيج." }
    : { eyebrow: "The NURAA ritual", title: "How to use", caution: "For external use only. Keep away from children and direct heat, and discontinue use if irritation occurs." };
  const steps = usage.split(/\n+/).map((step) => step.replace(/^\s*\d+[.)-]?\s*/, "").trim()).filter(Boolean);
  const visibleSteps = steps.length ? steps : [locale === "ar" ? "استخدم كمية صغيرة واترك الرائحة تتكشف بهدوء." : "Use a small amount and allow the fragrance to unfold slowly."];
  return (
    <section className="px-6 py-24 md:py-32"><div className="mx-auto max-w-5xl"><div className="grid gap-12 md:grid-cols-[.7fr_1.3fr]"><div><p className="text-xs uppercase tracking-[.22em] text-black/45">{labels.eyebrow}</p><h2 className="font-display mt-5 text-5xl md:text-6xl">{labels.title}</h2></div><div><ol className="space-y-0 border-t border-black/15">{visibleSteps.map((step, index) => <li key={`${step}-${index}`} className="grid grid-cols-[46px_1fr] border-b border-black/15 py-6"><span className="font-display text-xl text-black/35">{String(index + 1).padStart(2, "0")}</span><p className="text-lg leading-8 text-black/65">{step}</p></li>)}</ol><div className="mt-8 flex gap-3 bg-[#f4f1eb] p-5 text-sm leading-6 text-black/55"><AlertCircle className="mt-0.5 size-4 shrink-0" /><p>{labels.caution}</p></div></div></div></div></section>
  );
}
