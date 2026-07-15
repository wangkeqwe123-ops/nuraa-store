"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StorefrontCart } from "@/features/cart/cart.service";
import type { Locale } from "@/i18n/config";

export function CartPage({ locale, initialCart }: { locale: Locale; initialCart: StorefrontCart }) {
  const [cart, setCart] = useState(initialCart);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const copy = locale === "ar"
    ? { eyebrow: "حقيبتك", title: "مختاراتك", empty: "حقيبتك فارغة حالياً.", shop: "اكتشفوا العطور", quantity: "الكمية", remove: "إزالة", subtotal: "المجموع الفرعي", delivery: "تظهر رسوم التوصيل والضرائب قبل الدفع.", checkout: "متابعة إلى الدفع", unavailable: "غير متوفر حالياً" }
    : { eyebrow: "Your bag", title: "Your selection", empty: "Your bag is currently empty.", shop: "Discover fragrances", quantity: "Quantity", remove: "Remove", subtotal: "Subtotal", delivery: "Delivery and applicable taxes are shown before payment.", checkout: "Continue to checkout", unavailable: "Currently unavailable" };

  async function change(itemId: string, quantity: number) {
    setPendingId(itemId);
    const response = await fetch("/api/cart", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemId, quantity }) });
    if (response.ok) setCart(await response.json());
    setPendingId(null); window.dispatchEvent(new CustomEvent("nuraa:cart-updated"));
  }
  async function remove(itemId: string) {
    setPendingId(itemId);
    const response = await fetch("/api/cart", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemId }) });
    if (response.ok) setCart(await response.json());
    setPendingId(null); window.dispatchEvent(new CustomEvent("nuraa:cart-updated"));
  }

  return <main className="bg-[#fcfbf8] text-black"><section className="mx-auto max-w-6xl px-5 py-16 md:px-10 md:py-24">
    <p className="text-xs uppercase tracking-[.2em] text-[#9A7137]">{copy.eyebrow}</p><h1 className="font-display mt-4 text-5xl md:text-7xl">{copy.title}</h1>
    {!cart.items.length ? <div className="mt-14 border-y border-black/12 py-20 text-center"><p className="text-lg text-black/55">{copy.empty}</p><Button nativeButton={false} render={<Link href={`/${locale}/products`}/>} className="mt-8 rounded-none bg-black px-8 text-white">{copy.shop}</Button></div> : <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
      <div className="divide-y divide-black/12 border-y border-black/12">{cart.items.map(item=><article key={item.id} className="grid grid-cols-[110px_1fr] gap-5 py-6 sm:grid-cols-[150px_1fr]">
        <Link href={`/${locale}/products/${item.slug}`} className="relative aspect-[4/5] overflow-hidden bg-[#eee8de]"><Image src={item.image} alt={item.name} fill className="object-cover" sizes="150px"/></Link>
        <div className="flex min-w-0 flex-col"><div className="flex justify-between gap-4"><div><Link href={`/${locale}/products/${item.slug}`} className="font-display text-2xl hover:underline">{item.name}</Link><p className="mt-2 text-sm text-black/55">{item.price.toLocaleString()} {item.currency}</p>{!item.available?<p className="mt-2 text-xs text-red-700">{copy.unavailable}</p>:null}</div><button type="button" onClick={()=>remove(item.id)} aria-label={copy.remove} className="grid size-10 place-items-center text-black/45 hover:text-black"><Trash2 size={17}/></button></div>
          <div className="mt-auto flex items-end justify-between gap-4 pt-6"><div><p className="mb-2 text-[10px] uppercase tracking-[.16em] text-black/45">{copy.quantity}</p><div className="flex items-center border border-black/20"><button type="button" disabled={pendingId===item.id} onClick={()=>change(item.id,Math.max(0,item.quantity-1))} className="grid size-9 place-items-center"><Minus size={13}/></button><span className="w-9 text-center text-sm">{pendingId===item.id?<Loader2 className="mx-auto size-3 animate-spin"/>:item.quantity}</span><button type="button" disabled={pendingId===item.id||item.quantity>=item.stock} onClick={()=>change(item.id,item.quantity+1)} className="grid size-9 place-items-center"><Plus size={13}/></button></div></div><p className="font-medium">{item.lineTotal.toLocaleString()} {item.currency}</p></div>
        </div>
      </article>)}</div>
      <aside className="h-fit border border-black/12 bg-white p-7 lg:sticky lg:top-32"><div className="flex justify-between text-lg"><span>{copy.subtotal}</span><strong>{cart.subtotal.toLocaleString()} {cart.currency}</strong></div><p className="mt-4 text-sm leading-6 text-black/50">{copy.delivery}</p><Button disabled={cart.items.some(item=>!item.available)} nativeButton={false} render={<Link href={`/${locale}/checkout`}/>} className="mt-7 h-13 w-full rounded-none bg-black text-xs uppercase tracking-[.16em] text-white">{copy.checkout}</Button></aside>
    </div>}
  </section></main>;
}
