-- AlterTable
ALTER TABLE "Collab" ADD COLUMN     "termsContent" TEXT,
ADD COLUMN     "termsDeadline" TIMESTAMP(3),
ADD COLUMN     "termsPrice" TEXT;

-- AlterTable
ALTER TABLE "Requirement" ADD COLUMN     "closedAt" TIMESTAMP(3);
