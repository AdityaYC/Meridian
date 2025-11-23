/*
  Warnings:

  - You are about to drop the column `tellerAccessToken` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `tellerEnrollmentId` on the `BankAccount` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BankAccount_tellerAccessToken_key";

-- DropIndex
DROP INDEX "BankAccount_tellerEnrollmentId_key";

-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "tellerAccessToken",
DROP COLUMN "tellerEnrollmentId",
ADD COLUMN     "enrollmentId" TEXT;

-- CreateTable
CREATE TABLE "TellerEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "institutionName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TellerEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TellerEnrollment_enrollmentId_key" ON "TellerEnrollment"("enrollmentId");

-- CreateIndex
CREATE INDEX "TellerEnrollment_userId_idx" ON "TellerEnrollment"("userId");

-- AddForeignKey
ALTER TABLE "TellerEnrollment" ADD CONSTRAINT "TellerEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "TellerEnrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
