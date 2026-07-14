-- Expand product fragrance data without removing existing values.
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "fragranceFamily" TEXT;

ALTER TABLE "ProductTranslation"
ADD COLUMN "fragranceNotes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "ProductTranslation"
RENAME COLUMN "seoTitle" TO "metaTitle";

ALTER TABLE "ProductTranslation"
RENAME COLUMN "seoDescription" TO "metaDescription";

-- Product media now expresses its editorial role. Existing images become PRODUCT media.
CREATE TYPE "ProductMediaType" AS ENUM ('PRODUCT', 'LIFESTYLE', 'VIDEO', 'DETAIL');

ALTER TABLE "ProductMedia"
ALTER COLUMN "type" DROP DEFAULT;

ALTER TABLE "ProductMedia"
ALTER COLUMN "type" TYPE "ProductMediaType"
USING (
  CASE
    WHEN "type"::text = 'IMAGE' THEN 'PRODUCT'
    WHEN "type"::text = 'VIDEO' THEN 'VIDEO'
  END
)::"ProductMediaType";

ALTER TABLE "ProductMedia"
ALTER COLUMN "type" SET DEFAULT 'PRODUCT';

DROP TYPE "MediaType";
