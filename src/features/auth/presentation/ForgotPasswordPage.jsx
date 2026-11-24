import { useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthFormLayout } from './AuthFormLayout.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';

export function ForgotPasswordPage() {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  return <AuthFormLayout title={t('authSuite.resetTitle')} footer={<p className="suite-auth__account-prompt"><Link to="/login">{t('authSuite.backLogin')}</Link></p>}><form className="suite-auth-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><h3>{t('authSuite.resetTitle')}</h3><p>{t('authSuite.resetHelp')}</p><label htmlFor="reset-email">{t('authSuite.email')}</label><div className="suite-auth__input-icon"><Mail size={17} /><input id="reset-email" type="email" placeholder="nombre@ejemplo.com" required /></div><button className="suite-button suite-button--primary" type="submit">{t('authSuite.resetAction')}<ArrowRight size={17} /></button>{submitted ? <p className="suite-notice" role="status">{t('authSuite.resetSent')}</p> : null}</form></AuthFormLayout>;
}
