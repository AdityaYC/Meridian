import prisma from '../config/database';

class SmartBudgetService {
  async createBudget(userId: string, month: string | Date, categories: Record<string, number>): Promise<any> {
    try {
      const monthDate = new Date(month);
      monthDate.setDate(1); // First of month
      monthDate.setHours(0, 0, 0, 0);

      for (const [category, amount] of Object.entries(categories)) {
        const existing = await prisma.smartBudget.findFirst({
            where: { userId, category, month: monthDate }
        });

        if (existing) {
            await prisma.smartBudget.update({
                where: { id: existing.id },
                data: { allocatedAmount: amount }
            });
        } else {
            await prisma.smartBudget.create({
                data: {
                    userId,
                    category,
                    allocatedAmount: amount,
                    month: monthDate,
                    autoAdjust: true,
                }
            });
        }
      }

      return await this.getBudget(userId, monthDate);
    } catch (error) {
      console.error('Create budget error:', error);
      throw error;
    }
  }

  async getBudget(userId: string, month: string | Date = new Date()): Promise<any> {
    try {
      const monthDate = new Date(month);
      monthDate.setDate(1);
      monthDate.setHours(0, 0, 0, 0);

      const budgets = await prisma.smartBudget.findMany({
        where: { userId, month: monthDate },
      });

      if (budgets.length === 0) {
        // Auto-create budget based on historical spending
        return await this.autoCreateBudget(userId, monthDate);
      }

      // Update spent amounts
      await this.updateSpentAmounts(userId, monthDate);

      const updated = await prisma.smartBudget.findMany({
        where: { userId, month: monthDate },
        orderBy: { category: 'asc' },
      });

      return this.formatBudget(updated);
    } catch (error) {
      console.error('Get budget error:', error);
      throw error;
    }
  }

  async autoCreateBudget(userId: string, month: Date): Promise<any> {
    try {
      const threeMonthsAgo = new Date(month);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // Analyze last 3 months of spending
      const spendingAgg = await prisma.transaction.groupBy({
        by: ['category'],
        where: {
          userId,
          type: 'debit',
          date: {
            gte: threeMonthsAgo,
            lt: month,
          },
        },
        _avg: {
          amount: true,
        },
      });

      const categories: Record<string, number> = {};

      spendingAgg.forEach(row => {
        const avgMonthly = Math.abs(row._avg.amount || 0);
        // Add 10% buffer to average
        const suggestedAmount = avgMonthly * 1.1;
        if (row.category) {
            categories[row.category] = suggestedAmount;
        }
      });

      // Ensure essential categories exist
      const essentials = [
        'Food & Dining',
        'Transportation',
        'Bills & Utilities',
        'Shopping',
        'Entertainment',
        'Healthcare',
        'Education',
        'Personal Care',
        'Other',
      ];

      essentials.forEach(cat => {
        if (!categories[cat]) {
          categories[cat] = 200; // Default amount
        }
      });

      return await this.createBudget(userId, month, categories);
    } catch (error) {
      console.error('Auto create budget error:', error);
      throw error;
    }
  }

  async updateSpentAmounts(userId: string, month: Date) {
    try {
      const monthEnd = new Date(month);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const spendingAgg = await prisma.transaction.groupBy({
        by: ['category'],
        where: {
          userId,
          type: 'debit',
          date: {
            gte: month,
            lt: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      for (const row of spendingAgg) {
        if (!row.category) continue;
        
        // Find budget for this category
        const budget = await prisma.smartBudget.findFirst({
            where: { userId, month, category: row.category }
        });

        if (budget) {
            await prisma.smartBudget.update({
                where: { id: budget.id },
                data: { spentAmount: Math.abs(row._sum.amount || 0) }
            });
        }
      }
    } catch (error) {
      console.error('Update spent amounts error:', error);
    }
  }

  async adjustBudgetForNextMonth(userId: string) {
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0,0,0,0);

      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const currentBudgets = await prisma.smartBudget.findMany({
        where: { userId, month: currentMonth, autoAdjust: true },
      });

      for (const budget of currentBudgets) {
        const spentAmount = budget.spentAmount;
        const allocatedAmount = budget.allocatedAmount;
        const rolloverAmount = budget.rolloverAmount || 0;

        let newAllocation = allocatedAmount;

        // If under budget, slightly decrease next month
        if (spentAmount < allocatedAmount * 0.8) {
          newAllocation = allocatedAmount * 0.95;
        }
        // If over budget, increase next month
        else if (spentAmount > allocatedAmount) {
          newAllocation = spentAmount * 1.1;
        }

        // Calculate rollover (unused budget)
        const newRollover = Math.max(0, allocatedAmount - spentAmount + rolloverAmount);

        // Upsert next month
        const existingNext = await prisma.smartBudget.findFirst({
            where: { userId, category: budget.category, month: nextMonth }
        });

        if (existingNext) {
             await prisma.smartBudget.update({
                 where: { id: existingNext.id },
                 data: {
                     allocatedAmount: newAllocation,
                     rolloverAmount: Math.min(newRollover, allocatedAmount * 0.5)
                 }
             });
        } else {
            await prisma.smartBudget.create({
                data: {
                    userId,
                    category: budget.category,
                    allocatedAmount: newAllocation,
                    month: nextMonth,
                    rolloverAmount: Math.min(newRollover, allocatedAmount * 0.5),
                    autoAdjust: true
                }
            });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Adjust budget error:', error);
      throw error;
    }
  }

  formatBudget(budgets: any[]) {
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
    const totalRollover = budgets.reduce((sum, b) => sum + (b.rolloverAmount || 0), 0);

    return {
      month: budgets[0]?.month,
      totalAllocated: totalAllocated.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
      totalRollover: totalRollover.toFixed(2),
      totalRemaining: (totalAllocated - totalSpent).toFixed(2),
      percentUsed: totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0,
      categories: budgets.map(b => ({
        category: b.category,
        allocated: b.allocatedAmount,
        spent: b.spentAmount,
        rollover: b.rolloverAmount || 0,
        remaining: b.allocatedAmount - b.spentAmount,
        percentUsed: b.allocatedAmount > 0 
          ? ((b.spentAmount / b.allocatedAmount) * 100).toFixed(1)
          : 0,
        autoAdjust: b.autoAdjust,
        status: b.spentAmount > b.allocatedAmount ? 'over' :
                b.spentAmount > b.allocatedAmount * 0.9 ? 'warning' : 'good',
      })),
    };
  }

  async getSuggestedAdjustments(userId: string, month: string | Date) {
    try {
      const budget = await this.getBudget(userId, month);
      const suggestions: any[] = [];

      budget.categories.forEach((cat: any) => {
        if (cat.status === 'over') {
          suggestions.push({
            category: cat.category,
            type: 'increase',
            currentAmount: cat.allocated,
            suggestedAmount: cat.spent * 1.1,
            reason: `You're ${cat.percentUsed}% over budget. Consider increasing allocation.`,
          });
        } else if (parseFloat(cat.percentUsed) < 60) {
          suggestions.push({
            category: cat.category,
            type: 'decrease',
            currentAmount: cat.allocated,
            suggestedAmount: cat.spent * 1.2, // Wait, decrease logic? spent * 1.2 might be < allocated if usage is < 60%
            // Example: Allocated 100, Spent 50. Usage 50%. Suggested: 50 * 1.2 = 60. Correct.
            reason: `You're only using ${cat.percentUsed}% of this budget. Consider reallocating funds.`,
          });
        }
      });

      return suggestions;
    } catch (error) {
      console.error('Get suggested adjustments error:', error);
      throw error;
    }
  }
}

export default new SmartBudgetService();
