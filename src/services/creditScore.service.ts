import prisma from '../config/database';

class CreditScoreService {
  async getCreditScore(userId: string) {
    const latest = await prisma.creditScore.findFirst({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
    });

    if (latest) return latest;

    // Generate initial score
    return this.simulateCreditScore(userId);
  }

  async simulateCreditScore(userId: string) {
    let score = 650; // Base score

    // Factor 1: Payment history
    const bills = await prisma.bill.findMany({
      where: { userId, isActive: true },
    });

    const paidBills = bills.filter(b => b.lastPaidDate).length;
    const paymentHistory = bills.length > 0 ? paidBills / bills.length : 0.9;
    score += paymentHistory * 150;

    // Factor 2: Credit utilization
    const creditCards = await prisma.bankAccount.findMany({
      where: { userId, accountType: 'credit' },
    });

    const totalUsed = creditCards.reduce((sum, cc) => sum + Math.abs(cc.current), 0);
    const totalLimit = creditCards.reduce((sum, cc) => sum + (cc.limit || 0), 0);
    const utilization = totalLimit > 0 ? totalUsed / totalLimit : 0;

    if (utilization < 0.3) score += 100;
    else if (utilization < 0.5) score += 70;
    else score += 30;

    score = Math.max(300, Math.min(850, Math.round(score)));

    const factors = {
      paymentHistory: {
        impact: 'high',
        status: paymentHistory > 0.9 ? 'excellent' : 'good',
        description: `${(paymentHistory * 100).toFixed(0)}% on-time payments`,
      },
      creditUtilization: {
        impact: 'high',
        status: utilization < 0.3 ? 'excellent' : 'good',
        description: `${(utilization * 100).toFixed(0)}% of credit used`,
      },
    };

    const recommendations = this.generateRecommendations(score, factors);

    const creditScore = await prisma.creditScore.create({
      data: {
        userId,
        score,
        provider: 'simulated',
        factors,
        recommendations,
      },
    });

    return creditScore;
  }

  generateRecommendations(score: number, factors: any) {
    const recommendations: any[] = [];

    if (score < 700) {
      recommendations.push({
        title: 'Improve Payment History',
        impact: '+20-50 points',
        description: 'Set up autopay for all bills',
      });
    }

    if (factors.creditUtilization.status !== 'excellent') {
      recommendations.push({
        title: 'Reduce Credit Utilization',
        impact: '+15-40 points',
        description: 'Pay down balances below 30%',
      });
    }

    recommendations.push({
      title: 'Monitor Your Credit',
      impact: 'Prevent fraud',
      description: 'Check credit report regularly',
    });

    return recommendations;
  }

  async getScoreHistory(userId: string, months = 12) {
    return prisma.creditScore.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: months,
    });
  }
}

export default new CreditScoreService();
