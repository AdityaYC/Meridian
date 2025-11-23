import prisma from '../config/database';
import cron from 'node-cron';
import notificationService from './notification.service';

class BillPayService {
  constructor() {
    // Run bill checker every day at 9 AM
    cron.schedule('0 9 * * *', () => {
      this.checkAllBills();
    });
  }

  async createBill(userId: string, billData: any) {
    try {
      const { name, category, amount, dueDate, frequency, autopayEnabled, paymentMethod, notes } = billData;

      const nextDueDate = this.calculateNextDueDate(new Date(dueDate), frequency);

      const bill = await prisma.bill.create({
        data: {
          userId,
          name,
          category,
          amount: parseFloat(amount),
          dueDate: new Date(dueDate),
          frequency,
          autopayEnabled: autopayEnabled || false,
          paymentMethod,
          nextDueDate,
          notes,
        },
      });

      return bill;
    } catch (error) {
      console.error('Create bill error:', error);
      throw error;
    }
  }

  private calculateNextDueDate(dueDate: Date, frequency: string): Date {
    const date = new Date(dueDate);
    const today = new Date();

    // If due date is in the future, return it (for first time)
    // But the logic in prompt finds *next* occurrence if current passed.
    // Let's follow prompt logic: "Find next occurrence"
    
    if (date > today) return date;

    while (date < today) {
      if (frequency === 'monthly') {
        date.setMonth(date.getMonth() + 1);
      } else if (frequency === 'weekly') {
        date.setDate(date.getDate() + 7);
      } else if (frequency === 'yearly') {
        date.setFullYear(date.getFullYear() + 1);
      } else {
        break; // one-time
      }
    }

    return date;
  }

  async getUserBills(userId: string) {
    return await prisma.bill.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        nextDueDate: 'asc',
      },
    });
  }

  async payBill(billId: string, userId: string) {
    try {
      const bill = await prisma.bill.findFirst({
        where: { id: billId, userId },
      });

      if (!bill) {
        throw new Error('Bill not found');
      }

      // Find a bank account to pay from (simplified: just pick first active one or based on payment method)
      const account = await prisma.bankAccount.findFirst({
        where: { userId },
      });

      if (!account) {
        throw new Error('No bank account found');
      }

      // Record payment as transaction
      await prisma.transaction.create({
        data: {
          userId,
          bankAccountId: account.id,
          description: `Bill Payment: ${bill.name}`,
          amount: -bill.amount, // Negative for debit
          type: 'debit',
          category: bill.category,
          date: new Date(),
          merchantName: bill.name,
          tellerTransactionId: `bill_${billId}_${Date.now()}`, // Mock ID
          status: 'completed',
        },
      });

      // Update bill
      const nextDueDate = bill.nextDueDate 
        ? this.calculateNextDueDate(bill.nextDueDate, bill.frequency)
        : null;

      await prisma.bill.update({
        where: { id: billId },
        data: {
          lastPaidDate: new Date(),
          nextDueDate: nextDueDate || undefined,
        },
      });

      await notificationService.createNotification(
        userId,
        'bill_paid',
        'Bill Paid Successfully',
        `Paid ${bill.name}: $${bill.amount}`,
        { billId, amount: bill.amount }
      );

      return { success: true };
    } catch (error) {
      console.error('Pay bill error:', error);
      throw error;
    }
  }

  async detectRecurringBills(userId: string) {
    try {
      // Analyze transactions for recurring patterns
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // We need raw SQL for aggregation usually, or do it in memory if small dataset
      // Prisma GroupBy is limited.
      // Let's use Prisma raw query for complex aggregation
      
      const result = await prisma.$queryRaw`
        SELECT 
          description,
          category,
          AVG(ABS(amount)) as avg_amount,
          COUNT(*) as occurrence_count,
          ARRAY_AGG(date ORDER BY date) as dates
         FROM "Transaction"
         WHERE "userId" = ${userId}
         AND date > ${sixMonthsAgo}
         AND type = 'debit'
         GROUP BY description, category
         HAVING COUNT(*) >= 3
         ORDER BY occurrence_count DESC
      `;

      const suggestions: any[] = [];

      // @ts-ignore
      for (const row of result) {
        const dates = row.dates.map((d: string) => new Date(d));
        const intervals = [];

        for (let i = 1; i < dates.length; i++) {
          const days = Math.round((dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24));
          intervals.push(days);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

        let frequency = 'monthly';
        if (avgInterval >= 25 && avgInterval <= 35) frequency = 'monthly';
        else if (avgInterval >= 6 && avgInterval <= 8) frequency = 'weekly';
        else if (avgInterval >= 360 && avgInterval <= 370) frequency = 'yearly';

        suggestions.push({
          name: row.description,
          category: row.category,
          amount: parseFloat(row.avg_amount).toFixed(2),
          frequency,
          lastOccurrence: dates[dates.length - 1],
          confidence: row.occurrence_count >= 6 ? 'high' : 'medium',
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Detect recurring bills error:', error);
      return [];
    }
  }

  async checkAllBills() {
    try {
      // Get all users with active bills
      // Prisma distinct
      const bills = await prisma.bill.findMany({
        where: { isActive: true },
        distinct: ['userId'],
        select: { userId: true }
      });

      for (const { userId } of bills) {
        await notificationService.checkUpcomingBills(userId);

        // Auto-pay bills if enabled
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dueBills = await prisma.bill.findMany({
          where: {
            userId,
            autopayEnabled: true,
            nextDueDate: {
              gte: today,
              lt: tomorrow
            }
          }
        });

        for (const bill of dueBills) {
          await this.payBill(bill.id, userId);
        }
      }
    } catch (error) {
      console.error('Check all bills error:', error);
    }
  }

  async updateBill(billId: string, userId: string, updates: any) {
    await prisma.bill.updateMany({
      where: { id: billId, userId },
      data: updates,
    });
    return { success: true };
  }

  async deleteBill(billId: string, userId: string) {
    await prisma.bill.updateMany({
      where: { id: billId, userId },
      data: { isActive: false },
    });
    return { success: true };
  }
}

export default new BillPayService();
