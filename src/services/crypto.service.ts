import ccxt from 'ccxt';
import axios from 'axios';

class CryptoService {
  private exchange: any;
  private coinGeckoUrl: string;

  constructor() {
    this.exchange = new ccxt.binance();
    this.coinGeckoUrl = 'https://api.coingecko.com/api/v3';
  }

  async getCryptoPrice(symbol: string) {
    try {
      // Convert symbol format (BTC -> BTC/USDT)
      const tradingPair = `${symbol}/USDT`;
      const ticker = await this.exchange.fetchTicker(tradingPair);
      
      return {
        symbol,
        price: ticker.last,
        change24h: ticker.percentage,
        volume24h: ticker.quoteVolume,
        high24h: ticker.high,
        low24h: ticker.low,
      };
    } catch (error) {
      console.error('Get crypto price error:', error);
      // Fallback or handle error gracefully
      return null;
    }
  }

  async getTopCryptos(limit = 50) {
    try {
      const response = await axios.get(
        `${this.coinGeckoUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1` 
      );
      
      return response.data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        marketCap: coin.market_cap,
        change24h: coin.price_change_percentage_24h,
        volume24h: coin.total_volume,
        rank: coin.market_cap_rank,
      }));
    } catch (error) {
      console.error('Get top cryptos error:', error);
      throw error;
    }
  }

  async getCryptoDetails(symbol: string) {
    try {
      const coinId = symbol.toLowerCase() === 'btc' ? 'bitcoin' : 
                     symbol.toLowerCase() === 'eth' ? 'ethereum' :
                     symbol.toLowerCase();

      const response = await axios.get(
        `${this.coinGeckoUrl}/coins/${coinId}?localization=false&tickers=false&community_data=true&developer_data=true` 
      );

      return {
        symbol: response.data.symbol.toUpperCase(),
        name: response.data.name,
        description: response.data.description.en,
        price: response.data.market_data.current_price.usd,
        marketCap: response.data.market_data.market_cap.usd,
        volume24h: response.data.market_data.total_volume.usd,
        change24h: response.data.market_data.price_change_percentage_24h,
        change7d: response.data.market_data.price_change_percentage_7d,
        change30d: response.data.market_data.price_change_percentage_30d,
        ath: response.data.market_data.ath.usd,
        atl: response.data.market_data.atl.usd,
        circulatingSupply: response.data.market_data.circulating_supply,
        totalSupply: response.data.market_data.total_supply,
      };
    } catch (error) {
      console.error('Get crypto details error:', error);
      throw error;
    }
  }

  async searchCrypto(query: string) {
    try {
      const response = await axios.get(
        `${this.coinGeckoUrl}/search?query=${query}` 
      );
      
      return response.data.coins.slice(0, 10).map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        marketCapRank: coin.market_cap_rank,
      }));
    } catch (error) {
      console.error('Search crypto error:', error);
      throw error;
    }
  }
}

export default new CryptoService();
