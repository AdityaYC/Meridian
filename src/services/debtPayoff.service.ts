import prisma from '../config/database';

class DebtPayoffService {
  async createDebtAccount(userId: string, debtData: any) {
    return prisma.debtAccount.create({
      data: {
        userId,
        creditorName: debtData.creditorName,
        accountType: debtData.accountType,
        balance: debtData.balance,
        interestRate: debtData.interestRate,
        minimumPayment: debtData.minimumPayment,
        currentPayment: debtData.currentPayment || debtData.minimumPayment,
        dueDate: debtData.dueDate,
      },
    });
  }

  async getDebtAccounts(userId: string) {
    return prisma.debtAccount.findMany({
      where: { userId, isActive: true },
      orderBy: { interestRate: 'desc' },
    });
  }

  async calculatePayoffPlan(userId: string, monthlyPayment: number, strategy = 'avalanche') {
    const debts = await this.getDebtAccounts(userId);

    if (debts.length === 0) {
      return {
        message: 'No active debt accounts',
        totalDebt: 0,
        payoffMonths: 0,
      };
    }

    // Sort debts based on strategy
    const sortedDebts = strategy === 'avalanche'
      ? [...debts].sort((a, b) => b.interestRate - a.interestRate)
      : [...debts].sort((a, b) => a.balance - b.balance);

    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const totalMinimum = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

    if (monthlyPayment < totalMinimum) {
      throw new Error(`Monthly payment must be at least $${totalMinimum.toFixed(2)}`);
    }

    // Simulate payoff
    const simulation = this.simulatePayoff(sortedDebts, monthlyPayment);

    // Save plan
    await prisma.debtPayoffPlan.upsert({
      where: { userId },
      create: {
        userId,
        strategy,
        totalDebt,
        monthlyPayment,
        payoffMonths: simulation.totalMonths,
        totalInterest: simulation.totalInterest,
        debtOrder: simulation.payoffOrder,
      },
      update: {
        strategy,
        totalDebt,
        monthlyPayment,
        payoffMonths: simulation.totalMonths,
        totalInterest: simulation.totalInterest,
        debtOrder: simulation.payoffOrder,
      },
    });

    return {
      strategy,
      totalDebt: totalDebt.toFixed(2),
      monthlyPayment: monthlyPayment.toFixed(2),
      payoffMonths: simulation.totalMonths,
      payoffDate: this.calculatePayoffDate(simulation.totalMonths),
      totalInterest: simulation.totalInterest.toFixed(2),
      payoffOrder: simulation.payoffOrder,
    };
  }

  simulatePayoff(debts: any[], monthlyPayment: number) {
    const debtsCopy = debts.map(d => ({
      ...d,
      balance: d.balance,
    }));

    let month = 0;
    let totalInterest = 0;
    const payoffOrder: any[] = [];

    while (debtsCopy.some(d => d.balance > 0) && month < 600) {
      month++;
      let remainingPayment = monthlyPayment;

      // Pay minimum on all debts
      debtsCopy.forEach(debt => {
        if (debt.balance > 0) {
          const monthlyInterest = (debt.balance * debt.interestRate) / 100 / 12;
          totalInterest += monthlyInterest;
          debt.balance += monthlyInterest;

          const payment = Math.min(debt.minimumPayment, debt.balance);
          debt.balance -= payment;
          remainingPayment -= payment;
        }
      });

      // Apply extra payment to first debt
      const targetDebt = debtsCopy.find(d => d.balance > 0);
      if (targetDebt && remainingPayment > 0) {
        const extraPayment = Math.min(remainingPayment, targetDebt.balance);
        targetDebt.balance -= extraPayment;

        if (targetDebt.balance <= 0) {
          payoffOrder.push({
            creditor: targetDebt.creditorName,
            months: month,
          });
        }
      }
    }

    return { totalMonths: month, totalInterest, payoffOrder };
  }

  calculatePayoffDate(months: number) {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  }
}

export default new DebtPayoffService();
