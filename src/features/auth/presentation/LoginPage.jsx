import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/presentation/Button.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { AuthFormLayout } from './AuthFormLayout.jsx';
import { useAuth } from './useAuth.js';

export function LoginPage() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError(t('auth.required'));
      return;
    }

    const result = await signIn(form).catch(() => ({ error: 'Invalid Password' }));

    if (result.error) {
      setError(result.error === 'User Deleted' ? t('auth.deletedUser') : t('auth.invalidLogin'));
      return;
    }

    navigate(`/app/users/${result.user.id}/budgets`, { replace: true });
  };

  return (
    <AuthFormLayout
      title={t('auth.loginTitle')}
      footer={
        <p className="form-footer">
          <Link to="/registro">{t('auth.goRegister')}</Link>
        </p>
      }
    >
      <form className="form-stack" onSubmit={submit}>
        {error ? <p className="form-error">{error}</p> : null}
        <label>
          {t('auth.email')}
          <input type="email" value={form.email} onChange={updateField('email')} placeholder="email@ejemplo.com" />
        </label>
        <label>
          {t('auth.password')}
          <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateField('password')} />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
          {t('auth.showPassword')}
        </label>
        <Button type="submit">{t('auth.submitLogin')}</Button>
      </form>
    </AuthFormLayout>
  );
}
