"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeader({locale}:{locale:Locale}) {
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  const [bagCount,setBagCount]=useState(0);
  const other=locale==="en"?"ar":"en";
  const home=`/${locale}`;
  const items=locale==="ar"?[
    ["الرئيسية",home],["العطور",`${home}/products#catalog`],["المجموعات",`${home}#collections`],["الهدايا",`${home}#gifts`],["قصتنا",`${home}#story`],
  ]:[
    ["Home",home],["Fragrance",`${home}/products#catalog`],["Collections",`${home}#collections`],["Gifts",`${home}#gifts`],["Our Story",`${home}#story`],
  ];
  const active=(href:string)=>href===home?pathname===home:href.includes("products")&&pathname.startsWith(`${home}/products`);
  useEffect(()=>{const load=()=>{void fetch("/api/cart").then(response=>response.ok?response.json():null).then(data=>setBagCount(data?.itemCount??0)).catch(()=>undefined)};load();window.addEventListener("nuraa:cart-updated",load);return()=>window.removeEventListener("nuraa:cart-updated",load)},[]);
  return <>
    <div className="bg-black px-4 py-2.5 text-center text-xs tracking-[.08em] text-white">{locale==="ar"?"توصيل مجاني داخل المملكة للطلبات فوق 250 ر.س":"Complimentary delivery across KSA on orders over 250 SAR"}</div>
    <header className="sticky top-0 z-40 border-b border-black/15 bg-[#FCFBF8]/96 text-black backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 lg:h-[88px] lg:px-10">
        <Sheet open={open} onOpenChange={setOpen}><SheetTrigger render={<button aria-label="Open menu" className="grid size-11 place-items-center lg:hidden"/>}><Menu size={24}/></SheetTrigger><SheetContent side={locale==="ar"?"right":"left"} className="bg-white text-black"><SheetHeader className="border-b border-black/15 px-7 py-7"><SheetTitle className="font-display text-4xl font-medium tracking-[.12em]" translate="no">NURAA</SheetTitle></SheetHeader><nav className="flex flex-col px-7 py-4">{items.map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)} className="border-b border-black/12 py-5 font-display text-3xl">{label}</Link>)}</nav></SheetContent></Sheet>
        <Link href={home} aria-label="NURAA home" translate="no" className="font-display absolute left-1/2 -translate-x-1/2 text-[34px] font-medium tracking-[.16em] lg:text-[40px]">NURAA</Link>
        <div className="ms-auto flex items-center gap-5"><Link href={`/${other}`} className="px-2 py-2 text-sm font-medium">{other==="ar"?"ع":"EN"}</Link><Link href={`${home}/cart`} aria-label={locale==="ar"?"حقيبة التسوق":"Shopping bag"} className="relative grid size-10 place-items-center"><ShoppingBag size={22}/>{bagCount>0?<span className="absolute end-0 top-0 grid min-w-5 place-items-center rounded-full bg-black px-1 text-[10px] leading-5 text-white">{bagCount}</span>:null}</Link></div>
      </div>
      <nav className="mx-auto hidden h-[58px] max-w-[1500px] items-center justify-center gap-14 border-t border-black/10 px-10 lg:flex">{items.map(([label,href])=><Link key={href} href={href} aria-current={active(href)?"page":undefined} className={cn("relative py-4 text-[15px] tracking-[.015em] transition-opacity hover:opacity-55 after:absolute after:inset-x-0 after:bottom-2 after:h-px after:scale-x-0 after:bg-black after:transition-transform",active(href)&&"after:scale-x-100")}>{label}</Link>)}</nav>
    </header>
  </>;
}
