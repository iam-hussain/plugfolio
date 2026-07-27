-- CreateEnum
CREATE TYPE "SupportTicketCategory" AS ENUM ('lost_email_access', 'change_email', 'merge_accounts', 'password_trouble', 'username_conflict', 'connection_trouble', 'collab_dispute', 'delete_account', 'other');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('open', 'resolved', 'dismissed');

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" UUID NOT NULL,
    "category" "SupportTicketCategory" NOT NULL,
    "message" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "requesterLabel" TEXT NOT NULL DEFAULT 'Anonymous visitor',
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupportTicket_status_createdAt_idx" ON "SupportTicket"("status", "createdAt");
