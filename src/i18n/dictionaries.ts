import type { Locale } from "./config";

const dictionaries = {
  en: {
    nav: { shop: "Shop", story: "Our story", journal: "Journal", search: "Search", bag: "Bag" },
    hero: { eyebrow: "A new rhythm of self-care", title: "Small rituals.\nA softer everyday.", body: "Thoughtfully sourced beauty, fragrance and home objects—curated for modern life in Saudi Arabia.", cta: "Explore the edit", note: "Complimentary delivery over 250 SAR" },
    labels: { featured: "The Nuraa edit", viewAll: "Shop all", quick: "View product", sar: "SAR", new: "New", bestseller: "Bestseller" },
    benefits: { title: "Considered at every step", one: "Curated with care", oneBody: "Useful, beautiful objects selected for quality.", two: "Delivered across KSA", twoBody: "Tracked delivery to your door.", three: "Here when you need us", threeBody: "Friendly support in Arabic and English." },
    ritual: { eyebrow: "Your evening, reimagined", title: "Make room for stillness", body: "A quiet edit of calming scents and tactile tools designed to turn the everyday into something intentional.", cta: "Discover home rituals" },
    footer: { line: "Modern rituals, thoughtfully sourced.", shop: "Shop", help: "Help", country: "Saudi Arabia · SAR", rights: "© 2026 Nuraa. All rights reserved." },
    productsTitle: "Objects for everyday rituals", productsBody: "Explore our considered edit of beauty, fragrance and calm.", filter: "All products", details: "Why you'll love it", usage: "The ritual", delivery: "Delivery across Saudi Arabia in 3–7 business days.", add: "Add to bag", back: "Back to shop"
  },
  ar: {
    nav: { shop: "تسوّق", story: "قصتنا", journal: "المجلة", search: "بحث", bag: "الحقيبة" },
    hero: { eyebrow: "إيقاع جديد للعناية الذاتية", title: "طقوس صغيرة.\nيوم أكثر هدوءاً.", body: "مجموعة مختارة بعناية من الجمال والعطور وأغراض المنزل، للحياة العصرية في السعودية.", cta: "اكتشفي المجموعة", note: "توصيل مجاني للطلبات فوق 250 ر.س" },
    labels: { featured: "مختارات نورا", viewAll: "تسوّقي الكل", quick: "عرض المنتج", sar: "ر.س", new: "جديد", bestseller: "الأكثر مبيعاً" },
    benefits: { title: "عناية في كل خطوة", one: "اختيارات مدروسة", oneBody: "قطع عملية وجميلة اخترناها لجودتها.", two: "توصيل لكل المملكة", twoBody: "توصيل متتبع حتى باب منزلك.", three: "نحن هنا لمساعدتك", threeBody: "دعم ودود بالعربية والإنجليزية." },
    ritual: { eyebrow: "مساؤك بصورة جديدة", title: "امنحي الهدوء مساحة", body: "عطور هادئة وأدوات ملموسة تحوّل تفاصيل يومك إلى لحظات مقصودة.", cta: "اكتشفي طقوس المنزل" },
    footer: { line: "طقوس عصرية، مختارة بعناية.", shop: "المتجر", help: "المساعدة", country: "السعودية · ر.س", rights: "© 2026 نورا. جميع الحقوق محفوظة." },
    productsTitle: "قطع لطقوسك اليومية", productsBody: "اكتشفي مختاراتنا من الجمال والعطور والهدوء.", filter: "كل المنتجات", details: "لماذا ستحبينه", usage: "طريقة الاستخدام", delivery: "توصيل داخل السعودية خلال 3–7 أيام عمل.", add: "أضيفي للحقيبة", back: "العودة للمتجر"
  }
} as const;
export function getDictionary(locale: Locale) { return dictionaries[locale]; }
