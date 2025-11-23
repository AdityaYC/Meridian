import prisma from '../config/database';

class RebalancingService {
  async setTargetAllocation(userId: string, targets: Record<string, number>) {
    for (const [assetType, targetPercent] of Object.entries(targets)) {
      await prisma.portfolioTarget.upsert({
        where: {
          userId_assetType: { userId, assetType },
        },
        create: { userId, assetType, targetPercent },
        update: { targetPercent },
      });
    }

    return this.getTargetAllocation(userId);
  }

  async getTargetAllocation(userId: string) {
    return prisma.portfolioTarget.findMany({ where: { userId } });
  }

  async checkRebalanceNeeded(userId: string) {
    const targets = await this.getTargetAllocation(userId);

    if (targets.length === 0) {
      return {
        needsRebalancing: false,
        message: 'No target allocation set',
      };
    }

    // Get current portfolio
    const investments = await prisma.investment.findMany({ where: { userId } });
    const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);

    if (totalValue === 0) {
      return { needsRebalancing: false, message: 'No portfolio holdings' };
    }

    // Calculate current allocation by type
    const currentAllocation: Record<string, number> = {};
    investments.forEach(inv => {
      const type = inv.type || 'other';
      currentAllocation[type] = (currentAllocation[type] || 0) + inv.totalValue;
    });

    // Convert to percentages
    Object.keys(currentAllocation).forEach(type => {
      currentAllocation[type] = (currentAllocation[type] / totalValue) * 100;
    });

    // Check deviations
    const deviations: any[] = [];
    let needsRebalancing = false;

    targets.forEach(target => {
      const current = currentAllocation[target.assetType] || 0;
      const deviation = Math.abs(current - target.targetPercent);

      deviations.push({
        assetType: target.assetType,
        target: target.targetPercent,
        current: current.toFixed(2),
        deviation: deviation.toFixed(2),
        needsAdjustment: deviation > target.rebalanceThreshold,
      });

      if (deviation > target.rebalanceThreshold) {
        needsRebalancing = true;
      }
    });

    return {
      needsRebalancing,
      totalValue: totalValue.toFixed(2),
      deviations,
    };
  }

  async generateRebalancingPlan(userId: string) {
    const check = await this.checkRebalanceNeeded(userId);

    if (!check.needsRebalancing || !check.totalValue) {
      return {
        needsRebalancing: false,
        message: 'Portfolio is within target allocation',
      };
    }

    const totalValue = parseFloat(check.totalValue);
    const trades: any[] = [];

    if (check.deviations) {
      check.deviations.forEach((dev: any) => {
        if (dev.needsAdjustment) {
          const currentValue = (parseFloat(dev.current) / 100) * totalValue;
          const targetValue = (dev.target / 100) * totalValue;
          const difference = targetValue - currentValue;

          trades.push({
            assetType: dev.assetType,
            action: difference > 0 ? 'buy' : 'sell',
            amount: Math.abs(difference).toFixed(2),
            currentPercent: dev.current,
            targetPercent: dev.target,
          });
        }
      });
    }

    return {
      needsRebalancing: true,
      totalValue: totalValue.toFixed(2),
      trades,
    };
  }
}

export default new RebalancingService();
