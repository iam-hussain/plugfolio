-- Member handles (ADR-0009) + per-profile categories (ADR-0010).
-- See docs/implementation/member-handles-and-categories.md.

-- User.username — backfilled from the row id (48 random bits of the uuid;
-- collision odds negligible at pre-launch row counts), then made required.
ALTER TABLE "User" ADD COLUMN "username" TEXT;
UPDATE "User" SET "username" = 'user-' || substr(replace("id"::text, '-', ''), 1, 12);
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Comment.asProfileId — which profile the comment speaks AS (null = personal).
ALTER TABLE "Comment" ADD COLUMN "asProfileId" UUID;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_asProfileId_fkey" FOREIGN KEY ("asProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_profileId_title_key" ON "Category"("profileId", "title");

-- CreateIndex
CREATE INDEX "Category_profileId_sortOrder_idx" ON "Category"("profileId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Post/Product → Category (one optional shelf per item; SET NULL on delete).
ALTER TABLE "Post" ADD COLUMN "categoryId" UUID;
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Product" ADD COLUMN "categoryId" UUID;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
