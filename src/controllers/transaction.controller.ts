import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 100;
    const accountId = req.query.accountId as string;
    const category = req.query.category as string;

    const where: any = { userId };
    if (accountId) where.bankAccountId = accountId;
    if (category) where.category = category;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        bankAccount: {
          select: {
            accountName: true,
            institutionName: true,
          }
        }
      }
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const getTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { transactionId } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      include: {
        bankAccount: true,
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};
