import yahooFinance from 'yahoo-finance2';

export const marketResearchTool = {
    id: 'market_research',
    description: 'Get real-time stock data including price, fundamentals, technicals, and analyst recommendations',
    parameters: {
        type: 'object',
        properties: {
            ticker: {
                type: 'string',
                description: 'Stock ticker symbol (e.g., AAPL, TSLA, MSFT)',
            },
            includeNews: {
                type: 'boolean',
                description: 'Include recent news about this stock',
            },
        },
        required: ['ticker'],
    },
    execute: async ({ ticker, includeNews = false }: any) => {
        try {
            const [quote, summary] = await Promise.all([
                yahooFinance.quote(ticker),
                yahooFinance.quoteSummary(ticker, {
                    modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics', 'recommendationTrend']
                }),
            ]) as [any, any];

            const data = {
                ticker: ticker.toUpperCase(),
                price: {
                    current: quote.regularMarketPrice,
                    change: quote.regularMarketChange,
                    changePercent: quote.regularMarketChangePercent?.toFixed(2) + '%',
                    volume: quote.regularMarketVolume?.toLocaleString(),
                },
                fundamentals: {
                    marketCap: `$${(summary.price?.marketCap / 1e9)?.toFixed(2)}B`,
                    peRatio: summary.summaryDetail?.trailingPE?.toFixed(2),
                    eps: summary.defaultKeyStatistics?.trailingEps?.toFixed(2),
                    dividendYield: summary.summaryDetail?.dividendYield ?
                        (summary.summaryDetail.dividendYield * 100).toFixed(2) + '%' : 'N/A',
                    beta: summary.defaultKeyStatistics?.beta?.toFixed(2),
                },
                range: {
                    fiftyTwoWeekHigh: summary.summaryDetail?.fiftyTwoWeekHigh,
                    fiftyTwoWeekLow: summary.summaryDetail?.fiftyTwoWeekLow,
                    fiftyDayAvg: summary.summaryDetail?.fiftyDayAverage,
                    twoHundredDayAvg: summary.summaryDetail?.twoHundredDayAverage,
                },
                analyst: {
                    recommendation: summary.financialData?.recommendationKey?.toUpperCase(),
                    targetPrice: summary.financialData?.targetMeanPrice,
                    numberOfAnalysts: summary.financialData?.numberOfAnalystOpinions,
                },
            };

            return data;
        } catch (error: any) {
            return { error: `Failed to fetch market data: ${error.message}` };
        }
    },
};

export const newsAnalysisTool = {
    id: 'analyze_news',
    description: 'Search and analyze financial news with AI-powered sentiment analysis',
    parameters: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Search query (company name, ticker, or topic)',
            },
            days: {
                type: 'number',
                description: 'Days to look back (default: 7)',
            },
        },
        required: ['query'],
    },
    execute: async ({ query, days = 7 }: any) => {
        try {
            const NewsAPI = require('newsapi');
            const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - days);

            const response = await newsapi.v2.everything({
                q: query,
                language: 'en',
                sortBy: 'relevancy',
                from: fromDate.toISOString().split('T')[0],
                pageSize: 10,
            });

            const articles = response.articles.slice(0, 5).map((a: any) => ({
                title: a.title,
                source: a.source.name,
                publishedAt: new Date(a.publishedAt).toLocaleDateString(),
                description: a.description,
                url: a.url,
            }));

            return {
                query,
                totalResults: response.totalResults,
                articles,
                summary: `Found ${response.totalResults} articles in the last ${days} days`,
            };
        } catch (error: any) {
            return { error: `News fetch failed: ${error.message}` };
        }
    },
};

export const insiderTradingTool = {
    id: 'insider_trading',
    description: 'Track insider trading activity (buys/sells by company executives and board members)',
    parameters: {
        type: 'object',
        properties: {
            ticker: {
                type: 'string',
                description: 'Stock ticker symbol',
            },
        },
        required: ['ticker'],
    },
    execute: async ({ ticker }: any) => {
        try {
            const axios = require('axios');
            const response = await axios.get(
                `https://financialmodelingprep.com/api/v4/insider-trading`,
                {
                    params: {
                        symbol: ticker.toUpperCase(),
                        apikey: process.env.FMP_API_KEY,
                        limit: 50,
                    },
                }
            );

            const trades = response.data;

            if (!trades || trades.length === 0) {
                return {
                    ticker: ticker.toUpperCase(),
                    message: 'No recent insider trading activity found',
                    trades: [],
                };
            }

            const last30Days = trades.filter((t: any) => {
                const tradeDate = new Date(t.transactionDate);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return tradeDate >= thirtyDaysAgo;
            });

            const buys = last30Days.filter((t: any) =>
                t.transactionType.toLowerCase().includes('buy') ||
                t.transactionType.toLowerCase().includes('purchase')
            );

            const sells = last30Days.filter((t: any) =>
                t.transactionType.toLowerCase().includes('sale') ||
                t.transactionType.toLowerCase().includes('sell')
            );

            const buyValue = buys.reduce((sum: number, t: any) =>
                sum + ((t.securitiesTransacted || 0) * (t.price || 0)), 0
            );

            const sellValue = sells.reduce((sum: number, t: any) =>
                sum + ((t.securitiesTransacted || 0) * (t.price || 0)), 0
            );

            return {
                ticker: ticker.toUpperCase(),
                period: 'Last 30 days',
                summary: {
                    totalBuys: buys.length,
                    totalSells: sells.length,
                    buyValue: `$${(buyValue / 1e6).toFixed(2)}M`,
                    sellValue: `$${(sellValue / 1e6).toFixed(2)}M`,
                    netSentiment: buyValue > sellValue ? 'BULLISH (More buying)' :
                        sellValue > buyValue ? 'BEARISH (More selling)' : 'NEUTRAL',
                },
                recentActivity: last30Days.slice(0, 10).map((t: any) => ({
                    date: new Date(t.transactionDate).toLocaleDateString(),
                    insider: t.reportingName,
                    position: t.typeOfOwner,
                    type: t.transactionType,
                    shares: t.securitiesTransacted?.toLocaleString(),
                    value: `$${((t.securitiesTransacted * t.price) / 1000).toFixed(0)}K`,
                })),
            };
        } catch (error: any) {
            return { error: `Insider trading data failed: ${error.message}` };
        }
    },
};
