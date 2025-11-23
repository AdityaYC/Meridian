import prisma from '../config/database';

class FinancialHealthService {
  async calculateHealthScore(userId: string) {
    try {
      const scores = await Promise.all([
        this.calculateEmergencyFundScore(userId),
        this.calculateDebtManagementScore(userId),
        this.calculateSavingsRateScore(userId),
        this.calculateInvestmentDiversityScore(userId),
        this.calculateBudgetAdherenceScore(userId),
      ]);

      const [
        emergencyFund,
        debtManagement,
        savingsRate,
        investmentDiversity,
        budgetAdherence,
      ] = scores;

      // Weighted average
      const overallScore = Math.round(
        emergencyFund.score * 0.25 +
        debtManagement.score * 0.20 +
        savingsRate.score * 0.20 +
        investmentDiversity.score * 0.20 +
        budgetAdherence.score * 0.15
      );

      const components = {
        emergencyFund,
        debtManagement,
        savingsRate,
        investmentDiversity,
        budgetAdherence,
      };

      const recommendations = this.generateRecommendations(components);

      // Save to database
      await prisma.financialHealthScore.create({
        data: {
          userId,
          overallScore,
          emergencyFundScore: emergencyFund.score,
          debtManagementScore: debtManagement.score,
          savingsRateScore: savingsRate.score,
          investmentDiversityScore: investmentDiversity.score,
          budgetAdherenceScore: budgetAdherence.score,
          components: JSON.stringify(components),
          recommendations: JSON.stringify(recommendations),
        },
      });

      return {
        overallScore,
        components,
        recommendations,
      };
    } catch (error) {
      console.error('Calculate health score error:', error);
      throw error;
    }
  }

  async calculateEmergencyFundScore(userId: string) {
    try {
      // Get monthly expenses
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const expensesAggregate = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'debit',
          date: {
            gte: threeMonthsAgo,
          },
        },
        _avg: {
          amount: true,
        },
      });

      const avgMonthlyExpense = Math.abs(expensesAggregate._avg.amount || 1000);

      // Get savings account balance
      const savingsAccount = await prisma.bankAccount.aggregate({
        where: {
          userId,
          accountType: 'savings',
        },
        _sum: {
          available: true,
        },
      });

      const totalSavings = savingsAccount._sum.available || 0;
      const monthsCovered = totalSavings / avgMonthlyExpense;

      let score = 0;
      let status = '';

      if (monthsCovered >= 6) {
        score = 100;
        status = 'Excellent';
      } else if (monthsCovered >= 3) {
        score = 85;
        status = 'Good';
      } else if (monthsCovered >= 1) {
        score = 60;
        status = 'Fair';
      } else {
        score = 30;
        status = 'Needs Improvement';
      }

      return {
        score,
        status,
        monthsCovered: monthsCovered.toFixed(1),
        totalSavings: totalSavings.toFixed(2),
        monthlyExpense: avgMonthlyExpense.toFixed(2),
        message: `You have ${monthsCovered.toFixed(1)} months of expenses saved`,
      };
    } catch (error) {
      console.error('Calculate emergency fund score error:', error);
      return { score: 50, status: 'Unknown', message: 'Unable to calculate', monthsCovered: "0", totalSavings: "0", monthlyExpense: "0" };
    }
  }

  async calculateDebtManagementScore(userId: string) {
    try {
      // Get credit card balances
      const creditCards = await prisma.bankAccount.aggregate({
        where: {
          userId,
          accountType: 'credit_card',
        },
        _sum: {
          current: true,
        },
      });

      const totalDebt = Math.abs(creditCards._sum.current || 0);

      // Get monthly income
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const incomeAggregate = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'credit',
          // category: 'Income', // Category might be null or varied
          date: {
            gte: threeMonthsAgo,
          },
        },
        _avg: {
          amount: true,
        },
      });

      const avgMonthlyIncome = incomeAggregate._avg.amount || 5000;
      const debtToIncomeRatio = totalDebt / avgMonthlyIncome;

      let score = 0;
      let status = '';

      if (totalDebt === 0) {
        score = 100;
        status = 'Debt Free';
      } else if (debtToIncomeRatio < 0.3) {
        score = 85;
        status = 'Manageable';
      } else if (debtToIncomeRatio < 0.5) {
        score = 60;
        status = 'Moderate';
      } else {
        score = 30;
        status = 'High';
      }

      return {
        score,
        status,
        totalDebt: totalDebt.toFixed(2),
        debtToIncomeRatio: (debtToIncomeRatio * 100).toFixed(1),
        message: totalDebt === 0 ? 'No credit card debt' : `Debt-to-income ratio: ${(debtToIncomeRatio * 100).toFixed(1)}%`,
      };
    } catch (error) {
      console.error('Calculate debt management score error:', error);
      return { score: 50, status: 'Unknown', message: 'Unable to calculate', totalDebt: "0", debtToIncomeRatio: "0" };
    }
  }

  async calculateSavingsRateScore(userId: string) {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Get monthly income
      const incomeAggregate = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'credit',
          date: {
            gte: oneMonthAgo,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const totalIncome = incomeAggregate._sum.amount || 0;

      // Get monthly expenses
      const expensesAggregate = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'debit',
          date: {
            gte: oneMonthAgo,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const totalExpenses = Math.abs(expensesAggregate._sum.amount || 0);

      const savedAmount = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (savedAmount / totalIncome) * 100 : 0;

      let score = 0;
      let status = '';

      if (savingsRate >= 20) {
        score = 100;
        status = 'Excellent';
      } else if (savingsRate >= 15) {
        score = 85;
        status = 'Great';
      } else if (savingsRate >= 10) {
        score = 70;
        status = 'Good';
      } else if (savingsRate >= 5) {
        score = 50;
        status = 'Fair';
      } else {
        score = 30;
        status = 'Poor';
      }

      return {
        score,
        status,
        savingsRate: savingsRate.toFixed(1),
        savedAmount: savedAmount.toFixed(2),
        message: `Saving ${savingsRate.toFixed(1)}% of income`,
      };
    } catch (error) {
      console.error('Calculate savings rate score error:', error);
      return { score: 50, status: 'Unknown', message: 'Unable to calculate', savingsRate: "0", savedAmount: "0" };
    }
  }

  async calculateInvestmentDiversityScore(userId: string) {
    try {
      // Get all investments and group manually since sector is optional
      const investments = await prisma.investment.findMany({
        where: { userId },
      });

      if (investments.length === 0) {
        return {
          score: 0,
          status: 'Not Invested',
          message: 'No investment portfolio',
          sectorCount: 0,
          diversityIndex: "0",
        };
      }

      // Group by sector manually
      const sectorMap = new Map<string, number>();
      investments.forEach(inv => {
        const sector = (inv as any).sector || 'Other';
        sectorMap.set(sector, (sectorMap.get(sector) || 0) + inv.totalValue);
      });

      const holdings = Array.from(sectorMap.entries()).map(([sector, totalValue]) => ({
        sector,
        totalValue,
      }));

      const sectorCount = holdings.length;
      const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);

      // Calculate Herfindahl index (diversity measure)
      const herfindahl = holdings.reduce((sum, h) => {
        const share = h.totalValue / totalValue;
        return sum + (share * share);
      }, 0);

      const diversity = 1 - herfindahl;

      let score = 0;
      let status = '';

      if (sectorCount >= 5 && diversity > 0.7) {
        score = 100;
        status = 'Well Diversified';
      } else if (sectorCount >= 3 && diversity > 0.5) {
        score = 75;
        status = 'Moderately Diversified';
      } else if (sectorCount >= 2) {
        score = 50;
        status = 'Somewhat Diversified';
      } else {
        score = 25;
        status = 'Concentrated';
      }

      return {
        score,
        status,
        sectorCount,
        diversityIndex: (diversity * 100).toFixed(1),
        message: `Invested across ${sectorCount} sectors`,
      };
    } catch (error) {
      console.error('Calculate investment diversity score error:', error);
      return { score: 0, status: 'Unknown', message: 'Unable to calculate', sectorCount: 0, diversityIndex: "0" };
    }
  }

  async calculateBudgetAdherenceScore(userId: string) {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const budgets = await prisma.smartBudget.findMany({
        where: {
          userId,
          month: {
            gte: startOfMonth,
          },
        },
      });

      if (budgets.length === 0) {
        return {
          score: 50,
          status: 'No Budget Set',
          message: 'Create a budget to track adherence',
          adherenceRate: "0",
          categoriesOverBudget: 0,
          totalCategories: 0,
        };
      }

      let totalAllocated = 0;
      let totalSpent = 0;
      let categoriesOverBudget = 0;

      budgets.forEach((budget: any) => {
        totalAllocated += budget.allocatedAmount;
        totalSpent += budget.spentAmount;

        if (budget.spentAmount > budget.allocatedAmount) {
          categoriesOverBudget++;
        }
      });

      const overallAdherence = totalAllocated > 0 ? (1 - (totalSpent / totalAllocated)) * 100 : 0;
      const percentOver = categoriesOverBudget / budgets.length;

      let score = 0;
      let status = '';

      if (percentOver === 0 && totalSpent <= totalAllocated) {
        score = 100;
        status = 'Perfect';
      } else if (percentOver < 0.2 && totalSpent <= totalAllocated * 1.05) {
        score = 85;
        status = 'Excellent';
      } else if (percentOver < 0.4) {
        score = 65;
        status = 'Good';
      } else {
        score = 40;
        status = 'Needs Improvement';
      }

      return {
        score,
        status,
        adherenceRate: Math.max(0, overallAdherence).toFixed(1),
        categoriesOverBudget,
        totalCategories: budgets.length,
        message: `${categoriesOverBudget} of ${budgets.length} categories over budget`,
      };
    } catch (error) {
      console.error('Calculate budget adherence score error:', error);
      return { score: 50, status: 'Unknown', message: 'Unable to calculate', adherenceRate: "0", categoriesOverBudget: 0, totalCategories: 0 };
    }
  }

  generateRecommendations(components: any) {
    const recommendations = [];

    if (components.emergencyFund.score < 70) {
      recommendations.push({
        type: 'emergency_fund',
        priority: 'high',
        title: 'Build Your Emergency Fund',
        description: `Aim for 3-6 months of expenses. Currently at ${components.emergencyFund.monthsCovered} months.`,
        action: 'Set up automatic transfer of 10% of income to savings',
      });
    }

    if (components.debtManagement.score < 70) {
      recommendations.push({
        type: 'debt',
        priority: 'high',
        title: 'Reduce High-Interest Debt',
        description: `Your debt-to-income ratio is ${components.debtManagement.debtToIncomeRatio}%.`,
        action: 'Focus on paying off highest APR credit card first',
      });
    }

    if (components.savingsRate.score < 70) {
      recommendations.push({
        type: 'savings',
        priority: 'medium',
        title: 'Increase Savings Rate',
        description: `Currently saving ${components.savingsRate.savingsRate}% of income.`,
        action: 'Try to save at least 15% of your income monthly',
      });
    }

    if (components.investmentDiversity.score < 70) {
      recommendations.push({
        type: 'investment',
        priority: 'medium',
        title: 'Diversify Investments',
        description: `Portfolio spread across ${components.investmentDiversity.sectorCount} sectors.`,
        action: 'Consider adding ETFs or mutual funds for broader diversification',
      });
    }

    if (components.budgetAdherence.score < 70) {
      recommendations.push({
        type: 'budget',
        priority: 'high',
        title: 'Improve Budget Adherence',
        description: `${components.budgetAdherence.categoriesOverBudget} categories over budget.`,
        action: 'Review and adjust budget allocations based on actual spending',
      });
    }

    return recommendations;
  }

  async getLatestScore(userId: string) {
    try {
      const result = await prisma.financialHealthScore.findFirst({
        where: { userId },
        orderBy: { calculatedAt: 'desc' },
      });

      if (!result) {
        return await this.calculateHealthScore(userId);
      }

      return {
        overallScore: result.overallScore,
        components: result.components ? JSON.parse(result.components as string) : {},
        recommendations: result.recommendations ? JSON.parse(result.recommendations as string) : [],
        calculatedAt: result.calculatedAt,
      };
    } catch (error) {
      console.error('Get latest score error:', error);
      throw error;
    }
  }
}

export default new FinancialHealthService();
