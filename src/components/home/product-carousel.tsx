"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { StorefrontProduct } from "@/features/catalog/catalog.repository";

export function ProductCarousel({products,locale}:{products:StorefrontProduct[];locale:Locale}) {
  const track=useRef<HTMLDivElement>(null);
  const move=(direction:number)=>track.current?.scrollBy({left:direction*track.current.clientWidth*.72,behavior:"smooth"});
  return <div><div ref={track} className="scrollbar-none flex snap-x snap-mandatory gap-px overflow-x-auto bg-black/20 pb-px">{products.map((product,index)=>{const copy=product[locale];const notes=[...copy.topNotes,...copy.heartNotes,...copy.baseNotes].slice(0,3).join(" · ");return <article key={product.id} className="group min-w-[84vw] snap-start bg-white p-5 sm:min-w-[49vw] lg:min-w-[31%]"><Link href={`/${locale}/products/${product.slug}`} className="block"><div className="relative aspect-[4/5] overflow-hidden bg-[#F1EEE8]"><Image src={product.image} alt={copy.name} fill priority={index===0} className="object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.035]" sizes="(max-width:640px) 84vw,(max-width:1024px) 49vw,31vw"/></div><div className="px-1 py-6"><p className="text-xs uppercase tracking-[.16em] text-black/48">{copy.scentFamily||copy.category}</p><h3 className="font-display mt-3 text-4xl font-medium text-black">{copy.name}</h3><p className="mt-3 text-sm uppercase tracking-[.08em] text-black/45">{notes}</p><p className="mt-5 line-clamp-2 max-w-md text-base leading-7 text-black/60">{copy.story||copy.description}</p><span className="maison-link mt-7 inline-flex items-center gap-2 border-b border-black pb-2 text-sm text-black">{locale==="ar"?"اكتشفوا الحكاية":"Discover the story"}<ArrowUpRight size={15}/></span></div></Link></article>;})}</div>
    <div className="mt-8 flex justify-end gap-2"><button onClick={()=>move(locale==="ar"?1:-1)} aria-label="Previous products" className="grid size-12 place-items-center rounded-full border border-black/25 text-black transition duration-500 hover:bg-black hover:text-white"><ArrowLeft size={18}/></button><button onClick={()=>move(locale==="ar"?-1:1)} aria-label="Next products" className="grid size-12 place-items-center rounded-full border border-black/25 text-black transition duration-500 hover:bg-black hover:text-white"><ArrowRight size={18}/></button></div>
  </div>;
}
