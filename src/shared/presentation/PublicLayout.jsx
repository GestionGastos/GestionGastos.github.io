import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, Menu, Moon, Settings, Sun, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../features/auth/presentation/useAuth.js';
import { useI18n } from '../i18n/I18nProvider.jsx';
import { useTheme } from '../theme/ThemeProvider.jsx';
import { Button } from './Button.jsx';
import { AppSidebar } from './AppSidebar.jsx';

export function PublicLayout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const privatePath = `/app/users/${user?.id ?? 'me'}`;

  const header = (
      <header className={`topbar${isAuthenticated ? ' topbar--private' : ''}`}>
        {isAuthenticated ? (
          <button type="button" className="mobile-menu-toggle" aria-label={isMobileMenuOpen ? t('sidebar.closeMenu') : t('sidebar.openMenu')} onClick={() => setIsMobileMenuOpen((open) => !open)}>
            {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        ) : null}
        <Link className="brand" to="/">
          <span className="brand-mark">◈</span> {t('appName')}
        </Link>
        <nav className="topbar__nav" aria-label="Principal">
          <NavLink to="/">{t('nav.home')}</NavLink>
          {isAuthenticated ? <NavLink to={`${privatePath}/dashboard`}>{t('nav.dashboardClean')}</NavLink> : null}
          {isAuthenticated ? <NavLink to={`${privatePath}/goals`}>{t('nav.goals')}</NavLink> : null}
          {isAuthenticated ? <NavLink to={`${privatePath}/budgets`}>{t('nav.budgets')}</NavLink> : null}
          {isAuthenticated ? <NavLink to={`${privatePath}/invoices`}>{t('nav.invoices')}</NavLink> : null}
          {!isAuthenticated ? <NavLink to="/login">{t('nav.login')}</NavLink> : null}
          {!isAuthenticated ? <NavLink to="/registro">{t('nav.register')}</NavLink> : null}
        </nav>
        <div className="topbar__actions">
          <select className="locale-select" aria-label="Idioma" value={locale} onChange={(event) => setLocale(event.target.value)}>
            <option value="es">{t('language.es')}</option>
            <option value="en">{t('language.en')}</option>
          </select>
          <Button type="button" variant="ghost" aria-label="Cambiar tema" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
          {isAuthenticated ? (
            <details className="user-menu">
              <summary className="user-menu__trigger">
                <UserRound size={17} />
                <span>{user?.name || t('sidebar.personalSpace')}</span>
                <ChevronDown size={15} />
              </summary>
              <div className="user-menu__content">
                <Link to={`${privatePath}/settings`}><Settings size={16} />{t('sidebar.settings')}</Link>
                <button type="button" onClick={logout}>{t('nav.logout')}</button>
              </div>
            </details>
          ) : null}
        </div>
      </header>
  );

  return isAuthenticated ? (
    <div className="app-shell app-shell--private">
      <AppSidebar userId={user?.id} user={user} t={t} isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />
      <div className="app-shell__content">
        {header}
        {children}
      </div>
    </div>
  ) : (
    <div className="app-shell">
      {header}
      {children}
    </div>
  );
}
