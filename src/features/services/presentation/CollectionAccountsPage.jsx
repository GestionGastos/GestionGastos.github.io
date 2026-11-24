import { useCallback, useEffect, useState } from 'react';
import { CirclePlus, RefreshCw } from 'lucide-react';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { useAuth } from '../../auth/presentation/useAuth.js';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { formatCurrency } from '../../../shared/i18n/currency.js';
import * as budgetRepository from '../../budgets/infrastructure/budgetRepository.js';
import { createServiceItem, listServiceItems, updateServiceItem } from '../infrastructure/serviceRepository.js';

const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function CollectionAccountsPage() {
  const { t } = useI18n();
  const { token, user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { const records = await listServiceItems('receivables', token); setAccounts((current) => { const byId = new Map(current.map((item) => [item._id, item])); records.forEach((item) => byId.set(item._id, item)); return [...byId.values()]; }); setError(''); } catch { setError(t('receivable.loadError')); } finally { setLoading(false); } }, [token, t]);
  useEffect(() => { load(); }, [load]);

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form));
    const account = { name: values.name.trim(), amount: Number(values.amount), service: `${values.kind}:${values.service.trim()}`, dueDate: values.dueDate || undefined, status: 'pending' };
    try { const response = await createServiceItem('receivables', token, account); const saved = response?.account ?? account; setAccounts((current) => [saved, ...current.filter((item) => item._id !== saved._id)]); setNotice(t('receivable.created')); setOpen(false); }
    catch { setError(t('receivable.actionError')); }
    finally { setSaving(false); }
  };

  const syncToBudget = async (account) => {
    setSaving(true); setError('');
    try {
      let response = await budgetRepository.getCurrentBudgetByUser(user?.id, token);
      let budget = Array.isArray(response?.budget) ? response.budget[0] : response?.budget;
      if (!budget?._id) {
        const now = new Date();
        const draft = { order: String(now.getMonth() + 1), year: String(now.getFullYear()), month: months[now.getMonth()], basics: { salary: '0', save: '0', additionalIncome: '0', cash: '0' }, expenses: [], additionals: [], tags: [] };
        response = await budgetRepository.createBudget(user?.id, token, draft);
        budget = response?.budget;
      }
      if (!budget?._id) throw new Error('BUDGET');
      const basics = { salary: '0', save: '0', additionalIncome: '0', cash: '0', ...budget.basics };
      const incomeField = account.service.startsWith('salary:') ? 'salary' : 'additionalIncome';
      basics[incomeField] = String(Number(basics[incomeField] || 0) + Number(account.amount));
      await budgetRepository.updateBudget(token, { ...budget, basics, expenses: budget.expenses ?? [], additionals: budget.additionals ?? [], tags: budget.tags ?? [] });
      const updated = await updateServiceItem('receivables', token, account._id, { ...account, status: 'collected' });
      const saved = updated?.account ?? { ...account, status: 'collected' };
      setAccounts((current) => current.map((item) => item._id === account._id ? saved : item));
      setNotice(t('receivable.synced'));
    } catch { setError(t('receivable.syncError')); }
    finally { setSaving(false); }
  };

  const setStatus = async (account, status) => { setSaving(true); try { const updated = await updateServiceItem('receivables', token, account._id, { ...account, status }); setAccounts((all) => all.map((item) => item._id === account._id ? updated?.account ?? { ...item, status } : item)); } catch { setError(t('receivable.actionError')); } finally { setSaving(false); } };
  const total = accounts.reduce((sum, account) => sum + Number(account.amount || 0), 0);

  return <PublicLayout><main className="suite-page receivables-page"><header className="suite-module-header"><div><p className="suite-eyebrow"><span />LifeSync · {t('receivable.title')}</p><h1>{t('receivable.title')}</h1><p>{t('receivable.subtitle')}</p></div><button className="suite-button suite-button--primary" onClick={() => setOpen(true)} type="button"><CirclePlus size={18} />{t('receivable.new')}</button></header>
    {notice ? <p className="suite-notice" role="status">{notice}</p> : null}{error ? <p className="form-feedback form-feedback--error" role="alert">{error}</p> : null}
    <section className="suite-stats-grid"><article className="suite-stat-card"><small>{t('receivable.count')}</small><strong>{accounts.length}</strong></article><article className="suite-stat-card suite-stat-card--highlight"><small>{t('receivable.total')}</small><strong>{formatCurrency(total)}</strong></article><article className="suite-stat-card"><small>{t('receivable.pending')}</small><strong>{accounts.filter((item) => item.status !== 'collected').length}</strong></article></section>
    <section className="suite-panel"><div className="suite-panel-heading"><div><h2>{t('receivable.listTitle')}</h2><p>{t('receivable.listSubtitle')}</p></div><button type="button" className="suite-button suite-button--secondary" onClick={load}><RefreshCw size={16} />{t('receivable.refresh')}</button></div>
      {loading ? <p role="status">{t('goal.loading')}</p> : !accounts.length ? <p className="suite-empty-state">{t('receivable.empty')}</p> : <div className="suite-service-grid">{accounts.map((account) => { const [kind, description] = String(account.service).split(':'); return <article className="suite-panel suite-service-card" key={account._id}><span className="suite-chip">{kind === 'salary' ? t('receivable.salary') : t('receivable.additional')}</span><h2>{account.name}</h2><p>{description}</p><strong>{formatCurrency(account.amount)}</strong><p>{account.dueDate ? new Date(account.dueDate).toLocaleDateString() : '—'}</p><select aria-label={t('receivable.status')} disabled={saving || account.status === 'collected'} value={account.status} onChange={(event) => setStatus(account, event.target.value)}><option value="next">{t('receivable.next')}</option><option value="pending">{t('receivable.pending')}</option><option value="collected">{t('receivable.collected')}</option></select><button className="suite-button suite-button--primary" type="button" disabled={saving || account.status === 'collected'} onClick={() => syncToBudget(account)}>{t('receivable.sync')}</button></article>; })}</div>}
    </section>
    {open ? <div className="modal-backdrop" role="presentation"><section className="modal-sheet service-create-modal" role="dialog" aria-modal="true" aria-labelledby="receivable-form-title"><header className="modal-heading"><h2 id="receivable-form-title">{t('receivable.new')}</h2><button type="button" aria-label={t('common.cancel')} onClick={() => setOpen(false)}>×</button></header><form className="form-stack" onSubmit={submit}><label>{t('receivable.client')}<input name="name" required /></label><label>{t('receivable.kind')}<select name="kind"><option value="salary">{t('receivable.salary')}</option><option value="additional">{t('receivable.additional')}</option></select></label><label>{t('receivable.service')}<input name="service" required /></label><label>{t('receivable.amount')}<input name="amount" type="number" min="0.01" step="0.01" required /></label><label>{t('receivable.dueDate')}<input name="dueDate" type="date" /></label><div className="modal-actions"><button type="button" className="suite-button suite-button--secondary" onClick={() => setOpen(false)}>{t('common.cancel')}</button><button type="submit" disabled={saving} className="suite-button suite-button--primary">{t('services.form.save')}</button></div></form></section></div> : null}
  </main></PublicLayout>;
}
