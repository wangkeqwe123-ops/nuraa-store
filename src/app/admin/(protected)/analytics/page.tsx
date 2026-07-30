import {
  BarChart3,
  Eye,
  MessageCircle,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import { ConversionFunnel } from "@/components/admin/conversion-funnel";
import { TrafficChart } from "@/components/admin/dashboard-charts";
import { MetricCard } from "@/components/admin/metric-card";
import { PageHeader } from "@/components/admin/page-header";
import { RangeTabs } from "@/components/admin/range-tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getDashboardData,
  parseRange,
} from "@/features/analytics/dashboard.service";

export default async function Analytics({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const range = parseRange((await searchParams).range);
  const data = await getDashboardData(range);

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Understand traffic, customer behavior and private-sales intent."
        actions={<RangeTabs range={range} path="/admin/analytics" />}
      />
      <Tabs defaultValue="overview" className="mb-5">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Visits"
          value={data.kpis.visitors.toLocaleString()}
          helper="Unique sessions"
          icon={Eye}
        />
        <MetricCard
          label="Orders"
          value={String(data.kpis.orders)}
          helper="Purchase events"
          icon={ReceiptText}
        />
        <MetricCard
          label="WhatsApp"
          value={data.kpis.whatsappClicks.toLocaleString()}
          helper="Sales conversations"
          icon={MessageCircle}
          accent
        />
        <MetricCard
          label="Revenue"
          value={`${data.kpis.revenue.toLocaleString()} SAR`}
          helper="Confirmed sales"
          icon={TrendingUp}
        />
        <MetricCard
          label="Conversion"
          value={`${data.kpis.conversion.toFixed(2)}%`}
          helper="Visit-to-purchase rate"
          icon={BarChart3}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <TrafficChart data={data.channels} />
        <ConversionFunnel data={data.funnel} />
      </div>

      <Card className="mt-5 border-[#12372a]/10 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Channel performance</CardTitle>
          <CardDescription>Attribution from first-touch UTM data</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Source</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="pr-6 text-right">Conversion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.channels.map((channel) => (
                <TableRow key={channel.channel}>
                  <TableCell className="pl-6">
                    <Badge
                      variant="outline"
                      className="border-[#12372a]/15 bg-[#12372a]/4 text-[#12372a]"
                    >
                      {channel.channel[0]
                        + channel.channel.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{channel.visits}</TableCell>
                  <TableCell>{channel.whatsappClicks}</TableCell>
                  <TableCell>{channel.orders}</TableCell>
                  <TableCell>{channel.revenue.toLocaleString()} SAR</TableCell>
                  <TableCell className="pr-6 text-right">
                    {channel.conversion.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-5 border-[#12372a]/10 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Product performance</CardTitle>
          <CardDescription>
            Views, cart intent, WhatsApp enquiries and purchase outcomes
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Product</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Add to cart</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Purchases</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="pr-6 text-right">CVR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topProducts.length ? (
                data.topProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="pl-6 font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.views}</TableCell>
                    <TableCell>{product.carts}</TableCell>
                    <TableCell>{product.whatsappClicks}</TableCell>
                    <TableCell>{product.orders}</TableCell>
                    <TableCell>
                      {product.revenue.toLocaleString()} SAR
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {product.views
                        ? (product.orders / product.views * 100).toFixed(2)
                        : "0.00"}
                      %
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No product activity in this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
