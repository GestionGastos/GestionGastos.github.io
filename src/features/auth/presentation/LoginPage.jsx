import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DomainAction } from '../../../shared/domain/actions.js';
import { OperationStatus } from '../../../shared/domain/operation.js';
import { Button } from '../../../shared/presentation/Button.jsx';
import { ErrorSummary } from '../../../shared/presentation/ErrorSummary.jsx';
import { Field } from '../../../shared/presentation/Field.jsx';
import { FormFeedback } from '../../../shared/presentation/FormFeedback.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { executeLoginUser, firstInvalidField, validateLoginForm } from '../domain/authActions.js';
import { AuthFormLayout } from './AuthFormLayout.jsx';
import { useAuth } from './useAuth.js';

const fieldOrder = [
  ['email', 'login-email'],
  ['password', 'login-password'],
];

export function LoginPage() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState(location.state?.message ? OperationStatus.success : OperationStatus.idle);
  const [message, setMessage] = useState(location.state?.message ?? '');
  const messages = {
    fieldRequired: t('auth.fieldRequired'),
    required: t('auth.required'),
    loginSuccess: t('auth.loginSuccess'),
    invalidLogin: t('auth.invalidLogin'),
    deletedUser: t('auth.deletedUser'),
    networkError: t('auth.networkError'),
  };
  const busy = status === OperationStatus.loading || status === OperationStatus.success;

  const updateField = (field) => (event) => {
    const next = { ...form, [field]: event.target.value };
    setForm(next);
    setFieldErrors((current) => ({ ...current, [field]: validateLoginForm(next, messages)[field] }));
    if (status !== OperationStatus.loading) {
      setStatus(OperationStatus.editing);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const errors = validateLoginForm(form, messages);
    setFieldErrors(errors);
    setStatus(OperationStatus.validating);

    if (Object.keys(errors).length) {
      setStatus(OperationStatus.error);
      setMessage(t('auth.required'));
      document.getElementById(firstInvalidField(errors, fieldOrder.map((pair) => pair[0])) === 'password' ? 'login-password' : 'login-email')?.focus();
      return;
    }

    setStatus(OperationStatus.loading);
    setMessage(t('auth.signingIn'));
    const result = await executeLoginUser(form, signIn, messages);
    setStatus(result.status);
    setMessage(result.message);

    if (result.status === OperationStatus.success) {
      window.setTimeout(() => navigate(`/app/users/${result.data.user.id}/budgets`, { replace: true }), 500);
    }
  };

  const errorItems = fieldOrder
    .filter(([field]) => fieldErrors[field])
    .map(([field, id]) => ({ id, message: fieldErrors[field], field }));

  return (
    <AuthFormLayout title={t('auth.loginTitle')} footer={<p className="form-footer"><Link to="/registro">{t('auth.goRegister')}</Link></p>}>
      <form className="form-stack" onSubmit={submit} noValidate aria-busy={status === OperationStatus.loading} data-form={DomainAction.login_user}>
        <ErrorSummary id="login-error-summary" title={t('auth.errorSummary')} items={errorItems} />
        <FormFeedback id="login-feedback" status={status} message={message} />
        <Field id="login-email" label={t('auth.email')} error={fieldErrors.email} required>
          <input name="email" type="email" autoComplete="username" value={form.email} onChange={updateField('email')} placeholder="email@ejemplo.com" aria-label={t('auth.email')} data-testid="login-email" />
        </Field>
        <Field id="login-password" label={t('auth.password')} error={fieldErrors.password} required>
          <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={updateField('password')} aria-label={t('auth.password')} data-testid="login-password" />
        </Field>
        <Button
          type="submit"
          disabled={busy}
          aria-busy={status === OperationStatus.loading}
          data-action={DomainAction.login_user}
        >
          {status === OperationStatus.loading ? t('auth.signingIn') : status === OperationStatus.error ? t('auth.retry') : t('auth.submitLogin')}
        </Button>
      </form>
    </AuthFormLayout>
  );
}
