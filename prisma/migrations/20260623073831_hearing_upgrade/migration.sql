-- AlterTable
ALTER TABLE "Hearing" ADD COLUMN     "courtRoom" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hearingType" TEXT,
ADD COLUMN     "orderPassed" TEXT;
