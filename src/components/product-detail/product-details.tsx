type ProductDetailsProps = {
  ingredients: string;
  size: string;
  burnTime: string;
  material: string;
  careInstructions: string;
  locale: "en" | "ar";
};

export function ProductDetails({
  ingredients,
  size,
  burnTime,
  material,
  careInstructions,
  locale,
}: ProductDetailsProps) {
  const labels = locale === "ar"
    ? {
        title: "المكونات والتفاصيل",
        ingredients: "المكونات",
        size: "الحجم",
        burnTime: "مدة الاحتراق",
        material: "المادة",
        care: "تعليمات العناية",
      }
    : {
        title: "Ingredients & details",
        ingredients: "Ingredients",
        size: "Size",
        burnTime: "Burn time",
        material: "Material",
        care: "Care instructions",
      };
  const details = [
    [labels.ingredients, ingredients],
    [labels.size, size],
    [labels.burnTime, burnTime],
    [labels.material, material],
    [labels.care, careInstructions],
  ].filter((item) => item[1]);

  if (!details.length) return null;

  return (
    <section className="bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-balance text-5xl tracking-[-.025em] md:text-7xl">
          {labels.title}
        </h2>
        <dl className="mt-14 border-t border-black/15">
          {details.map(([label, value]) => (
            <div key={label} className="grid gap-4 border-b border-black/15 py-6 md:grid-cols-[220px_1fr] md:py-7">
              <dt className="text-sm font-medium">{label}</dt>
              <dd className="max-w-3xl whitespace-pre-line leading-7 text-black/60">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
