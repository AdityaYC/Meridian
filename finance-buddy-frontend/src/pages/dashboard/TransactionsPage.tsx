import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, Calendar } from 'lucide-react';
import { transactionAPI } from '../../lib/api';
import { format } from 'date-fns';

const TransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const { data } = await transactionAPI.getAll({ limit: 100 });
            setTransactions(data);
        } catch (error) {
            console.error('Load transactions error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter((t) => {
        const matchesSearch =
            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.merchantName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set(transactions.map((t) => t.category).filter(Boolean))];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="heading-2">Transactions</h1>
                    <p className="text-gray-600 mt-1">View and manage all your transactions</p>
                </div>
                <button className="btn-secondary inline-flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search transactions..."
                            className="input pl-10"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input md:w-48"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'All Categories' : cat}
                            </option>
                        ))}
                    </select>

                    {/* Date Range */}
                    <button className="btn-secondary inline-flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Date Range
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Account
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {format(new Date(transaction.date), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {transaction.merchantName || transaction.description}
                                            </div>
                                            {transaction.merchantName && (
                                                <div className="text-sm text-gray-500">{transaction.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {transaction.category && (
                                                <span className="badge-primary">{transaction.category}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {transaction.bankAccount?.accountName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span
                                                className={`text-sm font-semibold ${transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'
                                                    }`}
                                            >
                                                {transaction.type === 'debit' ? '-' : '+'}$
                                                {Math.abs(transaction.amount).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span
                                                className={`badge ${transaction.status === 'posted' ? 'badge-success' : 'badge-warning'
                                                    }`}
                                            >
                                                {transaction.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredTransactions.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No transactions found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
