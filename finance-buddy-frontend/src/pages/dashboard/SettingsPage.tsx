import React, { useState } from 'react';
import {
    User,
    Lock,
    CreditCard,
    Bell,
    Palette,
    Download,
    Trash2,
    Globe,
    Bot,
    Shield,
    HelpCircle,
    ChevronRight,
    Moon,
    Sun,
    Monitor,
    Eye,
    EyeOff,
    Camera,
    LogOut,
    Smartphone,
    Mail,
    Save,
    AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'security' | 'accounts' | 'notifications' | 'ai' | 'appearance' | 'privacy' | 'help';

const SettingsPage: React.FC = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

    const tabs = [
        { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
        { id: 'security' as SettingsTab, label: 'Security & Privacy', icon: Shield },
        { id: 'accounts' as SettingsTab, label: 'Connected Accounts', icon: CreditCard },
        { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
        { id: 'ai' as SettingsTab, label: 'AI Banker', icon: Bot },
        { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette },
        { id: 'privacy' as SettingsTab, label: 'Data & Privacy', icon: Lock },
        { id: 'help' as SettingsTab, label: 'Help & Support', icon: HelpCircle },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="heading-2">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="card p-2 space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                                        ? 'bg-primary-50 text-primary-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm">{tab.label}</span>
                                    <ChevronRight className={`w-4 h-4 ml-auto ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {activeTab === 'profile' && <ProfileSettings />}
                    {activeTab === 'security' && <SecuritySettings />}
                    {activeTab === 'accounts' && <ConnectedAccountsSettings />}
                    {activeTab === 'notifications' && <NotificationSettings />}
                    {activeTab === 'ai' && <AIBankerSettings />}
                    {activeTab === 'appearance' && <AppearanceSettings />}
                    {activeTab === 'privacy' && <PrivacySettings />}
                    {activeTab === 'help' && <HelpSettings />}
                </div>
            </div>
        </div>
    );
};

// Profile Settings Component
const ProfileSettings: React.FC = () => {
    const { user } = useAuthStore();
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '',
        dateOfBirth: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            // TODO: Call API to update profile
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

                {/* Profile Photo */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                            {formData.firstName?.[0] || 'U'}
                        </div>
                        <div>
                            <button className="btn-secondary text-sm inline-flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                Change Photo
                            </button>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="label-text block mb-2">First Name</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="label-text block mb-2">Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="label-text block mb-2">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="label-text block mb-2">Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    <div>
                        <label className="label-text block mb-2">Date of Birth</label>
                        <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="label-text block mb-2">Address</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="input"
                            placeholder="123 Main St, City, State"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} disabled={loading} className="btn-primary inline-flex items-center gap-2">
                        {loading ? (
                            <>Saving...</>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Security Settings Component
const SecuritySettings: React.FC = () => {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    const handleChangePassword = async () => {
        if (passwordData.new !== passwordData.confirm) {
            toast.error('New passwords do not match');
            return;
        }

        try {
            // TODO: Call API
            toast.success('Password changed successfully');
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error('Failed to change password');
        }
    };

    return (
        <div className="space-y-6">
            {/* Change Password */}
            <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>

                <div className="space-y-4">
                    <div>
                        <label className="label-text block mb-2">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={passwordData.current}
                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                className="input pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="label-text block mb-2">New Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="label-text block mb-2">Confirm New Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            className="input"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <button onClick={handleChangePassword} className="btn-primary">
                        Update Password
                    </button>
                </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
                        <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={twoFactorEnabled}
                            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                </div>

                {twoFactorEnabled && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Two-factor authentication is enabled. You'll need to enter a code from your authenticator app when you
                            sign in.
                        </p>
                    </div>
                )}
            </div>

            {/* Active Sessions */}
            <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Sessions</h2>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-gray-600" />
                            <div>
                                <p className="font-medium text-gray-900">Chrome on Mac</p>
                                <p className="text-sm text-gray-500">Madison, WI • Current session</p>
                            </div>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Active now</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Connected Accounts Settings
const ConnectedAccountsSettings: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Connected Bank Accounts</h2>
                        <p className="text-sm text-gray-600 mt-1">Manage your linked financial accounts</p>
                    </div>
                    <button className="btn-primary">+ Add Account</button>
                </div>

                <p className="text-sm text-gray-500">Go to the Accounts page to manage your connected bank accounts.</p>
            </div>
        </div>
    );
};

// Notification Settings
const NotificationSettings: React.FC = () => {
    const [notifications, setNotifications] = useState({
        email: {
            transactions: true,
            budgetAlerts: true,
            weeklyReport: true,
            monthlyReport: true,
        },
        push: {
            transactions: true,
            budgetAlerts: true,
            largeTransactions: true,
            billReminders: true,
        },
    });

    const toggleNotification = (type: 'email' | 'push', key: string) => {
        setNotifications({
            ...notifications,
            [type]: {
                ...notifications[type],
                [key]: !(notifications[type] as any)[key],
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Email Notifications */}
            <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
                </div>

                <div className="space-y-4">
                    <NotificationToggle
                        label="Transaction alerts"
                        description="Get notified when money moves in or out"
                        checked={notifications.email.transactions}
                        onChange={() => toggleNotification('email', 'transactions')}
                    />
                    <NotificationToggle
                        label="Budget alerts"
                        description="When you reach 80%, 90%, or 100% of budget"
                        checked={notifications.email.budgetAlerts}
                        onChange={() => toggleNotification('email', 'budgetAlerts')}
                    />
                    <NotificationToggle
                        label="Weekly summary"
                        description="Your weekly spending and income report"
                        checked={notifications.email.weeklyReport}
                        onChange={() => toggleNotification('email', 'weeklyReport')}
                    />
                    <NotificationToggle
                        label="Monthly summary"
                        description="Your monthly financial overview"
                        checked={notifications.email.monthlyReport}
                        onChange={() => toggleNotification('email', 'monthlyReport')}
                    />
                </div>
            </div>

            {/* Push Notifications */}
            <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Push Notifications</h2>
                </div>

                <div className="space-y-4">
                    <NotificationToggle
                        label="All transactions"
                        description="Real-time alerts for every transaction"
                        checked={notifications.push.transactions}
                        onChange={() => toggleNotification('push', 'transactions')}
                    />
                    <NotificationToggle
                        label="Budget alerts"
                        description="When approaching or exceeding budgets"
                        checked={notifications.push.budgetAlerts}
                        onChange={() => toggleNotification('push', 'budgetAlerts')}
                    />
                    <NotificationToggle
                        label="Large transactions"
                        description="Transactions over $500"
                        checked={notifications.push.largeTransactions}
                        onChange={() => toggleNotification('push', 'largeTransactions')}
                    />
                    <NotificationToggle
                        label="Bill reminders"
                        description="3 days before bills are due"
                        checked={notifications.push.billReminders}
                        onChange={() => toggleNotification('push', 'billReminders')}
                    />
                </div>
            </div>
        </div>
    );
};

// AI Banker Settings
const AIBankerSettings: React.FC = () => {
    const [aiSettings, setAiSettings] = useState({
        enabled: true,
        saveConversations: true,
        voiceEnabled: true,
        autoGreet: true,
    });

    return (
        <div className="space-y-6">
            <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Bot className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">AI Banker (Michael)</h2>
                </div>

                <div className="space-y-4">
                    <NotificationToggle
                        label="Enable AI Banker"
                        description="Allow Michael to provide personalized financial advice"
                        checked={aiSettings.enabled}
                        onChange={() => setAiSettings({ ...aiSettings, enabled: !aiSettings.enabled })}
                    />
                    <NotificationToggle
                        label="Save conversation history"
                        description="Keep a record of your conversations with Michael"
                        checked={aiSettings.saveConversations}
                        onChange={() => setAiSettings({ ...aiSettings, saveConversations: !aiSettings.saveConversations })}
                    />
                    <NotificationToggle
                        label="Voice interactions"
                        description="Enable voice conversations with Michael"
                        checked={aiSettings.voiceEnabled}
                        onChange={() => setAiSettings({ ...aiSettings, voiceEnabled: !aiSettings.voiceEnabled })}
                    />
                    <NotificationToggle
                        label="Auto-greet"
                        description="Michael greets you when you start a session"
                        checked={aiSettings.autoGreet}
                        onChange={() => setAiSettings({ ...aiSettings, autoGreet: !aiSettings.autoGreet })}
                    />
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                        Delete All Conversation History
                    </button>
                </div>
            </div>
        </div>
    );
};

// Appearance Settings
const AppearanceSettings: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');

    return (
        <div className="space-y-6">
            <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Theme</h2>

                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => setTheme('light')}
                        className={`p-4 border-2 rounded-lg transition-all ${theme === 'light' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <Sun className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                        <p className="text-sm font-medium">Light</p>
                    </button>

                    <button
                        onClick={() => setTheme('dark')}
                        className={`p-4 border-2 rounded-lg transition-all ${theme === 'dark' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <Moon className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                        <p className="text-sm font-medium">Dark</p>
                    </button>

                    <button
                        onClick={() => setTheme('auto')}
                        className={`p-4 border-2 rounded-lg transition-all ${theme === 'auto' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                        <p className="text-sm font-medium">Auto</p>
                    </button>
                </div>
            </div>

            <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Language & Region</h2>

                <div className="space-y-4">
                    <div>
                        <label className="label-text block mb-2">Language</label>
                        <select className="input">
                            <option>English (US)</option>
                            <option>Spanish</option>
                            <option>French</option>
                        </select>
                    </div>

                    <div>
                        <label className="label-text block mb-2">Date Format</label>
                        <select className="input">
                            <option>MM/DD/YYYY</option>
                            <option>DD/MM/YYYY</option>
                            <option>YYYY-MM-DD</option>
                        </select>
                    </div>

                    <div>
                        <label className="label-text block mb-2">Currency</label>
                        <select className="input">
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                            <option>GBP (£)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Privacy Settings
const PrivacySettings: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Data Management</h2>

                <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-gray-600" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Download Your Data</p>
                                <p className="text-sm text-gray-500">Get a copy of all your financial data</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="card p-6 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="btn-secondary text-red-600 border-red-600 hover:bg-red-50">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

// Help Settings
const HelpSettings: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Help & Support</h2>

                <div className="space-y-3">
                    <a
                        href="#"
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <HelpCircle className="w-5 h-5 text-gray-600" />
                            <p className="font-medium text-gray-900">Help Center</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>

                    <a
                        href="#"
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <p className="font-medium text-gray-900">Contact Support</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>

                    <a
                        href="#"
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-600" />
                            <p className="font-medium text-gray-900">Privacy Policy</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>

                    <a
                        href="#"
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-600" />
                            <p className="font-medium text-gray-900">Terms of Service</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </a>
                </div>
            </div>

            <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">About Meridian</h2>
                <p className="text-sm text-gray-600 mb-4">Version 1.0.0</p>
                <p className="text-xs text-gray-500">© 2024 Meridian. All rights reserved.</p>
            </div>
        </div>
    );
};

// Notification Toggle Component
const NotificationToggle: React.FC<{
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
}> = ({ label, description, checked, onChange }) => {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex-1">
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
        </div>
    );
};

export default SettingsPage;
