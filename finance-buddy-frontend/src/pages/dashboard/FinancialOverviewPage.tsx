import React, { useState } from 'react';
import TransactionsPage from './TransactionsPage';
import BudgetsPage from './BudgetsPage';
import AnalyticsPage from './AnalyticsPage';
import { LayoutDashboard, Receipt, PieChart } from 'lucide-react';

type Tab = 'transactions' | 'budgets' | 'analytics';

const FinancialOverviewPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('transactions');

    const tabs = [
        { id: 'transactions', label: 'Transactions', icon: Receipt },
        { id: 'budgets', label: 'Budgets', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: PieChart },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="heading-2">Financial Overview</h1>
                <p className="text-gray-600 mt-1">Manage your transactions, budgets, and view analytics</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`
                                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                                    ${activeTab === tab.id
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <Icon
                                    className={`
                                        -ml-0.5 mr-2 h-5 w-5
                                        ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                                    `}
                                />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'transactions' && <TransactionsPage />}
                {activeTab === 'budgets' && <BudgetsPage />}
                {activeTab === 'analytics' && <AnalyticsPage />}
            </div>
        </div>
    );
};

export default FinancialOverviewPage;
