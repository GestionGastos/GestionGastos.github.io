import { ArrowLeft, CalendarDays, Check, Goal, Plus, PiggyBank } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { Button } from '../../../shared/presentation/Button.jsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as goalRepository from '../infrastructure/goalRepository.js';
import { useAuth } from '../../auth/presentation/useAuth.js';
import { GoalFormModal } from './GoalFormModal.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { GoalCard } from './GoalCard.jsx';
import { GoalContributionModal } from './GoalContributionModal.jsx';
import * as budgetRepository from '../../budgets/infrastructure/budgetRepository.js';
import { formatCurrency } from '../../../shared/i18n/currency.js';

export const GoalsPage = () => {
  const { userId } = useParams();
  const [goals, setGoals] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '' });
  const { token, user } = useAuth();
  const [editingGoal, setEditingGoal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [contributingGoal, setContributingGoal] = useState(null);
  const { t } = useI18n();
  const effectiveUserId = userId === 'me' ? user?.id : userId;

  const loadGoals = useCallback(async () => {
    setStatus({ loading: true, error: '' });
    try {
      const goalsResponse = await goalRepository.getGoals(effectiveUserId, token);
      const nextGoals = (goalsResponse?.goals ?? []).filter((goal) => goal.status !== 'deleted').map((goal) => {
        const expired = goal.type !== 'budget' && goal.objective_date && new Date(goal.objective_date).setHours(23,59,59,999) <= Date.now();
        return expired ? { ...goal, status: 'completed' } : goal;
      });
      setGoals(nextGoals);
      setStatus({ loading: false, error: '' });
    } catch {
      setStatus({ loading: false, error: t('goal.loadError') });
    }
  }, [effectiveUserId, token, t]);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const activeGoals = useMemo(() => goals.filter((goal) => ['pending', 'in_progress'].includes(goal.status)), [goals]);
  const completed = goals.filter((goal) => goal.status === 'completed');
  const savingGoals = goals.filter((goal) => goal.type === 'saving');
  const savings = savingGoals.reduce((totals, goal) => ({ current: totals.current + (Number(goal.current) || 0), target: totals.target + (Number(goal.value) || 0) }), { current: 0, target: 0 });
  const visibleGoals = goals.filter((goal) => filter === 'all' || goal.status === filter);

  const submitGoal = async (goal) => {
    if (saving) return;
    setSaving(true);
    try {
      if (goal._id) await goalRepository.updateGoal(token, goal);
      else await goalRepository.createGoal(token, goal);
      setIsModalOpen(false);
      setEditingGoal(null);
      await loadGoals();
    } catch {
      setStatus({ loading: false, error: t('goal.saveError') });
    } finally { setSaving(false); }
  };

  const removeGoal = async (goal) => {
    if (!window.confirm(t('goal.deleteConfirm'))) return;
    setSaving(true);
    try {
      await goalRepository.deleteGoal(token, goal);
      setGoals((current) => current.filter((entry) => entry._id !== goal._id));
      await loadGoals();
    } catch {
      setStatus({ loading: false, error: t('goal.deleteError') });
    } finally { setSaving(false); }
  };

  const addContribution = async (amount) => {
    if (!contributingGoal || saving) return;
    setSaving(true);
    try {
      const budget = await readCurrentBudget(effectiveUserId, token);
      await goalRepository.createGoalContribution(token, contributingGoal._id, { budgetId: budget._id, amount });
      setContributingGoal(null);
      await loadGoals();
    } catch { setStatus({ loading: false, error: t('goal.contributionError') }); }
    finally { setSaving(false); }
  };

  const openEdit = (goal) => { setEditingGoal(goal); setIsModalOpen(true); };
  const openCreate = () => { setEditingGoal(null); setIsModalOpen(true); };

  return (
    <PublicLayout>
      <main className="goals-page">
        <div className="goals-heading"><div><Link className="back-link" to={`/app/users/${userId}/dashboard`}><ArrowLeft size={16} />{t('nav.dashboardClean')}</Link><h1>{t('goal.title')}</h1><p>{t('goal.subtitle')}</p></div><Button type="button" onClick={openCreate}><Plus size={18} />{t('goal.new')}</Button></div>
        {status.error ? <p className="form-feedback form-feedback--error" role="alert">{status.error}</p> : null}
        <section className="goals-summary"><article><span><Goal size={18} />{t('goal.active')}</span><strong>{activeGoals.length}</strong><small>{goals.filter((goal) => goal.status === 'in_progress').length} {t('goal.inProgress')}</small></article><article><span><PiggyBank size={18} />{t('goal.saved')}</span><strong>{formatCurrency(savings.current)}</strong><small>{t('goal.of')} {formatCurrency(savings.target)}</small></article><article><span><Check size={18} />{t('goal.completed')}</span><strong>{completed.length}</strong><small>{t('goal.thisYear')}</small></article></section>
        <div className="goals-toolbar"><h2>{t('goal.objectives')}</h2><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label={t('goal.filter')}><option value="all">{t('goal.all')}</option><option value="in_progress">{t('goal.inProgress')}</option><option value="completed">{t('goal.completed')}</option></select></div>
        {status.loading ? <p role="status">{t('goal.loading')}</p> : null}
        {!status.loading && !visibleGoals.length ? <p className="suite-notice">{t('goal.empty')}</p> : null}
        <section className="goals-grid">{visibleGoals.map((goal) => <GoalCard key={goal._id ?? goal.name} name={goal.name} target={goal.value} date={goal.type === 'budget' ? goal.month : goal.objective_date} current={goal.current} type={goal.type} percent={goal.value ? Math.round((Number(goal.current) || 0) / Number(goal.value) * 100) : 0} onEdit={() => openEdit(goal)} onDelete={() => removeGoal(goal)} onContribute={() => setContributingGoal(goal)} />)}</section>
        <section className="goals-tip"><CalendarDays size={22} /><div><strong>{t('goal.tipTitle')}</strong><p>{t('goal.tipText')}</p></div></section>
      </main>
      {isModalOpen ? <GoalFormModal key={editingGoal?._id ?? 'new'} initialGoal={editingGoal} onClose={() => { if (!saving) { setIsModalOpen(false); setEditingGoal(null); } }} onSubmit={submitGoal} /> : null}
      {contributingGoal ? <GoalContributionModal goal={contributingGoal} busy={saving} onClose={() => { if (!saving) setContributingGoal(null); }} onSave={addContribution} /> : null}
    </PublicLayout>
  );
};

async function readCurrentBudget(userId, token) {
  const response = await budgetRepository.getCurrentBudgetByUser(userId, token);
  const budget = Array.isArray(response?.budget) ? response.budget[0] : response?.budget;
  if (!budget?._id) throw new Error('Current budget required');
  return budget;
}
