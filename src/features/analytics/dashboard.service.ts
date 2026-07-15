import "server-only";
import { db } from "@/lib/db";

export type RangeKey = "today" | "7d" | "30d";
export function parseRange(value?: string): RangeKey { return value === "7d" || value === "30d" ? value : "today"; }

function riyadhStart(days: number) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const number = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const today = Date.UTC(number("year"), number("month") - 1, number("day")) - 3 * 3_600_000;
  return new Date(today - (days - 1) * 86_400_000);
}

const rangeStart = (range: RangeKey) => riyadhStart(range === "today" ? 1 : range === "7d" ? 7 : 30);

export async function getDashboardData(range: RangeKey) {
  const start = rangeStart(range);
  const [sessions, purchases, revenue, productCount, events] = await Promise.all([
    db.analyticsEvent.findMany({ where: { eventType: "PAGE_VIEW", occurredAt: { gte: start } }, distinct: ["sessionId"], select: { sessionId: true } }),
    db.analyticsEvent.findMany({ where: { eventType: "PURCHASE", occurredAt: { gte: start } }, distinct: ["orderReference"], select: { orderReference: true } }),
    db.analyticsEvent.aggregate({ where: { eventType: "PURCHASE", occurredAt: { gte: start } }, _sum: { revenue: true } }),
    db.product.count({ where: { deletedAt: null } }),
    db.analyticsEvent.findMany({
      where: { occurredAt: { gte: start } },
      select: { eventType: true, occurredAt: true, revenue: true, sessionId: true, orderReference: true, trafficSource: { select: { channel: true } }, product: { select: { id: true, slug: true, translations: { where: { locale: "EN" }, select: { name: true } } } } },
      orderBy: { occurredAt: "asc" },
    }),
  ]);
  const visitors = sessions.length;
  const orders = purchases.filter((item) => item.orderReference).length;
  const sales = Number(revenue._sum.revenue ?? 0);
  const days = range === "today" ? 1 : range === "7d" ? 7 : 30;
  const trend = new Map<string, { label: string; revenue: number; orders: Set<string>; visitors: Set<string> }>();
  for (let index = 0; index < days; index++) {
    const date = new Date(start.getTime() + index * 86_400_000);
    trend.set(date.toISOString().slice(0, 10), { label: range === "today" ? "Today" : date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "Asia/Riyadh" }), revenue: 0, orders: new Set(), visitors: new Set() });
  }
  const channels = new Map<string, { visits: Set<string>; orders: Set<string>; revenue: number }>();
  const products = new Map<string, { id: string; name: string; slug: string; views: number; carts: number; orders: number; revenue: number }>();
  for (const event of events) {
    const day = event.occurredAt.toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
    const daily = trend.get(day);
    if (daily) {
      if (event.eventType === "PAGE_VIEW") daily.visitors.add(event.sessionId);
      if (event.eventType === "PURCHASE") { if (event.orderReference) daily.orders.add(event.orderReference); daily.revenue += Number(event.revenue ?? 0); }
    }
    const channelName = event.trafficSource?.channel ?? "DIRECT";
    if (!channels.has(channelName)) channels.set(channelName, { visits: new Set(), orders: new Set(), revenue: 0 });
    const channel = channels.get(channelName)!;
    if (event.eventType === "PAGE_VIEW") channel.visits.add(event.sessionId);
    if (event.eventType === "PURCHASE") { if (event.orderReference) channel.orders.add(event.orderReference); channel.revenue += Number(event.revenue ?? 0); }
    if (event.product) {
      if (!products.has(event.product.id)) products.set(event.product.id, { id: event.product.id, name: event.product.translations[0]?.name ?? event.product.slug, slug: event.product.slug, views: 0, carts: 0, orders: 0, revenue: 0 });
      const product = products.get(event.product.id)!;
      if (event.eventType === "PRODUCT_VIEW") product.views++;
      if (event.eventType === "ADD_TO_CART") product.carts++;
      if (event.eventType === "PURCHASE") { product.orders++; product.revenue += Number(event.revenue ?? 0); }
    }
  }
  return {
    range,
    kpis: { revenue: sales, orders, visitors, conversion: visitors ? orders / visitors * 100 : 0, aov: orders ? sales / orders : 0, products: productCount },
    trend: [...trend.values()].map((item) => ({ label: item.label, revenue: item.revenue, orders: item.orders.size, visitors: item.visitors.size })),
    channels: ["TIKTOK", "FACEBOOK", "GOOGLE", "DIRECT"].map((channelName) => { const channel = channels.get(channelName); const visits = channel?.visits.size ?? 0; const channelOrders = channel?.orders.size ?? 0; return { channel: channelName, visits, orders: channelOrders, revenue: channel?.revenue ?? 0, conversion: visits ? channelOrders / visits * 100 : 0 }; }),
    funnel: { pageViews: events.filter((event) => event.eventType === "PAGE_VIEW").length, productViews: events.filter((event) => event.eventType === "PRODUCT_VIEW").length, addToCarts: events.filter((event) => event.eventType === "ADD_TO_CART").length, checkoutStarts: events.filter((event) => event.eventType === "CHECKOUT_START").length, purchases: new Set(events.filter((event) => event.eventType === "PURCHASE").map((event) => event.orderReference).filter(Boolean)).size },
    topProducts: [...products.values()].sort((a, b) => b.revenue - a.revenue || b.views - a.views).slice(0, 6),
  };
}
