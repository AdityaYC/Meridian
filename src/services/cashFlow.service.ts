import prisma from '../config/database';
import billPayService from './billPay.service';

class CashFlowService {
  async getForecast(userId: string, months = 3) {
    try {
      // Get current balance
      const accounts = await prisma.bankAccount.findMany({
        where: { userId },
      });
      
      let currentBalance = accounts.reduce((sum, acc) => sum + acc.current, 0);
      const today = new Date();

      // Get recurring bills
      const bills = await billPayService.getUserBills(userId);

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);

      const events: any[] = [];

      // Add Bill events
      for (const bill of bills) {
        let nextDate = new Date(bill.nextDueDate || today);
        // Handle past due dates by advancing them to future
        while (nextDate < today) {
             if (bill.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
             else if (bill.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
             else if (bill.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
             else break;
        }

        while (nextDate <= endDate) {
          events.push({
            date: new Date(nextDate),
            amount: -bill.amount,
            name: bill.name,
            type: 'bill'
          });
          
          // Advance nextDate based on frequency
          if (bill.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
          else if (bill.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
          else if (bill.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
          else break; // One-time
        }
      }

      // Add predicted income (Simplified: Fixed monthly income based on avg)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const incomeResult = await prisma.transaction.aggregate({
        where: {
            userId,
            amount: { gt: 0 },
            date: { gte: threeMonthsAgo }
        },
        _avg: { amount: true }
      });
      
      const avgIncome = incomeResult._avg.amount || 0;
      if (avgIncome > 0) {
          let incomeDate = new Date(today);
          incomeDate.setDate(1); // Assume 1st of month for simplicity if no pattern
          if (incomeDate < today) incomeDate.setMonth(incomeDate.getMonth() + 1);
          
          while (incomeDate <= endDate) {
              events.push({
                  date: new Date(incomeDate),
                  amount: avgIncome,
                  name: 'Estimated Income',
                  type: 'income'
              });
              incomeDate.setMonth(incomeDate.getMonth() + 1);
          }
      }

      // Sort events by date
      events.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Generate daily balances
      const dailyBalances: any[] = [];
      let runningBalance = currentBalance;
      
      // Group by date string
      const eventsByDate = new Map<string, any[]>();
      events.forEach(e => {
          const dateStr = e.date.toISOString().split('T')[0];
          if (!eventsByDate.has(dateStr)) eventsByDate.set(dateStr, []);
          eventsByDate.get(dateStr)?.push(e);
      });

      let iterDate = new Date(today);
      while (iterDate <= endDate) {
          const dateStr = iterDate.toISOString().split('T')[0];
          const dayEvents = eventsByDate.get(dateStr) || [];
          
          dayEvents.forEach((e: any) => runningBalance += e.amount);
          
          dailyBalances.push({
              date: dateStr,
              balance: runningBalance,
              events: dayEvents
          });
          
          iterDate.setDate(iterDate.getDate() + 1);
      }

      return {
          currentBalance,
          forecast: dailyBalances,
          lowestBalance: dailyBalances.length > 0 ? Math.min(...dailyBalances.map(d => d.balance)) : currentBalance,
          highestBalance: dailyBalances.length > 0 ? Math.max(...dailyBalances.map(d => d.balance)) : currentBalance
      };

    } catch (error) {
      console.error('Get cash flow forecast error:', error);
      throw error;
    }
  }
}

export default new CashFlowService();
