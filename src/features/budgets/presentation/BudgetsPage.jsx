import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/presentation/useAuth.js';
import * as budgetRepository from '../infrastructure/budgetRepository.js';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { Button } from '../../../shared/presentation/Button.jsx';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { BudgetEditor } from './BudgetEditor.jsx';
import { BudgetFormModal } from './BudgetFormModal.jsx';

export function BudgetsPage() {
  const { userId } = useParams();
  const { token, user } = useAuth();
  const { t } = useI18n();
  const [budgets, setBudgets] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState({ loading: true, error: '' });

  const effectiveUserId = userId === 'me' ? user?.id : userId;

  const loadBudgets = async () => {
    setStatus({ loading: true, error: '' });

    try {
      const [budgetsResponse, currentResponse] = await Promise.all([
        budgetRepository.getBudgetsByUser(effectiveUserId, token),
        budgetRepository.getCurrentBudgetByUser(effectiveUserId, token),
      ]);
      const nextBudgets = budgetsResponse?.budgets ?? [];
      const nextCurrentBudget = currentResponse?.budget?.[0] ?? currentResponse?.budget ?? nextBudgets[0] ?? null;
      setBudgets(nextBudgets);
      setCurrentBudget(nextCurrentBudget);
      setStatus({ loading: false, error: '' });
    } catch {
      setStatus({ loading: false, error: t('budget.loadError') });
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [effectiveUserId, token]);

  const submitBudget = async (budget) => {
    await budgetRepository.createBudget(effectiveUserId, token, budget);
    setIsModalOpen(false);
    await loadBudgets();
  };

  const saveBudget = async (nextBudget) => {
    setCurrentBudget(nextBudget);
    setBudgets((current) => current.map((budget) => (budget._id === nextBudget._id ? nextBudget : budget)));
    await budgetRepository.updateBudget(token, nextBudget);
    await loadBudgets();
  };

  return (
    <PublicLayout>
      <main className="dashboard">
        <section className="dashboard-heading">
          <div>
            <p className="eyebrow">User ID: {effectiveUserId}</p>
            <h1>{t('budget.title')}</h1>
            <p>{t('budget.subtitle')}</p>
          </div>
          <Button type="button" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> {t('budget.newBudget')}
          </Button>
        </section>

        {status.error ? <p className="form-error">{status.error}</p> : null}
        {status.loading ? <p className="muted">Cargando...</p> : null}

        {!status.loading ? (
          <div className="dashboard-grid">
            <aside className="panel history-panel">
              <h2>{t('budget.history')}</h2>
              {budgets.length ? (
                <div className="history-list">
                  {budgets.map((budget) => (
                    <button key={budget._id ?? `${budget.year}-${budget.month}`} type="button" onClick={() => setCurrentBudget(budget)}>
                      <strong>{budget.month}</strong>
                      <span>{budget.year}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="muted">{t('budget.apiEmpty')}</p>
              )}
            </aside>

            <section className="dashboard-main">
              {currentBudget ? (
                <BudgetEditor budget={currentBudget} onSave={saveBudget} />
              ) : (
                <section className="empty-state">
                  <h2>{t('budget.noBudget')}</h2>
                  <Button type="button" onClick={() => setIsModalOpen(true)}>
                    {t('budget.createFirst')}
                  </Button>
                </section>
              )}
            </section>
          </div>
        ) : null}
      </main>
      {isModalOpen ? <BudgetFormModal onClose={() => setIsModalOpen(false)} onSubmit={submitBudget} /> : null}
    </PublicLayout>
  );
}
