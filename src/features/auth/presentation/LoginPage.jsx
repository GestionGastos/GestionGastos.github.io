import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/presentation/Button.jsx';
import { FormFeedback } from '../../../shared/presentation/FormFeedback.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { AuthFormLayout } from './AuthFormLayout.jsx';
import { useAuth } from './useAuth.js';

export function LoginPage() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const emailRef = useRef(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState(location.state?.message ? 'success' : 'idle');
  const [message, setMessage] = useState(location.state?.message ?? '');

  const validate = (values) => ({
    ...(values.email ? {} : { email: t('auth.fieldRequired') }),
    ...(values.password ? {} : { password: t('auth.fieldRequired') }),
  });

  const updateField = (field) => (event) => {
    const next = { ...form, [field]: event.target.value };
    setForm(next);
    setFieldErrors((current) => ({ ...current, [field]: validate(next)[field] }));
    if (status !== 'loading') setStatus('editing');
  };

  const submit = async (event) => {
    event.preventDefault();
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setStatus('error');
      setMessage(t('auth.required'));
      emailRef.current?.focus();
      return;
    }

    setStatus('loading');
    setMessage(t('auth.signingIn'));
    try {
      const result = await signIn(form);
      if (result.error) {
        setStatus('error');
        setMessage(result.error === 'User Deleted' ? t('auth.deletedUser') : t('auth.invalidLogin'));
        return;
      }

      setStatus('success');
      setMessage(t('auth.loginSuccess'));
      window.setTimeout(() => navigate(`/app/users/${result.user.id}/budgets`, { replace: true }), 450);
    } catch (error) {
      setStatus('error');
      setMessage(error?.status ? t('auth.invalidLogin') : t('auth.networkError'));
    }
  };

  return (
    <AuthFormLayout title={t('auth.loginTitle')} footer={<p className="form-footer"><Link to="/registro">{t('auth.goRegister')}</Link></p>}>
      <form className="form-stack" onSubmit={submit} noValidate aria-busy={status === 'loading'} data-action="login_user">
        <FormFeedback id="login-feedback" status={status} message={message} />
        <label htmlFor="login-email">
          {t('auth.email')}
          <input ref={emailRef} id="login-email" name="email" type="email" autoComplete="username" value={form.email} onChange={updateField('email')} onBlur={() => setFieldErrors((current) => ({ ...current, email: validate(form).email }))} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'login-email-error' : 'login-feedback'} placeholder="email@ejemplo.com" />
        </label>
        {fieldErrors.email ? <p id="login-email-error" className="field-error" role="alert">{fieldErrors.email}</p> : null}
        <label htmlFor="login-password">
          {t('auth.password')}
          <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={updateField('password')} onBlur={() => setFieldErrors((current) => ({ ...current, password: validate(form).password }))} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'login-password-error' : 'login-feedback'} />
        </label>
        {fieldErrors.password ? <p id="login-password-error" className="field-error" role="alert">{fieldErrors.password}</p> : null}
        <label className="checkbox-row" htmlFor="login-show-password"><input id="login-show-password" name="show-password" type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />{t('auth.showPassword')}</label>
        <Button type="submit" disabled={status === 'loading' || status === 'success'} aria-busy={status === 'loading'} data-action="login_user">{status === 'loading' ? t('auth.signingIn') : t('auth.submitLogin')}</Button>
      </form>
    </AuthFormLayout>
  );
}
