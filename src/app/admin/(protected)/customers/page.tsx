import { Search, UserRoundCheck, Users } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { MetricCard } from "@/components/admin/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const where = q ? { OR: [
    { name: { contains: q, mode: "insensitive" as const } },
    { email: { contains: q, mode: "insensitive" as const } },
    { phone: { contains: q } },
  ] } : {};
  const [customers, totalCustomers] = await Promise.all([
    db.customer.findMany({
      where,
      include: { orders: { select: { totalAmount: true, paymentStatus: true, createdAt: true }, orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.customer.count(),
  ]);
  const repeatCustomers = customers.filter((customer) => customer.orders.filter((order) => order.paymentStatus === "PAID").length > 1).length;
  return <>
    <PageHeader eyebrow="Audience" title="Customers" description="Purchase history and contact context for customer support." />
    <div className="grid gap-4 sm:grid-cols-2">
      <MetricCard label="Customers" value={String(totalCustomers)} helper="Guest checkout profiles" icon={Users}/>
      <MetricCard label="Repeat customers" value={String(repeatCustomers)} helper="Two or more paid orders in this view" icon={UserRoundCheck} accent/>
    </div>
    <Card className="mt-5 border-[#12372a]/10 shadow-none"><CardContent className="p-0">
      <form className="flex gap-3 border-b p-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input name="q" defaultValue={q} placeholder="Search name, email or phone" className="pl-9"/></div><Button type="submit" variant="outline">Search</Button></form>
      <div className="overflow-x-auto"><Table className="min-w-[850px]"><TableHeader><TableRow><TableHead className="pl-5">Customer</TableHead><TableHead>Phone</TableHead><TableHead>Paid orders</TableHead><TableHead>Lifetime value</TableHead><TableHead>Last order</TableHead><TableHead>Created</TableHead></TableRow></TableHeader><TableBody>
        {customers.map((customer) => {
          const paid = customer.orders.filter((order) => order.paymentStatus === "PAID");
          return <TableRow key={customer.id}>
            <TableCell className="pl-5"><p className="font-medium">{customer.name}</p><p className="text-xs text-muted-foreground">{customer.email}</p></TableCell>
            <TableCell>{customer.phone}</TableCell><TableCell>{paid.length}</TableCell>
            <TableCell className="font-medium text-[#9a7a16]">{paid.reduce((sum, order) => sum + Number(order.totalAmount), 0).toLocaleString()} SAR</TableCell>
            <TableCell className="text-xs text-muted-foreground">{customer.orders[0]?.createdAt.toLocaleString("en-SA") ?? "—"}</TableCell>
            <TableCell className="text-xs text-muted-foreground">{customer.createdAt.toLocaleDateString("en-SA")}</TableCell>
          </TableRow>;
        })}
        {!customers.length && <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No customers found.</TableCell></TableRow>}
      </TableBody></Table></div>
    </CardContent></Card>
  </>;
}
