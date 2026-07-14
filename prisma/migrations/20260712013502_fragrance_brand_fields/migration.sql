-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "rating" DECIMAL(2,1) NOT NULL DEFAULT 5.0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductTranslation" ADD COLUMN     "baseNotes" TEXT[],
ADD COLUMN     "giftDescription" TEXT,
ADD COLUMN     "heartNotes" TEXT[],
ADD COLUMN     "scentFamily" TEXT,
ADD COLUMN     "story" TEXT,
ADD COLUMN     "topNotes" TEXT[],
ADD COLUMN     "usageOccasions" TEXT[];
