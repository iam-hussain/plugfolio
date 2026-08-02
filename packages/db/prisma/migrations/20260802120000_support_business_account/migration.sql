-- AlterEnum
-- Business accounts are requested through Support instead of a "Create a
-- business" menu item, so the queue needs a category for it.
ALTER TYPE "SupportTicketCategory" ADD VALUE 'business_account';
