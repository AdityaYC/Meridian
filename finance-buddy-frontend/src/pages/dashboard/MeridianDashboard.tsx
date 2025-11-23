import React, { useEffect, useState } from 'react';
import {
  TrendingUp, DollarSign, Bell, Target, Calendar, Receipt, Shield, Zap, Sparkles,
  FileText, CreditCard, PieChart as PieChartIcon, Award, TrendingDown, Clock,
  AlertCircle, CheckCircle, ArrowRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ReceiptScanModal from '../../components/modals/ReceiptScanModal';
import BillPayModal from '../../components/modals/BillPayModal';
import TaxInsightsModal from '../../components/modals/TaxInsightsModal';

type TabType = 'overview' | 'reports' | 'debt' | 'rebalance' | 'credit' | 'retirement';

const MeridianDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [healthScore, setHealthScore] = useState<any>(null);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await Promise.allSettled([
        api.get('/financial-health').catch(() => null),
        api.get('/cash-flow/predict?days=30').catch(() => null),
        api.get('/notifications?limit=5').catch(() => null),
        api.get('/bills').catch(() => null),
        api.get('/wealth/roadmap').catch(() => null),
        api.get('/smart-budget').catch(() => null),
      ]);
      if (results[0].status === 'fulfilled' && results[0].value) setHealthScore(results[0].value.data);
      if (results[1].status === 'fulfilled' && results[1].value) setCashFlow(results[1].value.data);
      if (results[2].status === 'fulfilled' && results[2].value) setNotifications(results[2].value.data);
      if (results[3].status === 'fulfilled' && results[3].value) setBills(results[3].value.data);
      if (results[4].status === 'fulfilled' && results[4].value) setRoadmap(results[4].value.data);
      if (results[5].status === 'fulfilled' && results[5].value) setBudget(results[5].value.data);
    } catch (error: any) {
      setError('Some features could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Sparkles },
    { id: 'reports' as const, label: 'AI Reports', icon: FileText },
    { id: 'debt' as const, label: 'Debt Payoff', icon: CreditCard },
    { id: 'rebalance' as const, label: 'Rebalance', icon: PieChartIcon },
    { id: 'credit' as const, label: 'Credit Score', icon: Award },
    { id: 'retirement' as const, label: 'Retirement', icon: Target },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Meridian Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Meridian Dashboard</h1>
          </div>
          <p className="text-gray-600 mt-1">Advanced AI-powered financial insights</p>
        </div>
        <button onClick={loadDashboardData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Refresh Data
        </button>
      </div>

      {error && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"><p className="text-sm text-yellow-800">{error}</p></div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'overview' && <OverviewTab healthScore={healthScore} cashFlow={cashFlow} notifications={notifications} bills={bills} roadmap={roadmap} budget={budget} onOpenReceiptModal={() => setShowReceiptModal(true)} onOpenBillModal={() => setShowBillModal(true)} onOpenTaxModal={() => setShowTaxModal(true)} />}
      {activeTab === 'reports' && <WeeklyReportsTab />}
      {activeTab === 'debt' && <DebtPayoffTab />}
      {activeTab === 'rebalance' && <RebalancingTab />}
      {activeTab === 'credit' && <CreditScoreTab />}
      {activeTab === 'retirement' && <RetirementTab />}

      <ReceiptScanModal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} onSuccess={loadDashboardData} />
      <BillPayModal isOpen={showBillModal} onClose={() => setShowBillModal(false)} onSuccess={loadDashboardData} />
      <TaxInsightsModal isOpen={showTaxModal} onClose={() => setShowTaxModal(false)} />
    </div>
  );
};

const OverviewTab: React.FC<any> = ({ healthScore, cashFlow, notifications, bills, roadmap, budget, onOpenReceiptModal, onOpenBillModal, onOpenTaxModal }) => {
  const upcomingBills = bills.filter((b: any) => b.nextDueDate && new Date(b.nextDueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const cashFlowData = cashFlow?.forecast?.slice(0, 14).map((cf: any) => ({ date: format(new Date(cf.date), 'MMM d'), balance: parseFloat(cf.balance) })) || [];

  return (
    <div className="space-y-6">
      {healthScore && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2"><Shield className="w-8 h-8" /><h2 className="text-2xl font-bold">Financial Health Score</h2></div>
              <div className="text-6xl font-bold mb-4">{healthScore?.overallScore || 0}/100</div>
              <p className="text-blue-100">{healthScore?.overallScore >= 80 ? 'Excellent!' : healthScore?.overallScore >= 60 ? 'Good progress!' : 'Room for improvement'}</p>
            </div>
            {healthScore?.components && (
              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                {Object.entries(healthScore.components).slice(0, 4).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-blue-100 text-xs mb-1 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').replace('Score', '').trim()}</p>
                    <p className="text-2xl font-bold">{value.score}</p>
                    <p className="text-blue-200 text-xs mt-1">{value.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {notifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4"><Bell className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Recent Notifications</h3></div>
            <div className="space-y-3">
              {notifications.slice(0, 5).map(notif => (
                <div key={notif.id} className={`p-3 rounded-lg border ${notif.severity === 'critical' ? 'bg-red-50 border-red-200' : notif.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                  <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {bills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4"><Calendar className="w-5 h-5 text-green-600" /><h3 className="font-semibold text-gray-900">Upcoming Bills</h3></div>
            <div className="space-y-3">
              {upcomingBills.slice(0, 5).map(bill => {
                const daysUntil = Math.ceil((new Date(bill.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={bill.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{bill.name}</p>
                        <p className={`text-xs ${daysUntil <= 3 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">${parseFloat(bill.amount).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {cashFlow && cashFlowData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Cash Flow Forecast</h3></div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => [`$${value.toFixed(2)}`, 'Balance']} />
                <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <button onClick={onOpenReceiptModal} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-100"><Receipt className="w-6 h-6" /></div>
          <h4 className="font-semibold text-gray-900 mb-1">Scan Receipt</h4>
          <p className="text-sm text-gray-600">Add expense via photo</p>
        </button>
        <button onClick={onOpenBillModal} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group">
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 text-green-600 group-hover:bg-green-100"><Calendar className="w-6 h-6" /></div>
          <h4 className="font-semibold text-gray-900 mb-1">Add Bill</h4>
          <p className="text-sm text-gray-600">Track recurring payments</p>
        </button>
        <button onClick={onOpenTaxModal} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group">
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 text-purple-600 group-hover:bg-purple-100"><Zap className="w-6 h-6" /></div>
          <h4 className="font-semibold text-gray-900 mb-1">Tax Insights</h4>
          <p className="text-sm text-gray-600">View deductions</p>
        </button>
        <button onClick={() => window.location.href = '/dashboard/trading'} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group">
          <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4 text-orange-600 group-hover:bg-orange-100"><TrendingUp className="w-6 h-6" /></div>
          <h4 className="font-semibold text-gray-900 mb-1">Trade Stocks</h4>
          <p className="text-sm text-gray-600">Real-time trading</p>
        </button>
      </div>
    </div>
  );
};

// ============ WEEKLY REPORTS TAB ============
const WeeklyReportsTab: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data } = await api.get('/premium/reports/weekly');
      setReports(data);
    } catch (error) {
      console.error('Load reports error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      const toastId = toast.loading('Generating your weekly report...');
      await api.post('/premium/reports/weekly/generate');
      toast.success('Report generated!', { id: toastId });
      loadReports();
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Financial Reports</h2>
          <p className="text-gray-600 mt-1">Weekly personalized financial digest</p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports yet</h3>
          <p className="text-gray-600 mb-6">Generate your first AI-powered financial digest</p>
          <button
            onClick={generateReport}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Report
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Week of {new Date(report.weekStart).toLocaleDateString()}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Net Worth: ${parseFloat(report.netWorth).toFixed(2)}{' '}
                    <span className={parseFloat(report.netWorthChange) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ({parseFloat(report.netWorthChange) >= 0 ? '+' : ''}${parseFloat(report.netWorthChange).toFixed(2)})
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">🎯 Highlights</h4>
                  <ul className="space-y-1">
                    {report.highlights.map((h: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700">• {h}</li>
                    ))}
                  </ul>
                </div>
                {report.warnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">⚠️ Warnings</h4>
                    <ul className="space-y-1">
                      {report.warnings.map((w: string, i: number) => (
                        <li key={i} className="text-sm text-red-600">• {w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ DEBT PAYOFF TAB ============
const DebtPayoffTab: React.FC = () => {
  const [debts, setDebts] = useState<any[]>([]);
  const [monthlyPayment, setMonthlyPayment] = useState(500);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const { data } = await api.get('/premium/debt/accounts');
      setDebts(data);
      if (data.length > 0) {
        calculatePlan(500);
      }
    } catch (error) {
      console.error('Load debts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePlan = async (payment: number) => {
    try {
      const { data } = await api.post('/premium/debt/payoff-plan', {
        monthlyPayment: payment,
        strategy: 'avalanche',
      });
      setPlan(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to calculate plan');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (debts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No debt accounts</h3>
        <p className="text-gray-600">You're debt-free! 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Debt Destruction Plan</h2>
        <p className="text-gray-600 mt-1">Accelerate your path to becoming debt-free</p>
      </div>

      {plan && (
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-6 text-white">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-red-100 text-sm mb-1">Total Debt</p>
              <p className="text-4xl font-bold">${plan.totalDebt}</p>
            </div>
            <div>
              <p className="text-red-100 text-sm mb-1">Payoff Time</p>
              <p className="text-4xl font-bold">{plan.payoffMonths} mo</p>
            </div>
            <div>
              <p className="text-red-100 text-sm mb-1">Total Interest</p>
              <p className="text-4xl font-bold">${plan.totalInterest}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Monthly Payment</h3>
        <input
          type="range"
          min="200"
          max="2000"
          step="50"
          value={monthlyPayment}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setMonthlyPayment(val);
            calculatePlan(val);
          }}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
          <span>$200</span>
          <span className="text-2xl font-bold text-blue-600">${monthlyPayment}</span>
          <span>$2,000</span>
        </div>
      </div>
    </div>
  );
};

// ============ REBALANCING TAB ============
const RebalancingTab: React.FC = () => {
  const [check, setCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheck();
  }, []);

  const loadCheck = async () => {
    try {
      const { data } = await api.get('/premium/rebalancing/check');
      setCheck(data);
    } catch (error) {
      console.error('Load check error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Portfolio Rebalancing</h2>
        <p className="text-gray-600 mt-1">Keep your investments aligned with your goals</p>
      </div>

      {check?.needsRebalancing ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Rebalancing Recommended</h3>
          </div>
          <p className="text-gray-700">Your portfolio has drifted from your target allocation.</p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Portfolio Balanced</h3>
          </div>
          <p className="text-gray-700">Your portfolio is within target allocation.</p>
        </div>
      )}

      {check?.deviations && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Allocation Status</h3>
          <div className="space-y-3">
            {check.deviations.map((dev: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{dev.assetType}</span>
                <div className="text-right">
                  <span className="text-sm text-gray-600">
                    {dev.current}% / {dev.target}% target
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ CREDIT SCORE TAB ============
const CreditScoreTab: React.FC = () => {
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScore();
  }, []);

  const loadScore = async () => {
    try {
      const { data } = await api.get('/premium/credit/score');
      setScore(data);
    } catch (error) {
      console.error('Load score error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Credit Score Monitoring</h2>
        <p className="text-gray-600 mt-1">Track and improve your credit health</p>
      </div>

      {score && (
        <>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-8 text-white text-center">
            <p className="text-purple-100 text-sm mb-2">Your Credit Score</p>
            <p className="text-7xl font-bold mb-2">{score.score}</p>
            <p className="text-purple-100">
              {score.score >= 750 ? 'Excellent' : score.score >= 700 ? 'Good' : score.score >= 650 ? 'Fair' : 'Needs Improvement'}
            </p>
          </div>

          {score.recommendations && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-3">
                {score.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-blue-600 mb-2">{rec.impact}</p>
                    <p className="text-sm text-gray-700">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ============ RETIREMENT TAB ============
const RetirementTab: React.FC = () => {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 500,
  });

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const { data } = await api.get('/premium/retirement/plan');
      if (data) {
        setPlan(data);
        setFormData({
          currentAge: data.currentAge,
          retirementAge: data.retirementAge,
          currentSavings: data.currentSavings,
          monthlyContribution: data.monthlyContribution,
        });
      }
    } catch (error) {
      console.error('Load plan error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePlan = async () => {
    try {
      const { data } = await api.post('/premium/retirement/plan', formData);
      setPlan(data);
      toast.success('Retirement plan updated!');
    } catch (error) {
      toast.error('Failed to calculate plan');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Retirement Calculator</h2>
        <p className="text-gray-600 mt-1">Plan your financial future</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Your Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Age</label>
              <input
                type="number"
                value={formData.currentAge}
                onChange={(e) => setFormData({ ...formData, currentAge: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Retirement Age</label>
              <input
                type="number"
                value={formData.retirementAge}
                onChange={(e) => setFormData({ ...formData, retirementAge: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Savings</label>
              <input
                type="number"
                value={formData.currentSavings}
                onChange={(e) => setFormData({ ...formData, currentSavings: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Contribution</label>
              <input
                type="number"
                value={formData.monthlyContribution}
                onChange={(e) => setFormData({ ...formData, monthlyContribution: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              onClick={calculatePlan}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Calculate Plan
            </button>
          </div>
        </div>

        {plan && (
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-6">Projected Retirement</h3>
            <div className="space-y-4">
              <div>
                <p className="text-green-100 text-sm mb-1">Years to Retirement</p>
                <p className="text-3xl font-bold">{plan.yearsToRetirement} years</p>
              </div>
              <div>
                <p className="text-green-100 text-sm mb-1">Projected Value</p>
                <p className="text-3xl font-bold">${plan.projectedValue?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-green-100 text-sm mb-1">Monthly Income</p>
                <p className="text-3xl font-bold">${plan.monthlyIncome?.toLocaleString()}</p>
              </div>
              <div className={`p-4 rounded-lg ${plan.isOnTrack ? 'bg-green-700' : 'bg-red-500'}`}>
                <p className="font-semibold">
                  {plan.isOnTrack ? '✓ On Track!' : '⚠️ Needs Adjustment'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeridianDashboard;
