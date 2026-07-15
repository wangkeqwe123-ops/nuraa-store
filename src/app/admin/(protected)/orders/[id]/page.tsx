import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { updateFulfillment } from "../actions";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Address = { address1?: string; address2?: string; city?: string; region?: string; postalCode?: string; country?: string };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true, payments: { orderBy: { createdAt: "desc" } }, shipment: true } });
  if (!order) notFound();
  const address = order.shippingAddress as Address;
  return <>
    <PageHeader eyebrow="Order detail" title={order.orderNumber} description={`Placed ${order.createdAt.toLocaleString("en-SA")}`} actions={<Button variant="outline" nativeButton={false} render={<Link href="/admin/orders"/>}><ArrowLeft/>Back to orders</Button>}/>
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]"><div className="space-y-5"><Card className="border-[#12372a]/10 shadow-none"><CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader><CardContent className="divide-y">{order.items.map(item => <div key={item.id} className="flex items-center gap-4 py-4">{item.imageUrl ? <div className="relative size-16 overflow-hidden bg-muted"><Image src={item.imageUrl} alt="" fill className="object-cover"/></div> : <div className="size-16 bg-muted"/>}<div className="min-w-0 flex-1"><p className="font-medium">{item.productName}</p><p className="text-xs text-muted-foreground">{item.sku} · {item.quantity} × {Number(item.unitPrice).toLocaleString()} SAR</p></div><p className="font-medium">{Number(item.lineTotal).toLocaleString()} SAR</p></div>)}<div className="space-y-2 pt-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{Number(order.subtotal).toLocaleString()} SAR</span></div><div className="flex justify-between"><span>Delivery</span><span>{Number(order.shippingAmount).toLocaleString()} SAR</span></div><div className="flex justify-between"><span>Tax</span><span>{Number(order.taxAmount).toLocaleString()} SAR</span></div><div className="flex justify-between border-t pt-3 text-base font-semibold"><span>Total</span><span>{Number(order.totalAmount).toLocaleString()} SAR</span></div></div></CardContent></Card>
      <Card className="border-[#12372a]/10 shadow-none"><CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="font-medium">{order.payments[0]?.provider ?? "Not initiated"}</p><p className="text-xs text-muted-foreground">{order.payments[0]?.providerPaymentId ?? "No provider reference"}</p></div><Badge variant="outline">{order.paymentStatus}</Badge></div></CardContent></Card></div>
      <div className="space-y-5"><Card className="border-[#12372a]/10 shadow-none"><CardHeader><CardTitle className="text-base">Customer & delivery</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><div><p className="font-medium">{order.customerName}</p><p>{order.customerEmail}</p><p>{order.customerPhone}</p></div><div className="border-t pt-4 text-muted-foreground"><p>{address.address1}</p>{address.address2 && <p>{address.address2}</p>}<p>{[address.city, address.region, address.postalCode].filter(Boolean).join(", ")}</p><p>{address.country ?? "Saudi Arabia"}</p></div></CardContent></Card>
      <Card className="border-[#12372a]/10 shadow-none"><CardHeader><CardTitle className="text-base">Fulfillment</CardTitle></CardHeader><CardContent><form action={updateFulfillment} className="space-y-4"><input type="hidden" name="orderId" value={order.id}/><label className="block text-sm"><span className="mb-1.5 block font-medium">Status</span><select name="fulfillmentStatus" defaultValue={order.fulfillmentStatus} className="h-10 w-full rounded-md border bg-white px-3"><option value="UNFULFILLED">Unfulfilled</option><option value="PROCESSING">Processing</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option></select></label><label className="block text-sm"><span className="mb-1.5 block font-medium">Carrier</span><Input name="carrier" defaultValue={order.shipment?.carrier ?? ""} placeholder="e.g. SMSA Express"/></label><label className="block text-sm"><span className="mb-1.5 block font-medium">Tracking number</span><Input name="trackingNumber" defaultValue={order.shipment?.trackingNumber ?? ""}/></label><Button type="submit" disabled={order.paymentStatus !== "PAID"} className="w-full bg-[#12372a] hover:bg-[#0d2b21]">Save fulfillment</Button>{order.paymentStatus !== "PAID" && <p className="text-xs text-amber-700">Payment must be paid before fulfillment.</p>}</form></CardContent></Card></div>
    </div>
  </>;
}
