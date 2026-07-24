"use client";

import { Activity, BarChart3 } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const salesConfig = {
  revenue: { label: "Revenue", color: "#a47728" },
  visitors: { label: "Visitors", color: "#17251f" },
} satisfies ChartConfig;

const trafficConfig = { visits: { label: "Visits", color: "#17251f" } } satisfies ChartConfig;

function EmptyChart({ type }: { type: "sales" | "traffic" }) {
  const Icon = type === "sales" ? Activity : BarChart3;
  return (
    <div className="grid h-[260px] place-items-center border-t border-[#17251f]/8 text-center">
      <div className="max-w-xs px-6">
        <Icon className="mx-auto text-[#17251f]/36" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-[#17251f]">No activity in this range</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Data will appear after storefront visits and completed purchases are recorded.</p>
      </div>
    </div>
  );
}

export function SalesTrendChart({ data }: { data: { label: string; revenue: number; orders: number; visitors: number }[] }) {
  const hasData = data.some((item) => item.revenue > 0 || item.visitors > 0);
  return (
    <Card className="border-[#17251f]/10 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Sales trend</CardTitle>
        <CardDescription>Revenue and visitors across the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={salesConfig} className="h-[260px] w-full">
            <AreaChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
              <defs><linearGradient id="nuraaRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a47728" stopOpacity={.22} /><stop offset="95%" stopColor="#a47728" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="rgba(23,37,31,.09)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stroke="#a47728" fill="url(#nuraaRevenue)" strokeWidth={2} />
              <Area type="monotone" dataKey="visitors" stroke="#17251f" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        ) : <EmptyChart type="sales" />}
      </CardContent>
    </Card>
  );
}

export function TrafficChart({ data }: { data: { channel: string; visits: number }[] }) {
  const hasData = data.some((item) => item.visits > 0);
  return (
    <Card className="border-[#17251f]/10 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Traffic sources</CardTitle>
        <CardDescription>Sessions by acquisition channel</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={trafficConfig} className="h-[260px] w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 12, right: 16 }}>
              <CartesianGrid horizontal={false} stroke="rgba(23,37,31,.09)" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="channel" tickLine={false} axisLine={false} width={76} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="visits" fill="#17251f" radius={[0, 3, 3, 0]} barSize={18} />
            </BarChart>
          </ChartContainer>
        ) : <EmptyChart type="traffic" />}
      </CardContent>
    </Card>
  );
}
