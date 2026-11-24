import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DomainAction } from '../../../shared/domain/actions.js';
import { OperationStatus } from '../../../shared/domain/operation.js';
import { Button } from '../../../shared/presentation/Button.jsx';
import { ErrorSummary } from '../../../shared/presentation/ErrorSummary.jsx';
import { Field } from '../../../shared/presentation/Field.jsx';
import { FormFeedback } from '../../../shared/presentation/FormFeedback.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { executeRegisterUser, validateRegisterForm } from '../domain/authActions.js';
import { AuthFormLayout } from './AuthFormLayout.jsx';
import { useAuth } from './useAuth.js';

const initialForm = { name: '', lastname: '', username: '', email: '', phone: '', password: '', confirmPassword: '', currency: localStorage.getItem('currency') ?? 'COP', language: localStorage.getItem('locale') === 'en' ? 'EN' : 'ES', theme: localStorage.getItem('theme') === 'dark' ? 'Dark' : 'Light', modules: ['FinTrack', 'HomeSync', 'TaskFlow'], termsAccepted: false };
const fieldOrder = [['name', 'register-name'], ['lastname', 'register-lastname'], ['email', 'register-email'], ['password', 'register-password'], ['confirmPassword', 'register-confirm-password'], ['termsAccepted', 'register-terms']];
const modules = [
  { key: 'FinTrack', label: 'FinTrack', detail: 'authSuite.fintrack' },
  { key: 'HomeSync', label: 'HomeSync', detail: 'authSuite.homesync' },
  { key: 'TaskFlow', label: 'TaskFlow', detail: 'authSuite.taskflow' },
  { key: 'Cuentas de Cobro', label: 'Cuentas Cobro', detail: 'authSuite.receivables' },
  { key: 'FitPulse', label: 'FitPulse', detail: 'authSuite.fitpulse' },
];

export function RegisterPage() {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState(OperationStatus.idle);
  const [message, setMessage] = useState('');
  const messages = authMessages(t);
  const busy = status === OperationStatus.loading || status === OperationStatus.success;

  const updateField = (field) => (event) => {
    const next = { ...form, [field]: event.target.value };
    if (field === 'email') next.username = event.target.value.trim().split('@')[0];
    setForm(next);
    const errors = validateRegisterForm(next, messages);
    setFieldErrors((current) => ({ ...current, [field]: errors[field], ...(field === 'password' || field === 'confirmPassword' ? { confirmPassword: errors.confirmPassword } : {}) }));
    if (status !== OperationStatus.loading) setStatus(OperationStatus.editing);
  };

  const submit = async (event) => {
    event.preventDefault();
    const errors = validateRegisterForm(form, messages);
    setFieldErrors(errors);
    setStatus(OperationStatus.validating);
    if (Object.keys(errors).length) {
      setStatus(OperationStatus.error);
      setMessage(t('auth.required'));
      document.getElementById(fieldOrder.find(([field]) => errors[field])?.[1])?.focus();
      return;
    }
    setStatus(OperationStatus.loading);
    setMessage(t('auth.creating'));
    const result = await executeRegisterUser(form, signUp, messages);
    setStatus(result.status);
    setMessage(result.message);
    if (result.status === OperationStatus.success) {
      window.setTimeout(() => navigate('/login', { replace: true, state: { message: t('auth.created') } }), 700);
      return;
    }
    if (result.error?.fields) setFieldErrors(result.error.fields);
  };

  const errorItems = fieldOrder.filter(([field]) => fieldErrors[field]).map(([field, id]) => ({ id, message: fieldErrors[field], field }));

  return (
    <AuthFormLayout mode="register" title={t('auth.registerTitle')} footer={<p className="suite-auth__account-prompt">{t('authSuite.hasAccount')} <Link to="/login">{t('authSuite.signIn')}</Link></p>}>
      <form className="suite-auth-form" onSubmit={submit} noValidate aria-busy={status === OperationStatus.loading} data-form={DomainAction.register_user}>
        <ErrorSummary id="register-error-summary" title={t('auth.errorSummary')} items={errorItems} />
        <FormFeedback id="register-feedback" status={status} message={message} />
        <div className="suite-auth-form__two-column">
          <Field id="register-name" label={t('auth.name')} error={fieldErrors.name} required><input name="name" autoComplete="given-name" placeholder="Juan" value={form.name} onChange={updateField('name')} data-testid="register-name" /></Field>
          <Field id="register-lastname" label={t('auth.lastname')} error={fieldErrors.lastname} required><input name="lastname" autoComplete="family-name" placeholder="Pérez" value={form.lastname} onChange={updateField('lastname')} data-testid="register-lastname" /></Field>
        </div>
        <input type="hidden" name="username" value={form.username} data-testid="register-username" readOnly />
        <Field id="register-email" label={t('authSuite.email')} error={fieldErrors.email} required><input name="email" type="email" autoComplete="email" placeholder="juan@ejemplo.com" value={form.email} onChange={updateField('email')} data-testid="register-email" /></Field>
        <Field id="register-phone" label={t('authSuite.phone')}><input name="phone" type="tel" autoComplete="tel" placeholder="+57 300 000 0000" value={form.phone} onChange={updateField('phone')} /></Field>
        <div className="suite-auth-form__two-column">
          <label>{t('preferences.currency')}<select name="currency" value={form.currency} onChange={updateField('currency')}><option value="COP">COP · Peso colombiano</option><option value="USD">USD · US Dollar</option><option value="EUR">EUR · Euro</option></select></label>
          <label>{t('preferences.language')}<select name="language" value={form.language} onChange={updateField('language')}><option value="ES">Español</option><option value="EN">English</option></select></label>
        </div>
        <div className="suite-auth-form__two-column">
          <Field id="register-password" label={t('auth.password')} error={fieldErrors.password} required><input name="password" type="password" autoComplete="new-password" value={form.password} onChange={updateField('password')} aria-label={t('auth.password')} data-field="password" data-testid="register-password" /></Field>
          <Field id="register-confirm-password" label={t('auth.confirmPassword')} error={fieldErrors.confirmPassword} required><input name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={updateField('confirmPassword')} aria-label={t('auth.confirmPassword')} data-field="confirm-password" data-testid="register-confirm-password" /></Field>
        </div>
        <fieldset className="suite-auth__interests"><legend>{t('authSuite.interests')} <span>{t('authSuite.changeLater')}</span></legend><div className="suite-auth__interest-grid">{modules.map(({ key, label, detail }) => <label key={key}><input type="checkbox" checked={form.modules.includes(key)} onChange={(event) => setForm((current) => ({ ...current, modules: event.target.checked ? [...current.modules, key] : current.modules.filter((item) => item !== key) }))} /><span><strong>{label}</strong><small>{t(detail)}</small></span></label>)}</div></fieldset>
        <div className="suite-auth__terms"><input id="register-terms" type="checkbox" name="termsAccepted" checked={form.termsAccepted} aria-invalid={Boolean(fieldErrors.termsAccepted)} onChange={(event) => { const next = { ...form, termsAccepted: event.target.checked }; setForm(next); setFieldErrors((current) => ({ ...current, termsAccepted: next.termsAccepted ? undefined : messages.termsRequired })); }} /><label htmlFor="register-terms">{t('authSuite.termsLead')} <Link to="/terms" target="_blank">{t('authSuite.termsOfService')}</Link> {t('authSuite.and')} <Link to="/privacy" target="_blank">{t('authSuite.privacyPolicy')}</Link></label></div>
        <Button type="submit" disabled={busy} aria-busy={status === OperationStatus.loading} data-action={DomainAction.register_user}>{status === OperationStatus.loading ? t('auth.creating') : status === OperationStatus.error ? t('auth.retry') : <>{t('authSuite.submitRegister')} <ArrowRight size={18} /></>}</Button>
      </form>
    </AuthFormLayout>
  );
}

function authMessages(t) {
  return { fieldRequired: t('auth.fieldRequired'), passwordMismatch: t('auth.passwordMismatch'), required: t('auth.required'), registerSuccess: t('auth.registerSuccess'), emailExists: t('auth.emailExists'), networkError: t('auth.networkError'), termsRequired: t('authSuite.termsRequired') };
}
