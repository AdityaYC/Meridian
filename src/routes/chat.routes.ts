import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Financial assistant chat endpoint
router.post('/financial-assistant', authMiddleware, async (req: Request, res: Response) => {
    try {
        console.log('Chat request received');
        const userId = (req as any).userId;
        const { message, history } = req.body;

        // Debug API key (safe log)
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('API Key status:', apiKey ? `Present (starts with ${apiKey.substring(0, 4)}...)` : 'Missing');
        console.log('Model:', "gemini-2.0-flash");

        // Fetch user's financial data with error handling
        console.log('Fetching user context...');
        let bankAccounts: any[] = [];
        let transactions: any[] = [];
        let budgets: any[] = [];
        let investments: any[] = [];
        
        try {
            [bankAccounts, transactions, budgets, investments] = await Promise.all([
                prisma.bankAccount?.findMany({ where: { userId }, take: 50 }).catch(() => []),
                prisma.transaction?.findMany({
                    where: { userId },
                    orderBy: { date: 'desc' },
                    take: 100,
                }).catch(() => []),
                prisma.budget?.findMany({ where: { userId } }).catch(() => []),
                prisma.investment?.findMany({ where: { userId } }).catch(() => []),
            ]);
        } catch (error) {
            console.log('Error fetching user data, using empty arrays:', error);
            // Use empty arrays if tables don't exist
        }

        // Calculate financial summary
        const totalBalance = bankAccounts.reduce((sum: number, acc: any) => sum + (acc.current || 0), 0);
        const totalInvestments = investments.reduce((sum: number, inv: any) => sum + (inv.totalValue || 0), 0);

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        const recentTransactions = transactions.filter((t: any) => new Date(t.date) >= last30Days);
        const monthlySpending = recentTransactions
            .filter((t: any) => t.amount < 0)
            .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
        const monthlyIncome = recentTransactions
            .filter((t: any) => t.amount > 0)
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        // Group transactions by category
        const spendingByCategory: Record<string, number> = {};
        recentTransactions.forEach((t: any) => {
            if (t.amount < 0) {
                const category = t.category || 'Uncategorized';
                spendingByCategory[category] = (spendingByCategory[category] || 0) + Math.abs(t.amount);
            }
        });

        // Create context for AI
        const context = `You are a helpful financial assistant. The user is asking about their finances.

FINANCIAL DATA:
- Total Account Balance: $${totalBalance.toFixed(2)}
- Total Investments: $${totalInvestments.toFixed(2)}
- Accounts: ${bankAccounts.length} accounts (${bankAccounts.map((a: any) => `${a.accountName}: $${a.current}`).join(', ')})
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
        // Filter out empty history and ensure proper role mapping
        const validHistory = (history || [])
            .filter((h: any) => h.role && h.content)
            .map((h: any) => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.content }],
            }));

        // Ensure the first message is from the user (Gemini requirement)
        if (validHistory.length > 0 && validHistory[0].role === 'model') {
            validHistory.shift();
        }

        console.log('Starting chat with history length:', validHistory.length);
        
        const chat = model.startChat({
            history: validHistory,
        });

        console.log('Sending message to Gemini...');
        const result = await chat.sendMessage(context);
        console.log('Got response from Gemini');
        const aiResponse = result.response.text();
        console.log('Response text extracted, length:', aiResponse.length);

        res.json({ response: aiResponse });
    } catch (error: any) {
        console.error('=== CHAT ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        console.error('Error stack:', error.stack);
        if (error.response) {
            console.error('Error response:', error.response);
        }
        if (error.errorDetails) {
            console.error('Error details:', JSON.stringify(error.errorDetails, null, 2));
        }
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        
        res.status(500).json({ 
            error: 'Failed to get response from AI',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
