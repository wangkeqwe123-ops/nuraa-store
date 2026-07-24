-- Expand Homepage CMS with localized content while preserving all legacy columns.
ALTER TABLE "homepage_sections"
ADD COLUMN "title_en" TEXT,
ADD COLUMN "title_ar" TEXT,
ADD COLUMN "subtitle_en" TEXT,
ADD COLUMN "subtitle_ar" TEXT,
ADD COLUMN "cta_text_en" TEXT,
ADD COLUMN "cta_text_ar" TEXT,
ADD COLUMN "cta_link" TEXT;

-- Existing English/legacy content remains immediately usable after migration.
UPDATE "homepage_sections"
SET
  "title_en" = COALESCE("title_en", "title"),
  "subtitle_en" = COALESCE("subtitle_en", "subtitle"),
  "cta_text_en" = COALESCE("cta_text_en", "button_text"),
  "cta_link" = COALESCE("cta_link", "button_link");

-- Site-wide CMS entries. ON CONFLICT keeps existing operator content untouched.
INSERT INTO "homepage_sections" (
  "id",
  "section_key",
  "title",
  "subtitle",
  "title_en",
  "title_ar",
  "cta_link",
  "media_type",
  "status",
  "sort_order",
  "created_at",
  "updated_at"
)
VALUES (
  'homepage-announcement-bar',
  'announcement_bar',
  'Complimentary delivery across KSA on orders over 250 SAR',
  NULL,
  'Complimentary delivery across KSA on orders over 250 SAR',
  'توصيل مجاني داخل المملكة للطلبات فوق 250 ر.س',
  NULL,
  'IMAGE',
  'ACTIVE',
  -100,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("section_key") DO NOTHING;

INSERT INTO "homepage_sections" (
  "id",
  "section_key",
  "title",
  "subtitle",
  "title_en",
  "title_ar",
  "subtitle_en",
  "subtitle_ar",
  "cta_text_en",
  "cta_text_ar",
  "cta_link",
  "media_type",
  "status",
  "sort_order",
  "created_at",
  "updated_at"
)
VALUES (
  'homepage-footer-brand',
  'footer_brand',
  'NURAA',
  'Luxury Arabian home fragrance, composed for the rituals and welcomes that shape a home.',
  'NURAA',
  'نُورا',
  'Luxury Arabian home fragrance, composed for the rituals and welcomes that shape a home.',
  'عطور منزلية عربية فاخرة صُممت لطقوس البيت ولحظات الترحيب.',
  'Join the list',
  'انضموا إلى القائمة',
  'mailto:hello@nuraa.sa?subject=NURAA%20Newsletter',
  'IMAGE',
  'ACTIVE',
  1000,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("section_key") DO NOTHING;
