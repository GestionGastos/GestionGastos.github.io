import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../../features/auth/presentation/LoginPage.jsx';
import { RegisterPage } from '../../features/auth/presentation/RegisterPage.jsx';
import { useAuth } from '../../features/auth/presentation/useAuth.js';
import { BudgetsPage } from '../../features/budgets/presentation/BudgetsPage.jsx';
import { LandingPage } from '../../features/marketing/presentation/LandingPage.jsx';
import { DashboardCleanPage } from '../../features/dashboard/presentation/DashboardCleanPage.jsx';
import { GoalsPage } from '../../features/goals/presentation/GoalsPage.jsx';
import { InvoicePage } from '../../features/Invoices/presentation/InvoicePage.jsx';
import { SettingsPage } from '../../features/settings/presentation/SettingsPage.jsx';

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
      <Route path="/signup" element={<Navigate to="/registro" replace />} />
      <Route path="/app" element={<AppEntry />} />
      <Route path="/app/users/:userId/dashboard" element={<PrivateRoute><DashboardCleanPage /></PrivateRoute>} />
      <Route path="/app/users/:userId/goals" element={<PrivateRoute><GoalsPage /></PrivateRoute>} />
      <Route path="/app/users/:userId/budgets" element={<PrivateRoute><BudgetsPage /></PrivateRoute>} />
      <Route path="/app/users/:userId/invoices" element={<PrivateRoute><InvoicePage /></PrivateRoute>} />
      <Route path="/app/users/:userId/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
