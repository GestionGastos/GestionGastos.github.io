import { ArrowRight, CheckCircle2, Dumbbell, Home, ReceiptText, ShieldCheck, ShoppingCart, Sparkles, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import registerBackground from '../../../es/img/background-1.jpg';

const moduleItems = [
  ['fintrack', WalletCards], ['homesync', ShoppingCart], ['taskflow', CheckCircle2], ['receivables', ReceiptText], ['fitpulse', Dumbbell],
];

export function AuthFormLayout({ title, children, footer, mode = 'login', utilities }) {
  const { t } = useI18n();
  const register = mode === 'register';
  return (
    <PublicLayout>
      <main className={`suite-auth suite-auth--${mode}`}>
        <section className="suite-auth__story">
          {register ? <img className="suite-auth__background" src={registerBackground} alt="" /> : null}
          <div className="suite-auth__story-inner">
            <Link to="/" className="suite-auth__brand"><span>⌘</span><span><strong>LifeSync</strong><small>{t('authSuite.suite')}</small></span></Link>
            {register ? <><span className="suite-pill"><Sparkles size={15} />{t('authSuite.registerBadge')}</span><h1>{t('authSuite.registerTitleA')} <span>{t('authSuite.registerTitleHighlight')}</span> {t('authSuite.registerTitleB')}</h1><p>{t('authSuite.registerIntro')}</p><h2>{t('authSuite.availableModules')}</h2><div className="suite-auth__module-grid">{moduleItems.map(([key, Icon]) => <div key={key}><Icon size={19} /><span><strong>{key === 'receivables' ? t('sidebar.receivables') : key === 'fitpulse' ? t('sidebar.fitpulse') : key === 'taskflow' ? t('sidebar.taskflow') : key === 'homesync' ? 'HomeSync' : 'FinTrack'}</strong><small>{t(`authSuite.${key}`)}</small></span></div>)}</div><div className="suite-auth__proof"><span><strong>2 min</strong><small>{t('authSuite.setup')}</small></span><span><strong>100%</strong><small>{t('authSuite.private')}</small></span><span><strong>$0</strong><small>{t('authSuite.free')}</small></span></div></> : <><h1>{t('authSuite.singleAccessA')}<br /><span>{t('authSuite.singleAccessB')}</span></h1><p>{t('authSuite.loginIntro')}</p><ul className="suite-auth__service-list">{moduleItems.map(([key, Icon]) => <li key={key}><Icon size={19} /><span><strong>{key === 'receivables' ? t('sidebar.receivables') : key === 'fitpulse' ? t('sidebar.fitpulse') : key === 'taskflow' ? t('sidebar.taskflow') : key === 'homesync' ? 'HomeSync' : 'FinTrack'}:</strong> {t(`authSuite.${key}`)}</span></li>)}</ul></>}
          </div>
        </section>
        <section className="suite-auth__form-area"><div className="suite-auth__card">
          <h1 className="sr-only">{title}</h1>
          <Link to="/" className="suite-auth__back">{t('authSuite.backHome')}</Link>
          <Link to="/" className="suite-auth__mobile-brand"><span>⌘</span>LifeSync</Link>
          {register ? <><h2>{t('authSuite.registerHeading')}</h2><p className="suite-auth__intro">{t('authSuite.registerHelp')}</p></> : <><h2>{t('authSuite.loginWelcome')}</h2><p className="suite-auth__intro">{t('authSuite.loginHelp')}</p></>}
          {utilities}
          {children}
          {footer}
          {register ? <div className="suite-auth__legal"><span>{t('authSuite.footer')}</span><span>◎　◇</span></div> : null}
        </div></section>
      </main>
    </PublicLayout>
  );
}
