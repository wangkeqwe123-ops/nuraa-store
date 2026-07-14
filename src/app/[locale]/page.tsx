import { notFound } from "next/navigation";
import { listStorefrontProducts } from "@/features/catalog/catalog.repository";
import { isLocale } from "@/i18n/config";
import { HeroSection } from "@/components/home/hero-section";
import { CollectionSection } from "@/components/home/collection-section";
import { BestSellerSection } from "@/components/home/best-seller-section";
import { BrandStorySection } from "@/components/home/brand-story-section";
import { TrustSection } from "@/components/home/trust-section";
import { GiftSection } from "@/components/home/gift-section";
import { JournalSection } from "@/components/home/journal-section";
import { listHomepageSections } from "@/features/homepage/homepage.repository";

export const dynamic="force-dynamic";
export default async function Home({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params;
  if(!isLocale(locale)) notFound();
  const [products,sections]=await Promise.all([listStorefrontProducts(),listHomepageSections()]);
  const hero=sections.find(section=>section.sectionKey==="hero_banner");
  const story=sections.find(section=>section.sectionKey==="brand_story");
  const collections=sections.filter(section=>section.sectionKey.startsWith("collection_"));
  const gifts=sections.filter(section=>section.sectionKey.startsWith("gift_"));
  const journal=sections.find(section=>section.sectionKey==="journal_section");
  const blocks=[
    hero&&{key:"hero",order:hero.sortOrder,node:<HeroSection locale={locale} section={hero}/>},
    collections.length&&{key:"collections",order:Math.min(...collections.map(section=>section.sortOrder)),node:<CollectionSection locale={locale} sections={collections}/>},
    story&&{key:"story",order:story.sortOrder,node:<BrandStorySection locale={locale} section={story}/>},
    gifts.length&&{key:"gifts",order:Math.min(...gifts.map(section=>section.sortOrder)),node:<GiftSection locale={locale} sections={gifts}/>},
    journal&&{key:"journal",order:journal.sortOrder,node:<JournalSection locale={locale} section={journal}/>},
  ].filter(Boolean) as {key:string;order:number;node:React.ReactNode}[];
  blocks.push({key:"products",order:35,node:<BestSellerSection locale={locale} products={products}/>});
  blocks.sort((a,b)=>a.order-b.order);
  return <>{blocks.map(block=><div key={block.key}>{block.node}</div>)}<TrustSection locale={locale}/></>;
}
