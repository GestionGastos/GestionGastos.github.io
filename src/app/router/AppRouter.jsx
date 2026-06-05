import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../../features/auth/presentation/LoginPage.jsx';
import { RegisterPage } from '../../features/auth/presentation/RegisterPage.jsx';
import { useAuth } from '../../features/auth/presentation/useAuth.js';
import { BudgetsPage } from '../../features/budgets/presentation/BudgetsPage.jsx';
import { LandingPage } from '../../features/marketing/presentation/LandingPage.jsx';

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

  return <Navigate to={`/app/users/${user?.id ?? 'me'}/budgets`} replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/signup" element={<Navigate to="/registro" replace />} />
      <Route path="/app" element={<AppEntry />} />
      <Route
        path="/app/users/:userId/budgets"
        element={
          <PrivateRoute>
            <BudgetsPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
