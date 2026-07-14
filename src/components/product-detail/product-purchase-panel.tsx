"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductPurchasePanel({ stock, locale }: { stock: number; locale: "en" | "ar" }) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const labels = locale === "ar"
    ? { quantity: "الكمية", add: "أضف إلى الحقيبة", out: "غير متوفر حالياً", reserved: "ستتوفر سلة التسوق في المرحلة التالية." }
    : { quantity: "Quantity", add: "Add to bag", out: "Currently unavailable", reserved: "Shopping bag will be enabled in the next phase." };

  return (
    <div className="mt-9">
      <div className="mb-4 flex items-center justify-between border-y border-black/12 py-4">
        <span className="text-xs uppercase tracking-[.14em] text-black/55">{labels.quantity}</span>
        <div className="flex items-center border border-black/20">
          <button type="button" className="grid size-10 place-items-center" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus className="size-3.5" /></button>
          <span className="w-10 text-center text-sm">{quantity}</span>
          <button type="button" className="grid size-10 place-items-center" onClick={() => setQuantity((value) => Math.min(Math.max(stock, 1), value + 1))} aria-label="Increase quantity"><Plus className="size-3.5" /></button>
        </div>
      </div>
      <Button type="button" disabled={stock < 1} onClick={() => setMessage(labels.reserved)} className="h-14 w-full rounded-none bg-black text-xs uppercase tracking-[.2em] text-white hover:bg-black/80">{stock > 0 ? labels.add : labels.out}</Button>
      {message ? <p className="mt-3 text-center text-xs text-black/50" role="status">{message}</p> : null}
    </div>
  );
}
