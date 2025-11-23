import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const prisma = new PrismaClient();

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Financial assistant chat endpoint
router.post('/financial-assistant', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { message, history } = req.body;

        // Fetch user's financial data
        const [bankAccounts, transactions, budgets, investments] = await Promise.all([
            prisma.bankAccount.findMany({ where: { userId }, take: 50 }),
            prisma.transaction.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                take: 100,
            }),
            prisma.budget.findMany({ where: { userId } }),
            prisma.investment.findMany({ where: { userId } }),
        ]);

        // Calculate financial summary
        const totalBalance = bankAccounts.reduce((sum: number, acc: any) => sum + parseFloat(acc.balance || '0'), 0);
        const totalInvestments = investments.reduce((sum: number, inv: any) => sum + parseFloat(inv.totalValue || '0'), 0);

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        const recentTransactions = transactions.filter((t: any) => new Date(t.date) >= last30Days);
        const monthlySpending = recentTransactions
            .filter((t: any) => parseFloat(t.amount) < 0)
            .reduce((sum: number, t: any) => sum + Math.abs(parseFloat(t.amount)), 0);
        const monthlyIncome = recentTransactions
            .filter((t: any) => parseFloat(t.amount) > 0)
            .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

        // Group transactions by category
        const spendingByCategory: Record<string, number> = {};
        recentTransactions.forEach((t: any) => {
            if (parseFloat(t.amount) < 0) {
                const category = t.category || 'Uncategorized';
                spendingByCategory[category] = (spendingByCategory[category] || 0) + Math.abs(parseFloat(t.amount));
            }
        });

        // Create context for AI
        const context = `You are a helpful financial assistant. The user is asking about their finances.

FINANCIAL DATA:
- Total Account Balance: $${totalBalance.toFixed(2)}
- Total Investments: $${totalInvestments.toFixed(2)}
- Accounts: ${bankAccounts.length} accounts (${bankAccounts.map((a: any) => `${a.name}: $${a.balance}`).join(', ')})
- Monthly Income (last 30 days): $${monthlyIncome.toFixed(2)}
- Monthly Spending (last 30 days): $${monthlySpending.toFixed(2)}
- Net Savings: $${(monthlyIncome - monthlySpending).toFixed(2)}
- Budgets: ${budgets.length} active budgets

SPENDING BY CATEGORY (last 30 days):
${Object.entries(spendingByCategory)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([cat, amount]) => `- ${cat}: $${(amount as number).toFixed(2)}`)
                .join('\n')}

RECENT TRANSACTIONS:
${recentTransactions.slice(0, 10).map((t: any) =>
                    `- ${new Date(t.date).toLocaleDateString()}: ${t.description} - $${t.amount} (${t.category || 'Uncategorized'})`
                ).join('\n')}

Answer the user's question based on this data. Be helpful, concise, and actionable. Use specific numbers from their data. If they ask for suggestions, provide practical financial advice.

User question: ${message}`;

        // Build conversation history
        const messages = [
            ...(history || []).map((h: any) => ({
                role: h.role,
                content: h.content,
            })),
            {
                role: 'user',
                content: context,
            },
        ];

        // Get AI response
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: messages as any,
        });

        const aiResponse = response.content[0].type === 'text'
            ? response.content[0].text
            : 'I apologize, I could not generate a response.';

        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

export default router;
