import prisma from '../config/database';

class WealthRoadmapService {
  async initializeRoadmap(userId: string, targetNetWorth = 1000000): Promise<any> {
    try {
      const milestones = [
        {
          type: 'emergency_fund',
          milestoneType: 'emergency_fund',
          targetAmount: 10000,
          orderIndex: 1,
        },
        {
          type: 'debt_free',
          milestoneType: 'debt_free',
          targetAmount: 0,
          orderIndex: 2,
        },
        {
          type: 'retirement_start',
          milestoneType: 'retirement_start',
          targetAmount: 5000,
          orderIndex: 3,
        },
        {
          type: 'net_worth_50k',
          milestoneType: 'net_worth_50k',
          targetAmount: 50000,
          orderIndex: 4,
        },
        {
          type: 'max_retirement',
          milestoneType: 'max_retirement',
          targetAmount: 20000,
          orderIndex: 5,
        },
        {
          type: 'net_worth_100k',
          milestoneType: 'net_worth_100k',
          targetAmount: 100000,
          orderIndex: 6,
        },
        {
          type: 'investment_portfolio',
          milestoneType: 'investment_portfolio',
          targetAmount: 50000,
          orderIndex: 7,
        },
        {
          type: 'real_estate',
          milestoneType: 'real_estate',
          targetAmount: 100000,
          orderIndex: 8,
        },
        {
          type: 'net_worth_500k',
          milestoneType: 'net_worth_500k',
          targetAmount: 500000,
          orderIndex: 9,
        },
        {
          type: 'net_worth_1m',
          milestoneType: 'net_worth_1m',
          targetAmount: targetNetWorth,
          orderIndex: 10,
        },
      ];

      for (const milestone of milestones) {
        // Use upsert or create if not exists
        const existing = await prisma.wealthMilestone.findFirst({
            where: { userId, milestoneType: milestone.type }
        });

        if (!existing) {
            await prisma.wealthMilestone.create({
                data: {
                    userId,
                    milestoneType: milestone.type,
                    targetAmount: milestone.targetAmount,
                    orderIndex: milestone.orderIndex,
                    currentAmount: 0,
                    progressPercent: 0,
                }
            });
        }
      }

      return await this.getRoadmap(userId);
    } catch (error) {
      console.error('Initialize roadmap error:', error);
      throw error;
    }
  }

  async getRoadmap(userId: string): Promise<any> {
    try {
      const milestones = await prisma.wealthMilestone.findMany({
        where: { userId },
        orderBy: { orderIndex: 'asc' },
      });

      if (milestones.length === 0) {
        return await this.initializeRoadmap(userId);
      }

      // Update progress
      await this.updateProgress(userId);

      const updated = await prisma.wealthMilestone.findMany({
        where: { userId },
        orderBy: { orderIndex: 'asc' },
      });

      return this.formatRoadmap(updated);
    } catch (error) {
      console.error('Get roadmap error:', error);
      throw error;
    }
  }

  async updateProgress(userId: string) {
    try {
      // Calculate current net worth
      const netWorth = await this.calculateNetWorth(userId);

      // Get debt
      const debtAgg = await prisma.bankAccount.aggregate({
        where: { userId, accountType: 'credit_card' },
        _sum: { current: true }
      });
      const totalDebt = Math.abs(debtAgg._sum.current || 0);

      // Get savings
      const savingsAgg = await prisma.bankAccount.aggregate({
        where: { userId, accountType: 'savings' },
        _sum: { available: true }
      });
      const totalSavings = savingsAgg._sum.available || 0;

      // Get investment portfolio value
      const portfolioAgg = await prisma.investment.aggregate({
        where: { userId },
        _sum: { totalValue: true }
      });
      const portfolioValue = portfolioAgg._sum.totalValue || 0;

      // Update each milestone
      const milestones = await prisma.wealthMilestone.findMany({ where: { userId } });

      for (const milestone of milestones) {
        let currentAmount = 0;
        let status = 'not_started';

        switch (milestone.milestoneType) {
          case 'emergency_fund':
            currentAmount = totalSavings;
            break;
          case 'debt_free':
            currentAmount = Math.max(0, (milestone.targetAmount || 0) - totalDebt);
            break;
          case 'net_worth_50k':
          case 'net_worth_100k':
          case 'net_worth_500k':
          case 'net_worth_1m':
            currentAmount = netWorth;
            break;
          case 'investment_portfolio':
          case 'retirement_start':
          case 'max_retirement':
          case 'real_estate':
            currentAmount = portfolioValue;
            break;
        }

        const targetAmount = milestone.targetAmount || 0;
        const progress = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;

        if (progress >= 100) {
          status = 'completed';
        } else if (progress > 0) {
          status = 'in_progress';
        }

        await prisma.wealthMilestone.update({
          where: { id: milestone.id },
          data: {
            currentAmount,
            progressPercent: progress,
            status,
            completedAt: status === 'completed' && !milestone.completedAt ? new Date() : milestone.completedAt,
          },
        });
      }
    } catch (error) {
      console.error('Update progress error:', error);
    }
  }

  async calculateNetWorth(userId: string) {
    try {
      const assetsAgg = await prisma.bankAccount.aggregate({
        where: { userId, accountType: { in: ['checking', 'savings', 'investment'] } },
        _sum: { available: true }
      });
      
      const portfolioAgg = await prisma.investment.aggregate({
        where: { userId },
        _sum: { totalValue: true }
      });

      const liabilitiesAgg = await prisma.bankAccount.aggregate({
        where: { userId, accountType: 'credit_card' },
        _sum: { current: true }
      });

      const totalAssets = (assetsAgg._sum.available || 0) + (portfolioAgg._sum.totalValue || 0);
      const totalLiabilities = Math.abs(liabilitiesAgg._sum.current || 0);

      return totalAssets - totalLiabilities;
    } catch (error) {
      console.error('Calculate net worth error:', error);
      return 0;
    }
  }

  formatRoadmap(milestones: any[]) {
    const milestoneDescriptions: Record<string, any> = {
      emergency_fund: {
        title: 'Build Emergency Fund',
        description: 'Save 3-6 months of expenses for unexpected events',
        icon: '🛡️',
      },
      debt_free: {
        title: 'Pay Off High-Interest Debt',
        description: 'Eliminate credit card and high-interest loans',
        icon: '💳',
      },
      retirement_start: {
        title: 'Start Retirement Contributions',
        description: 'Begin contributing to 401k or IRA',
        icon: '🏖️',
      },
      net_worth_50k: {
        title: 'Reach $50,000 Net Worth',
        description: 'Your first major wealth milestone',
        icon: '🎯',
      },
      max_retirement: {
        title: 'Max Out Retirement Accounts',
        description: 'Contribute the maximum to all retirement accounts',
        icon: '📈',
      },
      net_worth_100k: {
        title: 'Reach $100,000 Net Worth',
        description: 'Significant wealth accumulation achieved',
        icon: '💎',
      },
      investment_portfolio: {
        title: 'Build Investment Portfolio',
        description: 'Create a diversified stock and bond portfolio',
        icon: '📊',
      },
      real_estate: {
        title: 'Real Estate Investment',
        description: 'Purchase investment property or REIT shares',
        icon: '🏠',
      },
      net_worth_500k: {
        title: 'Reach $500,000 Net Worth',
        description: 'Halfway to millionaire status',
        icon: '🚀',
      },
      net_worth_1m: {
        title: 'Reach $1,000,000 Net Worth',
        description: 'Achieve millionaire status',
        icon: '👑',
      },
    };

    return milestones.map(m => ({
      id: m.id,
      type: m.milestoneType,
      ...(milestoneDescriptions[m.milestoneType] || {}),
      targetAmount: m.targetAmount,
      currentAmount: m.currentAmount,
      progress: m.progressPercent,
      status: m.status,
      completedAt: m.completedAt,
      order: m.orderIndex,
    }));
  }
}

export default new WealthRoadmapService();
