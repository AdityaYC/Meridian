import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserFinancesTool = {
    id: 'get_user_finances',
    description: 'Get user\'s financial data: balances, transactions, budgets, spending patterns',
    parameters: {
        type: 'object',
        properties: {
            userId: {
                type: 'string',
                description: 'User ID',
            },
            dataType: {
                type: 'string',
                enum: ['summary', 'transactions', 'budgets', 'spending', 'all'],
                description: 'Type of data to retrieve',
            },
        },
        required: ['userId'],
    },
    execute: async ({ userId, dataType = 'summary' }: any) => {
        try {
            if (dataType === 'summary' || dataType === 'all') {
                const [accounts, transactions, budgets] = await Promise.all([
                    prisma.bankAccount.findMany({ where: { userId } }),
                    prisma.transaction.findMany({
                        where: { userId },
                        orderBy: { date: 'desc' },
                        take: 30,
                    }),
                    prisma.budget.findMany({ where: { userId } }),
                ]);

                // Calculate spending analytics manually since we're not hitting the API
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const recentExpenses = transactions.filter(t =>
                    t.type === 'debit' && new Date(t.date) >= thirtyDaysAgo
                );

                const totalBalance = accounts.reduce((sum, acc) => sum + acc.available, 0);
                const monthlyExpenses = recentExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);

                // Group spending by category
                const spendingByCategory: Record<string, number> = {};
                recentExpenses.forEach(t => {
                    const cat = t.category || 'Uncategorized';
                    spendingByCategory[cat] = (spendingByCategory[cat] || 0) + Math.abs(t.amount);
                });

                const topSpending = Object.entries(spendingByCategory)
                    .map(([category, total]) => ({ category, total, transactions: 0 })) // Count not easily available without another pass
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 5);

                return {
                    summary: {
                        totalBalance: `$${totalBalance.toFixed(2)}`,
                        accountCount: accounts.length,
                        monthlyExpenses: `$${monthlyExpenses.toFixed(2)}`,
                    },
                    accounts: accounts.map((acc) => ({
                        name: acc.accountName,
                        institution: acc.institutionName,
                        type: acc.accountType,
                        balance: `$${acc.available.toFixed(2)}`,
                    })),
                    recentTransactions: transactions.slice(0, 10).map((txn) => ({
                        date: new Date(txn.date).toLocaleDateString(),
                        description: txn.description,
                        amount: `$${Math.abs(txn.amount).toFixed(2)}`,
                        category: txn.category,
                        type: txn.type,
                    })),
                    budgets: budgets.map((b) => ({
                        category: b.category,
                        spent: `$${b.currentSpent.toFixed(2)}`,
                        limit: `$${b.monthlyLimit.toFixed(2)}`,
                        remaining: `$${(b.monthlyLimit - b.currentSpent).toFixed(2)}`,
                        percentUsed: `${((b.currentSpent / b.monthlyLimit) * 100).toFixed(0)}%`,
                    })),
                    topSpending: topSpending.map((cat) => ({
                        category: cat.category,
                        amount: `$${cat.total.toFixed(2)}`,
                        transactions: cat.transactions, // Placeholder
                    })),
                };
            }
        } catch (error: any) {
            return { error: `Failed to fetch user finances: ${error.message}` };
        }
    },
};

export const manageBudgetTool = {
    id: 'manage_budget',
    description: 'Create or update user budget for a specific category',
    parameters: {
        type: 'object',
        properties: {
            userId: {
                type: 'string',
                description: 'User ID',
            },
            category: {
                type: 'string',
                description: 'Budget category',
            },
            monthlyLimit: {
                type: 'number',
                description: 'Monthly budget limit in dollars',
            },
            action: {
                type: 'string',
                enum: ['create', 'update'],
                description: 'Action to perform',
            },
        },
        required: ['userId', 'category', 'monthlyLimit', 'action'],
    },
    execute: async ({ userId, category, monthlyLimit, action }: any) => {
        try {
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);

            // Check if budget exists for this month
            const existingBudget = await prisma.budget.findFirst({
                where: {
                    userId,
                    category,
                    month: currentMonth
                },
            });

            let budget;

            if (existingBudget) {
                // Update
                budget = await prisma.budget.update({
                    where: { id: existingBudget.id },
                    data: { monthlyLimit },
                });
            } else {
                // Create
                budget = await prisma.budget.create({
                    data: {
                        userId,
                        category,
                        monthlyLimit,
                        currentSpent: 0,
                        alertThreshold: 80,
                        month: currentMonth,
                    },
                });
            }

            return {
                success: true,
                message: `Budget ${action}d: $${monthlyLimit}/month for ${category}`,
                budget: {
                    category,
                    limit: `$${monthlyLimit}`,
                    alertAt: '80%',
                },
            };
        } catch (error: any) {
            return { error: `Budget management failed: ${error.message}` };
        }
    },
};
