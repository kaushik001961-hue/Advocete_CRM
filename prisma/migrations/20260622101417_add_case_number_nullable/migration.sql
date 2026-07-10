/*
  Warnings:

  - Added the required column `caseNumber` to the `Case` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "caseNumber" TEXT NOT NULL,
ADD COLUMN     "description" TEXT;
