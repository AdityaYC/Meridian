import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, X, Clock, Search } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

const TradingPage: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop_loss'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [marketData, setMarketData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMarketData();
    loadOrders();
    
    // Auto-refresh market data every 10 seconds
    const interval = setInterval(loadMarketData, 10000);
    return () => clearInterval(interval);
  }, [symbol]);

  const loadMarketData = async () => {
    try {
      setRefreshing(true);
      const { data } = await api.get(`/premium/trading/market/${symbol}`);
      setMarketData(data);
    } catch (error) {
      console.error('Load market data error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/premium/trading/orders');
      setOrders(data);
    } catch (error) {
      console.error('Load orders error:', error);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      const orderData = {
        symbol,
        orderType,
        side,
        quantity,
        price: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
        stopPrice: orderType === 'stop_loss' ? parseFloat(stopPrice) : undefined,
      };

      await api.post('/premium/trading/orders', orderData);

      toast.success(`${side.toUpperCase()} order placed for ${quantity} shares of ${symbol}`);

      // Reset form
      setQuantity(1);
      setLimitPrice('');
      setStopPrice('');

      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.delete(`/premium/trading/orders/${orderId}`);
      toast.success('Order cancelled');
      loadOrders();
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const estimatedCost = marketData ? quantity * marketData.price : 0;
  const isPositive = marketData?.changePercent >= 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trading Station</h1>
          <p className="text-gray-600 mt-1">Real-time market access & execution</p>
        </div>
        <div className="badge bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
          Paper Trading Mode
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trading Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Data Card */}
          {marketData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-bold text-gray-900">{symbol}</h2>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">NASDAQ</span>
                  </div>
                  <p className="text-gray-600">Real-time Quote</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-gray-900">${marketData.price.toFixed(2)}</div>
                  <div className={`flex items-center gap-1 justify-end mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span className="font-medium">
                      {isPositive ? '+' : ''}{marketData.change.toFixed(2)} ({isPositive ? '+' : ''}{marketData.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Open</p>
                  <p className="font-medium text-gray-900">${marketData.open.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">High</p>
                  <p className="font-medium text-gray-900">${marketData.high.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Low</p>
                  <p className="font-medium text-gray-900">${marketData.low.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Vol</p>
                  <p className="font-medium text-gray-900">{(marketData.volume / 1e6).toFixed(2)}M</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Execute Trade</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                 {/* Symbol Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="AAPL"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                {/* Order Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="market">Market Order</option>
                    <option value="limit">Limit Order</option>
                    <option value="stop_loss">Stop Loss</option>
                  </select>
                </div>

                {/* Limit Price */}
                {orderType === 'limit' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Limit Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {/* Stop Price */}
                {orderType === 'stop_loss' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stop Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={stopPrice}
                        onChange={(e) => setStopPrice(e.target.value)}
                        className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estimated Cost */}
            <div className="p-4 bg-gray-50 rounded-lg mb-6 flex justify-between items-center">
              <span className="text-gray-600">Estimated {side === 'buy' ? 'Cost' : 'Proceeds'}</span>
              <span className="text-2xl font-bold text-gray-900">${estimatedCost.toFixed(2)}</span>
            </div>

            {/* Buy/Sell Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setSide('buy');
                  if (side === 'buy') handlePlaceOrder();
                }}
                className={`py-3 rounded-lg font-bold transition-all ${
                  side === 'buy'
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={loading && side === 'buy'}
              >
                {loading && side === 'buy' ? 'Processing...' : `BUY ${symbol}`}
              </button>
              <button
                onClick={() => {
                  setSide('sell');
                  if (side === 'sell') handlePlaceOrder();
                }}
                className={`py-3 rounded-lg font-bold transition-all ${
                  side === 'sell'
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={loading && side === 'sell'}
              >
                {loading && side === 'sell' ? 'Processing...' : `SELL ${symbol}`}
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Recent Activity
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-12 flex-1 flex flex-col justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active orders</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
                {orders.slice(0, 10).map((order) => (
                  <OrderCard key={order.id} order={order} onCancel={handleCancelOrder} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderCard: React.FC<{ order: any; onCancel: (id: string) => void }> = ({ order, onCancel }) => {
  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    filled: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">{order.symbol}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${order.side === 'buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {order.side}
          </span>
        </div>
        {order.status === 'pending' && (
          <button
            onClick={() => onCancel(order.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Cancel Order"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">{order.quantity} sh @ ${parseFloat(order.price || order.filledPrice || 0).toFixed(2)}</span>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
          {order.status}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
    </div>
  );
};

export default TradingPage;
