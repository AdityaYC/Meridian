import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Bell,
  AlertCircle,
  Target,
  Calendar,
  Receipt,
  Shield,
  Zap,
} from 'lucide-react';
import { api } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EnhancedDashboard: React.FC = () => {
  const [healthScore, setHealthScore] = useState<any>(null);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        healthRes,
        cashFlowRes,
        notifRes,
        billsRes,
        roadmapRes,
        budgetRes,
      ] = await Promise.all([
        api.get('/financial-health'),
        api.get('/cash-flow/predict?days=30'),
        api.get('/notifications?limit=5'),
        api.get('/bills'),
        api.get('/wealth/roadmap'),
        api.get('/smart-budget'),
      ]);

      setHealthScore(healthRes.data);
      setCashFlow(cashFlowRes.data);
      setNotifications(notifRes.data);
      setUpcomingBills(billsRes.data.filter((b: any) => 
        new Date(b.nextDueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ));
      setRoadmap(roadmapRes.data);
      setBudget(budgetRes.data);
    } catch (error: any) {
      console.error('Load dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cashFlowData = cashFlow?.forecast?.slice(0, 14).map((cf: any) => ({
    date: format(new Date(cf.date), 'MMM d'),
    balance: parseFloat(cf.balance),
  })) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-1">Your complete financial overview powered by AI</p>
        </div>
        <NotificationBell notifications={notifications} />
      </div>

      {/* Financial Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Financial Health Score</h2>
            </div>
            <div className="text-6xl font-bold mb-4">{healthScore?.overallScore || 0}/100</div>
            <p className="text-blue-100">
              {healthScore?.overallScore >= 80 ? 'Excellent!' :
               healthScore?.overallScore >= 60 ? 'Good progress!' :
               'Room for improvement'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            {healthScore?.components && Object.entries(healthScore.components).slice(0, 4).map(([key, value]: [string, any]) => (
              <ScoreCard key={key} title={key} score={value.score} status={value.status} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Alerts & Upcoming Bills */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Critical Alerts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">Attention Needed</h3>
          </div>

          <div className="space-y-3">
            {notifications.filter(n => n.severity === 'critical' || n.severity === 'warning').length === 0 && (
                <p className="text-sm text-gray-500">No critical alerts.</p>
            )}
            {notifications.filter(n => n.severity === 'critical' || n.severity === 'warning').slice(0, 3).map(notif => (
              <NotificationCard key={notif.id} notification={notif} />
            ))}
            {upcomingBills.slice(0, 3).map(bill => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        </motion.div>

        {/* Cash Flow Forecast */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Cash Flow Forecast (Next 2 Weeks)</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'Balance']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={3} dot={false} />
                </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Balance projected to be lowest on {format(new Date(cashFlow?.forecast?.reduce((min: any, curr: any) => parseFloat(curr.balance) < parseFloat(min.balance) ? curr : min, cashFlow.forecast[0])?.date || new Date()), 'MMM d')}.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Wealth Roadmap Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Wealth Building Roadmap</h3>
          </div>
          <span className="text-sm text-gray-600">
            {roadmap.filter(m => m.status === 'completed').length} of {roadmap.length} completed
          </span>
        </div>

        <div className="space-y-4">
          {roadmap.slice(0, 5).map((milestone, index) => (
            <MilestoneCard key={milestone.id} milestone={milestone} index={index} />
          ))}
        </div>
      </motion.div>

      {/* Budget Overview */}
      {budget && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Budget This Month</h3>
            </div>
            <span className={`text-2xl font-bold ${
              parseFloat(budget.percentUsed) > 100 ? 'text-red-600' :
              parseFloat(budget.percentUsed) > 80 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {budget.percentUsed}%
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budget.categories?.slice(0, 6).map((cat: any) => (
              <BudgetCategoryCard key={cat.category} category={cat} />
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 You have ${budget.totalRemaining} left to spend this month. 
              {parseFloat(budget.percentUsed) > 90 && ' Be careful with spending!'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <QuickActionCard
          icon={<Receipt className="w-6 h-6" />}
          title="Scan Receipt"
          description="Add expense via photo"
          onClick={() => toast('Receipt scanning coming soon!')}
        />
        <QuickActionCard
          icon={<Calendar className="w-6 h-6" />}
          title="Pay Bill"
          description="Quick bill payment"
          onClick={() => toast('Bill pay coming soon!')}
        />
        <QuickActionCard
          icon={<Zap className="w-6 h-6" />}
          title="Get Insights"
          description="AI financial analysis"
          onClick={() => toast('Insights coming soon!')}
        />
        <QuickActionCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Invest"
          description="View recommendations"
          onClick={() => window.location.href = '/dashboard/portfolio'}
        />
      </div>
    </div>
  );
};

// Helper Components
const ScoreCard: React.FC<{ title: string; score: number; status: string }> = ({ title, score, status }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
    <p className="text-blue-100 text-xs mb-1 uppercase tracking-wider">{title.replace(/([A-Z])/g, ' $1').replace('Score', '').trim()}</p>
    <p className="text-2xl font-bold">{score}</p>
    <p className="text-blue-200 text-xs mt-1">{status}</p>
  </div>
);

const NotificationCard: React.FC<{ notification: any }> = ({ notification }) => (
  <div className={`p-3 rounded-lg border ${
    notification.severity === 'critical' ? 'bg-red-50 border-red-200' :
    notification.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
    'bg-blue-50 border-blue-200'
  }`}>
    <p className="font-medium text-sm text-gray-900">{notification.title}</p>
    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
  </div>
);

const BillCard: React.FC<{ bill: any }> = ({ bill }) => {
  const daysUntil = Math.ceil((new Date(bill.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm text-gray-900">{bill.name}</p>
          <p className={`text-xs ${daysUntil <= 3 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
          </p>
        </div>
        <p className="text-lg font-bold text-gray-900">${parseFloat(bill.amount).toFixed(2)}</p>
      </div>
    </div>
  );
};

const MilestoneCard: React.FC<{ milestone: any; index: number }> = ({ milestone }) => (
  <div className="relative">
    <div className="flex items-center gap-4">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
        milestone.status === 'completed' ? 'bg-green-500 text-white' :
        milestone.status === 'in_progress' ? 'bg-blue-500 text-white' :
        'bg-gray-200 text-gray-600'
      }`}>
        {milestone.status === 'completed' ? '✓' : milestone.icon}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="font-medium text-gray-900">{milestone.title}</p>
          <p className="text-sm text-gray-600">{Math.min(100, milestone.progress).toFixed(0)}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              milestone.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, milestone.progress)}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          ${milestone.currentAmount?.toLocaleString()} / ${milestone.targetAmount?.toLocaleString()}
        </p>
      </div>
    </div>
  </div>
);

const BudgetCategoryCard: React.FC<{ category: any }> = ({ category }) => (
  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-gray-900 truncate">{category.category}</p>
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
        category.status === 'over' ? 'bg-red-100 text-red-700' :
        category.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
        'bg-green-100 text-green-700'
      }`}>
        {category.percentUsed}%
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
      <div
        className={`h-2 rounded-full ${
          category.status === 'over' ? 'bg-red-500' :
          category.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
        }`}
        style={{ width: `${Math.min(100, parseFloat(category.percentUsed))}%` }}
      />
    </div>
    <div className="flex items-center justify-between text-xs text-gray-600">
      <span>${category.spent.toFixed(0)} spent</span>
      <span>${category.remaining.toFixed(0)} left</span>
    </div>
  </div>
);

const QuickActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group"
  >
    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors text-blue-600">
      {icon}
    </div>
    <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
    <p className="text-sm text-gray-600">{description}</p>
  </button>
);

const NotificationBell: React.FC<{ notifications: any[] }> = ({ notifications }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button className="text-xs text-blue-600 hover:underline">Mark all read</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
              ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                          <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                          {!notif.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedDashboard;
