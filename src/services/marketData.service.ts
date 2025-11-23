const axios = require('axios');

class MarketDataService {
    constructor() {
        this.fmpApiKey = process.env.FMP_API_KEY;
        this.newsApiKey = process.env.NEWS_API_KEY;
        this.fmpBaseUrl = 'https://financialmodelingprep.com/api/v3';
    }

    async getStockQuote(symbol) {
        try {
            const response = await axios.get(
                `${this.fmpBaseUrl}/quote/${symbol}?apikey=${this.fmpApiKey}`
            );
            return response.data[0];
        } catch (error) {
            console.error('FMP getStockQuote error:', error);
            throw error;
        }
    }

    async getCompanyProfile(symbol) {
        try {
            const response = await axios.get(
                `${this.fmpBaseUrl}/profile/${symbol}?apikey=${this.fmpApiKey}`
            );
            return response.data[0];
        } catch (error) {
            console.error('FMP getCompanyProfile error:', error);
            throw error;
        }
    }

    async getStockNews(symbol, limit = 10) {
        try {
            const response = await axios.get(
                `${this.fmpBaseUrl}/stock_news?tickers=${symbol}&limit=${limit}&apikey=${this.fmpApiKey}`
            );
            return response.data;
        } catch (error) {
            console.error('FMP getStockNews error:', error);
            throw error;
        }
    }

    async getMarketSectors() {
        try {
            const response = await axios.get(
                `${this.fmpBaseUrl}/sector-performance?apikey=${this.fmpApiKey}`
            );
            return response.data;
        } catch (error) {
            console.error('FMP getMarketSectors error:', error);
            throw error;
        }
    }

    async getTopGainersLosers() {
        try {
            const [gainers, losers] = await Promise.all([
                axios.get(`${this.fmpBaseUrl}/stock_market/gainers?apikey=${this.fmpApiKey}`),
                axios.get(`${this.fmpBaseUrl}/stock_market/losers?apikey=${this.fmpApiKey}`),
            ]);

            return {
                gainers: gainers.data.slice(0, 5),
                losers: losers.data.slice(0, 5),
            };
        } catch (error) {
            console.error('FMP getTopGainersLosers error:', error);
            throw error;
        }
    }

    async searchStocks(query) {
        try {
            const response = await axios.get(
                `${this.fmpBaseUrl}/search?query=${query}&limit=10&apikey=${this.fmpApiKey}`
            );
            return response.data;
        } catch (error) {
            console.error('FMP searchStocks error:', error);
            throw error;
        }
    }
}

module.exports = new MarketDataService();
