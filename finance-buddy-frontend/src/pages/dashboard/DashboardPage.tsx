import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { tellerAPI, transactionAPI, analyticsAPI } from '../../lib/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import TellerConnectButton from '../../components/teller/TellerConnect';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0,
    });
    const [accounts, setAccounts] = useState<any[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [spendingData, setSpendingData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [accountsRes, transactionsRes, spendingRes, trendsRes] = await Promise.all([
                tellerAPI.getAccounts(),
                transactionAPI.getAll({ limit: 10 }),
                analyticsAPI.getSpending(30),
                analyticsAPI.getTrends(6),
            ]);

            setAccounts(accountsRes.data);
            setRecentTransactions(transactionsRes.data);
            setSpendingData(spendingRes.data);
            setTrendData(trendsRes.data);

            // Calculate stats
            const totalBalance = accountsRes.data.reduce((sum: number, acc: any) => {
                const balance = acc.balance_available || acc.available || 0;
                return sum + balance;
            }, 0);
            const monthlyExpenses = spendingRes.data.reduce((sum: number, cat: any) => sum + cat.total, 0);

            setStats({
                totalBalance,
                monthlyIncome: 5000, // Calculate from income transactions
                monthlyExpenses,
                savingsRate: totalBalance > 0 ? ((5000 - monthlyExpenses) / 5000) * 100 : 0,
            });
        } catch (error) {
            console.error('Dashboard load error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="heading-2">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
                </div>
                <TellerConnectButton onSuccess={loadDashboardData} />
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Balance"
                    value={`$${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    change={+12.5}
                    icon={<DollarSign className="w-5 h-5" />}
                />
                <StatCard
                    title="Monthly Income"
                    value={`$${stats.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    change={+8.2}
                    icon={<TrendingUp className="w-5 h-5" />}
                />
                <StatCard
                    title="Monthly Expenses"
                    value={`$${stats.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    change={-3.1}
                    icon={<TrendingDown className="w-5 h-5" />}
                />
                <StatCard
                    title="Savings Rate"
                    value={`${stats.savingsRate.toFixed(1)}%`}
                    change={+5.3}
                    icon={<CreditCard className="w-5 h-5" />}
                />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Spending Trend */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="heading-3">Spending Trend</h3>
                        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-500">
                            <option>Last 6 months</option>
                            <option>Last 12 months</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="expenses"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fill="url(#expenses)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Spending by Category */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="heading-3">Spending by Category</h3>
                        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-500">
                            <option>This month</option>
                            <option>Last month</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={spendingData}>
                            <XAxis
                                dataKey="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                }}
                            />
                            <Bar dataKey="total" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Accounts */}
                <div className="lg:col-span-2 card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="heading-3">Accounts</h3>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            View all
                        </button>
                    </div>
                    <div className="space-y-3">
                        {accounts.slice(0, 4).map((account) => (
                            <AccountRow key={account.id} account={account} />
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="heading-3">Recent</h3>
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            View all
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentTransactions.slice(0, 5).map((transaction) => (
                            <TransactionRow key={transaction.id} transaction={transaction} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard: React.FC<{
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
}> = ({ title, value, change, icon }) => {
    const isPositive = change > 0;

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">{title}</span>
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
            <div className="flex items-center gap-1 text-sm">
                {isPositive ? (
                    <>
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">{change}%</span>
                    </>
                ) : (
                    <>
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 font-medium">{Math.abs(change)}%</span>
                    </>
                )}
                <span className="text-gray-500">vs last month</span>
            </div>
        </div>
    );
};

// Account Row Component
const AccountRow: React.FC<{ account: any }> = ({ account }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                    <div className="font-medium text-gray-900">{account.accountName}</div>
                    <div className="text-sm text-gray-500">{account.institutionName}</div>
                </div>
            </div>
            <div className="text-right">
                <div className="font-semibold text-gray-900">
                    ${(account.balance_available || account.available || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-500">{account.account_type || account.accountType}</div>
            </div>
        </div>
    );
};

// Transaction Row Component
const TransactionRow: React.FC<{ transaction: any }> = ({ transaction }) => {
    const isExpense = transaction.type === 'debit';

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div
                    className={`w-2 h-2 rounded-full ${isExpense ? 'bg-red-500' : 'bg-green-500'
                        }`}
                />
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {transaction.merchantName || transaction.description}
                    </div>
                    <div className="text-xs text-gray-500">{transaction.category}</div>
                </div>
            </div>
            <div className={`text-sm font-semibold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                {isExpense ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
            </div>
        </div>
    );
};

export default DashboardPage;
