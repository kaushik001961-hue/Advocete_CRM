/*
  Warnings:

  - A unique constraint covering the columns `[barEnrollmentNo]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "barEnrollmentNo" TEXT,
ADD COLUMN     "experienceYears" INTEGER DEFAULT 0,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "specialisation" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active';

-- CreateIndex
CREATE UNIQUE INDEX "User_barEnrollmentNo_key" ON "User"("barEnrollmentNo");
