import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, CirclePlus, Clock3, Dumbbell, FileText, ListTodo, Plus, Sparkles, X } from 'lucide-react';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { useAuth } from '../../auth/presentation/useAuth.js';
import { createServiceItem, listServiceItems, updateServiceItem } from '../infrastructure/serviceRepository.js';

const serviceIcons = { taskflow: ListTodo, fitpulse: Dumbbell, receivables: FileText, outings: Sparkles };
const listKeys = { taskflow: 'tasks', receivables: 'accounts', outings: 'plans', fitpulse: 'routines' };

export function SuiteServicePage({ service }) {
  const { t, locale } = useI18n();
  const { token } = useAuth();
  const [notice, setNotice] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doneItems, setDoneItems] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const Icon = serviceIcons[service] ?? Sparkles;
  const details = t(`services.${service}.details`);
  const cards = t(`services.${service}.cards`);
  const normalizedItems = useMemo(() => items.map((item) => normalizeItem(item, service, locale)), [items, service, locale]);
  const visibleItems = useMemo(() => normalizedItems.filter((item) => service !== 'taskflow' || (statusFilter === 'all' || item.status === statusFilter) && (priorityFilter === 'all' || item.priority === priorityFilter)).sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0) || new Date(a.deadline || a.date || '9999-12-31') - new Date(b.deadline || b.date || '9999-12-31') || priorityRank(b.priority) - priorityRank(a.priority)), [normalizedItems, priorityFilter, service, statusFilter]);

  useEffect(() => {
    let active = true;
    listServiceItems(service, token).then((records) => {
      if (!active) return;
      setItems((current) => {
        const byId = new Map(current.map((item) => [item._id ?? item.id, item]));
        records.forEach((item) => { if (!byId.has(item._id ?? item.id)) byId.set(item._id ?? item.id, item); });
        return [...byId.values()];
      });
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [service, token]);

  const saveItem = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSaving(true);
    const values = Object.fromEntries(new FormData(form));
    const record = makePayload(service, values, locale);
    try {
      const response = await createServiceItem(service, token, record);
      const created = response?.[listKeys[service].replace(/s$/, '')] ?? Object.values(response ?? {}).find((value) => value && typeof value === 'object' && (value._id || value.id));
      const nextItem = created ?? { ...record, _id: `demo-${Date.now()}` };
      setItems((current) => [nextItem, ...current.filter((item) => (item._id ?? item.id) !== (nextItem._id ?? nextItem.id))]);
      setNotice(t('services.form.created'));
    } catch {
      setItems((current) => [{ ...record, _id: `demo-${Date.now()}`, __local: true }, ...current]);
      setNotice(t('services.form.localOnly'));
    } finally {
      setIsSaving(false);
      setIsFormOpen(false);
      form.reset();
    }
  };

  const completeItem = async (item) => {
    if (item._id && !item.__local) {
      try {
        await updateServiceItem(service, token, item._id, { ...item, status: completedStatus(service) });
      } catch {
        setNotice(t('services.form.localOnly'));
        return;
      }
    }
    setDoneItems((current) => [...current, item._id ?? item.id ?? item.title]);
    setItems((current) => current.map((row) => (row._id ?? row.id) === (item._id ?? item.id) ? { ...row, status: completedStatus(service) } : row));
  };

  const displayCards = visibleItems;

  return (
    <PublicLayout>
      <main className={`suite-page suite-service-page suite-service-page--${service}`}>
        <header className="suite-module-header"><div><p className="suite-eyebrow"><span />LifeSync Suite · {t(`services.${service}.title`)}</p><h1>{t(`services.${service}.title`)}</h1><p>{t(`services.${service}.subtitle`)} {t(`services.${service}.intro`)}</p></div><button className="suite-button suite-button--primary" type="button" onClick={() => setIsFormOpen(true)}><CirclePlus size={18} />{t(`services.${service}.action`)}</button></header>
        {notice ? <p className="suite-notice" role="status">{notice}</p> : null}
        {service === 'taskflow' ? <div className="taskflow-filter-bar"><label>{t('taskflow.status')}<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="pending">{t('taskflow.pending')}</option><option value="in_progress">{t('taskflow.inProgress')}</option><option value="done">{t('taskflow.completed')}</option><option value="all">{t('taskflow.all')}</option></select></label><label>{t('taskflow.priority')}<select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="all">{t('taskflow.all')}</option><option value="high">{t('taskflow.high')}</option><option value="medium">{t('taskflow.medium')}</option><option value="low">{t('taskflow.low')}</option></select></label></div> : null}
        {service === 'taskflow' ? <section className="suite-stats-grid service-metrics"><article className="suite-stat-card"><small>{t('taskflow.today')}</small><strong>{items.filter((item) => item.status !== 'done' && isToday(item.deadline)).length}</strong></article><article className="suite-stat-card"><small>{t('taskflow.inProgress')}</small><strong>{items.filter((item) => item.status === 'in_progress').length}</strong></article><article className="suite-stat-card"><small>{t('taskflow.completedWeek')}</small><strong>{items.filter((item) => item.status === 'done').length}</strong></article></section> : null}
        {!loading && !displayCards.length ? <p className="suite-empty-state">{t(`services.${service}.empty`)}</p> : null}
        <section className="suite-service-grid">{displayCards.map((item) => { const id = item._id ?? item.id ?? item.title; const done = doneItems.includes(id) || item.status === completedStatus(service); const overdue = service === 'taskflow' && item.deadline && new Date(item.deadline) < new Date() && !done; return <article className={`suite-panel suite-service-card${done ? ' is-complete' : ''}${overdue ? ' is-overdue' : ''}`} key={id}><div className="suite-service-card__icon"><Icon size={20} /></div><span className="suite-chip">{done ? t('services.done') : item.status === 'in_progress' ? t('taskflow.inProgress') : item.status === 'pending' ? t('taskflow.pending') : t('services.today')}</span><h2>{item.title}</h2><p>{item.description || item.detail || ''}</p><div className="suite-service-card__meta"><span><Clock3 size={14} />{formatDate(item.deadline || item.dueDate || item.date, locale)}</span>{service === 'taskflow' ? <span className={`taskflow-priority taskflow-priority--${item.priority || 'medium'}`}>{t(`taskflow.${item.priority || 'medium'}`)}</span> : null}<button type="button" disabled={done} aria-label={`${t('services.markDone')} ${item.title}`} onClick={() => completeItem(item)}><Check size={15} />{done ? t('services.done') : t('services.markDone')}</button></div></article>; })}</section>
        {isFormOpen ? <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setIsFormOpen(false); }}><section className="modal-sheet service-create-modal" role="dialog" aria-modal="true" aria-labelledby="service-create-title"><header className="modal-heading"><h2 id="service-create-title">{t(`services.${service}.action`)}</h2><button type="button" aria-label={t('common.cancel')} onClick={() => setIsFormOpen(false)}><X size={18} /></button></header><form className="form-stack" onSubmit={saveItem}>{renderServiceFields(service, t, locale)}<div className="modal-actions"><button className="suite-button suite-button--secondary" type="button" onClick={() => setIsFormOpen(false)}>{t('services.form.cancel')}</button><button className="suite-button suite-button--primary" type="submit" disabled={isSaving}>{t('services.form.save')}</button></div></form></section></div> : null}
      </main>
    </PublicLayout>
  );
}

function renderServiceFields(service, t, locale) {
  const f = (key) => t(`services.form.${key}`);
  if (service === 'taskflow') return <><label>{f('name')}<input name="title" required maxLength="120" /></label><label>{f('description')}<textarea name="description" rows="3" /></label><label>{f('assignee')}<input name="assignee" /></label><label>{t('taskflow.deadline')}<input name="deadline" type="date" /></label><label>{t('taskflow.priority')}<select name="priority"><option value="medium">{t('taskflow.medium')}</option><option value="high">{t('taskflow.high')}</option><option value="low">{t('taskflow.low')}</option></select></label></>;
  if (service === 'receivables') return <><label>{f('client')}<input name="name" required /></label><label>{f('serviceName')}<input name="service" required /></label><label>{f('amount')}<input name="amount" type="number" min="0" step="100" required /></label><label>{f('dueDate')}<input name="dueDate" type="date" /></label></>;
  if (service === 'outings') return <><label>{f('name')}<input name="name" required /></label><label>{f('client')}<input name="restaurant" /></label><label>{f('amount')}<input name="value" type="number" min="0" step="100" required /></label><label>{f('date')}<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label><input type="hidden" name="locale" value={locale} /></>;
  return <><label>{f('name')}<input name="name" required /></label><label>{f('date')}<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label><label>{f('monthlyGoal')}<input name="monthlyGoal" type="number" min="1" defaultValue="12" /></label></>;
}

function makePayload(service, values, locale) {
  if (service === 'taskflow') return { title: values.title, description: values.description, type: 'daily', assigneeType: 'self', assignee: values.assignee, deadline: values.deadline, priority: values.priority || 'medium', status: 'pending' };
  if (service === 'receivables') return { name: values.name, amount: Number(values.amount), service: values.service, dueDate: values.dueDate || undefined, status: 'pending' };
  if (service === 'outings') { const date = new Date(`${values.date}T12:00:00`); return { name: values.name, restaurant: values.restaurant, value: Number(values.value), date: values.date, weekday: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date), type: 'outing', status: 'planned' }; }
  return { name: values.name, date: values.date, monthlyGoal: Number(values.monthlyGoal) || 12, exercises: [], status: 'pending' };
}

function normalizeItem(item, service, locale) {
  const title = item.title ?? item.name ?? item.service ?? '—';
  return { ...item, id: item._id ?? title, title, description: item.description ?? item.restaurant ?? item.service, date: item.dueDate ?? item.date, locale, service };
}

function completedStatus(service) {
  return { taskflow: 'done', receivables: 'collected', outings: 'completed', fitpulse: 'completed' }[service];
}

function priorityRank(priority) { return { high: 3, medium: 2, low: 1 }[priority] ?? 0; }
function isToday(value) { return value && new Date(value).toDateString() === new Date().toDateString(); }
function formatDate(value, locale) { return value ? new Date(value).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO') : '—'; }
