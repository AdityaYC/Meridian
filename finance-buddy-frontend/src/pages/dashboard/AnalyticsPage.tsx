import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { analyticsAPI } from '../../lib/api';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const AnalyticsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('6');
    const [spendingData, setSpendingData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [useDemo] = useState(true); // Use demo data for consistent display

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            
            if (useDemo) {
                // Demo data matching the dashboard statistics
                // Total spending: $1950 (30 days)
                // Food & Dining: 33%, Transportation: 19%, Bills & Utilities: 22%, Shopping: 16%, Entertainment: 9%
                setSpendingData([
                    { category: 'Food & Dining', total: 643.50, count: 18 },  // 33%
                    { category: 'Bills & Utilities', total: 429.00, count: 8 },  // 22%
                    { category: 'Transportation', total: 370.50, count: 12 },  // 19%
                    { category: 'Shopping', total: 312.00, count: 9 },  // 16%
                    { category: 'Entertainment', total: 175.50, count: 7 },  // 9%
                    { category: 'Personal Care', total: 19.50, count: 2 },  // 1%
                ]);
                
                // Generate trend data based on timeRange
                const months = parseInt(timeRange);
                const trendDataArray = [];
                const baseData = [
                    { income: 4500, expenses: 1200 },
                    { income: 4500, expenses: 1350 },
                    { income: 4500, expenses: 1450 },
                    { income: 4500, expenses: 1530 },
                    { income: 4500, expenses: 1620 },
                    { income: 4500, expenses: 1680 },
                ];
                
                for (let i = months - 1; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const monthStr = date.toISOString().slice(0, 7);
                    const dataIndex = (months - 1 - i) % baseData.length;
                    
                    trendDataArray.push({
                        month: monthStr,
                        income: baseData[dataIndex].income,
                        expenses: baseData[dataIndex].expenses,
                    });
                }
                setTrendData(trendDataArray);
            } else {
                const [spending, trends] = await Promise.all([
                    analyticsAPI.getSpending(30),
                    analyticsAPI.getTrends(parseInt(timeRange)),
                ]);
                setSpendingData(spending.data);
                setTrendData(trends.data);
            }
        } catch (error) {
            console.error('Analytics error:', error);
            // Fallback to demo data on error
            setSpendingData([
                { category: 'Food & Dining', total: 643.50, count: 18 },
                { category: 'Bills & Utilities', total: 429.00, count: 8 },
                { category: 'Transportation', total: 370.50, count: 12 },
                { category: 'Shopping', total: 312.00, count: 9 },
                { category: 'Entertainment', total: 175.50, count: 7 },
                { category: 'Personal Care', total: 19.50, count: 2 },
            ]);
            setTrendData([
                { month: '2025-06', income: 4500, expenses: 1200 },
                { month: '2025-07', income: 4500, expenses: 1350 },
                { month: '2025-08', income: 4500, expenses: 1450 },
                { month: '2025-09', income: 4500, expenses: 1530 },
                { month: '2025-10', income: 4500, expenses: 1620 },
                { month: '2025-11', income: 4500, expenses: 1680 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];

    const totalSpending = spendingData.reduce((sum, cat) => sum + cat.total, 0);
    const avgMonthlySpending =
        trendData.length > 0 ? trendData.reduce((sum, month) => sum + month.expenses, 0) / trendData.length : 0;

    const lastMonthExpenses = trendData.length > 0 ? trendData[trendData.length - 1]?.expenses : 0;
    const previousMonthExpenses = trendData.length > 1 ? trendData[trendData.length - 2]?.expenses : 0;
    const monthOverMonthChange =
        previousMonthExpenses > 0 ? ((lastMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 : 0;

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
                    <h1 className="heading-2">Analytics</h1>
                    <p className="text-gray-600 mt-1">Deep insights into your spending patterns</p>
                </div>
                <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="input w-48">
                    <option value="3">Last 3 months</option>
                    <option value="6">Last 6 months</option>
                    <option value="12">Last 12 months</option>
                </select>
            </div>

            {/* Balance Overview Card */}
            <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm mb-2">Total Balance</p>
                        <h2 className="text-5xl font-bold mb-2">$3,492.73</h2>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-blue-100">Monthly Income: $5,000.00</span>
                            <span className="text-blue-100">•</span>
                            <span className="text-blue-100">Monthly Expenses: $1,679.76</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-blue-100 text-sm mb-1">Savings Rate</div>
                        <div className="text-4xl font-bold">66.4%</div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="text-sm text-gray-600">Total Spending (30d)</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">${totalSpending.toFixed(2)}</div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-600">Avg Monthly</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">${avgMonthlySpending.toFixed(2)}</div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className={`w-10 h-10 ${monthOverMonthChange > 0 ? 'bg-red-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}
                        >
                            {monthOverMonthChange > 0 ? (
                                <TrendingUp className="w-5 h-5 text-red-600" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-green-600" />
                            )}
                        </div>
                        <span className="text-sm text-gray-600">Month over Month</span>
                    </div>
                    <div className={`text-3xl font-bold ${monthOverMonthChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {monthOverMonthChange > 0 ? '+' : ''}
                        {monthOverMonthChange.toFixed(1)}%
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="heading-3">Income vs Expenses</h3>
                        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-500">
                            <option>Last 6 months</option>
                            <option>Last 12 months</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
                            <YAxis
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                axisLine={{ stroke: '#E5E7EB' }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} name="Income" />
                            <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 4 }} name="Expenses" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="heading-3">Spending Distribution</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={spendingData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="total"
                                nameKey="category"
                            >
                                {spendingData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => `$${value.toFixed(2)}`}
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card p-6">
                <h3 className="heading-3 mb-6">Category Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transactions</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% of Total</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg per Transaction</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {spendingData.map((category, index) => {
                                const percentage = (category.total / totalSpending) * 100;
                                const avgPerTransaction = category.total / category.count;

                                return (
                                    <tr key={category.category} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="font-medium text-gray-900">{category.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right text-gray-600">{category.count}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">${category.total.toFixed(2)}</td>
                                        <td className="px-4 py-4 text-right text-gray-600">{percentage.toFixed(1)}%</td>
                                        <td className="px-4 py-4 text-right text-gray-600">${avgPerTransaction.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card p-6">
                <h3 className="heading-3 mb-6">Monthly Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
                        <YAxis
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            axisLine={{ stroke: '#E5E7EB' }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        <Bar dataKey="income" fill="#10B981" radius={[8, 8, 0, 0]} name="Income" />
                        <Bar dataKey="expenses" fill="#EF4444" radius={[8, 8, 0, 0]} name="Expenses" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsPage;
