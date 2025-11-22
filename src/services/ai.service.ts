import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

export const categorizeTransaction = async (description: string, amount: number) => {
  try {
    const prompt = `Categorize this financial transaction:
Description: ${description}
Amount: $${Math.abs(amount).toFixed(2)}

Categories: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Personal, Insurance, Investments, Income, Transfer, Other

Return ONLY valid JSON (no markdown, no extra text):
{
  "category": "exact category from list",
  "subcategory": "specific type",
  "isRecurring": boolean,
  "isTaxDeductible": boolean,
  "confidence": 0.85
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = completion.choices[0].message.content || '{}';
    return JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
  } catch (error) {
    console.error('Categorization error:', error);
    return {
      category: 'Other',
      subcategory: 'Uncategorized',
      isRecurring: false,
      isTaxDeductible: false,
      confidence: 0.1
    };
  }
};

export const generateFinancialInsight = async (userId: string, question: string) => {
  try {
    const [transactions, accounts, budgets] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        take: 100,
        orderBy: { date: 'desc' },
      }),
      prisma.bankAccount.findMany({
        where: { userId },
      }),
      prisma.budget.findMany({
        where: { userId },
      }),
    ]);

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.available, 0);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlySpending = transactions
      .filter(t => t.date >= last30Days && t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const categoryBreakdown = transactions
      .filter(t => t.date >= last30Days && t.type === 'debit')
      .reduce((acc: any, t) => {
        const cat = t.category || 'Other';
        acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    const context = {
      totalBalance: totalBalance.toFixed(2),
      monthlySpending: monthlySpending.toFixed(2),
      accountCount: accounts.length,
      topCategories: Object.entries(categoryBreakdown)
        .sort(([,a]: any, [,b]: any) => b - a)
        .slice(0, 3)
        .map(([cat, amt]) => ({ category: cat, amount: amt })),
      budgets: budgets.map(b => ({
        category: b.category,
        limit: b.monthlyLimit,
        spent: b.currentSpent,
        remaining: b.monthlyLimit - b.currentSpent
      }))
    };

    const prompt = `You are a friendly, helpful financial advisor assistant named Finance Buddy.

User's Financial Summary:
${JSON.stringify(context, null, 2)}

User's Question: ${question}

Provide a brief (2-4 sentences), actionable, encouraging response. Be conversational and supportive. Use light emoji sparingly.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0].message.content || 'I can help you with your finances!';
  } catch (error) {
    console.error('Financial insight error:', error);
    return 'I can help you manage your finances better. What would you like to know?';
  }
};
