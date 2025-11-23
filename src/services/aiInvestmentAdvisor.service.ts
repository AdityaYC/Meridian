import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import marketDataService from './marketData.service';

class AIInvestmentAdvisor {
    private anthropic: any;
    private genAI: any;

    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY || '',
        });

        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }

    async analyzePortfolio(userId: string, holdings: any[], userProfile: any) {
        try {
            const totalValue = holdings.reduce((sum, h) => sum + (parseFloat(h.totalValue) || 0), 0);
            const portfolioBreakdown = this.calculatePortfolioBreakdown(holdings);

            const prompt = `You are an expert financial advisor analyzing a user's investment portfolio.

USER PROFILE:
- Age: ${userProfile.age || 'Unknown'}
- Risk Tolerance: ${userProfile.riskTolerance || 'Moderate'}
- Investment Goal: ${userProfile.investmentGoal || 'Long-term growth'}
- Time Horizon: ${userProfile.timeHorizon || '10+ years'}

CURRENT PORTFOLIO:
Total Value: $${totalValue.toFixed(2)}

Holdings:
${holdings.map(h => `- ${h.symbol}: ${h.quantity} shares at $${h.currentPrice}, Value: $${h.totalValue}, Gain/Loss: ${h.gainLossPercent}%`).join('\n')}

Sector Allocation:
${Object.entries(portfolioBreakdown.sectors).map(([sector, pct]: [string, any]) => `- ${sector}: ${pct.toFixed(1)}%`).join('\n')}

Asset Type Allocation:
${Object.entries(portfolioBreakdown.assetTypes).map(([type, pct]: [string, any]) => `- ${type}: ${pct.toFixed(1)}%`).join('\n')}

TASK:
1. Analyze the portfolio's diversification
2. Identify risks and opportunities
3. Provide 3-5 specific, actionable recommendations
4. Suggest specific stocks, ETFs, or mutual funds to buy/sell
5. Explain reasoning for each recommendation

Format your response as JSON (no markdown):
{
  "overallScore": 0-100,
  "diversificationScore": 0-100,
  "riskLevel": "low" | "medium" | "high",
  "summary": "brief portfolio assessment",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": [
    {
      "action": "buy" | "sell" | "hold",
      "symbol": "TICKER",
      "assetType": "stock" | "etf" | "mutual_fund",
      "reasoning": "why this recommendation",
      "targetAllocation": percentage,
      "riskLevel": "low" | "medium" | "high",
      "expectedReturn": "estimated return range",
      "timeframe": "short" | "medium" | "long"
    }
  ]
}`;

            const response = await this.anthropic.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2000,
                messages: [{ role: 'user', content: prompt }],
            });

            const analysis = JSON.parse(
                (response.content[0] as any).text.replace(/```json\n?|\n?```/g, '')
            );

            return analysis;
        } catch (error) {
            console.error('AI portfolio analysis error:', error);
            throw error;
        }
    }

    async getInvestmentSuggestions(userProfile: any, availableCapital: number) {
        try {
            // Get market data
            const [sectors, topStocks] = await Promise.all([
                marketDataService.getMarketSectors(),
                marketDataService.getTopGainersLosers(),
            ]);

            const prompt = `You are an expert investment advisor. Suggest investment opportunities for a user.

USER PROFILE:
- Available Capital: $${availableCapital}
- Risk Tolerance: ${userProfile.riskTolerance || 'Moderate'}
- Investment Goal: ${userProfile.investmentGoal || 'Growth'}
- Time Horizon: ${userProfile.timeHorizon || 'Long-term'}

MARKET CONTEXT:
Top Performing Sectors: ${(sectors as any[]).slice(0, 3).map(s => `${s.sector} (+${s.changesPercentage}%)`).join(', ')}

TASK:
Provide 5-8 specific investment recommendations across different categories:
1. Growth Stocks (high risk, high reward)
2. Value Stocks (undervalued, stable)
3. Index ETFs (diversified, low risk)
4. Dividend Stocks (income generation)

For each recommendation, provide specific details. Format as JSON (no markdown):
{
  "strategy": "overall investment strategy explanation",
  "allocationPlan": {
    "stocks": percentage,
    "etfs": percentage,
    "mutualFunds": percentage,
    "cash": percentage
  },
  "recommendations": [
    {
      "symbol": "TICKER",
      "name": "Company/Fund Name",
      "assetType": "stock|etf|mutual_fund",
      "category": "growth|value|dividend|index",
      "suggestedAmount": dollar amount,
      "shares": estimated shares to buy,
      "currentPrice": current price,
      "reasoning": "detailed explanation",
      "expectedReturn": "X-Y% annually",
      "riskLevel": "low|medium|high",
      "timeframe": "1-2 years|3-5 years|5+ years",
      "pros": ["pro1", "pro2"],
      "cons": ["con1", "con2"]
    }
  ]
}`;

            const response = await this.anthropic.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 3000,
                messages: [{ role: 'user', content: prompt }],
            });

            const suggestions = JSON.parse(
                (response.content[0] as any).text.replace(/```json\n?|\n?```/g, '')
            );

            return suggestions;
        } catch (error) {
            console.error('AI investment suggestions error:', error);
            throw error;
        }
    }

    async analyzeStock(symbol: string) {
        try {
            const [quote, profile, news] = await Promise.all([
                marketDataService.getStockQuote(symbol),
                marketDataService.getCompanyProfile(symbol),
                marketDataService.getStockNews(symbol, 5),
            ]);

            const prompt = `Analyze this stock and provide investment recommendation:

STOCK: ${symbol} - ${(profile as any).companyName}
Sector: ${(profile as any).sector}
Industry: ${(profile as any).industry}
Price: $${(quote as any).price}
52-Week Range: $${(quote as any).yearLow} - $${(quote as any).yearHigh}
Market Cap: $${((profile as any).mktCap / 1e9).toFixed(2)}B
P/E Ratio: ${(quote as any).pe}
EPS: ${(quote as any).eps}

Recent News:
${(news as any[]).map(n => `- ${n.title}`).join('\n')}

Provide analysis in JSON (no markdown):
{
  "recommendation": "strong_buy|buy|hold|sell|strong_sell",
  "targetPrice": estimated fair value,
  "confidenceLevel": 0-100,
  "timeHorizon": "short|medium|long",
  "riskLevel": "low|medium|high",
  "summary": "one paragraph analysis",
  "bullishFactors": ["factor1", "factor2"],
  "bearishFactors": ["factor1", "factor2"],
  "catalysts": ["upcoming events that could impact price"],
  "technicalAnalysis": "price trend assessment",
  "fundamentalAnalysis": "business health assessment"
}`;

            const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            const analysis = JSON.parse(
                responseText.replace(/```json\n?|\n?```/g, '')
            );

            return { ...analysis, stockData: { quote, profile } };
        } catch (error) {
            console.error('AI stock analysis error:', error);
            throw error;
        }
    }

    calculatePortfolioBreakdown(holdings: any[]) {
        const totalValue = holdings.reduce((sum, h) => sum + (parseFloat(h.totalValue) || 0), 0);

        const sectors: any = {};
        const assetTypes: any = {};

        holdings.forEach(holding => {
            const value = parseFloat(holding.totalValue) || 0;
            const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

            // By sector
            if (holding.sector) {
                sectors[holding.sector] = (sectors[holding.sector] || 0) + percentage;
            }

            // By asset type
            assetTypes[holding.type] = (assetTypes[holding.type] || 0) + percentage;
        });

        return { sectors, assetTypes };
    }
}

export default new AIInvestmentAdvisor();
