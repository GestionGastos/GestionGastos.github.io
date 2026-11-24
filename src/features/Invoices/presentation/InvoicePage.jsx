import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Download,
  FileCheck2,
  FileText,
  MoreVertical,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
  Timer,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { formatCurrency } from '../../../shared/i18n/currency.js';

const sampleInvoiceRecords = [
  { id: 'FAC-2024-0128', date: '24 Nov, 2024', supplier: 'AWS Cloud Services', detail: 'Servicios de infraestructura cloud', category: 'Infraestructura', due: '30 Nov, 2024', amount: '$1,850.00', status: 'processed' },
  { id: 'FAC-2024-0127', date: '22 Nov, 2024', supplier: 'Adobe Creative Cloud', detail: 'Licencia corporativa anual', category: 'Licencias', due: '28 Nov, 2024', amount: '$890.00', status: 'processed' },
  { id: 'FAC-2024-0126', date: '20 Nov, 2024', supplier: 'Consultoría Tech Corp', detail: 'Auditoría de Sistemas S.A.', category: 'Servicios', due: '30 Nov, 2024', amount: '$4,500.00', status: 'pending' },
  { id: 'FAC-2024-0125', date: '18 Nov, 2024', supplier: 'Logística Express Global', detail: 'RUT inválido / Error Timbrado', category: 'Operativo', due: '19 Nov, 2024 (Vencida)', amount: '$940.00', status: 'failed' },
  { id: 'FAC-2024-0124', date: '17 Nov, 2024', supplier: 'Arriendo Oficinas Central', detail: 'Inmobiliaria Metropolitana', category: 'Operativo', due: '30 Nov, 2024', amount: '$6,500.00', status: 'processed' },
  { id: 'FAC-2024-0123', date: '15 Nov, 2024', supplier: 'Servicios Contables Deloitte', detail: 'Honorarios Profesionales', category: 'Servicios', due: '28 Nov, 2024', amount: '$2,750.00', status: 'processed' },
  { id: 'FAC-2024-0122', date: '14 Nov, 2024', supplier: 'Google Workspace & Cloud', detail: 'Alphabet Ireland Ltd.', category: 'Licencias', due: '30 Nov, 2024', amount: '$1,620.50', status: 'pending' },
  { id: 'FAC-2024-0121', date: '12 Nov, 2024', supplier: 'Datadog Monitoring Inc', detail: 'Firma electrónica corrupta', category: 'Infraestructura', due: '15 Nov, 2024 (Rechazada)', amount: '$490.00', status: 'failed' },
];

const statusConfig = {
  processed: { icon: CheckCircle2, tone: 'processed' },
  pending: { icon: Timer, tone: 'pending' },
  failed: { icon: XCircle, tone: 'failed' },
};

export function InvoicePage() {
  const { t } = useI18n();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [manualInvoices, setManualInvoices] = useState(readManualInvoices);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const invoiceRecords = [...manualInvoices, ...sampleInvoiceRecords];

  const visibleInvoices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return invoiceRecords.filter((invoice) => {
      const matchesStatus = filter === 'all' || invoice.status === filter;
      const matchesSearch = !normalizedSearch || Object.values(invoice).join(' ').toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [filter, search, manualInvoices]);

  return (
    <PublicLayout>
      <main className="invoice-page">
        <div className="invoice-page__ambient invoice-page__ambient--green" />
        <div className="invoice-page__ambient invoice-page__ambient--orange" />
        <div className="invoice-container">
          <InvoiceHeader t={t} onCreate={() => setIsCreateOpen(true)} />
          {notice ? <p className="invoice-manual-notice" role="status">{notice}</p> : null}
          <InvoiceMetrics t={t} />
          <SyncBanner t={t} />
          <section className="invoice-table-card">
            <div className="invoice-toolbar">
              <div className="invoice-filters" role="tablist" aria-label={t('invoice.filters.title')}>
                <FilterButton active={filter === 'all'} count={145} label={t('invoice.filters.all')} onClick={() => setFilter('all')} />
                <FilterButton active={filter === 'processed'} count={128} label={t('invoice.filters.processed')} tone="processed" onClick={() => setFilter('processed')} />
                <FilterButton active={filter === 'pending'} count={14} label={t('invoice.filters.pending')} tone="pending" onClick={() => setFilter('pending')} />
                <FilterButton active={filter === 'failed'} count={3} label={t('invoice.filters.failed')} tone="failed" onClick={() => setFilter('failed')} />
              </div>
              <div className="invoice-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('invoice.search')} aria-label={t('invoice.search')} /></div>
            </div>
            <div className="invoice-table-scroll">
              <table className="invoice-table">
                <thead><tr><th>{t('invoice.table.invoice')}</th><th>{t('invoice.table.supplier')}</th><th>{t('invoice.table.category')}</th><th>{t('invoice.table.due')}</th><th className="text-right">{t('invoice.table.amount')}</th><th className="text-center">{t('invoice.table.status')}</th><th className="text-center">{t('invoice.table.actions')}</th></tr></thead>
                <tbody>{visibleInvoices.map((invoice) => <InvoiceRow key={invoice.id} invoice={invoice} t={t} />)}</tbody>
              </table>
              {!visibleInvoices.length ? <div className="invoice-empty">{t('invoice.empty')}</div> : null}
            </div>
            <div className="invoice-pagination"><span>{t('invoice.showing')} <strong>1-{visibleInvoices.length}</strong> {t('invoice.of')} <strong>145</strong> {t('invoice.processedPlural')}</span><div><button type="button" disabled><ChevronLeft size={17} /></button><button className="active" type="button">1</button><button type="button">2</button><button type="button">3</button><span>…</span><button type="button">15</button><button type="button"><ChevronRight size={17} /></button></div></div>
          </section>
          <InvoiceInfoCards t={t} />
        </div>
        {isCreateOpen ? <ManualInvoiceModal t={t} onClose={() => setIsCreateOpen(false)} onSave={(invoice) => { const next = [invoice, ...manualInvoices]; setManualInvoices(next); localStorage.setItem('lifesync.manualInvoices', JSON.stringify(next)); setNotice(t('invoice.manual.saved')); setIsCreateOpen(false); }} /> : null}
      </main>
    </PublicLayout>
  );
}

function InvoiceHeader({ t, onCreate }) {
  return (
    <section className="invoice-heading">
      <div>
        <div className="invoice-eyebrow"><span />{t('invoice.eyebrow')}</div>
        <h1>{t('invoice.title')}</h1>
        <p>{t('invoice.subtitle')}</p>
      </div>
      <div className="invoice-heading__actions">
        <button className="invoice-secondary-button" type="button">
          <Download size={18} />
          {t('invoice.export')}
          <small>CSV/PDF</small>
        </button>
        <button className="invoice-primary-button" type="button" onClick={onCreate}>
          <PlusCircle size={20} />
          {t('invoice.new')}
        </button>
      </div>
    </section>
  );
}

function ManualInvoiceModal({ t, onClose, onSave }) {
  const { locale } = useI18n();
  const [quantity, setQuantity] = useState('1');
  const [unitValue, setUnitValue] = useState('');
  const [vat, setVat] = useState('19');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const subtotal = Number(values.quantity) * Number(values.unitValue);
    const tax = subtotal * Number(values.vat) / 100;
    const issued = new Date(`${values.issueDate}T12:00:00`);
    const currencyLocale = locale === 'en' ? 'en-US' : 'es-CO';
    const amount = subtotal + tax;
    setSubmitting(true);
    onSave({
      id: values.number.trim(), date: issued.toLocaleDateString(currencyLocale), supplier: values.seller.trim(), detail: values.buyer.trim(), category: description.trim(), due: values.dueDate || '—',
      amount: formatCurrency(amount, undefined, locale), status: 'pending', sellerId: values.sellerId.trim(), buyerId: values.buyerId.trim(), quantity: Number(values.quantity), unitValue: Number(values.unitValue), vat: Number(values.vat), subtotal, tax, createdManually: true,
    });
  };

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}><section className="modal-sheet invoice-manual-modal" role="dialog" aria-modal="true" aria-labelledby="manual-invoice-title"><header className="modal-heading"><h2 id="manual-invoice-title">{t('invoice.manual.title')}</h2><button type="button" aria-label={t('invoice.manual.cancel')} onClick={onClose}>×</button></header><form className="form-stack invoice-manual-form" onSubmit={submit}><p className="invoice-manual-warning"><ShieldCheck size={16} />{t('invoice.manual.legalNotice')}</p><div className="invoice-manual-grid"><label>{t('invoice.manual.number')}<input name="number" required maxLength="30" /></label><label>{t('invoice.manual.issueDate')}<input name="issueDate" type="date" required defaultValue={new Date().toISOString().slice(0,10)} /></label><label>{t('invoice.manual.seller')}<input name="seller" required /></label><label>{t('invoice.manual.sellerId')}<input name="sellerId" required /></label><label>{t('invoice.manual.buyer')}<input name="buyer" required /></label><label>{t('invoice.manual.buyerId')}<input name="buyerId" required /></label><label className="invoice-manual-grid__wide">{t('invoice.manual.description')}<input name="description" required value={description} onChange={(event) => setDescription(event.target.value)} /></label><label>{t('invoice.manual.quantity')}<input name="quantity" type="number" min="0.01" step="0.01" required value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label><label>{t('invoice.manual.unitValue')}<input name="unitValue" type="number" min="0" step="1" required value={unitValue} onChange={(event) => setUnitValue(event.target.value)} /></label><label>{t('invoice.manual.vat')}<input name="vat" type="number" min="0" max="100" step="0.1" value={vat} onChange={(event) => setVat(event.target.value)} /></label><label>{t('invoice.manual.dueDate')}<input name="dueDate" type="date" /></label></div><div className="invoice-manual-total"><span>{t('invoice.table.amount')}</span><strong>{formatCurrency(Number(quantity || 0) * Number(unitValue || 0) * (1 + Number(vat || 0) / 100))}</strong></div><div className="modal-actions"><button type="button" className="invoice-secondary-button" onClick={onClose}>{t('invoice.manual.cancel')}</button><button type="submit" className="invoice-primary-button" disabled={submitting}>{t('invoice.manual.save')}</button></div></form></section></div>;
}

function readManualInvoices() {
  try { return JSON.parse(localStorage.getItem('lifesync.manualInvoices')) ?? []; } catch { return []; }
}

function InvoiceMetrics({ t }) {
  const metrics = [
    { icon: <FileCheck2 />, label: t('invoice.metrics.processed'), value: '$48,250.00', suffix: 'USD', detail: t('invoice.metrics.processedDetail'), badge: '+14.2%', tone: 'green' },
    { icon: <Timer />, label: t('invoice.metrics.pending'), value: '$6,120.50', suffix: 'USD', detail: t('invoice.metrics.pendingDetail'), badge: t('invoice.metrics.pendingBadge'), tone: 'orange' },
    { icon: <AlertCircle />, label: t('invoice.metrics.failed'), value: '$1,430.00', suffix: 'USD', detail: t('invoice.metrics.failedDetail'), badge: t('invoice.metrics.failedBadge'), tone: 'red' },
    { icon: <Sparkles />, label: t('invoice.metrics.ocr'), value: '1.8', suffix: t('invoice.metrics.seconds'), detail: t('invoice.metrics.ocrDetail'), badge: t('invoice.metrics.ocrBadge'), tone: 'blue' },
  ];

  return <section className="invoice-metrics">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section>;
}

function MetricCard({ icon, label, value, suffix, detail, badge, tone }) {
  return (
    <article className={`invoice-metric invoice-metric--${tone}`}>
      <div className="invoice-metric__top">
        <span className="invoice-metric__icon">{icon}</span>
        <span className="invoice-metric__badge">{badge}</span>
      </div>
      <div>
        <small>{label}</small>
        <div className="invoice-metric__value"><strong>{value}</strong><span>{suffix}</span></div>
        <div className="invoice-metric__detail">{detail}</div>
      </div>
    </article>
  );
}

function SyncBanner({ t }) {
  return (
    <section className="invoice-sync">
      <div className="invoice-sync__icon"><Cloud size={25} /></div>
      <div>
        <div className="invoice-sync__label">{t('invoice.sync.label')} <span>• {t('invoice.sync.time')}</span></div>
        <h2>{t('invoice.sync.title')}</h2>
        <p>{t('invoice.sync.description')}</p>
      </div>
      <button className="invoice-sync__button" type="button"><RefreshCw size={16} />{t('invoice.sync.action')}</button>
    </section>
  );
}

function FilterButton({ active, count, label, tone, onClick }) {
  return (
    <button className={`invoice-filter ${active ? 'active' : ''}`} type="button" onClick={onClick}>
      {tone ? <span className={`invoice-status-dot invoice-status-dot--${tone}`} /> : null}
      <span>{label}</span>
      <small>{count}</small>
    </button>
  );
}

function InvoiceRow({ invoice, t }) {
  const config = statusConfig[invoice.status];
  const StatusIcon = config.icon;
  return (
    <tr>
      <td>
        <div className="invoice-id">
          <span className={`invoice-row-icon invoice-row-icon--${config.tone}`}><FileText size={17} /></span>
          <div><strong>{invoice.id}</strong><small>{invoice.date}</small></div>
        </div>
      </td>
      <td><strong>{invoice.supplier}</strong><small>{invoice.detail}</small></td>
      <td><span className="invoice-category">{invoice.category}</span></td>
      <td className={invoice.status === 'failed' ? 'invoice-date--failed' : ''}>{invoice.due}</td>
      <td className={`text-right invoice-amount ${invoice.status === 'failed' ? 'invoice-amount--failed' : ''}`}>{invoice.amount}</td>
      <td className="text-center">
        <span className={`invoice-status invoice-status--${config.tone}`}><StatusIcon size={14} />{t(`invoice.status.${invoice.status}`)}</span>
      </td>
      <td className="text-center">
        <div className="invoice-actions">
          {invoice.status === 'pending' ? <button type="button" className="invoice-row-action invoice-row-action--pending">{t('invoice.actions.approve')}</button> : null}
          {invoice.status === 'failed' ? <button type="button" className="invoice-row-action invoice-row-action--failed"><RefreshCw size={14} />{t('invoice.actions.retry')}</button> : null}
          {invoice.status === 'processed' ? <button type="button" className="invoice-icon-action" aria-label={t('invoice.actions.download')}><Download size={17} /></button> : null}
          <button type="button" className="invoice-icon-action" aria-label={t('invoice.actions.options')}><MoreVertical size={17} /></button>
        </div>
      </td>
    </tr>
  );
}

function InvoiceInfoCards({ t }) {
  return (
    <section className="invoice-info-cards">
      <InfoCard icon={<ShieldCheck />} title={t('invoice.info.validationTitle')} text={t('invoice.info.validationText')} tone="green" />
      <InfoCard icon={<FileText />} title={t('invoice.info.ocrTitle')} text={t('invoice.info.ocrText')} tone="blue" />
      <InfoCard icon={<Cloud />} title={t('invoice.info.erpTitle')} text={t('invoice.info.erpText')} tone="slate" />
    </section>
  );
}

function InfoCard({ icon, title, text, tone }) {
  return (
    <article className={`invoice-info-card invoice-info-card--${tone}`}>
      <span>{icon}</span>
      <div><strong>{title}</strong><p>{text}</p></div>
    </article>
  );
}
