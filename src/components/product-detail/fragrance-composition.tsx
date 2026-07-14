type Composition = { fragranceNotes: string[]; topNotes: string[]; heartNotes: string[]; baseNotes: string[] };

export function FragranceComposition({ copy, locale }: { copy: Composition; locale: "en" | "ar" }) {
  const labels = locale === "ar"
    ? { eyebrow: "التركيبة العطرية", title: "رحلة العطر", notes: "الطابع", top: "المقدمة", heart: "القلب", base: "القاعدة", empty: "قريباً" }
    : { eyebrow: "Fragrance composition", title: "The scent journey", notes: "Impression", top: "Top notes", heart: "Heart notes", base: "Base notes", empty: "To be revealed" };
  const groups = [[labels.notes, copy.fragranceNotes], [labels.top, copy.topNotes], [labels.heart, copy.heartNotes], [labels.base, copy.baseNotes]] as const;
  return (
    <section className="border-y border-black/10 bg-[#f4f1eb] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl"><p className="text-center text-xs uppercase tracking-[.22em] text-black/45">{labels.eyebrow}</p><h2 className="font-display mt-4 text-center text-4xl md:text-6xl">{labels.title}</h2><div className="mt-14 grid border-l border-t border-black/15 sm:grid-cols-2 lg:grid-cols-4">{groups.map(([label, values]) => <div key={label} className="min-h-48 border-b border-r border-black/15 p-7"><p className="text-xs uppercase tracking-[.18em] text-black/45">{label}</p><p className="font-display mt-8 text-2xl leading-relaxed">{values.join(" · ") || labels.empty}</p></div>)}</div></div>
    </section>
  );
}
