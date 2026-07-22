-- Comment targets (profile page | product) + one-level replies (ADR-0013).

ALTER TABLE "Comment" ADD COLUMN "productId" UUID;
ALTER TABLE "Comment" ADD COLUMN "parentId" UUID;

-- CreateIndex
CREATE INDEX "Comment_productId_createdAt_idx" ON "Comment"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
