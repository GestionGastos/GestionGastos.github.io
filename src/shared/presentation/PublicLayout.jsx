import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Moon, Settings, Sun, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/presentation/useAuth.js';
import { useI18n } from '../i18n/I18nProvider.jsx';
import { useTheme } from '../theme/ThemeProvider.jsx';
import { Button } from './Button.jsx';
import { AppSidebar } from './AppSidebar.jsx';

export function PublicLayout({ children, showHeader = true }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [enabledModules, setEnabledModules] = useState(readEnabledModules);
  const location = useLocation();
  const isMarketing = !isAuthenticated && location.pathname === '/';
  const isHomeSync = location.pathname.includes('/homesync');

  useEffect(() => {
    const update = () => setEnabledModules(readEnabledModules());
    window.addEventListener('lifesync:modules-updated', update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener('lifesync:modules-updated', update); window.removeEventListener('storage', update); };
  }, []);

  const privatePath = `/app/users/${user?.id ?? 'me'}`;

  const header = showHeader ? (
      <header className={`topbar${isAuthenticated ? ' topbar--private' : ''}`}>
        <button type="button" className="mobile-menu-toggle" aria-label={isMobileMenuOpen ? t('sidebar.closeMenu') : t('sidebar.openMenu')} onClick={() => setIsMobileMenuOpen((open) => !open)}>
          {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link className="brand" to="/">
          <span className="brand-mark">⌘</span><span><strong>{t('appName')}</strong>{isMarketing ? <small>Everyday OS</small> : null}</span>
        </Link>
        <nav className={`topbar__nav${!isAuthenticated ? ' topbar__nav--public' : ''}${isMobileMenuOpen ? ' mobile-open' : ''}`} aria-label="Principal">
          {isMarketing ? <><a href="#inicio">{t('nav.home')}</a><a href="#modulos">{t('landingSuite.navModules')}</a><a href="#integracion">{t('landingSuite.integration')}</a><a href="#beneficios">{t('landingSuite.benefits')}</a><Link className="topbar__login" to="/login">{t('landingSuite.login')}</Link><Link className="topbar__cta" to="/registro">{t('landingSuite.start')}</Link></> : null}
          {isHomeSync && enabledModules.includes('homesync') ? <><NavLink to={`${privatePath}/homesync/shopping`} onClick={() => setIsMobileMenuOpen(false)}>{t('homesync.nav.shopping')}</NavLink><NavLink to={`${privatePath}/homesync/chores`} onClick={() => setIsMobileMenuOpen(false)}>{t('homesync.nav.chores')}</NavLink><NavLink to={`${privatePath}/homesync/outings`} onClick={() => setIsMobileMenuOpen(false)}>{t('homesync.nav.outings')}</NavLink></> : null}
          {isAuthenticated && !isHomeSync && enabledModules.includes('fintrack') ? <><NavLink to={`${privatePath}/dashboard`} onClick={() => setIsMobileMenuOpen(false)}>{t('nav.dashboardClean')}</NavLink><NavLink to={`${privatePath}/budgets`} onClick={() => setIsMobileMenuOpen(false)}>{t('nav.budgets')}</NavLink><NavLink to={`${privatePath}/invoices`} onClick={() => setIsMobileMenuOpen(false)}>{t('nav.invoices')}</NavLink><NavLink to={`${privatePath}/goals`} onClick={() => setIsMobileMenuOpen(false)}>{t('nav.goals')}</NavLink></> : null}
          {!isAuthenticated && !isMarketing ? <><NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.home')}</NavLink><NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.login')}</NavLink><NavLink to="/registro" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.register')}</NavLink></> : null}
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
  ) : null;

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

function readEnabledModules() {
  try { return JSON.parse(localStorage.getItem('lifesync.enabledModules')) ?? ['fintrack', 'homesync', 'taskflow', 'receivables', 'fitpulse']; } catch { return ['fintrack', 'homesync', 'taskflow', 'receivables', 'fitpulse']; }
}
