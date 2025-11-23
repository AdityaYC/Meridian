import { GoogleGenerativeAI } from '@google/generative-ai';
import marketDataService from './marketData.service';
import insiderTradingService from './insiderTrading.service';

class PredictionService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async predictStockPrice(symbol: string, horizon = '1month') {
    try {
      // Gather comprehensive data
      const [quote, profile, news, insiderAnalysis] = await Promise.all([
        marketDataService.getStockQuote(symbol),
        marketDataService.getCompanyProfile(symbol),
        marketDataService.getStockNews(symbol, 10),
        insiderTradingService.analyzeInsiderActivity(symbol).catch(() => null),
      ]);

      // Calculate technical indicators
      const technicalIndicators = this.calculateTechnicalIndicators(quote);

      const prompt = `You are an expert quantitative analyst with deep knowledge of financial markets, technical analysis, and fundamental analysis.

ANALYZE AND PREDICT: ${symbol} - ${profile.companyName}

CURRENT DATA:
Price: $${quote.price}
52-Week Range: $${quote.yearLow} - $${quote.yearHigh}
Market Cap: $${(profile.mktCap / 1e9).toFixed(2)}B
P/E Ratio: ${quote.pe}
EPS: $${quote.eps}
Beta: ${profile.beta}
Avg Volume: ${quote.avgVolume}

TECHNICAL INDICATORS:
Price vs 52-week high: ${((quote.price / quote.yearHigh) * 100).toFixed(1)}%
Price vs 52-week low: ${((quote.price / quote.yearLow) * 100).toFixed(1)}%
Volume Trend: ${quote.volume > quote.avgVolume ? 'Above average' : 'Below average'}

INSIDER TRADING:
${insiderAnalysis ? `
Sentiment: ${insiderAnalysis.sentiment}
Net Volume: ${insiderAnalysis.netVolume} shares
Signal: ${insiderAnalysis.analysis.signal}
Analysis: ${insiderAnalysis.analysis.message}
` : 'No recent insider data available'}

RECENT NEWS SENTIMENT:
${news.slice(0, 5).map((n: any) => `- ${n.title}`).join('\n')}

SECTOR: ${profile.sector}
INDUSTRY: ${profile.industry}

TASK:
Predict the stock price for the ${horizon} timeframe using:
1. Technical analysis (price trends, volume, support/resistance)
2. Fundamental analysis (valuation, earnings, growth)
3. Insider trading signals
4. News sentiment analysis
5. Sector and market trends

Provide prediction in JSON format:
{
  "predictedPrice": predicted price in USD (number),
  "priceRange": {
    "low": conservative estimate (number),
    "high": optimistic estimate (number)
  },
  "confidence": 0-100 confidence score (number),
  "priceChange": percentage change from current (number),
  "direction": "up" | "down" | "sideways",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "risks": ["risk1", "risk2"],
  "catalysts": ["upcoming events that could impact price"],
  "technicalAnalysis": "brief technical summary",
  "fundamentalAnalysis": "brief fundamental summary",
  "recommendation": "strong_buy" | "buy" | "hold" | "sell" | "strong_sell",
  "targetEntry": suggested entry price (number),
  "stopLoss": suggested stop loss price (number),
  "takeProfit": suggested take profit price (number)
}`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      const prediction = JSON.parse(
        responseText.replace(/```json\n?|\n?```/g, '')
      );

      return {
        ...prediction,
        symbol,
        horizon,
        currentPrice: quote.price,
        analysisDate: new Date().toISOString(),
        technicalIndicators,
        insiderSignal: insiderAnalysis?.analysis.signal || 'neutral',
      };
    } catch (error) {
      console.error('Predict stock price error:', error);
      throw error;
    }
  }

  calculateTechnicalIndicators(quote: any) {
    return {
      priceVs52WeekHigh: ((quote.price / quote.yearHigh) * 100).toFixed(2),
      priceVs52WeekLow: ((quote.price / quote.yearLow) * 100).toFixed(2),
      volumeVsAverage: ((quote.volume / quote.avgVolume) * 100).toFixed(2),
      dayChange: quote.changesPercentage,
    };
  }

  async getCategoryRecommendations(category: string, riskTolerance: number, investmentAmount: number) {
    try {
      const riskLevel = riskTolerance < 0.35 ? 'low' : riskTolerance < 0.7 ? 'medium' : 'high';

      let prompt = '';

      if (category === 'stocks') {
        prompt = this.getStockRecommendationPrompt(riskLevel, investmentAmount);
      } else if (category === 'crypto') {
        prompt = this.getCryptoRecommendationPrompt(riskLevel, investmentAmount);
      } else if (category === 'mutual_funds') {
        prompt = this.getMutualFundRecommendationPrompt(riskLevel, investmentAmount);
      } else if (category === 'etfs') {
        prompt = this.getETFRecommendationPrompt(riskLevel, investmentAmount);
      } else if (category === 'bonds') {
        prompt = this.getBondRecommendationPrompt(riskLevel, investmentAmount);
      } else if (category === 'reits') {
        prompt = this.getREITRecommendationPrompt(riskLevel, investmentAmount);
      } else if (category === 'options') {
        prompt = this.getOptionsRecommendationPrompt(riskLevel, investmentAmount);
      }

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      const recommendations = JSON.parse(
        responseText.replace(/```json\n?|\n?```/g, '')
      );

      return recommendations;
    } catch (error) {
      console.error('Get category recommendations error:', error);
      throw error;
    }
  }

  getStockRecommendationPrompt(riskLevel: string, amount: number) {
    return `You are an expert stock analyst. Recommend the best stocks for:
- Risk Level: ${riskLevel}
- Investment Amount: $${amount}

Provide 5-8 specific stock recommendations across different sectors.

For each stock, include:
- Symbol and company name
- Current price
- Why it fits this risk profile
- Expected return (realistic range)
- Key catalysts
- Risks to consider

Format as JSON:
{
  "strategy": "overall strategy explanation",
  "recommendations": [
    {
      "symbol": "TICKER",
      "name": "Company Name",
      "currentPrice": price estimate (number),
      "suggestedShares": number of shares (number),
      "suggestedAmount": dollar amount (number),
      "sector": "sector name",
      "reasoning": "why this pick",
      "expectedReturn": "X-Y% over timeframe",
      "timeframe": "6 months|1 year|2+ years",
      "keyFactors": ["factor1", "factor2"],
      "risks": ["risk1", "risk2"],
      "dividendYield": "X.X%" or null,
      "targetPrice": estimated 12-month target (number),
      "riskLevel": "low|medium|high"
    }
  ]
}`;
  }

  getCryptoRecommendationPrompt(riskLevel: string, amount: number) {
    return `You are an expert crypto analyst. Recommend the best cryptocurrencies for:
- Risk Level: ${riskLevel}
- Investment Amount: $${amount}

Include mix of:
- Large cap (BTC, ETH) if appropriate for risk level
- Mid cap opportunities
- Promising projects with strong fundamentals

Format as JSON:
{
  "strategy": "crypto portfolio strategy",
  "recommendations": [
    {
      "symbol": "TICKER",
      "name": "Crypto Name",
      "currentPrice": price estimate (number),
      "suggestedAmount": dollar amount (number),
      "marketCap": "large|mid|small",
      "reasoning": "why this crypto",
      "expectedReturn": "X-Y% potential",
      "timeframe": "short|medium|long",
      "technology": "brief tech explanation",
      "useCase": "primary use case",
      "risks": ["risk1", "risk2"],
      "volatilityLevel": "low|medium|high|extreme",
      "riskLevel": "low|medium|high"
    }
  ]
}`;
  }

  getMutualFundRecommendationPrompt(riskLevel: string, amount: number) {
    return `Recommend best mutual funds for:
- Risk Level: ${riskLevel}
- Investment Amount: $${amount}

Include index funds, sector funds, and actively managed funds as appropriate.

Format as JSON with fund details including expense ratio, historical returns, and Morningstar rating. Add riskLevel field to recommendations.`;
  }

  getETFRecommendationPrompt(riskLevel: string, amount: number) {
    return `Recommend best ETFs for:
- Risk Level: ${riskLevel}
- Investment Amount: $${amount}

Include sector ETFs, index ETFs, and thematic ETFs.

Format as JSON with ETF details including expense ratio, AUM, and tracking error. Add riskLevel field to recommendations.`;
  }

  getBondRecommendationPrompt(riskLevel: string, amount: number) {
    return `Recommend best bonds for:
- Risk Level: ${riskLevel}
- Investment Amount: $${amount}

Include government bonds, corporate bonds, and municipal bonds.

Format as JSON with bond details including yield, maturity, and credit rating. Add riskLevel field to recommendations.`;
  }

  getREITRecommendationPrompt(riskLevel: string, amount: number) {
    return `Recommend best REITs for:
- Risk Level: ${riskLevel}
- Investment Amount: $${amount}

Include residential, commercial, industrial, and specialized REITs.

Format as JSON with REIT details including dividend yield, FFO, and property type. Add riskLevel field to recommendations.`;
  }

  getOptionsRecommendationPrompt(riskLevel: string, amount: number) {
      return `Recommend best Options strategies for:
- Risk Level: ${riskLevel}
- Investment Amount: $${amount}

Include hedging and speculative strategies.

Format as JSON with strategy details. Add riskLevel field to recommendations.`;
  }
}

export default new PredictionService();
