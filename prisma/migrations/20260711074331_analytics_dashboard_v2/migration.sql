-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('PAGE_VIEW', 'PRODUCT_VIEW', 'ADD_TO_CART', 'CHECKOUT_START', 'PURCHASE');

-- CreateEnum
CREATE TYPE "TrafficChannel" AS ENUM ('TIKTOK', 'FACEBOOK', 'GOOGLE', 'DIRECT', 'OTHER');

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventType" "AnalyticsEventType" NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "productId" TEXT,
    "orderReference" TEXT,
    "quantity" INTEGER,
    "revenue" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "path" TEXT,
    "referrer" TEXT,
    "trafficSourceId" TEXT,
    "deduplicationKey" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrafficSource" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "channel" "TrafficChannel" NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrafficSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAnalytics" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "productViews" INTEGER NOT NULL DEFAULT 0,
    "addToCarts" INTEGER NOT NULL DEFAULT 0,
    "checkoutStarts" INTEGER NOT NULL DEFAULT 0,
    "purchases" INTEGER NOT NULL DEFAULT 0,
    "unitsSold" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsEvent_deduplicationKey_key" ON "AnalyticsEvent"("deduplicationKey");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_occurredAt_idx" ON "AnalyticsEvent"("eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_visitorId_occurredAt_idx" ON "AnalyticsEvent"("visitorId", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_occurredAt_idx" ON "AnalyticsEvent"("sessionId", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_productId_eventType_occurredAt_idx" ON "AnalyticsEvent"("productId", "eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_trafficSourceId_eventType_occurredAt_idx" ON "AnalyticsEvent"("trafficSourceId", "eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_orderReference_idx" ON "AnalyticsEvent"("orderReference");

-- CreateIndex
CREATE UNIQUE INDEX "TrafficSource_fingerprint_key" ON "TrafficSource"("fingerprint");

-- CreateIndex
CREATE INDEX "TrafficSource_channel_idx" ON "TrafficSource"("channel");

-- CreateIndex
CREATE INDEX "TrafficSource_utmSource_idx" ON "TrafficSource"("utmSource");

-- CreateIndex
CREATE INDEX "TrafficSource_utmCampaign_idx" ON "TrafficSource"("utmCampaign");

-- CreateIndex
CREATE INDEX "ProductAnalytics_date_idx" ON "ProductAnalytics"("date");

-- CreateIndex
CREATE INDEX "ProductAnalytics_productId_date_idx" ON "ProductAnalytics"("productId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAnalytics_productId_date_key" ON "ProductAnalytics"("productId", "date");

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_trafficSourceId_fkey" FOREIGN KEY ("trafficSourceId") REFERENCES "TrafficSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAnalytics" ADD CONSTRAINT "ProductAnalytics_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
