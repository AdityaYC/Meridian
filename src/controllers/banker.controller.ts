import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { synthesiaService } from '../services/synthesia.service';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateVideo = async (req: Request, res: Response) => {
    try {
        const { script } = req.body;

        if (!script) {
            return res.status(400).json({ message: 'Script is required' });
        }

        const result = await synthesiaService.generateVideo(script);
        res.json(result);
    } catch (error: any) {
        console.error('Video generation error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getVideoStatus = async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        const status = await synthesiaService.getVideoStatus(videoId);
        res.json(status);
    } catch (error: any) {
        console.error('Status check error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getBankerContext = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        // Fetch user's financial data
        const [user, accounts, transactions, budgets] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.bankAccount.findMany({ where: { userId } }),
            prisma.transaction.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                take: 100,
            }),
            prisma.budget.findMany({ where: { userId } }),
        ]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate financial metrics
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.available, 0);
        const checkingBalance = accounts
            .filter(a => a.accountType === 'checking')
            .reduce((sum, acc) => sum + acc.available, 0);
        const savingsBalance = accounts
            .filter(a => a.accountType === 'savings')
            .reduce((sum, acc) => sum + acc.available, 0);
        const creditCardBalance = accounts
            .filter(a => a.accountType === 'credit' || a.accountType === 'credit_card')
            .reduce((sum, acc) => sum + acc.current, 0);

        // Calculate monthly metrics
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentTransactions = transactions.filter(t => t.date >= thirtyDaysAgo);

        const monthlyIncome = recentTransactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const monthlyExpenses = recentTransactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // Top spending categories
        const categoryTotals = recentTransactions
            .filter(t => t.type === 'debit' && t.category)
            .reduce((acc: any, t) => {
                const cat = t.category || 'Other';
                acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
                return acc;
            }, {});

        const topCategories = Object.entries(categoryTotals)
            .map(([category, total]) => ({ category, total: total as number }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        // Build persona context
        const personaContext = buildPersonaContext({
            firstName: user.firstName,
            lastName: user.lastName,
            totalBalance,
            checkingBalance,
            savingsBalance,
            creditCardBalance,
            monthlyIncome,
            monthlyExpenses,
            topCategories,
            recentTransactions: recentTransactions.slice(0, 5),
            budgets,
        });

        res.json({
            personaContext,
            financialData: {
                totalBalance,
                checkingBalance,
                savingsBalance,
                creditCardBalance,
                monthlyIncome,
                monthlyExpenses,
                topCategories,
            },
        });
    } catch (error) {
        console.error('Get banker context error:', error);
        res.status(500).json({ error: 'Failed to fetch financial context' });
    }
};

export const getPersona = async (req: Request, res: Response) => {
    try {
        const apiKey = process.env.TAVUS_API_KEY;
        const personaId = process.env.TAVUS_PERSONA_ID || 'p171e7013ba0';

        console.log('Fetching Persona:', {
            hasApiKey: !!apiKey,
            personaId,
            envKeyLength: apiKey?.length
        });

        if (!apiKey) {
            throw new Error('Tavus API key not configured');
        }

        const response = await axios.get(
            `https://tavusapi.com/v2/personas/${personaId}`,
            {
                headers: {
                    'x-api-key': apiKey,
                },
            }
        );

        console.log('Tavus API Response Status:', response.status);
        console.log('Tavus API Response Data keys:', Object.keys(response.data));
        if (response.data) {
            console.log('Persona Image URLs found:', {
                thumbnail: response.data.thumbnail_url,
                avatar: response.data.avatar_url,
                profile: response.data.profile_image_url,
                layers: response.data.layers // sometimes image is in layers
            });
        }

        res.json(response.data);
    } catch (error: any) {
        console.error('Get persona error full details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });

        // Return minimal data or error so frontend can handle gracefully
        res.json({
            id: process.env.TAVUS_PERSONA_ID || 'p171e7013ba0',
            name: 'Raj',
            thumbnail_url: null // Fallback
        });
    }
};

export const processBankerQuery = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { query, conversationHistory } = req.body;

        // This is a simplified version - in production you'd want more sophisticated handling
        res.json({
            response: 'Query processed',
            action: null,
        });
    } catch (error) {
        console.error('Process banker query error:', error);
        res.status(500).json({ error: 'Failed to process query' });
    }
};

// Text chat with Michael
export const chatWithMichael = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { message } = req.body;

        // Fetch user's financial data
        const [user, bankAccounts, transactions, budgets, investments] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.bankAccount.findMany({ where: { userId } }),
            prisma.transaction.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                take: 100,
            }),
            prisma.budget.findMany({ where: { userId } }),
            prisma.investment.findMany({ where: { userId } }),
        ]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate financial metrics
        const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.available, 0);
        const checkingBalance = bankAccounts
            .filter(a => a.accountType === 'checking')
            .reduce((sum, acc) => sum + acc.available, 0);
        const savingsBalance = bankAccounts
            .filter(a => a.accountType === 'savings')
            .reduce((sum, acc) => sum + acc.available, 0);
        const creditCardBalance = bankAccounts
            .filter(a => a.accountType === 'credit' || a.accountType === 'credit_card')
            .reduce((sum, acc) => sum + acc.current, 0);

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentTransactions = transactions.filter(t => t.date >= thirtyDaysAgo);

        const monthlyIncome = recentTransactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const monthlyExpenses = recentTransactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // Top spending categories
        const categoryTotals = recentTransactions
            .filter(t => t.type === 'debit' && t.category)
            .reduce((acc: any, t) => {
                const cat = t.category || 'Other';
                acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
                return acc;
            }, {});

        const topCategories = Object.entries(categoryTotals)
            .map(([category, total]) => ({ category, total: total as number }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        const totalInvestments = investments.reduce((sum, inv) => sum + parseFloat(inv.totalValue.toString()), 0);

        // --- NEW: Financial Health Metrics ---

        // 1. Spending Trend (Month over Month)
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const previousMonthTransactions = transactions.filter(t => t.date >= sixtyDaysAgo && t.date < thirtyDaysAgo);
        const previousMonthExpenses = previousMonthTransactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const spendingTrend = previousMonthExpenses > 0
            ? ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
            : 0;

        // 2. Emergency Fund Coverage
        // Assuming monthly expenses is a good proxy for "necessary expenses"
        const emergencyFundMonths = monthlyExpenses > 0 ? (savingsBalance / monthlyExpenses).toFixed(1) : 'N/A';

        // 3. Debt-to-Asset Ratio
        const totalAssets = totalBalance + totalInvestments;
        const totalDebt = Math.abs(creditCardBalance); // Add loans here if available
        const debtToAssetRatio = totalAssets > 0 ? ((totalDebt / totalAssets) * 100).toFixed(1) : '0';

        // 4. Investment Sector Breakdown
        const sectorMap: Record<string, number> = {};
        investments.forEach(inv => {
            if (inv.sector) {
                sectorMap[inv.sector] = (sectorMap[inv.sector] || 0) + parseFloat(inv.totalValue.toString());
            }
        });
        const sectorBreakdown = Object.entries(sectorMap)
            .map(([sector, value]) => `- ${sector}: $${value.toFixed(2)} (${((value / totalInvestments) * 100).toFixed(1)}%)`)
            .join('\n');

        // 5. Budget Adherence Analysis
        let budgetAdherence = 'No budgets set';
        let overBudgetCategories: string[] = [];
        let avgAdherence = 0;

        if (budgets.length > 0) {
            const adherenceScores = budgets.map(b => {
                const spent = parseFloat(b.currentSpent.toString());
                const limit = parseFloat(b.monthlyLimit.toString());
                const adherence = (spent / limit) * 100;
                if (adherence > 100) {
                    overBudgetCategories.push(`${b.category} (${adherence.toFixed(0)}%)`);
                }
                return adherence;
            });
            avgAdherence = adherenceScores.reduce((sum, score) => sum + score, 0) / adherenceScores.length;
            budgetAdherence = `${avgAdherence.toFixed(0)}% average adherence${overBudgetCategories.length > 0 ? `, ${overBudgetCategories.length} categories over budget` : ', all on track!'}`;
        }

        // 6. Subscription Detection
        interface Subscription {
            merchant: string;
            amount: number;
            frequency: number; // days between transactions
        }

        const subscriptions: Subscription[] = [];
        const merchantTransactions: Record<string, any[]> = {};

        // Group transactions by merchant name
        transactions.forEach(t => {
            if (t.type === 'debit' && t.merchantName) {
                const merchant = t.merchantName.toLowerCase();
                if (!merchantTransactions[merchant]) {
                    merchantTransactions[merchant] = [];
                }
                merchantTransactions[merchant].push(t);
            }
        });

        // Detect recurring patterns
        Object.entries(merchantTransactions).forEach(([merchant, txns]) => {
            if (txns.length >= 2) {
                // Sort by date
                const sorted = txns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                // Calculate average interval and amount
                const intervals: number[] = [];
                const amounts: number[] = [];

                for (let i = 1; i < sorted.length; i++) {
                    const daysBetween = Math.abs(new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / (1000 * 60 * 60 * 24);
                    intervals.push(daysBetween);
                    amounts.push(Math.abs(sorted[i].amount));
                }

                const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
                const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
                const amountVariance = Math.max(...amounts) - Math.min(...amounts);

                // If interval is ~monthly (25-35 days) and amount is consistent (< 20% variance)
                if (avgInterval >= 25 && avgInterval <= 35 && amountVariance < avgAmount * 0.2) {
                    subscriptions.push({
                        merchant: txns[0].merchantName || merchant,
                        amount: avgAmount,
                        frequency: Math.round(avgInterval)
                    });
                }
            }
        });

        const totalSubscriptionCost = subscriptions.reduce((sum, s) => sum + s.amount, 0);
        const subscriptionList = subscriptions.length > 0
            ? subscriptions.map(s => `- ${s.merchant}: $${s.amount.toFixed(2)}/month`).join('\n')
            : '- No recurring subscriptions detected';

        // 7. Impulse Buy Detection
        interface ImpulseBuy {
            description: string;
            amount: number;
            category: string;
            date: Date;
            percentAboveAvg: number;
        }

        const impulseBuys: ImpulseBuy[] = [];

        // Calculate average spending per category
        const categoryAverages: Record<string, number> = {};
        const categoryCounts: Record<string, number> = {};

        recentTransactions.filter(t => t.type === 'debit').forEach(t => {
            const cat = t.category || 'Uncategorized';
            const amount = Math.abs(t.amount);
            categoryAverages[cat] = (categoryAverages[cat] || 0) + amount;
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        Object.keys(categoryAverages).forEach(cat => {
            categoryAverages[cat] = categoryAverages[cat] / categoryCounts[cat];
        });

        // Flag transactions > 2x category average
        recentTransactions.filter(t => t.type === 'debit').forEach(t => {
            const cat = t.category || 'Uncategorized';
            const amount = Math.abs(t.amount);
            const avg = categoryAverages[cat];

            if (amount > avg * 2 && amount > 50) { // Only flag if > $50
                impulseBuys.push({
                    description: t.description,
                    amount: amount,
                    category: cat,
                    date: t.date,
                    percentAboveAvg: ((amount - avg) / avg) * 100
                });
            }
        });

        const totalImpulseSpending = impulseBuys.reduce((sum, ib) => sum + ib.amount, 0);
        const impulseBuyList = impulseBuys.length > 0
            ? impulseBuys.slice(0, 5).map(ib => `- ${ib.description}: $${ib.amount.toFixed(2)} (${ib.percentAboveAvg.toFixed(0)}% above avg)`).join('\n')
            : '- No unusual spending detected';


        // Build Michael's personality context
        const systemPrompt = `You are Michael, a warm, helpful, and professional Certified Financial Planner (CFP®). You're speaking with ${user.firstName} ${user.lastName || ''}.

YOUR PERSONALITY:
- Friendly and approachable, like talking to a trusted advisor
- Use the user's first name occasionally to personalize
- Provide specific, actionable advice based on their real data
- Be encouraging when they're doing well, supportive when there are challenges
- Ask clarifying questions when needed
- Keep responses conversational but professional

${user.firstName}'S CURRENT FINANCIAL SITUATION:

Account Balances:
- Total Balance: $${totalBalance.toFixed(2)}
- Checking: $${checkingBalance.toFixed(2)}
- Savings: $${savingsBalance.toFixed(2)}
- Credit Card Balance: $${Math.abs(creditCardBalance).toFixed(2)}
- Investments: $${totalInvestments.toFixed(2)}

Monthly Cash Flow:
- Income: $${monthlyIncome.toFixed(2)}
- Expenses: $${monthlyExpenses.toFixed(2)}
- Net Savings: $${(monthlyIncome - monthlyExpenses).toFixed(2)}

Top Spending Categories (Last 30 Days):
${topCategories.length > 0 ? topCategories.map(cat => `- ${cat.category}: $${cat.total.toFixed(2)}`).join('\n') : '- No spending data yet'}

Recent Transactions:
${recentTransactions.slice(0, 5).map(t => `- ${t.description}: $${Math.abs(t.amount).toFixed(2)} (${t.category || 'Uncategorized'})`).join('\n')}

Active Budgets:
${budgets.length > 0 ? budgets.map(b => {
            const progress = (parseFloat(b.currentSpent.toString()) / parseFloat(b.monthlyLimit.toString())) * 100;
            return `- ${b.category}: $${b.currentSpent.toFixed(2)} / $${b.monthlyLimit.toFixed(2)} (${progress.toFixed(0)}% used)`;
        }).join('\n') : '- No budgets set'}

IMPORTANT: Always reference their specific numbers and patterns when giving advice.

FINANCIAL HEALTH METRICS (Use these to provide deeper analysis):
- Spending Trend (vs last month): ${spendingTrend > 0 ? '+' : ''}${spendingTrend.toFixed(1)}%
- Emergency Fund Coverage: ${emergencyFundMonths} months of expenses
- Debt-to-Asset Ratio: ${debtToAssetRatio}%
- Budget Adherence: ${budgetAdherence}${overBudgetCategories.length > 0 ? ` (Over: ${overBudgetCategories.join(', ')})` : ''}

RECURRING SUBSCRIPTIONS (Total: $${totalSubscriptionCost.toFixed(2)}/month):
${subscriptionList}

POTENTIAL IMPULSE BUYS (Total: $${totalImpulseSpending.toFixed(2)} this month):
${impulseBuyList}

INVESTMENT PORTFOLIO:
${sectorBreakdown || '- No investment data available'}

WHEN ASKED FOR A "FINANCIAL HEALTH CHECK":
1. Analyze ALL the metrics above comprehensively
2. Identify the top 3 most pressing issues or opportunities
3. Provide 3 SPECIFIC, ACTIONABLE tips that ${user.firstName} can implement TODAY
4. Reference exact numbers and show calculations
5. Be encouraging but honest about areas needing improvement
`;

        // Get Michael's response using Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Gemini API key not configured');
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash"
        });

        const fullPrompt = `${systemPrompt}\n\nUser Message: ${message}`;
        const result = await model.generateContent(fullPrompt);
        const response = result.response.text();

        res.json({ response });
    } catch (error) {
        console.error('Chat with Michael error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
};

export const createConversation = async (req: Request, res: Response) => {
    console.log('Starting createConversation...');
    try {
        const userId = (req as any).userId;
        const { personaContext } = req.body;
        const apiKey = process.env.TAVUS_API_KEY;
        const personaId = process.env.TAVUS_PERSONA_ID || 'p171e7013ba0';

        console.log(`Config check - API Key exists: ${!!apiKey}, Persona ID: ${personaId}`);

        if (!apiKey) {
            throw new Error('Tavus API key not configured');
        }

        console.log('Sending request to Tavus...');

        const response = await axios.post(
            'https://tavusapi.com/v2/conversations',
            {
                persona_id: personaId,
                properties: {
                    max_call_duration: 1800,
                    participant_left_timeout: 60,
                    enable_recording: false,
                },
                conversational_context: personaContext,
            },
            {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // Increased timeout
            }
        );

        res.json(response.data);
    } catch (error: any) {
        console.error('Create conversation error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });

        // Fallback to Mock Mode if Tavus is unreachable
        console.log('⚠️ Tavus API unreachable. Falling back to MOCK MODE.');
        res.json({
            conversation_id: 'mock-conversation-' + Date.now(),
            conversation_url: 'https://demo.daily.co/hello', // Public demo room
            status: 'active',
            is_mock: true
        });
    }
};

export const endConversation = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.body;
        const apiKey = process.env.TAVUS_API_KEY;

        if (!apiKey) {
            throw new Error('Tavus API key not configured');
        }

        await axios.delete(`https://tavusapi.com/v2/conversations/${conversationId}`, {
            headers: {
                'x-api-key': apiKey,
            },
        });

        res.json({ success: true });
    } catch (error: any) {
        console.error('End conversation error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to end conversation' });
    }
};

function buildPersonaContext(data: any): string {
    const {
        firstName,
        lastName,
        totalBalance,
        checkingBalance,
        savingsBalance,
        creditCardBalance,
        monthlyIncome,
        monthlyExpenses,
        topCategories,
        recentTransactions,
        budgets,
    } = data;

    const netSavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? ((netSavings / monthlyIncome) * 100).toFixed(1) : '0';

    return `You are currently assisting ${firstName}${lastName ? ' ' + lastName : ''}.

CURRENT FINANCIAL SNAPSHOT:

Account Balances:
- Total Balance: $${totalBalance.toFixed(2)}
- Checking Account: $${checkingBalance.toFixed(2)}
- Savings Account: $${savingsBalance.toFixed(2)}
- Credit Card Balance: $${Math.abs(creditCardBalance).toFixed(2)}

Monthly Cash Flow:
- Monthly Income: $${monthlyIncome.toFixed(2)}
- Monthly Expenses: $${monthlyExpenses.toFixed(2)}
- Net Savings: $${netSavings.toFixed(2)}
- Savings Rate: ${savingsRate}%

Top Spending Categories (Last 30 Days):
${topCategories.length > 0
            ? topCategories.map((cat: any) => `- ${cat.category}: $${cat.total.toFixed(2)}`).join('\n')
            : '- No spending data available yet'
        }

Recent Transactions:
${recentTransactions.length > 0
            ? recentTransactions
                .map((txn: any) => `- ${txn.description}: $${Math.abs(txn.amount).toFixed(2)} (${txn.category || 'Uncategorized'})`)
                .join('\n')
            : '- No recent transactions'
        }

Active Budgets:
${budgets.length > 0
            ? budgets
                .map((b: any) => {
                    const progress = (b.currentSpent / b.monthlyLimit) * 100;
                    return `- ${b.category}: $${b.currentSpent.toFixed(2)} / $${b.monthlyLimit.toFixed(2)} (${progress.toFixed(0)}% used)`;
                })
                .join('\n')
            : '- No budgets set up yet'
        }

IMPORTANT: Use ${firstName}'s actual data when providing advice. Reference specific numbers and patterns.`;
}
