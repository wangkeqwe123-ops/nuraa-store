ALTER TYPE "AnalyticsEventType" ADD VALUE IF NOT EXISTS 'WHATSAPP_CLICK';

CREATE TABLE IF NOT EXISTS "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "whatsapp_number" TEXT NOT NULL DEFAULT '',
    "whatsapp_message_template" TEXT NOT NULL DEFAULT '',
    "support_email" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "site_settings" (
    "id",
    "whatsapp_message_template",
    "support_email",
    "updated_at"
)
VALUES (
    'default',
    'Hello NURAA, I would like to know more about your fragrances.',
    'hello@nuraa.sa',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
