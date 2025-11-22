import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Settings,
    Bell,
    Search,
    Menu,
    X,
    LogOut,
    User,
    CreditCard,
    Users,
    Moon,
    Sun,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const { isDarkMode, toggleTheme } = useThemeStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg" />
                        <span className="text-xl font-semibold text-gray-900 dark:text-white">Meridian</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                        <NavItem
                            icon={<LayoutDashboard className="w-5 h-5" />}
                            label="Dashboard"
                            path="/dashboard"
                            active={location.pathname === '/dashboard'}
                            onClick={() => navigate('/dashboard')}
                        />
                        <NavItem
                            icon={<CreditCard className="w-5 h-5" />}
                            label="Accounts"
                            path="/dashboard/accounts"
                            active={location.pathname === '/dashboard/accounts'}
                            onClick={() => navigate('/dashboard/accounts')}
                        />
                        <NavItem
                            icon={<ArrowLeftRight className="w-5 h-5" />}
                            label="Financial Overview"
                            path="/dashboard/overview"
                            active={location.pathname === '/dashboard/overview'}
                            onClick={() => navigate('/dashboard/overview')}
                        />
                        <NavItem
                            icon={<Users className="w-5 h-5" />}
                            label="Talk to Michael"
                            path="/dashboard/banker"
                            active={location.pathname === '/dashboard/banker'}
                            onClick={() => navigate('/dashboard/banker')}
                        />

                        <div className="divider my-4" />

                        <NavItem
                            icon={<Settings className="w-5 h-5" />}
                            label="Settings"
                            path="/dashboard/settings"
                            active={location.pathname === '/dashboard/settings'}
                            onClick={() => navigate('/dashboard/settings')}
                        />
                    </nav>

                    {/* User Profile */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center font-semibold">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                            </div>
                        </button>

                        {profileOpen && (
                            <div className="mt-2 py-2 space-y-1">
                                <button
                                    onClick={() => navigate('/dashboard/settings')}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
                {/* Top Bar */}
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
                    <div className="h-full px-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                {sidebarOpen ? (
                                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                ) : (
                                    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                )}
                            </button>

                            {/* Search */}
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 w-96 transition-colors">
                                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                                <kbd className="px-2 py-0.5 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded text-gray-600 dark:text-gray-300">
                                    ⌘K
                                </kbd>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDarkMode ? (
                                    <Sun className="w-5 h-5 text-yellow-500" />
                                ) : (
                                    <Moon className="w-5 h-5 text-gray-600" />
                                )}
                            </button>

                            {/* Notifications */}
                            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                />
            )}
        </div>
    );
};

// Nav Item Component
const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    path: string;
    active: boolean;
    onClick: () => void;
}> = ({ icon, label, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
        >
            {icon}
            <span className="text-sm">{label}</span>
        </button>
    );
};

export default DashboardLayout;
