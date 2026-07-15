import Link from "next/link";
import { Banknote, PackageCheck, Search, ShoppingBag, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { MetricCard } from "@/components/admin/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusClass = (status: string) => status === "PAID" || status === "DELIVERED" || status === "CONFIRMED"
  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
  : status === "FAILED" || status === "CANCELLED"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-amber-200 bg-amber-50 text-amber-700";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; fulfillment?: string }> }) {
  const { q, fulfillment } = await searchParams;
  const fulfillmentValues = ["UNFULFILLED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
  const validFulfillment = fulfillmentValues.find((value) => value === fulfillment);
  const where = {
    ...(validFulfillment ? { fulfillmentStatus: validFulfillment } : {}),
    ...(q ? { OR: [{ orderNumber: { contains: q, mode: "insensitive" as const } }, { customerEmail: { contains: q, mode: "insensitive" as const } }, { customerName: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const [orders, orderCount, unfulfilled, shipped, revenue] = await Promise.all([
    db.order.findMany({ where, include: { items: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.order.count(),
    db.order.count({ where: { fulfillmentStatus: "UNFULFILLED", paymentStatus: "PAID" } }),
    db.order.count({ where: { fulfillmentStatus: "SHIPPED" } }),
    db.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { totalAmount: true } }),
  ]);
  return <>
    <PageHeader eyebrow="Commerce" title="Orders" description="Review payment, fulfillment and Saudi delivery status." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Orders" value={String(orderCount)} helper="All time" icon={ShoppingBag}/><MetricCard label="Paid revenue" value={`${Number(revenue._sum.totalAmount ?? 0).toLocaleString()} SAR`} helper="Captured payments" icon={Banknote} accent/><MetricCard label="To fulfill" value={String(unfulfilled)} helper="Paid and unfulfilled" icon={PackageCheck}/><MetricCard label="In transit" value={String(shipped)} helper="Marked as shipped" icon={Truck}/></div>
    <Card className="mt-5 border-[#12372a]/10 shadow-none"><CardContent className="p-0"><form className="flex flex-col gap-3 border-b p-4 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input name="q" defaultValue={q} placeholder="Search order, customer or email" className="pl-9"/></div><select name="fulfillment" defaultValue={fulfillment ?? ""} className="h-9 rounded-lg border bg-white px-3 text-sm"><option value="">All fulfillment</option>{fulfillmentValues.map(value => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select><Button type="submit" variant="outline">Filter</Button></form>
      <div className="overflow-x-auto"><Table className="min-w-[980px]"><TableHeader><TableRow><TableHead className="pl-5">Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Payment</TableHead><TableHead>Fulfillment</TableHead><TableHead>Total</TableHead><TableHead>Placed</TableHead></TableRow></TableHeader><TableBody>{orders.map(order => <TableRow key={order.id}><TableCell className="pl-5"><Link className="font-medium text-[#12372a] hover:underline" href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link></TableCell><TableCell><p className="font-medium">{order.customerName}</p><p className="text-xs text-muted-foreground">{order.customerEmail}</p></TableCell><TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell><TableCell><Badge variant="outline" className={statusClass(order.paymentStatus)}>{order.paymentStatus}</Badge></TableCell><TableCell><Badge variant="outline" className={statusClass(order.fulfillmentStatus)}>{order.fulfillmentStatus.replaceAll("_", " ")}</Badge></TableCell><TableCell className="font-medium">{Number(order.totalAmount).toLocaleString()} {order.currency}</TableCell><TableCell className="text-xs text-muted-foreground">{order.createdAt.toLocaleString("en-SA")}</TableCell></TableRow>)}{!orders.length && <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No orders match these filters.</TableCell></TableRow>}</TableBody></Table></div>
    </CardContent></Card>
  </>;
}
