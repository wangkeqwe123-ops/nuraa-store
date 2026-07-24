-- Add optional product-detail attributes without changing or deleting existing catalog data.
ALTER TYPE "ProductMediaType" ADD VALUE IF NOT EXISTS 'LIFESTYLE_IMAGE';

ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "size" TEXT,
ADD COLUMN IF NOT EXISTS "burnTime" TEXT,
ADD COLUMN IF NOT EXISTS "material" TEXT,
ADD COLUMN IF NOT EXISTS "ingredients" TEXT,
ADD COLUMN IF NOT EXISTS "careInstructions" TEXT;
