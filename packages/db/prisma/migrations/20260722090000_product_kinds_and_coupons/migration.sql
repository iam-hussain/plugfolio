-- Product kinds (affiliate | own) & coupon offers (ADR-0011).
-- See docs/implementation/products-and-offers.md.

-- CreateEnum
CREATE TYPE "ProductKind" AS ENUM ('affiliate', 'own');

-- Product: kind + coupon attachment; the outbound URL becomes optional
-- (null = in-store-only coupon, no Buy button).
ALTER TABLE "Product" ADD COLUMN "kind" "ProductKind" NOT NULL DEFAULT 'affiliate';
ALTER TABLE "Product" ADD COLUMN "couponCode" TEXT;
ALTER TABLE "Product" ADD COLUMN "offerEndsAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "inStoreNote" TEXT;
ALTER TABLE "Product" ALTER COLUMN "affiliateUrl" DROP NOT NULL;

-- CreateTable: the second attribution event, append-only like Tap.
CREATE TABLE "CodeCopy" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "postId" UUID,
    "deviceId" UUID NOT NULL,
    "idempotencyKey" UUID NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeCopy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeCopy_idempotencyKey_key" ON "CodeCopy"("idempotencyKey");

-- CreateIndex
CREATE INDEX "CodeCopy_profileId_occurredAt_idx" ON "CodeCopy"("profileId", "occurredAt");

-- CreateIndex
CREATE INDEX "CodeCopy_productId_occurredAt_idx" ON "CodeCopy"("productId", "occurredAt");

-- AddForeignKey
ALTER TABLE "CodeCopy" ADD CONSTRAINT "CodeCopy_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeCopy" ADD CONSTRAINT "CodeCopy_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeCopy" ADD CONSTRAINT "CodeCopy_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
