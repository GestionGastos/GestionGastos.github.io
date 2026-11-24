import { useMemo, useState } from 'react';
import { Check, ChevronDown, CirclePlus, RotateCcw, Save, Settings2, SlidersHorizontal, ToggleLeft, ToggleRight } from 'lucide-react';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { initialTaxRates } from '../domain/homeSyncData.js';
import { formatCurrency } from '../../../shared/i18n/currency.js';

export function HomeSyncTaxSettingsPage() {
  const { t } = useI18n();
  const [rates, setRates] = useState(initialTaxRates);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('rates');
  const [showNewRate, setShowNewRate] = useState(false);
  const [discloseTax, setDiscloseTax] = useState(true);
  const [overspendAlert, setOverspendAlert] = useState(true);
  const rateAverage = rates.filter((rate) => rate.active).reduce((total, rate) => total + rate.rate, 0) / (rates.filter((rate) => rate.active).length || 1);
  const taxEstimate = useMemo(() => 34998 + rates.filter((rate) => rate.active).length * 127, [rates]);

  const toggleRate = (id) => { setRates((current) => current.map((rate) => rate.id === id ? { ...rate, active: !rate.active } : rate)); setSaved(false); };
  const saveRate = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setRates((current) => [...current, { id: `tax-${Date.now()}`, name: data.get('name'), description: data.get('scope'), rate: Number(data.get('rate')), type: 'Porcentual', scope: data.get('scope'), active: true }]);
    setShowNewRate(false);
    setSaved(false);
  };

  return (
    <PublicLayout>
      <main className="suite-page tax-settings-page">
        <header className="suite-module-header"><div><p className="suite-eyebrow"><span />{t('homesync.tax.engine')} · HomeSync → FinTrack</p><h1>{t('homesync.tax.title')}</h1><p>{t('homesync.tax.subtitle')}</p></div><div className="suite-header-actions"><button type="button" className="suite-button suite-button--secondary" onClick={() => { setRates(initialTaxRates); setSaved(false); }}><RotateCcw size={16} />{t('common.discard')}</button><button type="button" className="suite-button suite-button--primary" onClick={() => setSaved(true)}><Save size={17} />{t('common.saveChanges')}</button></div></header>
        {saved ? <p className="suite-notice" role="status"><Check size={16} />{t('homesync.tax.saved')}</p> : null}

        <nav className="suite-list-tabs tax-tabs" aria-label={t('homesync.tax.settingsTabs')}>
          {['rates', 'categories', 'connection', 'currency'].map((tab) => <button key={tab} type="button" aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)}><SlidersHorizontal size={16} />{t(`homesync.tax.tabs.${tab}`)}</button>)}
        </nav>

        <section className="suite-stats-grid tax-stats"><article className="suite-stat-card"><small>{t('homesync.tax.averageRate')}</small><strong>{rateAverage.toFixed(2)}%</strong><span>{t('homesync.tax.rateEstimate')}</span></article><article className="suite-stat-card suite-stat-card--orange"><small>{t('homesync.tax.monthlyTax')}</small><strong>{formatCurrency(taxEstimate)}</strong><span>{t('homesync.tax.projectedThisMonth')}</span></article><article className="suite-stat-card suite-stat-card--highlight"><small>{t('homesync.tax.taxedCategories')}</small><strong>{rates.filter((rate) => rate.active).length} <span>/ {rates.length}</span></strong><span>{t('homesync.tax.syncOn')}</span></article></section>

        {showNewRate ? <form className="suite-panel tax-new-rate" onSubmit={saveRate}><h2>{t('homesync.tax.addRate')}</h2><label>{t('homesync.tax.taxName')}<input name="name" required maxLength="60" /></label><div className="suite-form-row"><label>{t('homesync.tax.rate')}<input name="rate" type="number" min="0" max="100" step="0.01" required /></label><label>{t('homesync.tax.scope')}<input name="scope" required maxLength="60" /></label></div><div className="suite-form-actions"><button type="button" className="suite-button suite-button--secondary" onClick={() => setShowNewRate(false)}>{t('common.cancel')}</button><button type="submit" className="suite-button suite-button--primary"><CirclePlus size={16} />{t('homesync.tax.addRate')}</button></div></form> : null}

        <section className="suite-panel tax-rate-panel"><div className="suite-panel-heading"><div><p className="suite-eyebrow"><span />{t('homesync.tax.ratesEyebrow')}</p><h2>{t('homesync.tax.configurableRates')}</h2></div><button type="button" className="suite-button suite-button--secondary" onClick={() => setShowNewRate((visible) => !visible)}><CirclePlus size={17} />{t('homesync.tax.addRate')}</button></div><div className="suite-table-scroll"><table className="suite-table tax-table"><thead><tr><th>{t('homesync.tax.taxName')}</th><th>{t('homesync.tax.rate')}</th><th>{t('homesync.tax.type')}</th><th>{t('homesync.tax.scope')}</th><th>{t('homesync.tax.status')}</th><th><span className="sr-only">{t('common.actions')}</span></th></tr></thead><tbody>{rates.map((rate) => <tr key={rate.id}><td><strong>{rate.name}</strong><small>{rate.description}</small></td><td><span className="suite-chip">{rate.rate.toFixed(2)}%</span></td><td>{rate.type}</td><td>{rate.scope}</td><td><button type="button" className={`suite-switch${rate.active ? ' is-on' : ''}`} role="switch" aria-checked={rate.active} aria-label={t('homesync.tax.toggleRate', { name: rate.name })} onClick={() => toggleRate(rate.id)}>{rate.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}</button></td><td><button className="suite-icon-button" type="button" aria-label={t('homesync.tax.editRate', { name: rate.name })} onClick={() => setSaved(false)}><Settings2 size={16} /></button></td></tr>)}</tbody></table></div></section>

        <div className="tax-detail-grid"><section className="suite-panel tax-rules"><p className="suite-eyebrow">{t('homesync.tax.automation')}</p><h2>{t('homesync.tax.categoryRules')}</h2><p>{t('homesync.tax.categoryRulesDescription')}</p>{[
          ['groceries', 'Exento de IVA (0%)'], ['cleaning', 'IVA Estándar (19%)'], ['restaurants', 'Impoconsumo (8%)'], ['snacks', 'IVA 19% + Saludable (10%)'],
        ].map(([category, selection]) => <label className="tax-rule-row" key={category}><span><strong>{t(`homesync.tax.categories.${category}`)}</strong><small>{t(`homesync.tax.categoryDescriptions.${category}`)}</small></span><span>{t('homesync.tax.apply')}<select aria-label={t('homesync.tax.ruleFor', { category: t(`homesync.tax.categories.${category}`) })} defaultValue={selection}><option>Exento de IVA (0%)</option><option>IVA Estándar (19%)</option><option>IVA Reducido (5%)</option><option>Impoconsumo (8%)</option></select><ChevronDown size={14} /></span></label>)}</section><aside className="suite-panel receipt-preview"><p className="suite-eyebrow">{t('homesync.tax.preview')}</p><h2>{t('homesync.tax.receiptSimulator')}</h2><div className="receipt-preview__store"><strong>{t('homesync.tax.localSupermarket')}</strong><small>{t('homesync.tax.today')}</small></div><div className="receipt-preview__line"><span>{t('homesync.tax.receiptProduct')}</span><span>{formatCurrency(18000)}</span></div><div className="receipt-preview__line"><span>{t('homesync.tax.receiptCleaning')}</span><span>{formatCurrency(49980)}</span></div><hr /><div className="receipt-preview__line"><span>{t('homesync.tax.netSubtotal')}</span><span>{formatCurrency(50480)}</span></div><div className="receipt-preview__line receipt-preview__line--tax"><span>IVA General (19%)</span><span>+{formatCurrency(5109)}</span></div><div className="receipt-preview__line receipt-preview__line--tax"><span>{t('homesync.tax.healthyTax')}</span><span>+{formatCurrency(658)}</span></div><div className="receipt-preview__total"><span>{t('homesync.tax.ticketTotal')}</span><strong>{formatCurrency(58500)}</strong></div><p className="suite-connected"><Check size={14} />{t('homesync.tax.rulesApplied')}</p></aside></div>

        <section className="tax-sync-section"><p className="suite-eyebrow"><span />{t('homesync.tax.accounting')}</p><h2>{t('homesync.tax.fintrackOptions')}</h2><p>{t('homesync.tax.fintrackOptionsDescription')}</p><div className="tax-sync-options"><ToggleCard title={t('homesync.tax.discloseTax')} text={t('homesync.tax.discloseTaxText')} value={discloseTax} onChange={() => { setDiscloseTax((value) => !value); setSaved(false); }} /><ToggleCard title={t('homesync.tax.overspendAlert')} text={t('homesync.tax.overspendAlertText')} value={overspendAlert} onChange={() => { setOverspendAlert((value) => !value); setSaved(false); }} /></div></section>
        <footer className="suite-integration-banner tax-save-banner"><span className="suite-integration-icon"><Check size={19} /></span><div><strong>{t('homesync.tax.autoReady')}</strong><p>{t('homesync.tax.changesAffect')}</p></div><button type="button" className="suite-button suite-button--secondary" onClick={() => setSaved(false)}>{t('common.cancel')}</button><button type="button" className="suite-button suite-button--primary" onClick={() => setSaved(true)}><Check size={16} />{t('common.saveChanges')}</button></footer>
      </main>
    </PublicLayout>
  );
}

function ToggleCard({ title, text, value, onChange }) {
  const { t } = useI18n();
  return <article className="suite-panel tax-toggle-card"><div><h3>{title}</h3><p>{text}</p><small>{t('homesync.tax.accountLinked')}</small></div><button type="button" className={`suite-switch${value ? ' is-on' : ''}`} role="switch" aria-checked={value} aria-label={title} onClick={onChange}>{value ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}</button></article>;
}
