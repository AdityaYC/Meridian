-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "investmentGoal" TEXT,
ADD COLUMN     "riskLevel" TEXT DEFAULT 'medium',
ADD COLUMN     "targetAllocation" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "InsiderTrading" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "filingDate" TIMESTAMP(3) NOT NULL,
    "transactionDate" TIMESTAMP(3),
    "insiderName" TEXT NOT NULL,
    "insiderTitle" TEXT,
    "transactionType" TEXT NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION,
    "value" DOUBLE PRECISION,
    "sharesOwnedAfter" DOUBLE PRECISION,
    "isSignificant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsiderTrading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockPrediction" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "predictionDate" TIMESTAMP(3) NOT NULL,
    "predictedPrice" DOUBLE PRECISION NOT NULL,
    "confidenceScore" DOUBLE PRECISION,
    "predictionHorizon" TEXT,
    "technicalIndicators" JSONB,
    "aiAnalysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "riskTolerance" DOUBLE PRECISION NOT NULL,
    "investmentAmount" DOUBLE PRECISION NOT NULL,
    "timeHorizon" TEXT,
    "goals" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoHolding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "avgCost" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION,
    "marketValue" DOUBLE PRECISION,
    "totalGainLoss" DOUBLE PRECISION,
    "gainLossPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CryptoHolding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InsiderTrading_symbol_idx" ON "InsiderTrading"("symbol");

-- CreateIndex
CREATE INDEX "InsiderTrading_filingDate_idx" ON "InsiderTrading"("filingDate" DESC);

-- CreateIndex
CREATE INDEX "StockPrediction_symbol_idx" ON "StockPrediction"("symbol");

-- CreateIndex
CREATE INDEX "InvestmentPreference_userId_idx" ON "InvestmentPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentPreference_userId_category_key" ON "InvestmentPreference"("userId", "category");

-- CreateIndex
CREATE INDEX "CryptoHolding_userId_idx" ON "CryptoHolding"("userId");

-- AddForeignKey
ALTER TABLE "InvestmentPreference" ADD CONSTRAINT "InvestmentPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoHolding" ADD CONSTRAINT "CryptoHolding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
