import prisma from '../config/database';

class TaxService {
  async identifyDeductions(userId: string, taxYear: number = new Date().getFullYear()) {
    try {
      // Get all transactions for the tax year
      const startOfYear = new Date(taxYear, 0, 1);
      const endOfYear = new Date(taxYear, 11, 31, 23, 59, 59);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        orderBy: { date: 'desc' },
      });

      // Categorize potential deductions
      const deductions: Record<string, any[]> = {
        businessExpenses: [],
        charitableDonations: [],
        medicalExpenses: [],
        educationExpenses: [],
        homeOffice: [],
        other: [],
      };

      for (const txn of transactions) {
        const deduction = this.categorizeDeduction(txn);
        if (deduction) {
          const category = deduction.category;
          if (deductions[category]) {
            deductions[category].push({
              transactionId: txn.id,
              description: txn.description,
              amount: Math.abs(txn.amount),
              date: txn.date,
              confidence: deduction.confidence,
            });

            // Save to tax_deductions table
            await prisma.taxDeduction.create({
              data: {
                userId,
                transactionId: txn.id,
                taxYear,
                category,
                amount: Math.abs(txn.amount),
                description: txn.description,
                date: txn.date,
              },
            });
          }
        }
      }

      // Calculate totals
      const summary: any = {
        totalDeductions: 0,
        byCategory: {},
      };

      for (const [category, items] of Object.entries(deductions)) {
        const total = items.reduce((sum, item) => sum + item.amount, 0);
        summary.byCategory[category] = {
          count: items.length,
          total: total.toFixed(2),
          items: items.slice(0, 10), // Top 10
        };
        summary.totalDeductions += total;
      }

      summary.totalDeductions = summary.totalDeductions.toFixed(2);

      return summary;
    } catch (error) {
      console.error('Identify deductions error:', error);
      throw error;
    }
  }

  private categorizeDeduction(transaction: any) {
    const desc = transaction.description.toLowerCase();
    const category = transaction.category?.toLowerCase() || '';

    // Business expenses
    if (
      desc.includes('office') ||
      desc.includes('supplies') ||
      desc.includes('software') ||
      desc.includes('subscription') ||
      category.includes('business')
    ) {
      return { category: 'businessExpenses', confidence: 0.8 };
    }

    // Charitable donations
    if (
      desc.includes('donation') ||
      desc.includes('charity') ||
      desc.includes('goodwill') ||
      desc.includes('salvation army')
    ) {
      return { category: 'charitableDonations', confidence: 0.9 };
    }

    // Medical expenses
    if (
      desc.includes('pharmacy') ||
      desc.includes('hospital') ||
      desc.includes('doctor') ||
      desc.includes('medical') ||
      category.includes('healthcare')
    ) {
      return { category: 'medicalExpenses', confidence: 0.7 };
    }

    // Education expenses
    if (
      desc.includes('tuition') ||
      desc.includes('books') ||
      desc.includes('university') ||
      desc.includes('college') ||
      category.includes('education')
    ) {
      return { category: 'educationExpenses', confidence: 0.85 };
    }

    return null;
  }

  async estimateQuarterlyTax(userId: string) {
    try {
      // Get income for current quarter
      const now = new Date();
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

      const incomeAggregate = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'credit',
          // category: 'Income', // Might filter if category is reliable
          date: {
            gte: quarterStart,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const totalIncome = incomeAggregate._sum.amount || 0;

      // Simplified tax estimation (US federal self-employment approx)
      const selfEmploymentTax = totalIncome * 0.153; // 15.3%
      const incomeTax = totalIncome * 0.22; // Assume 22% bracket

      const estimatedTax = selfEmploymentTax + incomeTax;

      return {
        quarterStart: quarterStart.toISOString().split('T')[0],
        totalIncome: totalIncome.toFixed(2),
        selfEmploymentTax: selfEmploymentTax.toFixed(2),
        incomeTax: incomeTax.toFixed(2),
        totalEstimated: estimatedTax.toFixed(2),
        dueDate: this.getNextQuarterlyDueDate(),
      };
    } catch (error) {
      console.error('Estimate quarterly tax error:', error);
      throw error;
    }
  }

  private getNextQuarterlyDueDate() {
    const now = new Date();
    const year = now.getFullYear();
    const dueDates = [
      new Date(year, 3, 15), // April 15
      new Date(year, 5, 15), // June 15
      new Date(year, 8, 15), // September 15
      new Date(year + 1, 0, 15), // January 15 next year
    ];

    return dueDates.find(date => date > now)?.toISOString().split('T')[0] || dueDates[0].toISOString().split('T')[0];
  }

  async generateTaxReport(userId: string, taxYear: number) {
    try {
      const startOfYear = new Date(taxYear, 0, 1);
      const endOfYear = new Date(taxYear, 11, 31, 23, 59, 59);

      const [deductions, incomeAgg, expensesAgg] = await Promise.all([
        this.identifyDeductions(userId, taxYear),
        prisma.transaction.aggregate({
          where: { userId, type: 'credit', date: { gte: startOfYear, lte: endOfYear } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: 'debit', date: { gte: startOfYear, lte: endOfYear } },
          _sum: { amount: true },
        }),
      ]);

      const totalIncome = incomeAgg._sum.amount || 0;
      const totalExpenses = Math.abs(expensesAgg._sum.amount || 0);

      return {
        taxYear,
        totalIncome: totalIncome.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        deductions,
        estimatedTaxSavings: (parseFloat(deductions.totalDeductions) * 0.22).toFixed(2), // 22% bracket
      };
    } catch (error) {
      console.error('Generate tax report error:', error);
      throw error;
    }
  }
}

export default new TaxService();
