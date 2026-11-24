import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Download, FileText, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/presentation/useAuth.js';
import * as budgets from '../../budgets/infrastructure/budgetRepository.js';
import { getExpenseTypes } from '../../budgets/infrastructure/expenseTypeRepository.js';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { formatCurrency } from '../../../shared/i18n/currency.js';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { createInvoice, deleteInvoice, downloadInvoiceExport, listInvoices, updateInvoice } from '../infrastructure/invoiceRepository.js';

export function InvoiceManagerPage() {
  const { t } = useI18n();
  const { token, user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [additionalSelected, setAdditionalSelected] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rows, types] = await Promise.all([listInvoices(token), getExpenseTypes(token)]);
      setInvoices(rows);
      setExpenseTypes(types?.expenseTypes ?? []);
      setError('');
    } catch { setError(t('invoice.loadError')); }
    finally { setLoading(false); }
  }, [token, t]);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => invoices.filter((invoice) => (filter === 'all' || invoice.status === filter) && `${invoice.number} ${invoice.customer} ${invoice.service}`.toLowerCase().includes(search.trim().toLowerCase())), [invoices, filter, search]);
  const processedCount = invoices.filter((invoice) => invoice.status === 'paid').length;
  const pendingCount = invoices.filter((invoice) => invoice.status === 'pending').length;

  const submitInvoice = async (event) => {
    event.preventDefault();
    setSaving(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const additional = data.get('expenseType') === '__additional__';
    const label = additional ? String(data.get('additionalName')).trim() : String(data.get('expenseType'));
    const amount = Number(data.get('amount'));
    try {
      const response = await createInvoice(token, { number: String(data.get('number')).trim(), customer: `${String(data.get('provider')).trim()} · NIT ${String(data.get('nit')).trim()}`, service: additional ? `additional:${label}` : label, amount, issueDate: data.get('issueDate'), dueDate: data.get('dueDate') || undefined, status: 'pending' });
      if (response?.invoice) setInvoices((current) => [response.invoice, ...current]); else await load();
      setCreateOpen(false); setNotice(t('invoice.created'));
    } catch { setError(t('invoice.saveError')); }
    finally { setSaving(false); }
  };

  const changeStatus = async (invoice, nextStatus) => {
    setSaving(true); setError('');
    try {
      if (nextStatus === 'paid') await synchronizeBudget(invoice, 1, token, user?.id);
      await updateInvoice(token, invoice._id, { status: nextStatus });
      setInvoices((current) => current.map((row) => row._id === invoice._id ? { ...row, status: nextStatus } : row));
      setNotice(t(nextStatus === 'paid' ? 'invoice.approved' : 'invoice.deleted'));
    } catch (caught) { setError(caught?.message === 'BUDGET_SYNC' ? t('invoice.budgetSyncError') : t('invoice.actionError')); }
    finally { setSaving(false); }
  };

  const remove = async (invoice) => {
    setSaving(true); setError('');
    let reversed = false;
    try {
      if (invoice.status === 'paid') { await synchronizeBudget(invoice, -1, token, user?.id); reversed = true; }
      await deleteInvoice(token, invoice._id);
      setInvoices((current) => current.filter((row) => row._id !== invoice._id));
      setNotice(t('invoice.deleted'));
    } catch (caught) {
      if (reversed) await synchronizeBudget(invoice, 1, token, user?.id).catch(() => {});
      setError(caught?.message === 'BUDGET_SYNC' ? t('invoice.budgetSyncError') : t('invoice.actionError'));
    } finally { setSaving(false); }
  };

  const exportAs = async (format) => { try { await downloadInvoiceExport(token, format); } catch { setError(t('invoice.exportError')); } };

  return <PublicLayout><main className="invoice-page"><div className="invoice-container">
    <header className="invoice-heading"><div><div className="invoice-eyebrow"><span />{t('invoice.eyebrow')}</div><h1>{t('invoice.title')}</h1><p>{t('invoice.subtitle')}</p></div><div className="invoice-heading__actions"><button className="invoice-secondary-button" type="button" onClick={() => exportAs('csv')}><Download size={17} />CSV</button><button className="invoice-secondary-button" type="button" onClick={() => exportAs('pdf')}><Download size={17} />PDF</button><button className="invoice-primary-button" type="button" onClick={() => setCreateOpen(true)}><PlusCircle size={18} />{t('invoice.new')}</button></div></header>
    {notice ? <p className="suite-notice" role="status">{notice}</p> : null}{error ? <p className="form-feedback form-feedback--error" role="alert">{error}</p> : null}
    <section className="invoice-metrics invoice-metrics--current"><Metric label={t('invoice.metrics.processed')} value={processedCount} /><Metric label={t('invoice.metrics.pending')} value={pendingCount} /></section>
    <section className="invoice-table-card"><div className="invoice-toolbar"><div className="invoice-filters" role="group" aria-label={t('invoice.filters.title')}><Filter active={filter === 'all'} onClick={() => setFilter('all')}>{t('invoice.filters.all')} ({invoices.length})</Filter><Filter active={filter === 'pending'} onClick={() => setFilter('pending')}>{t('invoice.filters.pending')} ({pendingCount})</Filter><Filter active={filter === 'paid'} onClick={() => setFilter('paid')}>{t('invoice.filters.processed')} ({processedCount})</Filter></div><div className="invoice-search"><Search size={17} /><input aria-label={t('invoice.search')} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('invoice.search')} /></div></div>
      <div className="invoice-table-scroll"><table className="invoice-table"><thead><tr><th>{t('invoice.table.invoice')}</th><th>{t('invoice.table.supplier')}</th><th>{t('invoice.table.category')}</th><th>{t('invoice.table.due')}</th><th className="text-right">{t('invoice.table.amount')}</th><th>{t('invoice.table.status')}</th><th>{t('invoice.table.actions')}</th></tr></thead><tbody>{shown.map((invoice) => <tr key={invoice._id}><td><div className="invoice-id"><span className="invoice-row-icon invoice-row-icon--pending"><FileText size={16} /></span><div><strong>{invoice.number}</strong><small>{new Date(invoice.issueDate).toLocaleDateString()}</small><small>{t(`invoice.source.${invoice.sourceType || 'manual'}`)}{invoice.sourceId ? ` · ${String(invoice.sourceId).slice(-8)}` : ''}</small></div></div></td><td>{invoice.customer}</td><td><span className="invoice-category">{invoice.service.startsWith('additional:') ? invoice.service.slice(11) : invoice.service}</span></td><td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</td><td className="text-right invoice-amount">{formatCurrency(invoice.amount)}</td><td><span className={`invoice-status invoice-status--${invoice.status === 'paid' ? 'processed' : invoice.status === 'cancelled' ? 'failed' : 'pending'}`}>{t(`invoice.status.${invoice.status === 'paid' ? 'processed' : invoice.status === 'cancelled' ? 'failed' : 'pending'}`)}</span></td><td><div className="invoice-actions">{invoice.status === 'pending' ? <button type="button" disabled={saving} className="invoice-row-action invoice-row-action--pending" onClick={() => changeStatus(invoice, 'paid')}><Check size={14} />{t('invoice.actions.approve')}</button> : null}<button type="button" disabled={saving} className="invoice-icon-action" aria-label={`${t('invoice.actions.delete')} ${invoice.number}`} onClick={() => remove(invoice)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table>{loading ? <p role="status">{t('goal.loading')}</p> : !shown.length ? <div className="invoice-empty">{t('invoice.empty')}</div> : null}</div></section>
    <p className="invoice-legal-note">{t('invoice.manual.legalNotice')}</p>
  </div>
  {createOpen ? <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setCreateOpen(false); }}><section className="modal-sheet invoice-manual-modal" role="dialog" aria-modal="true" aria-labelledby="invoice-create-title"><header className="modal-heading"><h2 id="invoice-create-title">{t('invoice.manual.title')}</h2><button type="button" aria-label={t('invoice.manual.cancel')} onClick={() => setCreateOpen(false)}>×</button></header><form className="form-stack invoice-manual-form" onSubmit={submitInvoice}><div className="invoice-manual-grid"><label>{t('invoice.manual.number')}<input name="number" required /></label><label>{t('invoice.manual.issueDate')}<input name="issueDate" type="date" defaultValue={new Date().toISOString().slice(0,10)} required /></label><label>{t('invoice.provider')}<input name="provider" required /></label><label>NIT<input name="nit" required /></label><label>{t('invoice.manual.description')}<select name="expenseType" required defaultValue="" onChange={(event) => setAdditionalSelected(event.target.value === '__additional__')}><option value="" disabled>{t('invoice.chooseExpense')}</option>{expenseTypes.map((type) => <option key={type._id} value={type.name}>{type.name}</option>)}<option value="__additional__">{t('invoice.additionalExpense')}</option></select></label><label>{t('invoice.manual.dueDate')}<input name="dueDate" type="date" /></label>{additionalSelected ? <label className="invoice-manual-additional">{t('invoice.additionalName')}<input name="additionalName" required /></label> : null}<label>{t('invoice.amountTotal')}<input name="amount" type="number" min="0.01" step="0.01" required /></label></div><div className="modal-actions"><button type="button" className="invoice-secondary-button" onClick={() => setCreateOpen(false)}>{t('invoice.manual.cancel')}</button><button type="submit" className="invoice-primary-button" disabled={saving}>{t('invoice.manual.save')}</button></div></form></section></div> : null}
  </main></PublicLayout>;
}

function Metric({ label, value }) { return <article className="invoice-metric invoice-metric--green"><small>{label}</small><strong>{value}</strong></article>; }
function Filter({ active, onClick, children }) { return <button className={`invoice-filter${active ? ' active' : ''}`} type="button" aria-pressed={active} onClick={onClick}>{children}</button>; }

async function synchronizeBudget(invoice, direction, token, userId) {
  let response;
  try { response = await budgets.getCurrentBudgetByUser(userId, token); } catch { throw new Error('BUDGET_SYNC'); }
  const budget = Array.isArray(response?.budget) ? response.budget[0] : response?.budget;
  if (!budget?._id) throw new Error('BUDGET_SYNC');
  const amount = Number(invoice.amount) * direction;
  const isAdditional = invoice.service.startsWith('additional:');
  let expenses = [...(budget.expenses ?? [])];
  let additionals = [...(budget.additionals ?? [])];
  if (isAdditional) {
    const name = invoice.service.slice(11);
    const index = additionals.findIndex((entry) => entry.name.toLowerCase() === name.toLowerCase());
    if (index < 0 && direction < 0) throw new Error('BUDGET_SYNC');
    if (index < 0) additionals.push({ name, amount: String(amount) });
    else additionals[index] = { ...additionals[index], amount: String(Math.max(0, Number(additionals[index].amount) + amount)) };
  } else {
    const index = expenses.findIndex((entry) => entry.expense === invoice.service);
    if (index < 0) throw new Error('BUDGET_SYNC');
    expenses[index] = { ...expenses[index], amount: String(Math.max(0, Number(expenses[index].amount) + amount)) };
  }
  await budgets.updateBudget(token, { ...budget, expenses, additionals, tags: budget.tags ?? [] });
}
