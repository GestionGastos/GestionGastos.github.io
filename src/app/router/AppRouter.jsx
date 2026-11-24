import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../../features/auth/presentation/LoginPage.jsx';
import { RegisterPage } from '../../features/auth/presentation/RegisterPage.jsx';
import { useAuth } from '../../features/auth/presentation/useAuth.js';
import { BudgetsPage } from '../../features/budgets/presentation/BudgetsPage.jsx';
import { LandingPage } from '../../features/marketing/presentation/LandingPage.jsx';
import { DashboardOverviewPage } from '../../features/dashboard/presentation/DashboardOverviewPage.jsx';
import { GoalsPage } from '../../features/goals/presentation/GoalsPage.jsx';
import { InvoiceManagerPage } from '../../features/Invoices/presentation/InvoiceManagerPage.jsx';
import { SettingsPage } from '../../features/settings/presentation/SettingsPage.jsx';
import { HomeSyncShoppingPage } from '../../features/homesync/presentation/HomeSyncShoppingPage.jsx';
import { HomeSyncChoresPage } from '../../features/homesync/presentation/HomeSyncChoresPage.jsx';
import { SuiteServicePage } from '../../features/services/presentation/SuiteServicePage.jsx';
import { CollectionAccountsPage } from '../../features/services/presentation/CollectionAccountsPage.jsx';
import { FitPulsePage } from '../../features/services/presentation/FitPulsePage.jsx';
import { OutingsPage } from '../../features/services/presentation/OutingsPage.jsx';
import { ForgotPasswordPage } from '../../features/auth/presentation/ForgotPasswordPage.jsx';
import { LegalPage } from '../../features/legal/presentation/LegalPage.jsx';

function PrivateRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.id) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

function AppEntry() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/app/users/${user?.id ?? 'me'}/dashboard`} replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/terms" element={<LegalPage documentType="terms" />} />
      <Route path="/privacy" element={<LegalPage documentType="privacy" />} />
      <Route path="/signup" element={<Navigate to="/registro" replace />} />
      <Route path="/app" element={<AppEntry />} />
      <Route path="/app/users/:userId/dashboard" element={<PrivateRoute><DashboardOverviewPage /></PrivateRoute>} />
      <Route path="/app/users/:userId/goals" element={<PrivateRoute><GoalsPage /></PrivateRoute>} />
      <Route path="/app/users/:userId/budgets" element={<PrivateRoute><BudgetsPage /></PrivateRoute>} />
      <Route path="/app/users/:userId/invoices" element={<PrivateRoute><InvoiceManagerPage /></PrivateRoute>} />
      <Route path="/app/users/:userId/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="/app/users/:userId/homesync/shopping" element={<PrivateRoute><HomeSyncShoppingPage /></PrivateRoute>} />
      <Route path="/app/users/:userId/homesync/chores" element={<PrivateRoute><HomeSyncChoresPage /></PrivateRoute>} />
      <Route path="/app/users/:userId/homesync/outings" element={<PrivateRoute><OutingsPage /></PrivateRoute>} />
      <Route path="/app/users/:userId/taskflow" element={<PrivateRoute><SuiteServicePage service="taskflow" /></PrivateRoute>} />
      <Route path="/app/users/:userId/receivables" element={<PrivateRoute><CollectionAccountsPage /></PrivateRoute>} />
      <Route path="/app/users/:userId/fitpulse" element={<PrivateRoute><FitPulsePage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
