import prisma from '../config/database';
import { Server } from 'socket.io';

class NotificationService {
  private io: Server | null = null;

  setIo(io: Server) {
    this.io = io;
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata: any = {}
  ) {
    try {
      const severity = this.determineSeverity(type, metadata);

      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          severity,
          metadata,
        },
      });

      // Send real-time notification via WebSocket
      if (this.io) {
        this.io.to(userId).emit('notification', notification);
      }

      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  private determineSeverity(type: string, metadata: any): string {
    if (type === 'unusual_transaction' || type === 'bill_overdue') return 'critical';
    if (type === 'budget_alert' && metadata.percentOver > 20) return 'warning';
    if (type === 'investment_alert' && Math.abs(metadata.change) > 10) return 'warning';
    return 'info';
  }

  async checkBudgetAlerts(userId: string) {
    try {
      // Get current month's smart budgets
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

      for (const budget of budgets) {
        const percentSpent = (budget.spentAmount / budget.allocatedAmount) * 100;

        if (percentSpent >= 80 && percentSpent < 100) {
          await this.createNotification(
            userId,
            'budget_alert',
            `${budget.category} Budget Warning`,
            `You've spent ${percentSpent.toFixed(0)}% of your ${budget.category} budget. $${(budget.allocatedAmount - budget.spentAmount).toFixed(2)} remaining.`,
            { category: budget.category, percentSpent, remaining: budget.allocatedAmount - budget.spentAmount }
          );
        } else if (percentSpent >= 100) {
          await this.createNotification(
            userId,
            'budget_alert',
            `${budget.category} Budget Exceeded`,
            `You're ${(percentSpent - 100).toFixed(0)}% over budget on ${budget.category}. Consider adjusting your spending.`,
            { category: budget.category, percentOver: percentSpent - 100 }
          );
        }
      }
    } catch (error) {
      console.error('Check budget alerts error:', error);
    }
  }

  async checkUnusualTransactions(userId: string) {
    try {
      // Get user's average transaction amount for last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: ninetyDaysAgo,
          },
        },
        select: {
          amount: true,
        },
      });

      if (transactions.length === 0) return;

      const amounts = transactions.map(t => Math.abs(t.amount));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance = amounts.reduce((a, b) => a + Math.pow(b - avgAmount, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);

      const threshold = avgAmount + (2 * stdDev); // 2 std deviations

      // Check recent transactions (last 1 day)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const unusualTxns = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: oneDayAgo,
          },
          amount: {
            lt: -threshold, // Assuming debit is negative
          },
        },
      });

      for (const txn of unusualTxns) {
        // Check if we already notified about this transaction
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId,
            type: 'unusual_transaction',
            metadata: {
              path: ['transactionId'],
              equals: txn.id
            }
          }
        });

        if (!existingNotification) {
          await this.createNotification(
            userId,
            'unusual_transaction',
            'Unusual Transaction Detected',
            `Large transaction: $${Math.abs(txn.amount).toFixed(2)} at ${txn.merchantName || txn.description}`,
            { transactionId: txn.id, amount: txn.amount, merchant: txn.merchantName || txn.description }
          );
        }
      }
    } catch (error) {
      console.error('Check unusual transactions error:', error);
    }
  }

  async checkUpcomingBills(userId: string) {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const today = new Date();

      const upcomingBills = await prisma.bill.findMany({
        where: {
          userId,
          isActive: true,
          nextDueDate: {
            gte: today,
            lte: threeDaysFromNow,
          },
          autopayEnabled: false,
        },
      });

      for (const bill of upcomingBills) {
        if (!bill.nextDueDate) continue;
        
        const daysUntilDue = Math.ceil((bill.nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Check if we already notified recently (e.g. today)
        // For simplicity, we'll just create it. Ideally check for duplicates.
        
        await this.createNotification(
          userId,
          'bill_reminder',
          `Bill Due ${daysUntilDue <= 0 ? 'Today' : `in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`}`,
          `${bill.name}: $${bill.amount} due on ${bill.nextDueDate.toLocaleDateString()}`,
          { billId: bill.id, amount: bill.amount, dueDate: bill.nextDueDate }
        );
      }
    } catch (error) {
      console.error('Check upcoming bills error:', error);
    }
  }

  async getNotifications(userId: string, limit = 20) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
}

export default new NotificationService();
