-- Collapse editorial media roles into a Shopify-style main/detail/video model.
CREATE TYPE "ProductMediaType_new" AS ENUM ('MAIN_IMAGE', 'DETAIL_IMAGE', 'VIDEO');

ALTER TABLE "ProductMedia"
ALTER COLUMN "type" DROP DEFAULT;

ALTER TABLE "ProductMedia"
ALTER COLUMN "type" TYPE "ProductMediaType_new"
USING (
  CASE
    WHEN "type"::text = 'PRODUCT' THEN 'MAIN_IMAGE'
    WHEN "type"::text IN ('LIFESTYLE', 'DETAIL') THEN 'DETAIL_IMAGE'
    WHEN "type"::text = 'VIDEO' THEN 'VIDEO'
  END
)::"ProductMediaType_new";

DROP TYPE "ProductMediaType";
ALTER TYPE "ProductMediaType_new" RENAME TO "ProductMediaType";

ALTER TABLE "ProductMedia"
ALTER COLUMN "type" SET DEFAULT 'DETAIL_IMAGE';

-- Preserve one deterministic storefront primary image for every product.
UPDATE "ProductMedia"
SET "isPrimary" = false
WHERE "type" <> 'MAIN_IMAGE';

WITH ranked_main AS (
  SELECT "id", ROW_NUMBER() OVER (
    PARTITION BY "productId"
    ORDER BY "isPrimary" DESC, "sortOrder" ASC, "id" ASC
  ) AS row_number
  FROM "ProductMedia"
  WHERE "type" = 'MAIN_IMAGE'
)
UPDATE "ProductMedia" AS media
SET "isPrimary" = (ranked_main.row_number = 1)
FROM ranked_main
WHERE media."id" = ranked_main."id";
