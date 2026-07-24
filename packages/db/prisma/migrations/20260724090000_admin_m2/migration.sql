-- Admin Milestone 2 (docs/design/admin-console-m2.md): reports queue,
-- invited operators (passwordless until the link is used), sign-in tracking.

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('comment', 'product', 'profile', 'post');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('spam', 'scam', 'offensive', 'impersonation', 'other');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('open', 'resolved', 'dismissed');

-- AlterTable
ALTER TABLE "AdminUser" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "AdminUser" ADD COLUMN "lastSignInAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "note" TEXT,
    "reporterLabel" TEXT NOT NULL DEFAULT 'Anonymous shopper',
    "snippet" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
