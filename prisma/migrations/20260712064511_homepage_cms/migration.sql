-- CreateEnum
CREATE TYPE "HomepageMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "HomepageSectionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "homepage_sections" (
    "id" TEXT NOT NULL,
    "section_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "media_type" "HomepageMediaType" NOT NULL DEFAULT 'IMAGE',
    "desktop_media_url" TEXT,
    "mobile_media_url" TEXT,
    "button_text" TEXT,
    "button_link" TEXT,
    "status" "HomepageSectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "homepage_sections_section_key_key" ON "homepage_sections"("section_key");

-- CreateIndex
CREATE INDEX "homepage_sections_status_sort_order_idx" ON "homepage_sections"("status", "sort_order");
