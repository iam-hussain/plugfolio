-- Admin auth hardening: revocable sessions via a version the JWT must match.

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
