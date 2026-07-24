import Link from "next/link";
import {
  Banknote,
  Clock3,
  PackageCheck,
  Search,
  ShoppingBag,
} from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  commerceOrderStatuses,
  commerceStatusLabel,
  getCommerceOrderStatus,
  type CommerceOrderStatus,
} from "@/features/orders/order-status";
import { PageHeader } from "@/components/admin/page-header";
import { MetricCard } from "@/components/admin/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusClass: Record<CommerceOrderStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-800",
  PROCESSING: "border-blue-200 bg-blue-50 text-blue-800",
  SHIPPED: "border-violet-200 bg-violet-50 text-violet-800",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-800",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const selectedStatus = commerceOrderStatuses.find(
    (value) => value === status,
  );
  const where: Prisma.OrderWhereInput = {
    ...(selectedStatus ? statusWhere(selectedStatus) : {}),
    ...(q
      ? {
          OR: [
            {
              orderNumber: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              customerEmail: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              customerName: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [orders, orderCount, pending, processing, revenue] =
    await Promise.all([
      db.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      db.order.count(),
      db.order.count({
        where: {
          status: "PENDING_PAYMENT",
          paymentStatus: "PENDING",
        },
      }),
      db.order.count({ where: { fulfillmentStatus: "PROCESSING" } }),
      db.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalAmount: true },
      }),
    ]);

  return (
    <>
      <PageHeader
        eyebrow="Commerce"
        title="Orders"
        description="Review customer orders, payment confirmation and Saudi fulfillment."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Orders"
          value={String(orderCount)}
          helper="All time"
          icon={ShoppingBag}
        />
        <MetricCard
          label="Pending"
          value={String(pending)}
          helper="Awaiting confirmation"
          icon={Clock3}
        />
        <MetricCard
          label="Processing"
          value={String(processing)}
          helper="Being prepared"
          icon={PackageCheck}
        />
        <MetricCard
          label="Paid revenue"
          value={`${Number(revenue._sum.totalAmount ?? 0).toLocaleString()} SAR`}
          helper="Confirmed payments"
          icon={Banknote}
          accent
        />
      </div>

      <Card className="mt-5 border-[#12372a]/10 shadow-none">
        <CardContent className="p-0">
          <form className="flex flex-col gap-3 border-b p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search order, customer or email"
                className="pl-9"
              />
            </div>
            <select
              name="status"
              defaultValue={selectedStatus ?? ""}
              className="h-9 rounded-md border bg-white px-3 text-sm"
            >
              <option value="">All statuses</option>
              {commerceOrderStatuses.map((value) => (
                <option key={value} value={value}>
                  {commerceStatusLabel(value)}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Filter
            </Button>
          </form>

          <div className="overflow-x-auto">
            <Table className="min-w-[880px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const commerceStatus = getCommerceOrderStatus(order);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="pl-5">
                        <Link
                          className="font-medium text-[#12372a] hover:underline"
                          href={`/admin/orders/${order.id}`}
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerEmail}
                        </p>
                      </TableCell>
                      <TableCell>
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusClass[commerceStatus]}
                        >
                          {commerceStatusLabel(commerceStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {Number(order.totalAmount).toLocaleString()}{" "}
                        {order.currency}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {order.createdAt.toLocaleString("en-SA")}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!orders.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No orders match these filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function statusWhere(
  status: CommerceOrderStatus,
): Prisma.OrderWhereInput {
  switch (status) {
    case "PENDING":
      return {
        status: "PENDING_PAYMENT",
        paymentStatus: { not: "PAID" },
      };
    case "PAID":
      return {
        status: { notIn: ["CANCELLED", "COMPLETED"] },
        paymentStatus: "PAID",
        fulfillmentStatus: "UNFULFILLED",
      };
    case "PROCESSING":
      return {
        status: { not: "CANCELLED" },
        fulfillmentStatus: "PROCESSING",
      };
    case "SHIPPED":
      return {
        status: { not: "CANCELLED" },
        fulfillmentStatus: "SHIPPED",
      };
    case "COMPLETED":
      return {
        OR: [
          { status: "COMPLETED" },
          { fulfillmentStatus: "DELIVERED" },
        ],
      };
    case "CANCELLED":
      return { status: "CANCELLED" };
  }
}
