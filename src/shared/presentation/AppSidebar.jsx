import { ArrowLeftRight, ChevronDown, CircleHelp, FileText, Goal, LayoutDashboard, ListChecks, Settings, WalletCards } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function AppSidebar({ userId, t, user }) {
  const basePath = `/app/users/${userId ?? 'me'}`;
  const modules = [
    { to: `${basePath}/invoices`, label: t('sidebar.invoices'), detail: t('sidebar.billing'), icon: FileText },
    { to: `${basePath}/budgets`, label: t('sidebar.budgets'), detail: t('sidebar.budgetPlanning'), icon: LayoutDashboard },
    { to: `${basePath}/dashboard`, label: t('sidebar.dashboard'), detail: t('sidebar.financeExpenses'), icon: WalletCards },
    { to: `${basePath}/goals`, label: t('sidebar.goals'), detail: t('sidebar.financialGoals'), icon: Goal },
  ];

  return (
    <>
      <aside className="app-sidebar" aria-label={t('sidebar.modules')}>
        <NavLink className="sidebar-brand" to="/">
          <span className="sidebar-brand__mark">◈</span>
          <span>
            <strong>LifeSync</strong>
            <small>{t('sidebar.suite')}</small>
          </span>
        </NavLink>

        <div className="sidebar-section-label">{t('sidebar.modules')}</div>
        <nav className="sidebar-nav">
          <details className="sidebar-group" open>
            <summary className="sidebar-group__summary">
              <WalletCards size={19} strokeWidth={1.9} />
              <span>
                <strong>{t('sidebar.fintrack')}</strong>
                <small>{t('sidebar.financeExpenses')}</small>
              </span>
              <ChevronDown size={16} className="sidebar-group__chevron" />
            </summary>
            <div className="sidebar-group__children">
              {modules.map(({ to, label, detail, icon: Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `sidebar-nav__item sidebar-nav__item--child${isActive ? ' active' : ''}`}>
                  <Icon size={17} strokeWidth={1.9} />
                  <span>
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </span>
                </NavLink>
              ))}
            </div>
          </details>
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
        {modules.slice(0, 4).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `app-mobile-nav__item${isActive ? ' active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
