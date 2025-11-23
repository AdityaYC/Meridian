import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import TestTellerPage from './pages/TestTellerPage';
import FinancialOverviewPage from './pages/dashboard/FinancialOverviewPage';
import AccountsPage from './pages/dashboard/AccountsPage';
import BankerPage from './pages/dashboard/BankerPage';
import AdvancedPortfolioPage from './pages/dashboard/AdvancedPortfolioPage';
import SettingsPage from './pages/dashboard/SettingsPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/test-teller" element={<TestTellerPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="overview" element={<FinancialOverviewPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="banker" element={<BankerPage />} />
          <Route path="portfolio" element={<AdvancedPortfolioPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
