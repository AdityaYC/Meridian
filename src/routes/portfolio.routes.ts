import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
const alpacaService = require('../services/alpaca.service');
const marketDataService = require('../services/marketData.service');
const aiInvestmentAdvisor = require('../services/aiInvestmentAdvisor.service');

const router = Router();
const prisma = new PrismaClient();

// Get user's portfolio holdings
router.get('/holdings', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        let holdings = await prisma.investment.findMany({
            where: { userId },
            orderBy: { totalValue: 'desc' },
        });

        // Update current prices
        for (const holding of holdings) {
            try {
                const quote = await marketDataService.getStockQuote(holding.symbol);
                const totalValue = holding.quantity * quote.price;
                const gainLoss = totalValue - (holding.quantity * holding.purchasePrice);
                const gainLossPercent = ((gainLoss / (holding.quantity * holding.purchasePrice)) * 100);

                await prisma.investment.update({
                    where: { id: holding.id },
                    data: {
                        currentPrice: quote.price,
                        totalValue,
                        gainLoss,
                        gainLossPercent,
                    },
                });

                holding.currentPrice = quote.price;
                holding.totalValue = totalValue;
                holding.gainLoss = gainLoss;
                holding.gainLossPercent = gainLossPercent;
            } catch (error) {
                console.error(`Failed to update ${holding.symbol}:`, error);
            }
        }

        res.json(holdings);
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get portfolio summary
router.get('/summary', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        const holdings = await prisma.investment.findMany({
            where: { userId },
        });

        const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
        const totalCost = holdings.reduce((sum, h) => sum + (h.quantity * h.purchasePrice), 0);
        const totalGainLoss = totalValue - totalCost;
        const gainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

        res.json({
            totalValue: totalValue.toFixed(2),
            totalCost: totalCost.toFixed(2),
            totalGainLoss: totalGainLoss.toFixed(2),
            gainLossPercent: gainLossPercent.toFixed(2),
            holdingsCount: holdings.length,
        });
    } catch (error) {
        console.error('Get portfolio summary error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get AI portfolio analysis
router.post('/analyze', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { riskTolerance, investmentGoal, timeHorizon, age } = req.body;

        const holdings = await prisma.investment.findMany({
            where: { userId },
        });

        const analysis = await aiInvestmentAdvisor.analyzePortfolio(
            userId,
            holdings,
            { riskTolerance, investmentGoal, timeHorizon, age }
        );

        // Save recommendations to database
        for (const rec of analysis.recommendations) {
            await prisma.aIRecommendation.create({
                data: {
                    userId,
                    recommendationType: rec.action,
                    symbol: rec.symbol,
                    reasoning: rec.reasoning,
                    confidenceScore: 0.75,
                    riskLevel: rec.riskLevel,
                },
            });
        }

        res.json(analysis);
    } catch (error) {
        console.error('Portfolio analysis error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get AI investment suggestions
router.post('/suggestions', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { availableCapital, riskTolerance, investmentGoal, timeHorizon } = req.body;

        const suggestions = await aiInvestmentAdvisor.getInvestmentSuggestions(
            { riskTolerance, investmentGoal, timeHorizon },
            availableCapital
        );

        res.json(suggestions);
    } catch (error) {
        console.error('Investment suggestions error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Analyze specific stock
router.get('/analyze/:symbol', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params;
        const analysis = await aiInvestmentAdvisor.analyzeStock(symbol);
        res.json(analysis);
    } catch (error) {
        console.error('Stock analysis error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Search stocks
router.get('/search', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        const results = await marketDataService.searchStocks(q as string);
        res.json(results);
    } catch (error) {
        console.error('Stock search error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Place order (paper trading)
router.post('/orders', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { symbol, shares, side } = req.body; // side: buy or sell

        // Place order with Alpaca
        const order = await alpacaService.placeOrder({
            symbol,
            qty: shares,
            side,
            type: 'market',
        });

        // Get current quote
        const quote = await marketDataService.getStockQuote(symbol);

        // Record transaction
        await prisma.portfolioTransaction.create({
            data: {
                userId,
                symbol,
                transactionType: side,
                shares,
                price: quote.price,
                totalAmount: shares * quote.price,
            },
        });

        // Update holdings
        if (side === 'buy') {
            const existing = await prisma.investment.findFirst({
                where: { userId, symbol },
            });

            if (existing) {
                const newShares = existing.quantity + shares;
                const newAvgCost = ((existing.purchasePrice * existing.quantity) + (quote.price * shares)) / newShares;

                await prisma.investment.update({
                    where: { id: existing.id },
                    data: {
                        quantity: newShares,
                        purchasePrice: newAvgCost,
                    },
                });
            } else {
                const profile = await marketDataService.getCompanyProfile(symbol);
                await prisma.investment.create({
                    data: {
                        userId,
                        symbol,
                        name: profile.companyName,
                        type: 'stock',
                        quantity: shares,
                        purchasePrice: quote.price,
                        currentPrice: quote.price,
                        totalValue: shares * quote.price,
                        gainLoss: 0,
                        gainLossPercent: 0,
                        sector: profile.sector,
                    },
                });
            }
        } else if (side === 'sell') {
            const holding = await prisma.investment.findFirst({
                where: { userId, symbol },
            });

            if (holding) {
                const newShares = holding.quantity - shares;
                if (newShares <= 0) {
                    await prisma.investment.delete({ where: { id: holding.id } });
                } else {
                    await prisma.investment.update({
                        where: { id: holding.id },
                        data: { quantity: newShares },
                    });
                }
            }
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get market overview
router.get('/market/overview', authMiddleware, async (req: Request, res: Response) => {
    try {
        const [sectors, topStocks] = await Promise.all([
            marketDataService.getMarketSectors(),
            marketDataService.getTopGainersLosers(),
        ]);

        res.json({ sectors, ...topStocks });
    } catch (error) {
        console.error('Market overview error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
