import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSpendingByCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate },
        type: 'debit',
      },
    });

    const breakdown = transactions.reduce((acc: any, t) => {
      const cat = t.category || 'Other';
      if (!acc[cat]) acc[cat] = { category: cat, total: 0, count: 0 };
      acc[cat].total += Math.abs(t.amount);
      acc[cat].count += 1;
      return acc;
    }, {});

    const result = Object.values(breakdown).sort((a: any, b: any) => b.total - a.total);

    res.json(result);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
};

export const getMonthlyTrends = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const months = parseInt(req.query.months as string) || 6;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
    });

    const monthlyData: any = {};

    transactions.forEach(t => {
      const monthKey = t.date.toISOString().substring(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0 };
      }
      if (t.type === 'credit') {
        monthlyData[monthKey].income += Math.abs(t.amount);
      } else {
        monthlyData[monthKey].expenses += Math.abs(t.amount);
      }
    });

    const result = Object.values(monthlyData).sort((a: any, b: any) => 
      a.month.localeCompare(b.month)
    );

    res.json(result);
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Failed to generate trends' });
  }
};
