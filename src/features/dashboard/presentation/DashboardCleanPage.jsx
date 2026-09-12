import {
  CarFront,
  Home,
  Plus,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  WalletCards,
  Zap,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../../shared/presentation/Button.jsx';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/presentation/useAuth.js';
import { calculateBudgetSummary, calculateBudgetSummaryTotals } from '../../budgets/domain/budgetCalculations.js';
//import { useI18n } from '../../../shared/i18n/i18nProvider.jsx';
import * as budgetRepository from '../../budgets/infrastructure/budgetRepository.js';
import { DashboardChart } from './DashboardChart.jsx';

const currency = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });
const chartInitialState = [
  { month: 'Enero', income: 0, expenses: 0 },
  { month: 'Febrero', income: 0, expenses: 0 },
  { month: 'Marzo', income: 0, expenses: 0 },
  { month: 'Abril', income: 0, expenses: 0 },
  { month: 'Mayo', income: 0, expenses: 0},
  { month: 'Junio', income: 0, expenses: 0 },
  { month: 'Julio', income: 0, expenses: 0 },
  { month: 'Agosto', income: 0, expenses: 0 },
  { month: 'Septiembre', income: 0, expenses: 0 },
  { month: 'Octubre', income: 0, expenses: 0 },
  { month: 'Noviembre', income: 0, expenses: 0 },
  { month: 'Diciembre', income: 0, expenses: 0 },
];

export function DashboardCleanPage() {
  const { userId } = useParams();
  const { t } = useI18n();
  const { token, user } = useAuth();
  const [ budgets, setBudgets ] = useState();
  const [ status, setStatus ] = useState({ loading: false, error: '' });
  const [ totals, setTotals ] = useState({ income: 0, savings: 0, fixedExpenses: 0, additionalExpenses: 0, available: 0 });
  const [ chart, setChart ] = useState(chartInitialState);
  const [ goals, setGoals ] = useState({ budgets: null });

  const effectiveUserId = userId === 'me' ? user?.id : userId;

  const loadBudgets = async () => {
    setStatus({ loading: true, error: '' });

    try {
      const [budgetsResponse] = await Promise.all([
        budgetRepository.getBudgetsByUser(effectiveUserId, token),
      ]);
      const nextBudgets = budgetsResponse?.budgets ?? [];

      const charts = nextBudgets.map((budget) => {
        const total = calculateBudgetSummary(budget)
        return {
          month: budget.month,
          income: total.income,
          expenses: total.fixedExpenses,
          additionals: total.additionalExpenses
        };
      })

      setChart(charts);

      const totals = calculateBudgetSummaryTotals(nextBudgets);
      setTotals(totals);

      setBudgets(nextBudgets);
      setStatus({ loading: false, error: '' });
    } catch(e) {
      setStatus({ loading: false, error: t('budget.loadError') });
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [effectiveUserId, token]);

  return (
    <PublicLayout>
      <main className="finance-dashboard">
        <section className="finance-dashboard__hero">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDul_-JfBOqqU_mYvUmpotut4u_cIi-XaYWJ_licGTR7ZZWFxb6n6odFBIJcaryxuEAonYJlFJbDFkIDVNyiE80nP-Dt71Bjv-PXglJ1pLX2TOx-A3gtppZrvPvTSYDiTDC-yxYaMa_adiEnQ0E7MIByZo_xEM-MyzOpW5rEYqaCafigIPbhEw2jtbS77Kjdfj9DN8YLqMG13bavUm9_LPtJmdKpTQuViI4aMSYQz_-Z-TcvS5yMFg4gjytgivUYxz9LfDPqPhkOxKR"
            alt="Ciudad moderna al atardecer"
          />
          <div className="finance-dashboard__hero-overlay" />
          <div className="finance-dashboard__hero-content">
            <h1>{t('dashboard.title')}</h1>
            <p>{t('dashboard.subtitle')}</p>
            <Button as={Link} to={`/app/users/${userId}/budgets`} variant="secondary">
              <Plus size={18} /> {t('budget.newBudget')}
            </Button>
          </div>
        </section>

        <div className="finance-dashboard__grid">
          <div className="finance-dashboard__main-column">
            {status.error !== '' && <p>Error:{status.error}</p>}
            {status.loading && <p>Loading...</p>}
            {!status.loading && 
              <section className="finance-card finance-overview">
                <div className="finance-card__heading">
                  <h2>Last Budget Overview</h2>
                  <div className="finance-legend">
                    <span><i className="finance-legend__dot finance-legend__dot--income" /> Income</span>
                    <span><i className="finance-legend__dot finance-legend__dot--expense" /> Expenses</span>
                    <span><i className="finance-legend__dot finance-legend__dot--additionals" /> Additionals</span>
                  </div>
                </div>
                <div className="finance-chart" aria-label="Income and expenses by day">
                  {/*chart.map(([day, income, expenses]) => (
                    <div className="finance-chart__day" key={day}>
                      <div className="finance-chart__bars">
                        <span className="finance-chart__bar finance-chart__bar--income" style={{ height: `${income}%` }} />
                        <span className="finance-chart__bar finance-chart__bar--expense" style={{ height: `${expenses}%` }} />
                      </div>
                      <small>{day}</small>
                    </div>
                  ))*/}
                  <DashboardChart monthlyBudget={chart} />
                </div>
                <div className="finance-summary-widgets">
                  <SummaryWidget icon={<TrendingUp size={22} />} label="Total Income" value={currency.format(totals.income)} tone="income" />
                  <SummaryWidget icon={<ReceiptText size={22} />} label="Fixed Expenses" value={currency.format(totals.fixedExpenses)} tone="expense" />
                </div>
              </section>
            }
            <section className="finance-budgets">
              <div className="finance-section-heading"><h2>All Budgets</h2><Link to={`/app/users/${userId}/budgets`}>View All</Link></div>
              { goals.budgets !== null && <div className="finance-budget-cards">
                <BudgetCard icon={<Home size={22} />} title="Household" description="Rent, utilities, and groceries" spent="$2,450" total="$3,000" progress={82} active />
                <BudgetCard icon={<CarFront size={22} />} title="Transport" description="Fuel, insurance, and transit" spent="$380" total="$500" progress={76} />
              </div> }
            </section>
          </div>

          <aside className="finance-dashboard__sidebar">
            <section className="finance-health">
              <h2>Financial Health</h2>
              <div className="finance-health__score"><strong>84%</strong><div><b>On Track</b><p>You're 12% above your savings target this month.</p></div></div>
              <hr />
              <p className="finance-health__label">SUGGESTED ACTION</p>
              <p>Move $450 to your 'Emergency Fund' to hit your quarterly goal.</p>
              <button className="finance-health__action" type="button">Transfer Now</button>
            </section>
            <section className="finance-card finance-transactions">
              <h2>Recent Transactions</h2>
              <Transaction icon={<ShoppingCart size={18} />} title="Whole Foods" date="Today, 2:45 PM" amount="-$142.30" />
              <Transaction icon={<WalletCards size={18} />} title="Salary Deposit" date="Yesterday" amount="+$4,200.00" positive />
              <Transaction icon={<Zap size={18} />} title="Utility Bill" date="Feb 14, 2024" amount="-$84.15" />
            </section>
          </aside>
        </div>
      </main>
    </PublicLayout>
  );
}

function SummaryWidget({ icon, label, value, tone }) {
  return <article className={`finance-summary-widget finance-summary-widget--${tone}`}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></article>;
}

function BudgetCard({ icon, title, description, spent, total, progress, active = false }) {
  return <article className="finance-budget-card"><div className="finance-budget-card__top"><span className="finance-budget-card__icon">{icon}</span><span className="finance-budget-card__status">{active ? 'ACTIVE' : '3 DAYS LEFT'}</span></div><h3>{title}</h3><p>{description}</p><div className="finance-budget-card__amount"><span>{spent} spent</span><small>of {total}</small></div><div className="finance-progress"><span style={{ width: `${progress}%` }} /></div></article>;
}

function Transaction({ icon, title, date, amount, positive = false }) {
  return <div className="finance-transaction"><span className="finance-transaction__icon">{icon}</span><div><strong>{title}</strong><small>{date}</small></div><b className={positive ? 'positive' : ''}>{amount}</b></div>;
}
