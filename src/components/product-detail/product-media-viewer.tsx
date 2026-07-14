"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import type { StorefrontMedia } from "@/features/catalog/catalog.repository";

export function ProductMediaViewer({ media, name }: { media: StorefrontMedia[]; name: string }) {
  const usable = media.length ? media : [{ id: "placeholder", url: "/images/products/placeholder.jpg", type: "MAIN_IMAGE" as const, sortOrder: 0, isPrimary: true }];
  const initial = usable.find((item) => item.isPrimary) ?? usable[0];
  const [selectedId, setSelectedId] = useState(initial.id);
  const selected = usable.find((item) => item.id === selectedId) ?? initial;

  return (
    <div className="grid gap-4 lg:grid-cols-[92px_minmax(0,1fr)]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
        {usable.map((item) => (
          <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} aria-label={`View ${item.type.toLowerCase()} media`} className={`relative aspect-square w-20 shrink-0 overflow-hidden border bg-[#f1eee8] transition lg:w-full ${item.id === selected.id ? "border-black" : "border-black/10 opacity-70 hover:opacity-100"}`}>
            {item.type === "VIDEO" ? <><video src={item.url} muted className="size-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-black/10"><Play className="size-5 fill-white text-white" /></span></> : <Image src={item.url} alt="" fill className="object-cover" sizes="92px" />}
          </button>
        ))}
      </div>
      <div className="relative order-1 aspect-[4/5] overflow-hidden bg-[#eeeae3] lg:order-2">
        {selected.type === "VIDEO" ? <video key={selected.url} src={selected.url} controls autoPlay muted playsInline className="size-full object-cover" /> : <Image key={selected.url} src={selected.url} alt={name} fill priority className="object-cover transition duration-700" sizes="(max-width:1024px) 100vw,52vw" />}
      </div>
    </div>
  );
}
