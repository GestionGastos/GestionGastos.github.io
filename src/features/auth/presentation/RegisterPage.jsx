import { useState } from 'react';
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

const initialForm = { name: '', lastname: '', username: '', email: '', password: '', confirmPassword: '' };
const fieldOrder = [
  ['name', 'register-name'],
  ['lastname', 'register-lastname'],
  ['username', 'register-username'],
  ['email', 'register-email'],
  ['password', 'register-password'],
  ['confirmPassword', 'register-confirm-password'],
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
    const nextErrors = validateRegisterForm(next, messages);
    setForm(next);
    setFieldErrors((current) => ({
      ...current,
      [field]: nextErrors[field],
      ...(field === 'password' || field === 'confirmPassword' ? { confirmPassword: nextErrors.confirmPassword } : {}),
    }));
    if (status !== OperationStatus.loading) {
      setStatus(OperationStatus.editing);
    }
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

    if (result.error?.fields) {
      setFieldErrors(result.error.fields);
    }
  };

  const errorItems = fieldOrder
    .filter(([field]) => fieldErrors[field])
    .map(([field, id]) => ({ id, message: fieldErrors[field], field }));

  return (
    <AuthFormLayout mode="register" title={t('auth.registerTitle')} footer={<p className="form-footer"><Link to="/login">{t('auth.goLogin')}</Link></p>}>
      <form className="form-stack" onSubmit={submit} noValidate aria-busy={status === OperationStatus.loading} data-form={DomainAction.register_user}>
        <ErrorSummary id="register-error-summary" title={t('auth.errorSummary')} items={errorItems} />
        <FormFeedback id="register-feedback" status={status} message={message} />
        <div className="two-column">
          <Field id="register-name" label={t('auth.name')} error={fieldErrors.name} required>
            <input name="name" autoComplete="given-name" value={form.name} onChange={updateField('name')} data-testid="register-name" />
          </Field>
          <Field id="register-lastname" label={t('auth.lastname')} error={fieldErrors.lastname} required>
            <input name="lastname" autoComplete="family-name" value={form.lastname} onChange={updateField('lastname')} data-testid="register-lastname" />
          </Field>
        </div>
        <Field id="register-username" label={t('auth.username')} error={fieldErrors.username} required>
          <input name="username" autoComplete="username" value={form.username} onChange={updateField('username')} data-testid="register-username" />
        </Field>
        <Field id="register-email" label={t('auth.email')} error={fieldErrors.email} required>
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={updateField('email')} data-testid="register-email" />
        </Field>
        <div className="two-column">
          <Field id="register-password" label={t('auth.password')} error={fieldErrors.password} required>
            <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={updateField('password')} aria-label={t('auth.password')} data-field="password" data-testid="register-password" />
          </Field>
          <Field id="register-confirm-password" label={t('auth.confirmPassword')} error={fieldErrors.confirmPassword} required>
            <input name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={updateField('confirmPassword')} aria-label={t('auth.confirmPassword')} data-field="confirm-password" data-testid="register-confirm-password" />
          </Field>
        </div>
        <Button
          type="submit"
          disabled={busy}
          aria-busy={status === OperationStatus.loading}
          data-action={DomainAction.register_user}
        >
          {status === OperationStatus.loading ? t('auth.creating') : status === OperationStatus.error ? t('auth.retry') : t('auth.submitRegister')}
        </Button>
      </form>
    </AuthFormLayout>
  );
}

function authMessages(t) {
  return {
    fieldRequired: t('auth.fieldRequired'),
    passwordMismatch: t('auth.passwordMismatch'),
    required: t('auth.required'),
    registerSuccess: t('auth.registerSuccess'),
    emailExists: t('auth.emailExists'),
    networkError: t('auth.networkError'),
  };
}
