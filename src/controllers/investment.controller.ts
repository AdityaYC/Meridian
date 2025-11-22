import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getInvestments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const investments = await prisma.investment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
    const totalGainLoss = investments.reduce((sum, inv) => sum + inv.gainLoss, 0);

    res.json({
      investments,
      summary: {
        totalValue,
        totalGainLoss,
        totalGainLossPercent: totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
};

export const addInvestment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { symbol, name, type, quantity, purchasePrice, currentPrice } = req.body;

    const totalValue = quantity * currentPrice;
    const gainLoss = totalValue - (quantity * purchasePrice);
    const gainLossPercent = ((currentPrice - purchasePrice) / purchasePrice) * 100;

    const investment = await prisma.investment.create({
      data: {
        userId,
        symbol,
        name,
        type,
        quantity,
        purchasePrice,
        currentPrice,
        totalValue,
        gainLoss,
        gainLossPercent,
      },
    });

    res.status(201).json(investment);
  } catch (error) {
    console.error('Add investment error:', error);
    res.status(500).json({ error: 'Failed to add investment' });
  }
};
