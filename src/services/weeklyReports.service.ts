import prisma from '../config/database';

class WeeklyReportsService {
  async generateWeeklyReport(userId: string) {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date();
      weekEnd.setHours(23, 59, 59, 999);

      // Calculate net worth
      const accounts = await prisma.bankAccount.findMany({ where: { userId } });
      const investments = await prisma.investment.findMany({ where: { userId } });
      
      const netWorth = accounts.reduce((sum, acc) => sum + acc.current, 0) +
                      investments.reduce((sum, inv) => sum + inv.totalValue, 0);

      // Get previous week's net worth
      const prevReport = await prisma.weeklyReport.findFirst({
        where: { userId },
        orderBy: { weekStart: 'desc' },
      });

      const netWorthChange = prevReport ? netWorth - prevReport.netWorth : 0;

      // Generate insights
      const highlights = [
        `Net worth ${netWorthChange >= 0 ? 'increased' : 'decreased'} by $${Math.abs(netWorthChange).toFixed(2)}`,
        `Total portfolio value: $${netWorth.toFixed(2)}`,
        `Active investments: ${investments.length}`,
      ];

      const warnings = netWorthChange < 0 ? 
        ['Net worth decreased this week', 'Review spending patterns'] : [];

      const opportunities = [
        'Consider increasing investment contributions',
        'Review budget allocations',
        'Check for tax optimization opportunities',
      ];

      const nextWeekGoals = [
        'Track daily expenses',
        'Review investment performance',
        'Update budget if needed',
      ];

      const report = await prisma.weeklyReport.create({
        data: {
          userId,
          weekStart,
          weekEnd,
          netWorth,
          netWorthChange,
          highlights,
          warnings,
          opportunities,
          nextWeekGoals,
          reportText: `Your financial week in review: Net worth is $${netWorth.toFixed(2)}, ${netWorthChange >= 0 ? 'up' : 'down'} $${Math.abs(netWorthChange).toFixed(2)} from last week.`,
        },
      });

      return report;
    } catch (error) {
      console.error('Generate weekly report error:', error);
      throw error;
    }
  }

  async getWeeklyReports(userId: string, limit = 10) {
    return prisma.weeklyReport.findMany({
      where: { userId },
      orderBy: { weekStart: 'desc' },
      take: limit,
    });
  }
}

export default new WeeklyReportsService();
