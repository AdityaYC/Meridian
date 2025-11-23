/*
  Warnings:

  - You are about to drop the column `transactionDate` on the `PortfolioTransaction` table. All the data in the column will be lost.
  - You are about to drop the `AIRecommendation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Watchlist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AIRecommendation" DROP CONSTRAINT "AIRecommendation_userId_fkey";

-- DropForeignKey
-- ALTER TABLE "Watchlist" DROP CONSTRAINT "Watchlist_userId_fkey";

-- DropIndex
DROP INDEX "PortfolioTransaction_symbol_idx";

-- AlterTable
ALTER TABLE "PortfolioTransaction" DROP COLUMN "transactionDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "AIRecommendation";

-- DropTable
-- DROP TABLE "Watchlist";

-- CreateTable
CREATE TABLE "AiRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiRecommendation_userId_idx" ON "AiRecommendation"("userId");

-- AddForeignKey
ALTER TABLE "AiRecommendation" ADD CONSTRAINT "AiRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
