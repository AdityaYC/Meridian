import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { category, monthlyLimit, alertThreshold } = req.body;

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const budget = await prisma.budget.create({
      data: {
        userId,
        category,
        monthlyLimit,
        alertThreshold: alertThreshold || 80,
        month: currentMonth,
      },
    });

    res.status(201).json(budget);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Budget already exists for this category' });
    }
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

export const getBudgets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const budgets = await prisma.budget.findMany({
      where: { userId, month: currentMonth },
    });

    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { budgetId } = req.params;
    const { monthlyLimit, alertThreshold } = req.body;

    const budget = await prisma.budget.updateMany({
      where: { id: budgetId, userId },
      data: { monthlyLimit, alertThreshold },
    });

    if (budget.count === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { budgetId } = req.params;

    const budget = await prisma.budget.deleteMany({
      where: { id: budgetId, userId },
    });

    if (budget.count === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};
