import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createAlert = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  severity: 'info' | 'warning' | 'critical',
  metadata?: any
) => {
  return await prisma.alert.create({
    data: { userId, type, title, message, severity, metadata },
  });
};

export const checkForFraud = async (transaction: any, io: any) => {
  const amount = Math.abs(transaction.amount);
  
  if (amount > 1000) {
    const alert = await createAlert(
      transaction.userId,
      'large_purchase',
      'Large Transaction Detected',
      `A transaction of $${amount.toFixed(2)} was detected${transaction.merchantName ? ` at ${transaction.merchantName}` : ''}`,
      amount > 5000 ? 'critical' : 'warning',
      { transactionId: transaction.id, amount }
    );

    io.to(transaction.userId).emit('alert', alert);
  }
};

export const checkBudgetLimit = async (userId: string, category: string, amount: number, io: any) => {
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const budget = await prisma.budget.findUnique({
    where: {
      userId_category_month: { userId, category, month: currentMonth },
    },
  });

  if (budget) {
    const newSpent = budget.currentSpent + amount;
    
    await prisma.budget.update({
      where: { id: budget.id },
      data: { currentSpent: newSpent },
    });

    const percentUsed = (newSpent / budget.monthlyLimit) * 100;

    if (percentUsed >= budget.alertThreshold) {
      const alert = await createAlert(
        userId,
        'budget_warning',
        `Budget Alert: ${category}`,
        `You've used ${percentUsed.toFixed(0)}% of your ${category} budget this month ($${newSpent.toFixed(2)} / $${budget.monthlyLimit})`,
        percentUsed >= 90 ? 'critical' : 'warning',
        { category, spent: newSpent, limit: budget.monthlyLimit }
      );

      io.to(userId).emit('alert', alert);
    }
  }
};
