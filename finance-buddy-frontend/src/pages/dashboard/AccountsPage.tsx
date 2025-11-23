import React, { useEffect, useState } from 'react';
import { RefreshCw, Trash2, ExternalLink, CreditCard } from 'lucide-react';
import TellerConnectButton from '../../components/teller/TellerConnect';
import { tellerAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AccountsPage: React.FC = () => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [useDemo] = useState(true); // Use demo data

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            
            if (useDemo) {
                // Demo data matching DashboardPage
                setAccounts([
                    { 
                        id: '1', 
                        account_name: 'Chase Checking',
                        accountName: 'Chase Checking',
                        account_type: 'depository',
                        balance_available: 1847.23,
                        balance_current: 1847.23,
                        institution_name: 'Chase',
                        last_four: '4523',
                        enrollment_id: 'demo1',
                        status: 'connected',
                        last_synced_at: new Date().toISOString()
                    },
                    { 
                        id: '2', 
                        account_name: 'Chase Savings',
                        accountName: 'Chase Savings',
                        account_type: 'depository',
                        balance_available: 1245.50,
                        balance_current: 1245.50,
                        institution_name: 'Chase',
                        last_four: '7891',
                        enrollment_id: 'demo2',
                        status: 'connected',
                        last_synced_at: new Date().toISOString()
                    },
                    { 
                        id: '3', 
                        account_name: 'Capital One Credit Card',
                        accountName: 'Capital One Credit Card',
                        account_type: 'credit',
                        balance_available: -400.00,
                        balance_current: -400.00,
                        institution_name: 'Capital One',
                        last_four: '3456',
                        enrollment_id: 'demo3',
                        status: 'connected',
                        last_synced_at: new Date().toISOString()
                    },
                ]);
            } else {
                const { data } = await tellerAPI.getAccounts();
                setAccounts(data);
            }
        } catch (error: any) {
            console.error('Load accounts error:', error);
            toast.error('Failed to load accounts');
        } finally {
            setLoading(false);
        }
    };

    const handleTellerSuccess = async () => {
        // The TellerConnectButton now handles the saving and toast.
        // We just need to reload the accounts.
        loadAccounts();
    };

    const handleSync = async (accountId: string) => {
        try {
            setSyncing(accountId);
            const { data } = await tellerAPI.syncAccount(accountId);

            toast.success(
                `Synced! ${data.newTransactions} new transactions found.`
            );

            loadAccounts();
        } catch (error: any) {
            toast.error('Failed to sync account');
        } finally {
            setSyncing(null);
        }
    };

    const handleDelete = async (accountId: string) => {
        if (!confirm('Are you sure you want to disconnect this account?')) return;

        try {
            await tellerAPI.deleteAccount(accountId);
            toast.success('Account disconnected');
            loadAccounts();
        } catch (error) {
            toast.error('Failed to disconnect account');
        }
    };

    const totalBalance = accounts.reduce((sum, acc) => {
        const balance = parseFloat(acc.balance_available) || 0;
        // For credit cards, use absolute value to show total assets
        return sum + (acc.account_type === 'credit' ? Math.abs(balance) : balance);
    }, 0);

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
                    <h1 className="heading-2">Accounts</h1>
                    <p className="text-gray-600 mt-1">Manage your connected bank accounts</p>
                </div>
                <TellerConnectButton onSuccess={handleTellerSuccess} />
            </div>

            {/* Total Balance Card */}
            <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-primary-100 text-sm mb-2">Total Balance</p>
                        <h2 className="text-5xl font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
                        <p className="text-primary-100 text-sm mt-2">
                            Across {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
                        </p>
                    </div>
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                        <CreditCard className="w-10 h-10" />
                    </div>
                </div>
            </div>

            {/* Accounts List */}
            {accounts.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="text-4xl">🏦</div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No accounts connected</h3>
                    <p className="text-gray-600 mb-6">Connect your bank account to start tracking your finances</p>
                    <TellerConnectButton onSuccess={handleTellerSuccess} />
                </div>
            ) : (
                <div className="grid gap-4">
                    {accounts.map((account) => (
                        <div key={account.id} className="card p-6 hover:shadow-medium transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                                        {getAccountIcon(account.account_type)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">{account.account_name}</h3>
                                        <p className="text-sm text-gray-600">{account.institution_name}</p>
                                        {account.last_four && (
                                            <p className="text-xs text-gray-500 mt-1">•••• {account.last_four}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        ${parseFloat(account.balance_available).toFixed(2)}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Available</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                                <div className="flex items-center gap-4">
                                    <span className="badge bg-green-100 text-green-700">{account.status}</span>
                                    <span className="text-xs text-gray-500">
                                        Last synced: {format(new Date(account.last_synced_at), 'MMM d, h:mm a')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleSync(account.id)}
                                        disabled={syncing === account.id}
                                        className="btn-ghost text-sm inline-flex items-center gap-2"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${syncing === account.id ? 'animate-spin' : ''}`} />
                                        Sync
                                    </button>
                                    <button
                                        onClick={() => handleDelete(account.id)}
                                        className="btn-ghost text-sm text-red-600 hover:bg-red-50 inline-flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Card */}
            <div className="card p-6 bg-blue-50 border-blue-200">
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Secure Banking Connection</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Your bank credentials are encrypted and never stored on our servers. We use Teller's bank-level security.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getAccountIcon = (type: string) => {
    const icons: any = {
        checking: '🏦',
        savings: '💰',
        depository: '🏦',
        credit_card: '💳',
        credit: '💳',
    };
    return icons[type] || '💼';
};

export default AccountsPage;
