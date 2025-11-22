import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, ExternalLink, CreditCard, Trash2 } from 'lucide-react';
import { tellerAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AccountsPage: React.FC = () => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState<string | null>(null);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            const { data } = await tellerAPI.getAccounts();
            setAccounts(data);
        } catch (error) {
            console.error('Load accounts error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectAccount = async () => {
        try {
            const { data } = await tellerAPI.getConnectUrl();
            window.open(data.connectUrl, '_blank', 'width=500,height=700');
            toast.success('Follow the prompts to connect your account');
        } catch (error) {
            toast.error('Failed to initiate connection');
        }
    };

    const handleSync = async (accountId: string) => {
        try {
            setSyncing(accountId);
            await tellerAPI.syncAccount(accountId);
            toast.success('Account synced successfully');
            loadAccounts();
        } catch (error) {
            toast.error('Failed to sync account');
        } finally {
            setSyncing(null);
        }
    };

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.available, 0);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="heading-2">Accounts</h1>
                    <p className="text-gray-600 mt-1">Manage your connected bank accounts</p>
                </div>
                <button onClick={handleConnectAccount} className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Connect Account
                </button>
            </div>

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

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : accounts.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No accounts connected</h3>
                    <p className="text-gray-600 mb-6">Connect your first bank account to start tracking your finances</p>
                    <button onClick={handleConnectAccount} className="btn-primary inline-flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Connect Account
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {accounts.map((account) => (
                        <AccountCard key={account.id} account={account} onSync={handleSync} syncing={syncing === account.id} />
                    ))}
                </div>
            )}

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
                            Your bank credentials are encrypted and never stored on our servers. We use Teller's bank-level security to keep
                            your financial data safe.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AccountCard: React.FC<{ account: any; onSync: (id: string) => void; syncing: boolean }> = ({
    account,
    onSync,
    syncing,
}) => {
    const getAccountIcon = (type: string) => {
        const icons: any = {
            checking: '🏦',
            savings: '💰',
            credit_card: '💳',
            credit: '💳',
        };
        return icons[type] || '💼';
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            active: 'bg-green-100 text-green-700',
            disconnected: 'bg-red-100 text-red-700',
            reauth_required: 'bg-yellow-100 text-yellow-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="card p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                        {getAccountIcon(account.accountType)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{account.accountName}</h3>
                        <p className="text-sm text-gray-600">{account.institutionName}</p>
                        {account.accountNumber && <p className="text-xs text-gray-500 mt-1">•••• {account.accountNumber}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                        ${account.available.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Available</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                    <span className={`badge ${getStatusColor(account.status)}`}>{account.status.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-500">
                        Last synced: {format(new Date(account.lastSyncedAt), 'MMM d, h:mm a')}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onSync(account.id)}
                        disabled={syncing}
                        className="btn-ghost text-sm inline-flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync'}
                    </button>
                    <button className="btn-ghost text-sm text-red-600 hover:bg-red-50 inline-flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Remove
                    </button>
                </div>
            </div>

            {account.accountType === 'credit' && account.limit && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Credit Limit</span>
                        <span className="font-semibold text-gray-900">
                            ${account.limit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600">Available Credit</span>
                        <span className="font-semibold text-gray-900">
                            ${(account.limit - Math.abs(account.current)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsPage;
