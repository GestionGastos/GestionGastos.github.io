import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth/presentation/AuthProvider.jsx';
import { I18nProvider } from '../shared/i18n/I18nProvider.jsx';
import { ThemeProvider } from '../shared/theme/ThemeProvider.jsx';
import { AppRouter } from './router/AppRouter.jsx';

export function AppProviders({ children }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  );
}
