import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    Sparkles,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    PieChart as RechartsPie,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const PortfolioPage: React.FC = () => {
    const [holdings, setHoldings] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [suggestions, setSuggestions] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'holdings' | 'suggestions' | 'analysis'>('holdings');
    const [useDemo] = useState(true); // Use demo data for consistent display

    useEffect(() => {
        loadPortfolio();
    }, []);

    const loadPortfolio = async () => {
        try {
            setLoading(true);
            
            if (useDemo) {
                // Demo portfolio data
                setHoldings([
                    {
                        id: '1',
                        symbol: 'AAPL',
                        name: 'Apple Inc.',
                        shares: 10,
                        avgCost: 150.00,
                        currentPrice: 175.50,
                        totalValue: 1755.00,
                        gainLoss: 255.00,
                        gainLossPercent: 17.00,
                    },
                    {
                        id: '2',
                        symbol: 'MSFT',
                        name: 'Microsoft Corporation',
                        shares: 5,
                        avgCost: 300.00,
                        currentPrice: 350.25,
                        totalValue: 1751.25,
                        gainLoss: 251.25,
                        gainLossPercent: 16.75,
                    },
                    {
                        id: '3',
                        symbol: 'GOOGL',
                        name: 'Alphabet Inc.',
                        shares: 8,
                        avgCost: 125.00,
                        currentPrice: 140.75,
                        totalValue: 1126.00,
                        gainLoss: 126.00,
                        gainLossPercent: 12.60,
                    },
                ]);
                
                setSummary({
                    totalValue: 4632.25,
                    totalCost: 4000.00,
                    totalGainLoss: 632.25,
                    gainLossPercent: 15.81,
                    dayChange: 125.50,
                    dayChangePercent: 2.78,
                });
            } else {
                const [holdingsRes, summaryRes] = await Promise.all([
                    api.get('/portfolio/holdings'),
                    api.get('/portfolio/summary'),
                ]);
                setHoldings(holdingsRes.data);
                setSummary(summaryRes.data);
            }
        } catch (error: any) {
            console.error('Load portfolio error:', error);
            // Fallback to demo data on error
            setHoldings([
                {
                    id: '1',
                    symbol: 'AAPL',
                    name: 'Apple Inc.',
                    shares: 10,
                    avgCost: 150.00,
                    currentPrice: 175.50,
                    totalValue: 1755.00,
                    gainLoss: 255.00,
                    gainLossPercent: 17.00,
                },
            ]);
            setSummary({
                totalValue: 1755.00,
                totalCost: 1500.00,
                totalGainLoss: 255.00,
                gainLossPercent: 17.00,
                dayChange: 25.50,
                dayChangePercent: 1.47,
            });
        } finally {
            setLoading(false);
        }
    };

    const getAIAnalysis = async () => {
        try {
            const toastId = toast.loading('Analyzing your portfolio...');
            const { data } = await api.post('/portfolio/analyze', {
                riskTolerance: 'moderate',
                investmentGoal: 'growth',
                timeHorizon: 'long',
                age: 25,
            });
            setAnalysis(data);
            setActiveTab('analysis');
            toast.success('Analysis complete!', { id: toastId });
        } catch (error) {
            toast.error('Failed to analyze portfolio');
        }
    };

    const getAISuggestions = async () => {
        try {
            const toastId = toast.loading('Getting personalized investment suggestions...');
            const { data } = await api.post('/portfolio/suggestions', {
                availableCapital: 5000,
                riskTolerance: 'moderate',
                investmentGoal: 'growth',
                timeHorizon: 'long',
            });
            setSuggestions(data);
            setActiveTab('suggestions');
            toast.success('Suggestions ready!', { id: toastId });
        } catch (error) {
            toast.error('Failed to get suggestions');
        }
    };

    const totalGainLoss = parseFloat(summary?.totalGainLoss || 0);
    const gainLossPercent = parseFloat(summary?.gainLossPercent || 0);
    const isPositive = totalGainLoss >= 0;

    const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];

    const pieData = holdings.map(h => ({
        name: h.symbol,
        value: parseFloat(h.totalValue || 0),
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="heading-2">Portfolio</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your investments with AI-powered insights</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={getAISuggestions} className="btn-secondary inline-flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Get AI Suggestions
                    </button>
                    <button onClick={loadPortfolio} className="btn-ghost inline-flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">${summary?.totalValue || '0.00'}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{summary?.holdingsCount || 0} holdings</p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 ${isPositive ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'} rounded-lg flex items-center justify-center`}>
                            {isPositive ? (
                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Gain/Loss</span>
                    </div>
                    <div className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}${totalGainLoss.toFixed(2)}
                    </div>
                    <p className={`text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%
                    </p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Cost</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">${summary?.totalCost || '0.00'}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Initial investment</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="card p-1">
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab('holdings')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'holdings'
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        Holdings
                    </button>
                    <button
                        onClick={() => setActiveTab('suggestions')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'suggestions'
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        AI Suggestions
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('analysis');
                            if (!analysis) getAIAnalysis();
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analysis'
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        Portfolio Analysis
                    </button>
                </div>
            </div>

            {/* Holdings Tab */}
            {activeTab === 'holdings' && (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {holdings.length === 0 ? (
                            <div className="card p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <PieChart className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No holdings yet</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Start investing to build your portfolio</p>
                                <button onClick={getAISuggestions} className="btn-primary inline-flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Get Investment Ideas
                                </button>
                            </div>
                        ) : (
                            holdings.map((holding) => (
                                <HoldingCard key={holding.id} holding={holding} />
                            ))
                        )}
                    </div>

                    <div className="space-y-4">
                        {holdings.length > 0 && (
                            <div className="card p-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Portfolio Allocation</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <RechartsPie>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && suggestions && (
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Investment Strategy</h3>
                        <p className="text-gray-600 dark:text-gray-400">{suggestions.strategy}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suggestions.recommendations?.map((rec: any, index: number) => (
                            <InvestmentSuggestionCard key={index} suggestion={rec} />
                        ))}
                    </div>
                </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && analysis && (
                <div className="space-y-6">
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Portfolio Health</h3>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Overall Score</p>
                                    <p className="text-2xl font-bold text-primary-600">{analysis.overallScore}/100</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Diversification</p>
                                    <p className="text-2xl font-bold text-blue-600">{analysis.diversificationScore}/100</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{analysis.summary}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="card p-6">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="text-green-600">✓</span> Strengths
                            </h4>
                            <ul className="space-y-2">
                                {analysis.strengths?.map((strength: string, index: number) => (
                                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                        <span className="text-green-600">•</span>
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="card p-6">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="text-red-600">!</span> Areas to Improve
                            </h4>
                            <ul className="space-y-2">
                                {analysis.weaknesses?.map((weakness: string, index: number) => (
                                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                        <span className="text-red-600">•</span>
                                        {weakness}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">AI Recommendations</h4>
                        <div className="space-y-3">
                            {analysis.recommendations?.map((rec: any, index: number) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 dark:text-white">{rec.symbol}</span>
                                            <span className={`badge ${rec.action === 'buy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                                    rec.action === 'sell' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {rec.action.toUpperCase()}
                                            </span>
                                            <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">{rec.riskLevel} risk</span>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{rec.timeframe}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{rec.reasoning}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Expected return: {rec.expectedReturn}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const HoldingCard: React.FC<{ holding: any }> = ({ holding }) => {
    const gainLoss = parseFloat(holding.gainLoss || 0);
    const gainLossPercent = parseFloat(holding.gainLossPercent || 0);
    const isPositive = gainLoss >= 0;

    return (
        <div className="card p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{holding.symbol}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{holding.quantity} shares • {holding.type}</p>
                    {holding.sector && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{holding.sector}</p>}
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${parseFloat(holding.totalValue || 0).toFixed(2)}</p>
                    <div className={`flex items-center gap-1 justify-end ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span className="text-sm font-medium">
                            {isPositive ? '+' : ''}${Math.abs(gainLoss).toFixed(2)} ({isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4 text-sm">
                <div>
                    <p className="text-gray-600 dark:text-gray-400">Avg Cost</p>
                    <p className="font-medium text-gray-900 dark:text-white">${parseFloat(holding.purchasePrice).toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-gray-600 dark:text-gray-400">Current Price</p>
                    <p className="font-medium text-gray-900 dark:text-white">${parseFloat(holding.currentPrice || 0).toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-gray-600 dark:text-gray-400">Total Cost</p>
                    <p className="font-medium text-gray-900 dark:text-white">${(holding.quantity * holding.purchasePrice).toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

const InvestmentSuggestionCard: React.FC<{ suggestion: any }> = ({ suggestion }) => {
    return (
        <div className="card p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{suggestion.symbol}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.name}</p>
                </div>
                <span className={`badge ${suggestion.riskLevel === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        suggestion.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                    {suggestion.riskLevel} risk
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Suggested Amount</span>
                    <span className="font-medium text-gray-900 dark:text-white">${suggestion.suggestedAmount?.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Expected Return</span>
                    <span className="font-medium text-green-600">{suggestion.expectedReturn}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Timeframe</span>
                    <span className="font-medium text-gray-900 dark:text-white">{suggestion.timeframe}</span>
                </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{suggestion.reasoning}</p>

            <div className="space-y-2">
                <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Pros:</p>
                    {suggestion.pros?.map((pro: string, i: number) => (
                        <p key={i} className="text-xs text-gray-600 dark:text-gray-400">• {pro}</p>
                    ))}
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cons:</p>
                    {suggestion.cons?.map((con: string, i: number) => (
                        <p key={i} className="text-xs text-gray-600 dark:text-gray-400">• {con}</p>
                    ))}
                </div>
            </div>

            <button className="btn-primary w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add to Portfolio
            </button>
        </div>
    );
};

export default PortfolioPage;
