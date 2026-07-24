import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Box,
  Mail,
  MapPin,
  Phone,
  Truck,
  UserRound,
} from "lucide-react";
import { db } from "@/lib/db";
import { updateOrderStatus } from "../actions";
import {
  commerceOrderStatuses,
  commerceStatusLabel,
  getCommerceOrderStatus,
  type CommerceOrderStatus,
} from "@/features/orders/order-status";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Address = {
  country?: string;
  city?: string;
  district?: string;
  street?: string;
  building?: string;
  apartment?: string | null;
  postalCode?: string;
  shippingMethod?: string;
  address1?: string;
  address2?: string;
  region?: string;
};

const statusClass: Record<CommerceOrderStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-800",
  PROCESSING: "border-blue-200 bg-blue-50 text-blue-800",
  SHIPPED: "border-violet-200 bg-violet-50 text-violet-800",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-800",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
      shipment: true,
    },
  });
  if (!order) notFound();

  const address = order.shippingAddress as Address;
  const commerceStatus = getCommerceOrderStatus(order);
  const currentIndex = commerceOrderStatuses.indexOf(commerceStatus);
  const availableStatuses =
    commerceStatus === "CANCELLED"
      ? (["CANCELLED"] as const)
      : commerceOrderStatuses.filter(
          (status, index) =>
            status === "CANCELLED" || index >= currentIndex,
        );

  return (
    <>
      <PageHeader
        eyebrow="Order detail"
        title={order.orderNumber}
        description={`Placed ${order.createdAt.toLocaleString("en-SA")}`}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/orders" />}
          >
            <ArrowLeft />
            Back to orders
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Badge
          variant="outline"
          className={`px-3 py-1 ${statusClass[commerceStatus]}`}
        >
          {commerceStatusLabel(commerceStatus)}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items ·{" "}
          {Number(order.totalAmount).toLocaleString()} {order.currency}
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <Card className="border-[#12372a]/10 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Box className="size-4 text-[#956c20]" />
                Order items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-4"
                  >
                    {item.imageUrl ? (
                      <div className="relative size-20 shrink-0 overflow-hidden bg-muted">
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-contain p-1"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="size-20 shrink-0 bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.sku} · {item.quantity} ×{" "}
                        {Number(item.unitPrice).toLocaleString()} SAR
                      </p>
                    </div>
                    <p className="font-medium">
                      {Number(item.lineTotal).toLocaleString()} SAR
                    </p>
                  </div>
                ))}
              </div>

              <div className="ms-auto mt-5 max-w-sm space-y-2 border-t pt-5 text-sm">
                <OrderTotal
                  label="Subtotal"
                  value={Number(order.subtotal)}
                />
                <OrderTotal
                  label="Shipping"
                  value={Number(order.shippingAmount)}
                />
                {Number(order.taxAmount) > 0 ? (
                  <OrderTotal
                    label="Tax"
                    value={Number(order.taxAmount)}
                  />
                ) : null}
                <div className="flex justify-between border-t pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>
                    {Number(order.totalAmount).toLocaleString()} SAR
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#12372a]/10 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Banknote className="size-4 text-[#956c20]" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">
                  {order.payments[0]?.provider ?? "Not collected"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {order.payments[0]?.providerPaymentId
                    ?? "No payment provider reference"}
                </p>
              </div>
              <Badge variant="outline">{order.paymentStatus}</Badge>
            </CardContent>
          </Card>

          {order.notes ? (
            <Card className="border-[#12372a]/10 shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Customer note</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {order.notes}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card className="border-[#12372a]/10 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="size-4 text-[#956c20]" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" />
                {order.customerEmail}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" />
                {order.customerPhone}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#12372a]/10 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="size-4 text-[#956c20]" />
                Saudi delivery address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {address.street ?? address.address1}
              </p>
              <p>
                {[
                  address.building
                    ? `Building ${address.building}`
                    : null,
                  address.apartment
                    ? `Apartment ${address.apartment}`
                    : address.address2,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>
                {[address.district ?? address.region, address.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>{address.postalCode}</p>
              <p>
                {address.country === "SA"
                  ? "Saudi Arabia"
                  : address.country ?? "Saudi Arabia"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#12372a]/10 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="size-4 text-[#956c20]" />
                Order status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateOrderStatus} className="space-y-4">
                <input type="hidden" name="orderId" value={order.id} />
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium">Status</span>
                  <select
                    name="status"
                    defaultValue={commerceStatus}
                    disabled={commerceStatus === "CANCELLED"}
                    className="h-11 w-full rounded-md border bg-white px-3"
                  >
                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {commerceStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium">Carrier</span>
                  <Input
                    name="carrier"
                    defaultValue={order.shipment?.carrier ?? ""}
                    placeholder="e.g. SMSA Express"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium">
                    Tracking number
                  </span>
                  <Input
                    name="trackingNumber"
                    defaultValue={order.shipment?.trackingNumber ?? ""}
                    placeholder="Required for shipped orders"
                  />
                </label>
                <Button
                  type="submit"
                  disabled={commerceStatus === "CANCELLED"}
                  className="w-full bg-[#12372a] hover:bg-[#0d2b21]"
                >
                  Save order status
                </Button>
                <p className="text-xs leading-5 text-muted-foreground">
                  Statuses move forward only. Cancelling releases reserved
                  inventory.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function OrderTotal({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value.toLocaleString()} SAR</span>
    </div>
  );
}
