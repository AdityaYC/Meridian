/*
  Warnings:

  - You are about to drop the column `sector` on the `Investment` table. All the data in the column will be lost.
  - You are about to drop the `AIRecommendation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PortfolioTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Watchlist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AIRecommendation" DROP CONSTRAINT "AIRecommendation_userId_fkey";

-- DropForeignKey
ALTER TABLE "PortfolioTransaction" DROP CONSTRAINT "PortfolioTransaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Watchlist" DROP CONSTRAINT "Watchlist_userId_fkey";

-- AlterTable
ALTER TABLE "Investment" DROP COLUMN "sector";

-- DropTable
DROP TABLE "AIRecommendation";

-- DropTable
DROP TABLE "PortfolioTransaction";

-- DropTable
DROP TABLE "Watchlist";
