import axios from 'axios';
import prisma from '../config/database';

class InsiderTradingService {
  private fmpApiKey: string;
  private baseUrl: string;

  constructor() {
    this.fmpApiKey = process.env.FMP_API_KEY || '';
    this.baseUrl = 'https://financialmodelingprep.com/api/v4';
  }

  async getInsiderTrading(symbol: string, limit = 100) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/insider-trading?symbol=${symbol}&limit=${limit}&apikey=${this.fmpApiKey}` 
      );
      return response.data;
    } catch (error) {
      console.error('FMP getInsiderTrading error:', error);
      throw error;
    }
  }

  async getInsiderTradingRSS() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/insider-trading-rss-feed?limit=100&apikey=${this.fmpApiKey}` 
      );
      return response.data;
    } catch (error) {
      console.error('FMP getInsiderTradingRSS error:', error);
      throw error;
    }
  }

  async analyzeInsiderActivity(symbol: string) {
    try {
      const trades = await this.getInsiderTrading(symbol, 50);
      
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recentTrades = trades.filter((t: any) => new Date(t.filingDate) >= last30Days);
      
      const buyVolume = recentTrades
        .filter((t: any) => t.transactionType === 'P-Purchase')
        .reduce((sum: number, t: any) => sum + (t.securitiesTransacted || 0), 0);
      
      const sellVolume = recentTrades
        .filter((t: any) => t.transactionType === 'S-Sale')
        .reduce((sum: number, t: any) => sum + (t.securitiesTransacted || 0), 0);

      const netVolume = buyVolume - sellVolume;
      const sentiment = netVolume > 0 ? 'bullish' : netVolume < 0 ? 'bearish' : 'neutral';
      
      // Significant trades (> $1M)
      const significantTrades = recentTrades.filter((t: any) => 
        Math.abs(t.securitiesTransacted * t.price) > 1000000
      );

      return {
        symbol,
        recentTrades: recentTrades.slice(0, 10),
        buyVolume,
        sellVolume,
        netVolume,
        sentiment,
        significantTrades,
        analysis: this.generateInsiderAnalysis(buyVolume, sellVolume, significantTrades),
      };
    } catch (error) {
      console.error('Analyze insider activity error:', error);
      throw error;
    }
  }

  generateInsiderAnalysis(buyVolume: number, sellVolume: number, significantTrades: any[]) {
    const netVolume = buyVolume - sellVolume;
    
    if (netVolume > 100000) {
      return {
        signal: 'strong_buy',
        confidence: 0.8,
        message: 'Heavy insider buying detected. Insiders are accumulating shares, which often signals confidence in future performance.',
      };
    } else if (netVolume > 10000) {
      return {
        signal: 'buy',
        confidence: 0.6,
        message: 'Moderate insider buying activity. Insiders show confidence in the company.',
      };
    } else if (netVolume < -100000) {
      return {
        signal: 'strong_sell',
        confidence: 0.8,
        message: 'Heavy insider selling detected. Insiders may be concerned about near-term performance.',
      };
    } else if (netVolume < -10000) {
      return {
        signal: 'sell',
        confidence: 0.6,
        message: 'Moderate insider selling activity. Exercise caution.',
      };
    } else {
      return {
        signal: 'neutral',
        confidence: 0.5,
        message: 'Balanced insider activity. No strong signals.',
      };
    }
  }

  async syncInsiderTrading(symbol: string) {
    try {
      const trades = await this.getInsiderTrading(symbol, 100);

      for (const trade of trades) {
        // @ts-ignore
        await prisma.insiderTrading.create({
          data: {
            symbol: trade.symbol,
            filingDate: new Date(trade.filingDate),
            transactionDate: new Date(trade.transactionDate),
            insiderName: trade.reportingName,
            insiderTitle: trade.typeOfOwner,
            transactionType: trade.transactionType,
            shares: trade.securitiesTransacted,
            price: trade.price,
            value: trade.securitiesTransacted * trade.price,
            sharesOwnedAfter: trade.securitiesOwned,
            isSignificant: Math.abs(trade.securitiesTransacted * trade.price) > 1000000,
          }
        });
      }

      return trades.length;
    } catch (error) {
      console.error('Sync insider trading error:', error);
      throw error;
    }
  }
}

export default new InsiderTradingService();
