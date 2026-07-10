/*
  Warnings:

  - Made the column `gstAmount` on table `Invoice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "notes" TEXT,
ALTER COLUMN "gstAmount" SET NOT NULL;
