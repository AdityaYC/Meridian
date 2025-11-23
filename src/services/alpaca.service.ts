import Alpaca from '@alpacahq/alpaca-trade-api';

class AlpacaService {
    private alpaca: any;

    constructor() {
        this.alpaca = new Alpaca({
            keyId: process.env.ALPACA_API_KEY,
            secretKey: process.env.ALPACA_SECRET_KEY,
            paper: process.env.ALPACA_PAPER === 'true',
        });
    }

    async getAccount() {
        try {
            return await this.alpaca.getAccount();
        } catch (error) {
            console.error('Alpaca getAccount error:', error);
            throw error;
        }
    }

    async getPositions() {
        try {
            return await this.alpaca.getPositions();
        } catch (error) {
            console.error('Alpaca getPositions error:', error);
            throw error;
        }
    }

    async getPosition(symbol: string) {
        try {
            return await this.alpaca.getPosition(symbol);
        } catch (error) {
            console.error('Alpaca getPosition error:', error);
            throw error;
        }
    }

    async placeOrder({ symbol, qty, side, type = 'market', timeInForce = 'day' }: { symbol: string, qty: number, side: string, type?: string, timeInForce?: string }) {
        try {
            return await this.alpaca.createOrder({
                symbol,
                qty,
                side, // buy or sell
                type,
                time_in_force: timeInForce,
            });
        } catch (error) {
            console.error('Alpaca placeOrder error:', error);
            throw error;
        }
    }

    async getOrders(params: any = {}) {
        try {
            return await this.alpaca.getOrders(params);
        } catch (error) {
            console.error('Alpaca getOrders error:', error);
            throw error;
        }
    }

    async getLatestQuote(symbol: string) {
        try {
            const quote = await this.alpaca.getLatestTrade(symbol);
            return quote;
        } catch (error) {
            console.error('Alpaca getLatestQuote error:', error);
            throw error;
        }
    }

    async getBars(symbol: string, timeframe = '1Day', limit = 100) {
        try {
            const bars = await this.alpaca.getBarsV2(symbol, {
                timeframe,
                limit,
            });

            const barData = [];
            for await (const bar of bars) {
                barData.push(bar);
            }
            return barData;
        } catch (error) {
            console.error('Alpaca getBars error:', error);
            throw error;
        }
    }
}

export default new AlpacaService();
