import { ArrowDown, ArrowRight, Check, CheckCircle2, CreditCard, Dumbbell, ListChecks, ReceiptText, ShieldCheck, ShoppingCart, Sparkles, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { Button } from '../../../shared/presentation/Button.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { useAuth } from '../../auth/presentation/useAuth.js';
import { useEffect, useState } from 'react';

const suiteModules = [
  { key: 'fintrack', label: 'FinTrack', icon: WalletCards, status: 'active' },
  { key: 'homesync', label: 'HomeSync', icon: ShoppingCart, status: 'active' },
  { key: 'taskflow', label: 'TaskFlow', icon: ListChecks, status: 'active' },
  { key: 'receivables', label: 'Cuentas de Cobro', icon: ReceiptText, status: 'active' },
  { key: 'fitpulse', label: 'FitPulse', icon: Dumbbell, status: 'active' },
];

export function LandingPage() {
  const { t } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installMessage, setInstallMessage] = useState('');
  useEffect(() => {
    const captureInstall = (event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener('beforeinstallprompt', captureInstall);
    return () => window.removeEventListener('beforeinstallprompt', captureInstall);
  }, []);
  const installApp = async () => {
    if (!installPrompt) { setInstallMessage(t('landingSuite.installHelp')); return; }
    await installPrompt.prompt();
    setInstallPrompt(null);
  };
  const appPath = `/app/users/${user?.id ?? 'me'}`;
  const servicePaths = {
    fintrack: `${appPath}/dashboard`,
    homesync: `${appPath}/homesync/shopping`,
    taskflow: `${appPath}/taskflow`,
    receivables: `${appPath}/receivables`,
    fitpulse: `${appPath}/fitpulse`,
  };
  const moduleLink = (to) => isAuthenticated ? servicePaths[to] : '/registro';

  return (
    <PublicLayout>
      <main className="landing-suite">
        <section className="landing-suite__hero" id="inicio">
          <div className="landing-suite__hero-copy">
            <span className="suite-pill"><Sparkles size={14} />{t('landingSuite.badge')}</span>
            <h1>{t('landingSuite.titleA')}<br /><span>{t('landingSuite.titleB')}</span></h1>
            <p>{t('landingSuite.description')}</p>
            <div className="landing-suite__actions"><Button as={Link} to="/registro">{t('landingSuite.start')}<ArrowRight size={17} /></Button><Button as={Link} to="/login" variant="ghost">{t('landingSuite.login')}</Button><Button as="a" href="#modulos" variant="ghost">{t('landingSuite.explore')}<ArrowDown size={16} /></Button><button className="landing-install-button" type="button" onClick={installApp}>{t('landingSuite.install')}</button></div>
            {installMessage ? <p className="landing-install-message" role="status">{installMessage}</p> : null}
            <div className="landing-suite__trust"><span><CheckCircle2 size={15} />{t('landingSuite.noSetup')}</span><span><CheckCircle2 size={15} />{t('landingSuite.private')}</span><span><CheckCircle2 size={15} />{t('landingSuite.mobile')}</span></div>
          </div>
          <div className="landing-suite__hero-visual" aria-label={t('landingSuite.previewAlt')}>
            <div className="landing-suite__device" aria-hidden="true"><div className="landing-suite__device-top"><span>LifeSync</span><span>•••</span></div><div className="landing-suite__device-heading"><small>{t('landingSuite.previewMonth')}</small><strong>{t('landingSuite.previewTitle')}</strong></div><div className="landing-suite__device-summary"><span><i />{t('dashboard.income')}</span><span><i />{t('dashboard.expenses')}</span></div><div className="landing-suite__device-chart"><span /><span /><span /><span /><span /><span /><span /></div><div className="landing-suite__device-legend"><span><i />{t('dashboard.income')}</span><span><i />{t('dashboard.expenses')}</span></div><div className="landing-suite__device-bottom"><span><WalletCards size={15} />FinTrack</span><span><ShoppingCart size={15} />HomeSync</span><span><ListChecks size={15} />TaskFlow</span></div></div>
            <div className="landing-suite__sync-float"><span><Check size={15} /></span><div><small>{t('landingSuite.invoiceCreated')}</small><strong>{t('landingSuite.invoiceReview')}</strong></div></div>
          </div>
        </section>

        <section className="landing-suite__modules" id="modulos">
          <header><div><h2>{t('landingSuite.modules')}</h2><p>{t('landingSuite.modulesSubtitle')}</p></div><span className="suite-pill">{t('landingSuite.moduleCount')}</span></header>
          <div className="landing-suite__module-grid">{suiteModules.map(({ key, label, icon: Icon, status }, index) => <article className={`landing-suite-card${index === 0 ? ' landing-suite-card--featured' : ''}`} key={key}><div className="landing-suite-card__top"><span className="landing-suite-card__icon"><Icon size={20} /></span><span className="suite-status-pill">{t(`landingSuite.${status}`)}</span></div><h3>{index + 1}. {label}</h3><p>{t(`landingSuite.${key}`)}</p><Link to={moduleLink(key)}>{t(`landingSuite.explore${key[0].toUpperCase()}${key.slice(1)}`)} <ArrowRight size={14} /></Link></article>)}<article className="landing-suite-card landing-suite-card--ecosystem"><span className="landing-suite-card__icon"><Sparkles size={20} /></span><h3>{t('landingSuite.connected')}</h3><p>{t('landingSuite.connectedText')}</p><span className="suite-connected"><Check size={14} />{t('landingSuite.availableNow')}</span></article></div>
        </section>

        <section className="landing-suite__pipeline" id="integracion"><div><span className="suite-pill"><Sparkles size={14} />{t('landingSuite.integration')}</span><h2>{t('landingSuite.syncTitle')}</h2><p>{t('landingSuite.syncText')}</p><ul><li><Check size={15} />{t('landingSuite.lessFriction')}</li><li><Check size={15} />{t('landingSuite.accurateBudget')}</li></ul></div><div className="landing-suite__pipeline-card"><span className="suite-status-pill">{t('landingSuite.availableNow')}</span><h3>{t('landingSuite.purchased')}</h3><p>{t('landingSuite.purchasedDetail')}</p><ArrowDown size={20} /><div><strong>{t('landingSuite.invoiceCreated')}</strong><small>{t('landingSuite.invoiceReview')}</small></div><b>{t('landingSuite.noSampleAmounts')}</b></div></section>

        <section className="landing-suite__benefits" id="beneficios"><div><h2>{t('landingSuite.why')}</h2><Benefit icon={CreditCard} title={t('landingSuite.value')} text={t('landingSuite.valueText')} /><Benefit icon={Sparkles} title={t('landingSuite.simple')} text={t('landingSuite.simpleText')} /><Benefit icon={ShieldCheck} title={t('landingSuite.privacy')} text={t('landingSuite.privacyText')} /></div><div className="landing-suite__workspace" role="img" aria-label={t('landingSuite.workspaceAlt')}><div className="landing-suite__workspace-window"><div className="landing-suite__workspace-top"><span /><span /><span /><strong>LifeSync · {t('landingSuite.previewTitle')}</strong></div><div className="landing-suite__workspace-body"><small>{t('landingSuite.previewMonth')}</small><strong>{t('landingSuite.previewTitle')}</strong><div className="landing-suite__workspace-metrics"><span>{t('dashboard.income')}<i /></span><span>{t('dashboard.expenses')}<i /></span></div><div className="landing-suite__workspace-bars">{[42, 68, 52, 80, 59, 92, 66, 75, 48, 86, 61, 72].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></div></div><span className="landing-suite__workspace-caption"><CheckCircle2 size={15} />{t('landingSuite.connectedText')}</span></div></section>

        <section className="landing-suite__cta"><h2>{t('landingSuite.cta')}</h2><p>{t('landingSuite.ctaText')}</p><Button as={Link} to="/registro">{t('landingSuite.ctaButton')}<ArrowRight size={17} /></Button><small>{t('landingSuite.ctaFoot')}</small></section>

        <footer className="landing-suite__footer"><div><Link to="/" className="landing-suite__brand"><span>⌘</span><strong>LifeSync</strong></Link><p>{t('landingSuite.footerAbout')}</p><div className="suite-social-links"><a href="#contacto" aria-label="Instagram">◎</a><a href="#contacto" aria-label="X">𝕏</a><a href="#contacto" aria-label="LinkedIn">in</a></div></div><div><strong>{t('landingSuite.footerModules')}</strong>{suiteModules.map((item) => <Link key={item.key} to={moduleLink(item.key)}>{item.label}</Link>)}</div><div><strong>{t('landingSuite.footerEcosystem')}</strong><a href="#integracion">{t('landingSuite.integration')}</a><a href="#beneficios">{t('landingSuite.benefits')}</a><a href="#modulos">{t('landingSuite.news')}</a></div><div id="contacto"><strong>{t('landingSuite.footerSupport')}</strong><Link to="/privacy">{t('landingSuite.privacyLink')}</Link><Link to="/terms">{t('landingSuite.terms')}</Link><a href="#contacto">{t('landingSuite.help')}</a><a href="mailto:hola@lifesync.app">{t('landingSuite.contact')}</a></div><div className="landing-suite__copyright"><span>{t('landingSuite.copyright')}</span><span>{t('landingSuite.footerTagline')}</span></div></footer>
      </main>
    </PublicLayout>
  );
}

function Benefit({ icon: Icon, title, text }) {
  return <article className="landing-suite-benefit"><span><Icon size={18} /></span><div><h3>{title}</h3><p>{text}</p></div></article>;
}
