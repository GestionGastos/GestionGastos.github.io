import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/presentation/Button.jsx';
import { FormFeedback } from '../../../shared/presentation/FormFeedback.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { AuthFormLayout } from './AuthFormLayout.jsx';
import { useAuth } from './useAuth.js';

const initialForm = { name: '', lastname: '', username: '', email: '', password: '', confirmPassword: '' };

export function RegisterPage() {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const firstFieldRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const validate = (values) => {
    const errors = {};
    ['name', 'lastname', 'username', 'email', 'password', 'confirmPassword'].forEach((field) => {
      if (!values[field]) errors[field] = t('auth.fieldRequired');
    });
    if (values.password && values.confirmPassword && values.password !== values.confirmPassword) errors.confirmPassword = t('auth.passwordMismatch');
    return errors;
  };

  const updateField = (field) => (event) => {
    const next = { ...form, [field]: event.target.value };
    const nextErrors = validate(next);
    setForm(next);
    setFieldErrors((current) => ({ ...current, [field]: nextErrors[field], ...(field === 'password' ? { confirmPassword: nextErrors.confirmPassword } : {}) }));
    if (status !== 'loading') setStatus('editing');
  };

  const submit = async (event) => {
    event.preventDefault();
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setStatus('error');
      setMessage(t('auth.required'));
      firstFieldRef.current?.focus();
      return;
    }

    setStatus('loading');
    setMessage(t('auth.creating'));
    try {
      const { confirmPassword, ...payload } = form;
      await signUp(payload);
      setStatus('success');
      setMessage(t('auth.registerSuccess'));
      window.setTimeout(() => navigate('/login', { replace: true, state: { message: t('auth.created') } }), 650);
    } catch (error) {
      setStatus('error');
      setMessage(error?.status === 409 ? t('auth.emailExists') : t('auth.networkError'));
    }
  };

  const inputProps = (field, id, autoComplete) => ({
    id,
    name: field,
    autoComplete,
    value: form[field],
    onChange: updateField(field),
    onBlur: () => setFieldErrors((current) => ({ ...current, [field]: validate(form)[field] })),
    'aria-invalid': Boolean(fieldErrors[field]),
    'aria-describedby': fieldErrors[field] ? `${id}-error` : 'register-feedback',
  });

  return (
    <AuthFormLayout mode="register" title={t('auth.registerTitle')} footer={<p className="form-footer"><Link to="/login">{t('auth.goLogin')}</Link></p>}>
      <form className="form-stack" onSubmit={submit} noValidate aria-busy={status === 'loading'} data-action="register_user">
        <FormFeedback id="register-feedback" status={status} message={message} />
        <div className="two-column">
          <Field label={t('auth.name')} id="register-name" error={fieldErrors.name}><input ref={firstFieldRef} {...inputProps('name', 'register-name', 'given-name')} /></Field>
          <Field label={t('auth.lastname')} id="register-lastname" error={fieldErrors.lastname}><input {...inputProps('lastname', 'register-lastname', 'family-name')} /></Field>
        </div>
        <Field label={t('auth.username')} id="register-username" error={fieldErrors.username}><input {...inputProps('username', 'register-username', 'username')} /></Field>
        <Field label={t('auth.email')} id="register-email" error={fieldErrors.email}><input type="email" {...inputProps('email', 'register-email', 'email')} /></Field>
        <div className="two-column">
          <Field label={t('auth.password')} id="register-password" error={fieldErrors.password}><input type={showPassword ? 'text' : 'password'} {...inputProps('password', 'register-password', 'new-password')} /></Field>
          <Field label={t('auth.confirmPassword')} id="register-confirm-password" error={fieldErrors.confirmPassword}><input id="register-confirm-password" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={updateField('confirmPassword')} onBlur={() => setFieldErrors((current) => ({ ...current, confirmPassword: validate(form).confirmPassword }))} aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? 'register-confirm-password-error' : 'register-feedback'} /></Field>
        </div>
        <label className="checkbox-row" htmlFor="register-show-password"><input id="register-show-password" name="show-password" type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />{t('auth.showPassword')}</label>
        <Button type="submit" disabled={status === 'loading' || status === 'success'} aria-busy={status === 'loading'} data-action="register_user">{status === 'loading' ? t('auth.creating') : t('auth.submitRegister')}</Button>
      </form>
    </AuthFormLayout>
  );
}

function Field({ label, id, error, children }) {
  return <><label htmlFor={id}>{label}{children}</label>{error ? <p id={`${id}-error`} className="field-error" role="alert">{error}</p> : null}</>;
}
