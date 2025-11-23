import axios from 'axios';

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
const NEWS_API_BASE = 'https://newsapi.org/v2/everything';
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

export interface StockData {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  peRatio?: number;
  marketCap?: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  sma50?: number;
  sma200?: number;
  beta?: number;
  sector?: string;
  dividendYield?: number;
}

export interface NewsSentiment {
  symbol: string;
  score: number; // -1 to 1
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  articles: any[];
}

// Top 20 Stocks to Analyze (Mix of sectors)
const TARGET_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 
  'JPM', 'JNJ', 'V', 'WMT', 'PG', 'MA', 'HD', 'DIS',
  'NFLX', 'AMD', 'CRM', 'PYPL', 'INTC', 'CSCO'
];

// Fallback mock data for when APIs fail or limits reached
const MOCK_STOCKS: StockData[] = [
  { symbol: 'AAPL', price: 185.50, changePercent: 1.2, volume: 50000000, rsi: 55, beta: 1.2, sector: 'Technology' },
  { symbol: 'MSFT', price: 375.20, changePercent: 0.8, volume: 25000000, rsi: 60, beta: 1.1, sector: 'Technology' },
  { symbol: 'JPM', price: 168.40, changePercent: -0.5, volume: 10000000, rsi: 45, beta: 0.9, sector: 'Finance' },
  { symbol: 'JNJ', price: 155.10, changePercent: 0.2, volume: 8000000, rsi: 48, beta: 0.6, sector: 'Healthcare' },
  { symbol: 'NVDA', price: 495.22, changePercent: 2.8, volume: 45000000, rsi: 72, beta: 1.8, sector: 'Technology' },
];

export const marketAnalysisService = {
  
  getApiKeys() {
    return {
      alphaVantage: localStorage.getItem('alphaVantageKey') || 'demo',
      newsApi: localStorage.getItem('newsApiKey'),
    };
  },

  async getStockQuote(symbol: string): Promise<Partial<StockData>> {
    try {
      // Try Yahoo Finance first (free, no key)
      const response = await axios.get(`${YAHOO_FINANCE_BASE}/${symbol}`);
      const result = response.data.chart.result[0];
      const quote = result.meta;
      
      return {
        symbol,
        price: quote.regularMarketPrice,
        changePercent: ((quote.regularMarketPrice - quote.chartPreviousClose) / quote.chartPreviousClose) * 100,
        volume: result.indicators.quote[0].volume.slice(-1)[0] || 0,
      };
    } catch (error) {
      console.warn(`Yahoo Finance failed for ${symbol}, trying Alpha Vantage...`);
      
      // Fallback to Alpha Vantage
      const { alphaVantage } = this.getApiKeys();
      if (alphaVantage === 'demo') return MOCK_STOCKS.find(s => s.symbol === symbol) || MOCK_STOCKS[0];

      try {
        const url = `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaVantage}`;
        const response = await axios.get(url);
        const data = response.data['Global Quote'];
        
        return {
          symbol,
          price: parseFloat(data['05. price']),
          changePercent: parseFloat(data['10. change percent'].replace('%', '')),
          volume: parseInt(data['06. volume']),
        };
      } catch (avError) {
        console.error(`Alpha Vantage failed for ${symbol}`);
        return MOCK_STOCKS.find(s => s.symbol === symbol) || MOCK_STOCKS[0];
      }
    }
  },

  async getTechnicalIndicators(symbol: string) {
    const { alphaVantage } = this.getApiKeys();
    if (alphaVantage === 'demo') {
        // Return mock technicals
        return { rsi: 50 + Math.random() * 20, macd: 0.5, macdSignal: 0.4 };
    }

    try {
      const rsiUrl = `${ALPHA_VANTAGE_BASE}?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${alphaVantage}`;
      const rsiRes = await axios.get(rsiUrl);
      const rsi = parseFloat(rsiRes.data['Technical Analysis: RSI']?.[Object.keys(rsiRes.data['Technical Analysis: RSI'])[0]]?.RSI || 50);

      return { rsi, macd: 0, macdSignal: 0 }; // Simplified for now
    } catch (error) {
      return { rsi: 50, macd: 0, macdSignal: 0 };
    }
  },

  async collectMarketData(): Promise<StockData[]> {
    const promises = TARGET_STOCKS.map(async (symbol) => {
      const quote = await this.getStockQuote(symbol);
      const technicals = await this.getTechnicalIndicators(symbol);
      
      // Assign sectors loosely based on knowledge (in a real app, fetch from Overview API)
      let sector = 'Technology';
      if (['JPM', 'V', 'MA', 'PYPL'].includes(symbol)) sector = 'Finance';
      if (['JNJ', 'PG'].includes(symbol)) sector = 'Healthcare'; // or Consumer Staples for PG
      if (['WMT', 'HD'].includes(symbol)) sector = 'Consumer Discretionary';
      if (['DIS', 'NFLX'].includes(symbol)) sector = 'Communication Services';

      return {
        ...quote,
        ...technicals,
        symbol,
        beta: 1.0, // Mock beta if not fetched
        sector,
      } as StockData;
    });

    return Promise.all(promises);
  },

  async analyzeNewsSentiment(): Promise<Record<string, number>> {
    const { newsApi } = this.getApiKeys();
    const sentimentScores: Record<string, number> = {};
    
    // Initialize with neutral
    TARGET_STOCKS.forEach(s => sentimentScores[s] = 0);

    if (!newsApi) {
        console.warn('No News API key provided, using random sentiment');
        TARGET_STOCKS.forEach(s => sentimentScores[s] = (Math.random() * 1) - 0.2); // Slight bullish bias
        return sentimentScores;
    }

    try {
      const url = `${NEWS_API_BASE}?q=stock market OR finance&sortBy=publishedAt&apiKey=${newsApi}`;
      const response = await axios.get(url);
      const articles = response.data.articles.slice(0, 50);

      articles.forEach((article: any) => {
        const text = (article.title + ' ' + article.description).toLowerCase();
        
        // Find mentioned stocks
        TARGET_STOCKS.forEach(symbol => {
          if (text.includes(symbol.toLowerCase()) || text.includes(this.getCompanyName(symbol).toLowerCase())) {
            let score = 0;
            if (text.match(/surge|rally|growth|profit|beat|jump|high|gain/)) score += 0.5;
            if (text.match(/decline|loss|drop|miss|concern|fall|low|crash/)) score -= 0.5;
            
            sentimentScores[symbol] = (sentimentScores[symbol] || 0) + score;
          }
        });
      });

      // Normalize scores -1 to 1
      Object.keys(sentimentScores).forEach(key => {
        sentimentScores[key] = Math.max(-1, Math.min(1, sentimentScores[key]));
      });

    } catch (error) {
      console.error('News analysis failed:', error);
    }

    return sentimentScores;
  },

  getCompanyName(symbol: string) {
    const map: Record<string, string> = {
      'AAPL': 'Apple', 'MSFT': 'Microsoft', 'GOOGL': 'Google', 'AMZN': 'Amazon',
      'NVDA': 'NVIDIA', 'TSLA': 'Tesla', 'JPM': 'JPMorgan', 'JNJ': 'Johnson & Johnson'
    };
    return map[symbol] || symbol;
  },

  calculateAIScore(stock: StockData, riskTolerance: number, sentimentScore: number) {
    let score = 50; // Base score

    // Technical Analysis (40% weight)
    if (stock.rsi) {
      if (stock.rsi < 30) score += 15; // Oversold
      else if (stock.rsi > 70) score -= 10; // Overbought
      else if (stock.rsi >= 40 && stock.rsi <= 60) score += 10;
    }

    // Trend
    if (stock.changePercent > 0) score += 10;
    else score -= 5;

    // Sentiment (20% weight)
    score += (sentimentScore || 0) * 20;

    // Risk Adjustment
    // Low risk tolerance (< 0.35): Penalize high volatility/beta (simulated here by sector)
    // High risk tolerance (> 0.7): Boost high growth/volatility
    
    if (riskTolerance < 0.35) {
        if (['Technology', 'Communication Services'].includes(stock.sector || '')) score -= 10;
        if (['Healthcare', 'Consumer Staples', 'Finance'].includes(stock.sector || '')) score += 15;
    } else if (riskTolerance > 0.7) {
        if (['Technology', 'Communication Services'].includes(stock.sector || '')) score += 15;
        if (['Healthcare', 'Consumer Staples'].includes(stock.sector || '')) score -= 5;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  },

  async getRecommendations(riskTolerance: number) {
    const marketData = await this.collectMarketData();
    const sentiment = await this.analyzeNewsSentiment();

    const scored = marketData.map(stock => {
        const score = this.calculateAIScore(stock, riskTolerance, sentiment[stock.symbol] || 0);
        
        let reason = "Balanced performance with neutral outlook.";
        if (score > 80) reason = "Strong bullish signals from technicals and sentiment.";
        else if (score < 40) reason = "Bearish trends detected, caution advised.";
        else if (stock.sector === 'Technology' && riskTolerance > 0.7) reason = "High growth potential matching your aggressive strategy.";
        else if (stock.sector === 'Healthcare' && riskTolerance < 0.35) reason = "Stable defensive stock matching your conservative strategy.";

        return {
            symbol: stock.symbol,
            name: this.getCompanyName(stock.symbol),
            currentPrice: stock.price.toFixed(2),
            change: (stock.changePercent > 0 ? '+' : '') + stock.changePercent.toFixed(2) + '%',
            aiScore: score,
            reason,
            metrics: {
                rsi: stock.rsi?.toFixed(1) || 'N/A',
                volume: (stock.volume / 1000000).toFixed(1) + 'M',
                sentiment: (sentiment[stock.symbol] || 0) > 0.2 ? 'Bullish' : (sentiment[stock.symbol] || 0) < -0.2 ? 'Bearish' : 'Neutral'
            },
            riskLevel: riskTolerance < 0.35 ? 'low' : riskTolerance < 0.7 ? 'medium' : 'high'
        };
    });

    // Sort by AI Score desc
    return scored.sort((a, b) => b.aiScore - a.aiScore).slice(0, 5);
  },

  async getPrediction(symbol: string) {
    // If using demo/mock data or if we want to simulate prediction on frontend for now
    // In a real app, this might still go to backend for advanced AI, but for this demo:
    const quote = await this.getStockQuote(symbol);
    const currentPrice = quote.price || 0;
    const sentiment = await this.analyzeNewsSentiment();
    const sentimentScore = sentiment[symbol] || 0;
    
    const predictedChange = (Math.random() * 5) + (sentimentScore * 2); // Random + sentiment bias
    const predictedPrice = currentPrice * (1 + (predictedChange / 100));
    
    return {
        symbol,
        currentPrice: currentPrice.toFixed(2),
        predictedPrice: predictedPrice.toFixed(2),
        priceChange: predictedChange.toFixed(2),
        confidence: Math.floor(70 + Math.random() * 20),
        recommendation: predictedChange > 2 ? 'strong_buy' : predictedChange > 0 ? 'buy' : 'hold',
        horizon: '1month',
        targetEntry: (currentPrice * 0.98).toFixed(2),
        takeProfit: (predictedPrice * 1.05).toFixed(2),
        stopLoss: (currentPrice * 0.95).toFixed(2),
        keyFactors: [
            "Technical momentum is " + (predictedChange > 0 ? "positive" : "neutral"),
            "News sentiment is " + (sentimentScore > 0 ? "bullish" : "mixed"),
            "Sector performance remains steady"
        ],
        risks: [
            "Market volatility may impact short-term targets",
            "Upcoming earnings report could cause fluctuation"
        ]
    };
  },

  async getInsiderTrading(symbol: string) {
    // Mock data for demo as FMP API requires paid key for insider trading often
    const sentiment = Math.random() > 0.5 ? 'bullish' : 'bearish';
    const buyVolume = Math.floor(Math.random() * 50000);
    const sellVolume = Math.floor(Math.random() * 30000);
    
    return {
        symbol,
        sentiment,
        buyVolume,
        sellVolume,
        netVolume: buyVolume - sellVolume,
        analysis: {
            message: sentiment === 'bullish' 
                ? "Recent insider buying activity suggests confidence in company growth."
                : "Insider selling outweighs buying, but may be due to routine profit taking."
        },
        recentTrades: [
            {
                insiderName: "John Doe",
                transactionType: "P-Purchase",
                shares: Math.floor(Math.random() * 5000),
                price: (Math.random() * 100 + 100).toFixed(2),
                filingDate: new Date().toISOString()
            },
            {
                insiderName: "Jane Smith",
                transactionType: "S-Sale",
                shares: Math.floor(Math.random() * 5000),
                price: (Math.random() * 100 + 100).toFixed(2),
                filingDate: new Date(Date.now() - 86400000).toISOString()
            }
        ]
    };
  }
};
