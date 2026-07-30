-- Normalize the provider-neutral payment lifecycle.
-- Existing PROCESSING records remain retryable as PENDING.
UPDATE "Payment"
SET "status" = 'PENDING'
WHERE "status" = 'PROCESSING';

UPDATE "Order"
SET "paymentStatus" = 'PENDING'
WHERE "paymentStatus" = 'PROCESSING';

ALTER TABLE "Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "paymentStatus" DROP DEFAULT;

ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

ALTER TABLE "Payment"
ALTER COLUMN "status" TYPE "PaymentStatus"
USING ("status"::text::"PaymentStatus");

ALTER TABLE "Order"
ALTER COLUMN "paymentStatus" TYPE "PaymentStatus"
USING ("paymentStatus"::text::"PaymentStatus");

ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "Order" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';

DROP TYPE "PaymentStatus_old";
