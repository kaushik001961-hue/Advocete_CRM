/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Document` table. All the data in the column will be lost.
  - Added the required column `name` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_clientId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "createdAt",
DROP COLUMN "title",
ADD COLUMN     "caseId" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "clientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Hearing" ADD COLUMN     "nextDate" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SCHEDULED';

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;
