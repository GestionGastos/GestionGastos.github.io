import { ArrowLeftRight, ChevronDown, CircleHelp, Dumbbell, FileText, Goal, Home, LayoutDashboard, ListChecks, ListTodo, ReceiptText, Settings, ShoppingCart, WalletCards } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function AppSidebar({ userId, t, user, isMobileOpen = false, onMobileClose = () => {} }) {
  const [enabledModules, setEnabledModules] = useState(readEnabledModules);
  const basePath = `/app/users/${userId ?? 'me'}`;
  const location = useLocation();
  useEffect(() => {
    const updateModules = () => setEnabledModules(readEnabledModules());
    window.addEventListener('lifesync:modules-updated', updateModules);
    window.addEventListener('storage', updateModules);
    return () => { window.removeEventListener('lifesync:modules-updated', updateModules); window.removeEventListener('storage', updateModules); };
  }, []);
  const servicePath = ['/taskflow', '/fitpulse', '/receivables'].some((path) => location.pathname.includes(path));
  const isFintrackPath = !location.pathname.includes('/homesync') && !servicePath;
  const fintrack = [
    { to: `${basePath}/invoices`, label: t('sidebar.invoices'), detail: t('sidebar.billing'), icon: FileText },
    { to: `${basePath}/budgets`, label: t('sidebar.budgets'), detail: t('sidebar.budgetPlanning'), icon: LayoutDashboard },
    { to: `${basePath}/dashboard`, label: t('sidebar.dashboard'), detail: t('sidebar.financeExpenses'), icon: WalletCards },
    { to: `${basePath}/goals`, label: t('sidebar.goals'), detail: t('sidebar.financialGoals'), icon: Goal },
  ];
  const homesync = [
    { to: `${basePath}/homesync/shopping`, label: t('homesync.nav.shopping'), icon: ShoppingCart },
    { to: `${basePath}/homesync/chores`, label: t('homesync.nav.chores'), icon: ListChecks },
    { to: `${basePath}/homesync/outings`, label: t('homesync.nav.outings'), icon: Home },
  ];
  const serviceLinks = [
    { to: `${basePath}/taskflow`, label: t('sidebar.taskflow'), detail: t('sidebar.taskflowDetail'), icon: ListTodo },
    { to: `${basePath}/receivables`, label: t('sidebar.receivables'), detail: t('sidebar.receivablesDetail'), icon: ReceiptText },
    { to: `${basePath}/fitpulse`, label: t('sidebar.fitpulse'), detail: t('sidebar.fitpulseDetail'), icon: Dumbbell },
  ];

  const renderChildren = (items) => items.map(({ to, label, detail, icon: Icon }) => (
    <NavLink key={to} to={to} onClick={onMobileClose} className={({ isActive }) => `sidebar-nav__item sidebar-nav__item--child${isActive ? ' active' : ''}`}>
      <Icon size={17} strokeWidth={1.9} />
      <span><strong>{label}</strong>{detail ? <small>{detail}</small> : null}</span>
    </NavLink>
  ));

  return (
    <>
      <button type="button" className={`app-sidebar__backdrop${isMobileOpen ? ' visible' : ''}`} aria-label={t('sidebar.closeMenu')} onClick={onMobileClose} />
      <aside className={`app-sidebar${isMobileOpen ? ' mobile-open' : ''}`} aria-label={t('sidebar.modules')}>
        <NavLink className="sidebar-brand" to="/">
          <span className="sidebar-brand__mark">◈</span>
          <span>
            <strong>LifeSync</strong>
            <small>{t('sidebar.suite')}</small>
          </span>
        </NavLink>

        <div className="sidebar-section-label">{t('sidebar.modules')}</div>
        <nav className="sidebar-nav">
          {enabledModules.includes('fintrack') ? <details className="sidebar-group" open={isFintrackPath}>
            <summary className="sidebar-group__summary">
              <WalletCards size={19} strokeWidth={1.9} />
              <span>
                <strong>{t('sidebar.fintrack')}</strong>
                <small>{t('sidebar.financeExpenses')}</small>
              </span>
              <ChevronDown size={16} className="sidebar-group__chevron" />
            </summary>
            <div className="sidebar-group__children">{renderChildren(fintrack)}</div>
          </details> : null}
          {enabledModules.includes('homesync') ? <details className="sidebar-group" open={location.pathname.includes('/homesync')}>
            <summary className="sidebar-group__summary"><Home size={19} /><span><strong>HomeSync</strong><small>{t('sidebar.homesyncDetail')}</small></span><ChevronDown size={16} className="sidebar-group__chevron" /></summary>
            <div className="sidebar-group__children">{renderChildren(homesync)}</div>
          </details> : null}
          {serviceLinks.filter((item) => enabledModules.includes(item.to.includes('/taskflow') ? 'taskflow' : item.to.includes('/receivables') ? 'receivables' : 'fitpulse')).map(({ to, label, detail, icon: Icon }) => <NavLink key={to} to={to} onClick={onMobileClose} className={({ isActive }) => `sidebar-nav__item${isActive ? ' active' : ''}`}><Icon size={18} /><span><strong>{label}</strong><small>{detail}</small></span></NavLink>)}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-workspace">
          <span className="sidebar-workspace__icon"><ListChecks size={17} /></span>
          <span>
            <strong>{user?.name || t('sidebar.personalSpace')}</strong>
            <small>{t('sidebar.proPlan')}</small>
          </span>
          <button type="button" className="sidebar-workspace__switch" title={t('sidebar.switchSpace')} aria-label={t('sidebar.switchSpace')}>
            <ArrowLeftRight size={15} />
          </button>
        </div>
        <div className="sidebar-footer-links">
          <a href="#support"><CircleHelp size={17} />{t('sidebar.support')}</a>
          <NavLink to={`${basePath}/settings`}><Settings size={17} />{t('sidebar.settings')}</NavLink>
        </div>
      </aside>

      <nav className="app-mobile-nav" aria-label={t('sidebar.modules')}>
        {fintrack.filter((_, index) => index < 4 && enabledModules.includes('fintrack')).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `app-mobile-nav__item${isActive ? ' active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

function readEnabledModules() {
  try { return JSON.parse(localStorage.getItem('lifesync.enabledModules')) ?? ['fintrack', 'homesync', 'taskflow', 'receivables', 'fitpulse']; } catch { return ['fintrack', 'homesync', 'taskflow', 'receivables', 'fitpulse']; }
}
