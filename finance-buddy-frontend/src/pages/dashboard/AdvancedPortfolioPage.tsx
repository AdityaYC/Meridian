import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  RefreshCw,
  Sparkles,
  Eye,
  Target,
} from 'lucide-react';
import { api } from '../../lib/api';
import { marketAnalysisService } from '../../services/marketAnalysis';
import toast from 'react-hot-toast';

type Category = 'stocks' | 'crypto' | 'mutual_funds' | 'etfs' | 'bonds' | 'reits' | 'options';

interface CategoryConfig {
  id: Category;
  name: string;
  icon: string;
  description: string;
  defaultRisk: number;
  defaultAmount: number;
}

const categories: CategoryConfig[] = [
  {
    id: 'stocks',
    name: 'Stocks',
    icon: '📈',
    description: 'Individual company shares with growth potential',
    defaultRisk: 0.5,
    defaultAmount: 5000,
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: '₿',
    description: 'Digital assets with high volatility and returns',
    defaultRisk: 0.8,
    defaultAmount: 2000,
  },
  {
    id: 'etfs',
    name: 'ETFs',
    icon: '📊',
    description: 'Diversified funds tracking indexes or sectors',
    defaultRisk: 0.3,
    defaultAmount: 10000,
  },
  {
    id: 'mutual_funds',
    name: 'Mutual Funds',
    icon: '🏛️',
    description: 'Professionally managed investment funds',
    defaultRisk: 0.4,
    defaultAmount: 10000,
  },
  {
    id: 'bonds',
    name: 'Bonds',
    icon: '🔒',
    description: 'Fixed-income securities for stable returns',
    defaultRisk: 0.2,
    defaultAmount: 15000,
  },
  {
    id: 'reits',
    name: 'REITs',
    icon: '🏢',
    description: 'Real estate investment trusts with dividends',
    defaultRisk: 0.4,
    defaultAmount: 7500,
  },
  {
    id: 'options',
    name: 'Options',
    icon: '⚡',
    description: 'Derivatives for hedging or speculation',
    defaultRisk: 0.9,
    defaultAmount: 1000,
  },
];

const AdvancedPortfolioPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('stocks');
  const [preferences, setPreferences] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [insiderData, setInsiderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const currentCategory = categories.find(c => c.id === activeCategory)!;
  const categoryPrefs = preferences[activeCategory] || {
    riskTolerance: currentCategory.defaultRisk,
    investmentAmount: currentCategory.defaultAmount,
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data } = await api.get('/portfolio/preferences');
      const prefsMap: any = {};
      data.forEach((pref: any) => {
        prefsMap[pref.category] = pref;
      });
      setPreferences(prefsMap);
    } catch (error) {
      console.error('Load preferences error:', error);
    }
  };

  const updateCategoryPreference = (key: string, value: any) => {
    setPreferences({
      ...preferences,
      [activeCategory]: {
        ...categoryPrefs,
        [key]: value,
      },
    });
  };

  const savePreferences = async () => {
    try {
      await api.post(`/portfolio/preferences/${activeCategory}`, categoryPrefs);
      toast.success('Preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const saveApiKeys = () => {
    localStorage.setItem('alphaVantageKey', apiKeys.alphaVantage);
    localStorage.setItem('newsApiKey', apiKeys.newsApi);
    setShowApiSettings(false);
    toast.success('API Keys saved');
  };

  const getRecommendations = async () => {
    try {
      setLoading(true);
      
      if (activeCategory === 'stocks') {
        const toastId = toast.loading('Analyzing market data...');
        
        // Use frontend market analysis service for stocks
        const results = await marketAnalysisService.getRecommendations(categoryPrefs.riskTolerance);
        
        setRecommendations({
          strategy: `AI Analysis based on your ${getRiskLabel(categoryPrefs.riskTolerance)} risk profile.`,
          recommendations: results.map(rec => ({
            ...rec,
            suggestedAmount: categoryPrefs.investmentAmount / results.length
          }))
        });
        
        toast.success('Analysis complete!', { id: toastId });
      } else {
        // Fallback to backend for other categories
        const toastId = toast.loading('Getting AI recommendations...');
        const { data } = await api.post(`/portfolio/recommendations/${activeCategory}`, {
          riskTolerance: categoryPrefs.riskTolerance,
          investmentAmount: categoryPrefs.investmentAmount,
        });
        setRecommendations(data);
        toast.success('Recommendations ready!', { id: toastId });
      }
    } catch (error: any) {
      console.error('Recommendation error:', error);
      toast.error('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getPrediction = async (symbol: string) => {
    try {
      const toastId = toast.loading(`Analyzing ${symbol}...`);
      
      // Use frontend service for stocks to support demo mode/API keys
      if (activeCategory === 'stocks') {
        const data = await marketAnalysisService.getPrediction(symbol);
        setPrediction(data);
      } else {
        const { data } = await api.get(`/portfolio/predict/${symbol}?horizon=1month`);
        setPrediction(data);
      }
      
      toast.success('Prediction ready!', { id: toastId });
    } catch (error) {
      toast.error('Failed to get prediction');
    }
  };

  const getInsiderTrading = async (symbol: string) => {
    try {
      const toastId = toast.loading(`Checking insider activity for ${symbol}...`);
      
      // Use frontend service for stocks to support demo mode
      if (activeCategory === 'stocks') {
        const data = await marketAnalysisService.getInsiderTrading(symbol);
        setInsiderData(data);
      } else {
        const { data } = await api.get(`/portfolio/insider/${symbol}`);
        setInsiderData(data);
      }
      
      toast.success('Insider data loaded!', { id: toastId });
    } catch (error) {
      toast.error('Failed to get insider data');
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 0.35) return 'bg-green-500';
    if (risk < 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskLabel = (risk: number) => {
    if (risk < 0.35) return 'Low Risk';
    if (risk < 0.7) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Portfolio</h1>
          <p className="text-gray-600 mt-1">Build a diversified portfolio with AI-powered insights</p>
        </div>
        <button onClick={loadPreferences} className="btn-ghost inline-flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg">
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2">
        <div className="grid grid-cols-4 lg:grid-cols-7 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-4 rounded-lg text-center transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-lg scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-medium">{cat.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Info */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{currentCategory.icon}</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentCategory.name}</h2>
            <p className="text-gray-700">{currentCategory.description}</p>
          </div>
        </div>
      </div>

      {/* Investment Configuration */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk Tolerance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Tolerance</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              categoryPrefs.riskTolerance < 0.35 ? 'bg-green-100 text-green-700' :
              categoryPrefs.riskTolerance < 0.7 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {getRiskLabel(categoryPrefs.riskTolerance)}
            </span>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={categoryPrefs.riskTolerance}
                onChange={(e) => updateCategoryPreference('riskTolerance', parseFloat(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10B981 0%, #F59E0B 50%, #EF4444 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>Conservative</span>
                <span>Moderate</span>
                <span>Aggressive</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                {categoryPrefs.riskTolerance < 0.35 && '🛡️ Conservative approach: Focus on capital preservation with stable, lower-risk investments.'}
                {categoryPrefs.riskTolerance >= 0.35 && categoryPrefs.riskTolerance < 0.7 && '⚖️ Balanced approach: Mix of growth and stability with moderate risk.'}
                {categoryPrefs.riskTolerance >= 0.7 && '🚀 Aggressive approach: High-risk, high-reward investments for maximum growth potential.'}
              </p>
            </div>
          </div>
        </div>

        {/* Investment Amount */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Investment Amount</h3>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Invest</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">$</span>
                <input
                  type="number"
                  value={categoryPrefs.investmentAmount}
                  onChange={(e) => updateCategoryPreference('investmentAmount', parseFloat(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 text-2xl font-bold border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  min="100"
                  step="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1000, 5000, 10000].map(amt => (
                <button
                  key={amt}
                  onClick={() => updateCategoryPreference('investmentAmount', amt)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ${amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={getRecommendations}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Get AI Recommendations
            </>
          )}
        </button>
        <button 
          onClick={savePreferences} 
          className="px-6 py-3 bg-white text-gray-700 font-semibold border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Save Preferences
        </button>
      </div>

      {/* Recommendations Display */}
      {recommendations && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Investment Strategy</h3>
            <p className="text-gray-700 leading-relaxed">{recommendations.strategy}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.recommendations?.map((rec: any, index: number) => (
              <RecommendationCard
                key={index}
                recommendation={rec}
                category={activeCategory}
                onPredict={getPrediction}
                onInsider={getInsiderTrading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Prediction Modal */}
      {prediction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{prediction.symbol} Prediction</h3>
              <button onClick={() => setPrediction(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">✕</button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Current Price</p>
                  <p className="text-2xl font-bold text-gray-900">${prediction.currentPrice}</p>
                </div>
                <div className="p-4 bg-primary-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Predicted Price ({prediction.horizon})</p>
                  <p className="text-2xl font-bold text-primary-600">${prediction.predictedPrice}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Potential Gain</p>
                  <p className="text-2xl font-bold text-green-600">{prediction.priceChange > 0 ? '+' : ''}{prediction.priceChange}%</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-blue-600">{prediction.confidence}%</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Recommendation</h4>
                <span className={`inline-block px-4 py-2 rounded-lg text-lg font-medium ${
                  prediction.recommendation === 'strong_buy' ? 'bg-green-100 text-green-700' :
                  prediction.recommendation === 'buy' ? 'bg-green-50 text-green-600' :
                  prediction.recommendation === 'hold' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {prediction.recommendation.toUpperCase().replace('_', ' ')}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Key Factors</h4>
                <ul className="space-y-1">
                  {prediction.keyFactors?.map((factor: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Risks</h4>
                <ul className="space-y-1">
                  {prediction.risks?.map((risk: string, i: number) => (
                    <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                      <span className="mt-1">⚠️</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Entry Price</p>
                  <p className="font-bold text-gray-900">${prediction.targetEntry}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Take Profit</p>
                  <p className="font-bold text-green-600">${prediction.takeProfit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Stop Loss</p>
                  <p className="font-bold text-red-600">${prediction.stopLoss}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insider Trading Modal */}
      {insiderData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Insider Trading: {insiderData.symbol}</h3>
              <button onClick={() => setInsiderData(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">✕</button>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-xl border" style={{
                backgroundColor: insiderData.sentiment === 'bullish' ? '#DEF7EC' : 
                                 insiderData.sentiment === 'bearish' ? '#FDE8E8' : '#F3F4F6',
                borderColor: insiderData.sentiment === 'bullish' ? '#84E1BC' : 
                             insiderData.sentiment === 'bearish' ? '#F8B4B4' : '#E5E7EB',
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className={`w-5 h-5 ${
                    insiderData.sentiment === 'bullish' ? 'text-green-600' :
                    insiderData.sentiment === 'bearish' ? 'text-red-600' : 'text-gray-600'
                  }`} />
                  <span className="font-bold text-gray-900">Sentiment: {insiderData.sentiment.toUpperCase()}</span>
                </div>
                <p className="text-sm text-gray-800">{insiderData.analysis.message}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm text-gray-600 mb-1">Buy Volume</p>
                  <p className="text-xl font-bold text-green-600">{insiderData.buyVolume.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-sm text-gray-600 mb-1">Sell Volume</p>
                  <p className="text-xl font-bold text-red-600">{insiderData.sellVolume.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Net Volume</p>
                  <p className={`text-xl font-bold ${insiderData.netVolume >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {insiderData.netVolume >= 0 ? '+' : ''}{insiderData.netVolume.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Recent Insider Trades</h4>
                <div className="space-y-2">
                  {insiderData.recentTrades?.slice(0, 10).map((trade: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{trade.insiderName || trade.insider_name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          (trade.transactionType || trade.transaction_type).includes('Purchase') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {(trade.transactionType || trade.transaction_type).includes('Purchase') ? 'BUY' : 'SELL'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{(trade.shares || trade.securitiesTransacted)?.toLocaleString()} shares @ ${trade.price}</span>
                        <span>{new Date(trade.filingDate || trade.filing_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RecommendationCard: React.FC<{
  recommendation: any;
  category: Category;
  onPredict: (symbol: string) => void;
  onInsider: (symbol: string) => void;
}> = ({ recommendation, category, onPredict, onInsider }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-gray-900 text-lg">{recommendation.symbol || recommendation.name}</h4>
          <p className="text-sm text-gray-600">{recommendation.name || recommendation.symbol}</p>
        </div>
        {recommendation.riskLevel && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            recommendation.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
            recommendation.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {recommendation.riskLevel.toUpperCase()}
          </span>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {recommendation.suggestedAmount && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Investment</span>
            <span className="font-bold text-gray-900">${recommendation.suggestedAmount.toFixed(2)}</span>
          </div>
        )}
        {recommendation.currentPrice && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Current Price</span>
            <span className="font-medium text-gray-900">${recommendation.currentPrice}</span>
          </div>
        )}
        {recommendation.expectedReturn && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Expected Return</span>
            <span className="font-bold text-green-600">{recommendation.expectedReturn}</span>
          </div>
        )}
        {recommendation.dividendYield && recommendation.dividendYield !== 'null' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Dividend Yield</span>
            <span className="font-medium text-blue-600">{recommendation.dividendYield}</span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-700 mb-6 line-clamp-3">{recommendation.reasoning}</p>

      {category === 'stocks' && recommendation.symbol && (
        <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
          <button
            onClick={() => onPredict(recommendation.symbol)}
            className="flex-1 text-xs py-2 inline-flex items-center justify-center gap-1 bg-primary-50 text-primary-700 font-medium rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Target className="w-3 h-3" />
            Predict
          </button>
          <button
            onClick={() => onInsider(recommendation.symbol)}
            className="flex-1 text-xs py-2 inline-flex items-center justify-center gap-1 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-3 h-3" />
            Insider
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedPortfolioPage;
