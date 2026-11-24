import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FileText, Plus, ReceiptText, Target, TrendingUp } from 'lucide-react';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { Button } from '../../../shared/presentation/Button.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { useAuth } from '../../auth/presentation/useAuth.js';
import * as budgetRepository from '../../budgets/infrastructure/budgetRepository.js';
import * as goalRepository from '../../goals/infrastructure/goalRepository.js';
import { listInvoices } from '../../Invoices/infrastructure/invoiceRepository.js';
import { calculateBudgetSummary } from '../../budgets/domain/budgetCalculations.js';
import { formatCurrency } from '../../../shared/i18n/currency.js';
import { DashboardChart } from './DashboardChart.jsx';
import cityHero from '../../../es/img/fintrack-city-hero.jpg';

const monthIndex = new Map(['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((month, index) => [month.toLocaleLowerCase(), index]));

export function DashboardOverviewPage() {
  const { userId } = useParams();
  const { t, locale } = useI18n();
  const { token, user } = useAuth();
  const id = userId === 'me' ? user?.id : userId;
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.allSettled([budgetRepository.getBudgetsByUser(id, token), goalRepository.getGoals(id, token), listInvoices(token)]).then(([budgetResult, goalResult, invoiceResult]) => {
      if (!active) return;
      if (budgetResult.status === 'fulfilled') setBudgets(budgetResult.value?.budgets ?? []);
      if (goalResult.status === 'fulfilled') setGoals((goalResult.value?.goals ?? []).filter((goal) => goal.status !== 'deleted'));
      if (invoiceResult.status === 'fulfilled') setInvoices(invoiceResult.value ?? []);
      setLoading(false);
    });
    return () => { active = false; };
  }, [id, token]);

  const chart = useMemo(() => [...budgets].sort((a, b) => Number(a.year) - Number(b.year) || (monthIndex.get(String(a.month).toLocaleLowerCase()) ?? 0) - (monthIndex.get(String(b.month).toLocaleLowerCase()) ?? 0)).slice(-12).map((budget) => {
    const summary = calculateBudgetSummary(budget);
    return { month: locale === 'en' ? new Date(Number(budget.year), monthIndex.get(String(budget.month).toLocaleLowerCase()) ?? 0).toLocaleString('en-US', { month: 'short' }) : budget.month, year: budget.year, income: summary.income, expenses: summary.fixedExpenses + summary.additionalExpenses };
  }), [budgets, locale]);
  const totals = useMemo(() => {
    const now = new Date();
    const current = budgets.find((budget) => Number(budget.year) === now.getFullYear() && monthIndex.get(String(budget.month).toLocaleLowerCase()) === now.getMonth());
    return current ? calculateBudgetSummary(current) : { income: 0, fixedExpenses: 0, additionalExpenses: 0, available: 0 };
  }, [budgets]);
  const recentGoals = useMemo(() => [...goals].sort((a, b) => new Date(b.created_at ?? b.createdAt ?? 0) - new Date(a.created_at ?? a.createdAt ?? 0)).slice(0, 3), [goals]);
  const recentInvoices = useMemo(() => [...invoices].sort((a, b) => new Date(b.issueDate ?? b.createdAt ?? 0) - new Date(a.issueDate ?? a.createdAt ?? 0)).slice(0, 3), [invoices]);
  const health = totals.income > 0 ? Math.round(Math.max(0, Math.min(100, (totals.income - totals.fixedExpenses - totals.additionalExpenses) / totals.income * 100))) : 0;

  return <PublicLayout><main className="finance-dashboard">
    <section className="finance-dashboard__hero"><img src={cityHero} alt={t('dashboard.cityAlt')} /><div className="finance-dashboard__hero-overlay" /><div className="finance-dashboard__hero-content"><h1>{t('dashboard.title')}</h1><p>{t('dashboard.subtitle')}</p><Button as={Link} to={`/app/users/${userId}/budgets`} variant="secondary"><Plus size={18} />{t('budget.newBudget')}</Button></div></section>
    <div className="finance-dashboard__grid"><div className="finance-dashboard__main-column">
      <section className="finance-card finance-overview"><div className="finance-card__heading"><h2>{t('dashboard.overview')}</h2><div className="finance-legend"><span><i className="finance-legend__dot finance-legend__dot--income" />{t('dashboard.income')}</span><span><i className="finance-legend__dot finance-legend__dot--expense" />{t('dashboard.expenses')}</span></div></div><div className="finance-chart"><DashboardChart monthlyBudget={chart} /></div><div className="finance-summary-widgets"><SummaryWidget icon={<TrendingUp size={22} />} label={t('dashboard.totalIncome')} value={formatCurrency(totals.income)} tone="income" /><SummaryWidget icon={<ReceiptText size={22} />} label={t('dashboard.totalExpenses')} value={formatCurrency(totals.fixedExpenses + totals.additionalExpenses)} tone="expense" /></div></section>
      <section className="finance-budgets"><div className="finance-section-heading"><h2>{t('dashboard.goals')}</h2><Link to={`/app/users/${userId}/goals`}>{t('dashboard.viewAll')} <ArrowRight size={14} /></Link></div>{loading ? <p role="status">{t('goal.loading')}</p> : recentGoals.length ? <div className="finance-budget-cards">{recentGoals.map((goal) => { const percent = goal.value > 0 ? Math.round(Number(goal.current || 0) / Number(goal.value) * 100) : 0; return <article className="finance-budget-card" key={goal._id}><div className="finance-budget-card__top"><span className="finance-budget-card__icon"><Target size={20} /></span><span className="finance-budget-card__status">{goal.status === 'completed' ? t('goal.completed') : t('goal.inProgress')}</span></div><h3>{goal.name}</h3><div className="finance-budget-card__amount"><span>{formatCurrency(goal.current ?? 0)}</span><small>{t('dashboard.of')} {formatCurrency(goal.value)}</small></div><div className="finance-progress"><span style={{ width: `${Math.min(percent, 100)}%` }} /></div><small className={percent > 100 ? 'finance-over-target' : ''}>{percent}%</small></article>; })}</div> : <p className="suite-empty-state">{t('dashboard.emptyGoals')}</p>}</section>
    </div><aside className="finance-dashboard__sidebar"><section className="finance-health"><h2>{t('dashboard.health')}</h2><div className="finance-health__score"><strong>{health}%</strong><div><b>{health >= 50 ? t('dashboard.onTrack') : t('dashboard.review')}</b><p>{t('dashboard.healthDescription')}</p></div></div><hr /><p className="finance-health__label">{t('dashboard.monthlySummary')}</p><p>{t('dashboard.remaining')}: {formatCurrency(totals.available)}</p></section><section className="finance-card finance-transactions"><h2>{t('dashboard.recentTransactions')}</h2>{loading ? <p role="status">{t('goal.loading')}</p> : recentInvoices.length ? recentInvoices.map((invoice) => <Transaction key={invoice._id} invoice={invoice} locale={locale} />) : <p className="suite-empty-state">{t('dashboard.emptyTransactions')}</p>}<Link to={`/app/users/${userId}/invoices`} className="finance-transactions__all">{t('dashboard.viewInvoices')} <ArrowRight size={14} /></Link></section></aside></div>
    {!loading && !budgets.length ? <p className="suite-notice">{t('budgets.empty')}</p> : null}
  </main></PublicLayout>;
}

function SummaryWidget({ icon, label, value, tone }) { return <article className={`finance-summary-widget finance-summary-widget--${tone}`}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></article>; }
function Transaction({ invoice, locale }) { const date = new Date(invoice.issueDate ?? invoice.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO'); return <div className="finance-transaction"><span className="finance-transaction__icon"><FileText size={18} /></span><div><strong>{invoice.number}</strong><small>{invoice.customer} · {date}</small></div><b>{formatCurrency(-Math.abs(invoice.amount))}</b></div>; }
