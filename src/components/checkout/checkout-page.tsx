"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getStorefrontAnalyticsContext, trackStorefrontEvent } from "@/components/analytics/analytics-tracker";
import type { Locale } from "@/i18n/config";

type Cart = { itemCount: number; subtotal: number; currency: string; items: Array<{ id: string; name: string; image: string; quantity: number; lineTotal: number; available: boolean }> };

export function CheckoutPage({ locale }: { locale: Locale }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const copy = locale === "ar" ? {
    eyebrow:"الدفع الآمن",title:"بيانات التوصيل",contact:"التواصل",address:"عنوان التوصيل داخل السعودية",name:"الاسم الكامل",email:"البريد الإلكتروني",phone:"رقم الجوال",city:"المدينة",district:"الحي",street:"الشارع",building:"رقم المبنى",apartment:"رقم الشقة (اختياري)",postal:"الرمز البريدي",notes:"ملاحظات التوصيل (اختياري)",summary:"ملخص الطلب",subtotal:"المجموع الفرعي",shipping:"التوصيل",shippingNote:"مجاني للطلبات فوق 250 ر.س، وإلا 25 ر.س.",pay:"إتمام الطلب التجريبي",secure:"لن يتم تفعيل الدفع الحقيقي حتى ربط مزود دفع سعودي.",empty:"الحقيبة فارغة",back:"العودة إلى الحقيبة"
  } : {
    eyebrow:"Secure checkout",title:"Delivery details",contact:"Contact",address:"Saudi delivery address",name:"Full name",email:"Email address",phone:"Mobile number",city:"City",district:"District",street:"Street",building:"Building number",apartment:"Apartment (optional)",postal:"Postal code",notes:"Delivery notes (optional)",summary:"Order summary",subtotal:"Subtotal",shipping:"Delivery",shippingNote:"Free over 250 SAR, otherwise 25 SAR.",pay:"Complete test order",secure:"Live payment remains disabled until a Saudi payment provider is connected.",empty:"Your bag is empty",back:"Back to bag"
  };
  useEffect(()=>{void fetch("/api/cart",{cache:"no-store"}).then(r=>r.json()).then(setCart);void trackStorefrontEvent("CHECKOUT_START")},[]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/checkout", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ ...payload, locale, ...getStorefrontAnalyticsContext() }) });
    const result = await response.json().catch(()=>({}));
    if (!response.ok) { setError(result.error ?? "Checkout failed"); setPending(false); return; }
    window.location.assign(result.redirectUrl);
  }

  if(!cart)return <div className="grid min-h-[60vh] place-items-center bg-[#fcfbf8]"><Loader2 className="animate-spin"/></div>;
  if(!cart.items.length)return <main className="grid min-h-[60vh] place-items-center bg-[#fcfbf8] text-center"><div><h1 className="font-display text-5xl">{copy.empty}</h1><Link className="mt-8 inline-block border-b border-black pb-1" href={`/${locale}/cart`}>{copy.back}</Link></div></main>;
  const shipping=cart.subtotal>=250?0:25;
  return <main className="bg-[#f8f5ef] text-black"><section className="mx-auto max-w-6xl px-5 py-14 md:px-10 md:py-20"><p className="text-xs uppercase tracking-[.2em] text-[#9A7137]">{copy.eyebrow}</p><h1 className="font-display mt-4 text-5xl md:text-7xl">{copy.title}</h1>
    <form onSubmit={submit} className="mt-12 grid gap-10 lg:grid-cols-[1fr_390px]"><div className="space-y-10"><section className="bg-white p-6 md:p-8"><h2 className="font-display text-3xl">{copy.contact}</h2><div className="mt-7 grid gap-5 sm:grid-cols-2"><Field label={copy.name} name="name"/><Field label={copy.email} name="email" type="email"/><Field label={copy.phone} name="phone" type="tel" placeholder="+9665XXXXXXXX" className="sm:col-span-2"/></div></section>
      <section className="bg-white p-6 md:p-8"><h2 className="font-display text-3xl">{copy.address}</h2><div className="mt-7 grid gap-5 sm:grid-cols-2"><Field label={copy.city} name="city"/><Field label={copy.district} name="district"/><Field label={copy.street} name="street" className="sm:col-span-2"/><Field label={copy.building} name="building"/><Field label={copy.apartment} name="apartment" required={false}/><Field label={copy.postal} name="postalCode" inputMode="numeric" pattern="[0-9]{5}"/><div className="sm:col-span-2"><Label htmlFor="notes">{copy.notes}</Label><Textarea id="notes" name="notes" maxLength={500} className="mt-2 min-h-24 bg-white"/></div></div></section></div>
      <aside className="h-fit bg-white p-6 lg:sticky lg:top-32"><h2 className="font-display text-3xl">{copy.summary}</h2><div className="mt-6 space-y-5">{cart.items.map(item=><div key={item.id} className="flex gap-4"><div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#eee8de]"><Image src={item.image} alt="" fill className="object-cover" sizes="64px"/></div><div className="min-w-0 flex-1"><p className="line-clamp-2 font-medium">{item.name}</p><p className="mt-1 text-xs text-black/45">× {item.quantity}</p></div><p className="text-sm">{item.lineTotal.toLocaleString()} SAR</p></div>)}</div><div className="mt-7 space-y-3 border-t border-black/12 pt-5 text-sm"><div className="flex justify-between"><span>{copy.subtotal}</span><span>{cart.subtotal.toLocaleString()} SAR</span></div><div className="flex justify-between"><span>{copy.shipping}</span><span>{shipping?`${shipping} SAR`:locale==="ar"?"مجاني":"Free"}</span></div><p className="text-xs leading-5 text-black/45">{copy.shippingNote}</p><div className="flex justify-between border-t border-black/12 pt-4 text-lg font-medium"><span>Total</span><span>{(cart.subtotal+shipping).toLocaleString()} SAR</span></div></div>
        {error?<p role="alert" className="mt-5 bg-red-50 p-3 text-sm text-red-800">{error}</p>:null}<Button type="submit" disabled={pending||cart.items.some(item=>!item.available)} className="mt-6 h-14 w-full rounded-none bg-black text-xs uppercase tracking-[.14em] text-white">{pending?<Loader2 className="animate-spin"/>:copy.pay}</Button><p className="mt-4 flex gap-2 text-xs leading-5 text-black/45"><LockKeyhole className="mt-0.5 size-4 shrink-0"/>{copy.secure}</p></aside>
    </form></section></main>;
}

function Field({label,name,type="text",required=true,className="",...props}:{label:string;name:string;type?:string;required?:boolean;className?:string;placeholder?:string;inputMode?:"numeric";pattern?:string}){return <div className={className}><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} required={required} className="mt-2 h-12 bg-white" {...props}/></div>}
