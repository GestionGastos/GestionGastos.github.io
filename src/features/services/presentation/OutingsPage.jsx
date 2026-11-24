import { useCallback, useEffect, useState } from 'react';
import { Check, CirclePlus, RefreshCw, Trash2 } from 'lucide-react';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { useAuth } from '../../auth/presentation/useAuth.js';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { createOuting, createOutingPlace, deleteOuting, getOutingSummary, listOutingPlaces, listOutings, synchronizeOuting, completeOuting } from '../infrastructure/serviceRepository.js';
import { formatCurrency } from '../../../shared/i18n/currency.js';

export function OutingsPage() {
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const [plans, setPlans] = useState([]);
  const [places, setPlaces] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [completePlan, setCompletePlan] = useState(null);
  const [newPlan, setNewPlan] = useState(false);

  const reload = useCallback(async () => {
    try {
      const now = new Date(); const from = new Date(now.getFullYear(), now.getMonth(), 1); const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const [nextPlans, nextPlaces, nextSummary] = await Promise.all([listOutings(token), listOutingPlaces(token), getOutingSummary(token, from, to)]);
      setPlans(nextPlans); setPlaces(nextPlaces); setSummary(nextSummary); setError('');
    } catch { setError(t('homesync.outings.loadError')); }
  }, [token, t]);
  useEffect(() => { reload(); }, [reload]);

  const savePlan = async (event) => {
    event.preventDefault(); setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const date = new Date(`${values.date}T12:00:00`);
      let place = places.find((p) => p.name.trim().toLowerCase() === values.place.trim().toLowerCase());
      if (!place) { const response = await createOutingPlace(token, { name: values.place.trim(), type: values.placeType }); place = response.place; }
      const result = await createOuting(token, { name: values.name.trim(), restaurant: place.name, place: place._id, value: Number(values.value) || 0, date: date.toISOString(), weekday: new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-CO', { weekday: 'long' }).format(date), type: 'outing', status: 'planned' });
      setNotice(t('homesync.outings.created')); setNewPlan(false); await reload();
    } catch { setError(t('homesync.outings.saveError')); }
    finally { setBusy(false); }
  };

  const complete = async (event) => {
    event.preventDefault(); setBusy(true); const values = Object.fromEntries(new FormData(event.currentTarget));
    const mode = values.paymentMode;
    const amount = Number(values.actualAmount); const taxRate = Number(values.taxRate) || 0; const tip = Number(values.tip) || 0;
    const splitItems = mode === 'split' ? [{ name: values.itemName || completePlan.name, quantity: 1, unitPrice: Math.max(0, amount - tip) / (1 + taxRate / 100), taxRate }] : [];
    try {
      const response = await completeOuting(token, completePlan._id, { place: values.place, actualAmount: amount, completedAt: new Date().toISOString(), paymentMode: mode, participants: String(values.participants || '').split(',').map((name) => name.trim()).filter(Boolean), splitItems, tip });
      setPlans((current) => current.map((p) => p._id === completePlan._id ? response.plan : p)); setCompletePlan(null); setNotice(t('homesync.outings.completed')); await reload();
    } catch { setError(t('homesync.outings.completeError')); }
    finally { setBusy(false); }
  };

  const synchronize = async (plan) => { setBusy(true); try { const response = await synchronizeOuting(token, plan._id); setPlans((current) => current.map((p) => p._id === plan._id ? response.plan : p)); setNotice(t('homesync.outings.synced')); await reload(); } catch { setError(t('homesync.outings.syncError')); } finally { setBusy(false); } };
  const remove = async (plan) => { setBusy(true); try { await deleteOuting(token, plan._id); setPlans((current) => current.filter((p) => p._id !== plan._id)); await reload(); } catch { setError(t('homesync.outings.deleteError')); } finally { setBusy(false); } };

  return <PublicLayout><main className="suite-page">
    <header className="suite-module-header"><div><p className="suite-eyebrow"><span />HomeSync</p><h1>{t('services.outings.title')}</h1><p>{t('services.outings.subtitle')}</p></div><button className="suite-button suite-button--primary" onClick={() => setNewPlan(true)}><CirclePlus size={17} />{t('services.outings.action')}</button></header>
    {notice && <p className="suite-notice" role="status">{notice}</p>}{error && <p className="form-feedback form-feedback--error" role="alert">{error}</p>}
    <section className="suite-stats-grid"><Metric title={t('homesync.outings.count')} value={summary?.count ?? plans.length} /><Metric title={t('homesync.outings.estimated')} value={formatCurrency(summary?.estimatedAmount ?? 0)} /><Metric title={t('homesync.outings.actual')} value={formatCurrency(summary?.actualAmount ?? 0)} /><Metric title={t('homesync.outings.places')} value={summary?.places ?? places.length} /></section>
    <section className="suite-service-grid">{plans.map((plan) => <article className="suite-panel suite-service-card" key={plan._id}><span className="suite-chip">{t(`homesync.outings.status.${plan.status}`)}</span><h2>{plan.name}</h2><p>{plan.restaurant || places.find((p) => p._id === plan.place)?.name || '—'}</p><p>{new Date(plan.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO')} · {formatCurrency(plan.actualAmount ?? plan.value ?? 0)}</p>{plan.invoice && <small>{t('homesync.outings.invoice')}: {String(plan.invoice).slice(-8)}</small>}<div className="suite-header-actions">{plan.status === 'planned' && <button className="suite-button suite-button--primary" onClick={() => setCompletePlan(plan)}><Check size={15} />{t('homesync.outings.complete')}</button>}{plan.status === 'completed' && <button className="suite-button suite-button--primary" disabled={busy} onClick={() => synchronize(plan)}><RefreshCw size={15} />{t('homesync.outings.sync')}</button>}{plan.status !== 'synced' && <button className="suite-button suite-button--secondary" disabled={busy} onClick={() => remove(plan)}><Trash2 size={15} />{t('common.delete')}</button>}</div></article>)}</section>
    {newPlan && <Dialog title={t('services.outings.action')} close={() => setNewPlan(false)}><form className="form-stack" onSubmit={savePlan}><label>{t('homesync.outings.name')}<input name="name" required /></label><label>{t('homesync.outings.place')}<input name="place" list="outing-places" required /><datalist id="outing-places">{places.map((p) => <option key={p._id}>{p.name}</option>)}</datalist></label><label>{t('homesync.outings.placeType')}<select name="placeType"><option value="restaurant">{t('homesync.outings.restaurant')}</option><option value="cafe">{t('homesync.outings.cafe')}</option><option value="bar">{t('homesync.outings.bar')}</option><option value="other">{t('homesync.outings.other')}</option></select></label><label>{t('homesync.outings.date')}<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0,10)} /></label><label>{t('homesync.outings.estimate')}<input name="value" type="number" min="0" step="0.01" /></label><div className="modal-actions"><button type="button" className="suite-button suite-button--secondary" onClick={() => setNewPlan(false)}>{t('common.cancel')}</button><button className="suite-button suite-button--primary" disabled={busy}>{t('common.saveChanges')}</button></div></form></Dialog>}
    {completePlan && <Dialog title={t('homesync.outings.completeTitle')} close={() => setCompletePlan(null)}><form className="form-stack" onSubmit={complete}><label>{t('homesync.outings.place')}<select name="place" required defaultValue={completePlan.place?._id ?? completePlan.place ?? ''}>{places.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></label><label>{t('homesync.outings.actual')}<input name="actualAmount" type="number" min="0" step="0.01" required /></label><label>{t('homesync.outings.paymentMode')}<select name="paymentMode"><option value="full">{t('homesync.outings.full')}</option><option value="split">{t('homesync.outings.split')}</option></select></label><label>{t('homesync.outings.participants')}<input name="participants" placeholder={t('homesync.outings.participantsHint')} /></label><label>{t('homesync.outings.itemName')}<input name="itemName" /></label><label>{t('homesync.outings.taxRate')}<input name="taxRate" type="number" min="0" max="100" step="0.01" defaultValue="0" /></label><label>{t('homesync.outings.tip')}<input name="tip" type="number" min="0" step="0.01" defaultValue="0" /></label><div className="modal-actions"><button type="button" className="suite-button suite-button--secondary" onClick={() => setCompletePlan(null)}>{t('common.cancel')}</button><button className="suite-button suite-button--primary" disabled={busy}>{t('homesync.outings.complete')}</button></div></form></Dialog>}
  </main></PublicLayout>;
}

function Metric({ title, value }) { return <article className="suite-stat-card"><small>{title}</small><strong>{value}</strong></article>; }
function Dialog({ title, close, children }) { return <div className="modal-backdrop" role="presentation"><section className="modal-sheet service-create-modal" role="dialog" aria-modal="true"><header className="modal-heading"><h2>{title}</h2><button type="button" onClick={close} aria-label="Close">×</button></header>{children}</section></div>; }
