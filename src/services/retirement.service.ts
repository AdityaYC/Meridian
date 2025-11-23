import prisma from '../config/database';

class RetirementService {
  async createRetirementPlan(userId: string, planData: any) {
    const projection = this.calculateProjection(planData);

    const plan = await prisma.retirementPlan.upsert({
      where: { userId },
      create: {
        userId,
        currentAge: planData.currentAge,
        retirementAge: planData.retirementAge,
        currentSavings: planData.currentSavings,
        monthlyContribution: planData.monthlyContribution,
        expectedReturn: planData.expectedReturn || 7.0,
        inflationRate: planData.inflationRate || 3.0,
        projectedValue: projection.projectedValue,
        monthlyIncome: projection.monthlyIncome,
        isOnTrack: projection.isOnTrack,
      },
      update: {
        currentAge: planData.currentAge,
        retirementAge: planData.retirementAge,
        currentSavings: planData.currentSavings,
        monthlyContribution: planData.monthlyContribution,
        expectedReturn: planData.expectedReturn || 7.0,
        inflationRate: planData.inflationRate || 3.0,
        projectedValue: projection.projectedValue,
        monthlyIncome: projection.monthlyIncome,
        isOnTrack: projection.isOnTrack,
      },
    });

    return { ...plan, ...projection };
  }

  calculateProjection(planData: any) {
    const {
      currentAge,
      retirementAge,
      currentSavings,
      monthlyContribution,
      expectedReturn = 7.0,
      inflationRate = 3.0,
      currentIncome = 5000,
    } = planData;

    const yearsToRetirement = retirementAge - currentAge;
    const monthsToRetirement = yearsToRetirement * 12;
    const monthlyReturn = expectedReturn / 100 / 12;

    // Future value calculations
    const fvCurrentSavings = currentSavings * Math.pow(1 + monthlyReturn, monthsToRetirement);
    const fvContributions =
      monthlyContribution * ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn);

    const projectedValue = fvCurrentSavings + fvContributions;
    const monthlyIncome = (projectedValue * 0.04) / 12; // 4% rule

    // Adjust for inflation
    const realValue = projectedValue / Math.pow(1 + inflationRate / 100, yearsToRetirement);
    const realMonthlyIncome = monthlyIncome / Math.pow(1 + inflationRate / 100, yearsToRetirement);

    const targetMonthlyIncome = currentIncome * 0.7;
    const isOnTrack = realMonthlyIncome >= targetMonthlyIncome;

    return {
      yearsToRetirement,
      projectedValue: Math.round(projectedValue),
      realValue: Math.round(realValue),
      monthlyIncome: Math.round(monthlyIncome),
      realMonthlyIncome: Math.round(realMonthlyIncome),
      replacementRatio: ((realMonthlyIncome / currentIncome) * 100).toFixed(1),
      isOnTrack,
      targetIncome: Math.round(targetMonthlyIncome),
      gap: isOnTrack ? 0 : Math.round(targetMonthlyIncome - realMonthlyIncome),
    };
  }

  async getRetirementPlan(userId: string) {
    const plan = await prisma.retirementPlan.findUnique({
      where: { userId },
    });

    if (!plan) return null;

    const projection = this.calculateProjection({
      currentAge: plan.currentAge,
      retirementAge: plan.retirementAge,
      currentSavings: plan.currentSavings,
      monthlyContribution: plan.monthlyContribution,
      expectedReturn: plan.expectedReturn,
      inflationRate: plan.inflationRate,
    });

    return { ...plan, ...projection };
  }

  async optimizeContributions(userId: string) {
    const plan = await this.getRetirementPlan(userId);

    if (!plan) {
      throw new Error('No retirement plan found');
    }

    if (plan.isOnTrack) {
      return {
        message: "You're on track!",
        currentContribution: plan.monthlyContribution,
      };
    }

    // Binary search for optimal contribution
    let low = plan.monthlyContribution;
    let high = plan.monthlyContribution * 3;
    let optimal = low;

    while (high - low > 1) {
      const mid = (low + high) / 2;
      const projection = this.calculateProjection({
        currentAge: plan.currentAge,
        retirementAge: plan.retirementAge,
        currentSavings: plan.currentSavings,
        monthlyContribution: mid,
        expectedReturn: plan.expectedReturn,
        inflationRate: plan.inflationRate,
      });

      if (projection.isOnTrack) {
        optimal = mid;
        high = mid;
      } else {
        low = mid;
      }
    }

    return {
      currentContribution: plan.monthlyContribution,
      recommendedContribution: Math.ceil(optimal),
      increase: Math.ceil(optimal - plan.monthlyContribution),
      message: `Increase by $${Math.ceil(optimal - plan.monthlyContribution)} to reach your goal`,
    };
  }
}

export default new RetirementService();
