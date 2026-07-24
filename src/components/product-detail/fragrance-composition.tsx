type Composition = {
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
};

export function FragranceComposition({
  copy,
  locale,
}: {
  copy: Composition;
  locale: "en" | "ar";
}) {
  const labels = locale === "ar"
    ? {
        title: "تكوين العطر",
        intro: "ثلاث طبقات تنكشف تدريجياً لتصنع حضوراً دافئاً ومتوازناً في المنزل.",
        top: "المقدمة",
        heart: "القلب",
        base: "القاعدة",
        empty: "سيتم الكشف عنها قريباً",
      }
    : {
        title: "Fragrance composition",
        intro: "Three layers unfold in sequence, creating a warm and considered presence in the home.",
        top: "Top notes",
        heart: "Heart notes",
        base: "Base notes",
        empty: "To be revealed",
      };
  const tiers = [
    { label: labels.top, values: copy.topNotes, width: "md:w-[56%]" },
    { label: labels.heart, values: copy.heartNotes, width: "md:w-[76%]" },
    { label: labels.base, values: copy.baseNotes, width: "md:w-full" },
  ];

  return (
    <section className="bg-[#17251f] px-6 py-24 text-[#fbfaf7] md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <h2 className="font-display max-w-[10ch] text-balance text-5xl leading-[.98] tracking-[-.025em] md:text-7xl">
            {labels.title}
          </h2>
          <p className="max-w-xl text-pretty text-base leading-8 text-white/68 md:justify-self-end">
            {labels.intro}
          </p>
        </div>
        <div className="mt-16 flex flex-col items-center gap-3 md:mt-20">
          {tiers.map((tier, index) => (
            <div
              key={tier.label}
              className={`w-full border border-white/20 px-6 py-7 text-center ${tier.width}`}
            >
              <div className="flex items-center justify-center gap-4">
                <span className="font-display text-lg text-[#c8a45d]">0{index + 1}</span>
                <h3 className="text-sm font-medium tracking-[.08em]">{tier.label}</h3>
              </div>
              <p className="font-display mt-3 text-2xl leading-relaxed text-white/86 md:text-3xl">
                {tier.values.join(" · ") || labels.empty}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
