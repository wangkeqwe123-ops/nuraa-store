"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackStorefrontEvent } from "@/components/analytics/analytics-tracker";

export function ProductPurchasePanel({ productId, stock, locale }: { productId: string; stock: number; locale: "en" | "ar" }) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const labels = locale === "ar"
    ? { quantity: "الكمية", add: "أضف إلى الحقيبة", adding: "جارٍ الإضافة", out: "غير متوفر حالياً", added: "تمت الإضافة إلى الحقيبة.", error: "تعذر إضافة المنتج. حاول مرة أخرى." }
    : { quantity: "Quantity", add: "Add to bag", adding: "Adding", out: "Currently unavailable", added: "Added to your bag.", error: "We could not add this item. Please try again." };

  async function addToBag() {
    setPending(true); setMessage("");
    try {
      const response = await fetch("/api/cart", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId, quantity, locale }) });
      if (!response.ok) throw new Error("Cart request failed");
      await trackStorefrontEvent("ADD_TO_CART", productId);
      window.dispatchEvent(new CustomEvent("nuraa:cart-updated"));
      setMessage(labels.added);
    } catch { setMessage(labels.error); }
    finally { setPending(false); }
  }

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
      <Button type="button" disabled={stock < 1 || pending} onClick={addToBag} className="h-14 w-full rounded-none bg-black text-xs uppercase tracking-[.2em] text-white hover:bg-black/80">{stock > 0 ? pending ? labels.adding : labels.add : labels.out}</Button>
      {message ? <p className="mt-3 text-center text-xs text-black/50" role="status">{message}</p> : null}
    </div>
  );
}
