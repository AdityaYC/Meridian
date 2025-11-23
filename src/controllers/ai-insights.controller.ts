import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../config/database';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateSavingsReport = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get user's financial data
        const [transactions, budgets, accounts] = await Promise.all([
            prisma.transaction.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                take: 100,
            }),
            prisma.budget.findMany({
                where: { userId },
            }),
            prisma.bankAccount.findMany({
                where: { userId },
            }),
        ]);

        // Calculate total balance
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.available, 0);

        // Calculate spending by category
        const spendingByCategory: Record<string, number> = {};
        transactions.forEach((tx) => {
            if (tx.type === 'debit' && tx.category) {
                spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + Math.abs(tx.amount);
            }
        });

        // Calculate total income and expenses
        const totalIncome = transactions
            .filter((tx) => tx.type === 'credit')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const totalExpenses = transactions
            .filter((tx) => tx.type === 'debit')
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        // Build context for Claude
        const financialContext = `
You are a financial advisor analyzing a student's spending habits. Here is their financial data:

ACCOUNT BALANCES:
- Total Available Balance: $${totalBalance.toFixed(2)}
${accounts.map(acc => `- ${acc.accountName}: $${acc.available.toFixed(2)}`).join('\n')}

INCOME & EXPENSES (Last 100 transactions):
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Net (Income - Expenses): $${(totalIncome - totalExpenses).toFixed(2)}

SPENDING BY CATEGORY:
${Object.entries(spendingByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)}`)
                .join('\n')}

BUDGETS:
${budgets.map(b => `- ${b.category}: $${b.currentSpent.toFixed(2)} / $${b.monthlyLimit.toFixed(2)} (${((b.currentSpent / b.monthlyLimit) * 100).toFixed(1)}% used)`).join('\n')}

TOP MERCHANTS:
${Object.entries(
                    transactions.reduce((acc, tx) => {
                        if (tx.merchantName) {
                            acc[tx.merchantName] = (acc[tx.merchantName] || 0) + Math.abs(tx.amount);
                        }
                        return acc;
                    }, {} as Record<string, number>)
                )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([merchant, amount]) => `- ${merchant}: $${amount.toFixed(2)}`)
                .join('\n')}

Generate a personalized savings report for this student that:
1. Identifies specific areas where they can save money
2. Provides actionable, student-specific tips (e.g., meal prep instead of dining out, free campus resources)
3. Highlights their biggest spending categories and suggests realistic reductions
4. Notes any positive spending habits
5. Recommends a monthly savings goal based on their income and expenses

Keep it friendly, encouraging, and practical for a college student. Format the response in markdown with clear sections and bullet points.
`;

        // Call Claude API
        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            messages: [
                {
                    role: 'user',
                    content: financialContext,
                },
            ],
        });

        const report = message.content[0].type === 'text' ? message.content[0].text : '';

        res.json({
            report,
            metadata: {
                totalBalance,
                totalIncome,
                totalExpenses,
                netSavings: totalIncome - totalExpenses,
                topSpendingCategory: Object.entries(spendingByCategory).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None',
            },
        });
    } catch (error: any) {
        console.error('Error generating savings report:', error);
        res.status(500).json({ error: 'Failed to generate savings report' });
    }
};
