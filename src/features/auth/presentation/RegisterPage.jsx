import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/presentation/Button.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { AuthFormLayout } from './AuthFormLayout.jsx';
import { useAuth } from './useAuth.js';

const initialForm = {
  name: '',
  lastname: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export function RegisterPage() {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (Object.values(form).some((value) => !value)) {
      setError(t('auth.required'));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    const { confirmPassword, ...payload } = form;
    await signUp(payload);
    navigate('/login', { replace: true, state: { message: t('auth.created') } });
  };

  return (
    <AuthFormLayout
      title={t('auth.registerTitle')}
      footer={
        <p className="form-footer">
          <Link to="/login">{t('auth.goLogin')}</Link>
        </p>
      }
    >
      <form className="form-stack" onSubmit={submit}>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="two-column">
          <label>
            {t('auth.name')}
            <input value={form.name} onChange={updateField('name')} />
          </label>
          <label>
            {t('auth.lastname')}
            <input value={form.lastname} onChange={updateField('lastname')} />
          </label>
        </div>
        <label>
          {t('auth.username')}
          <input value={form.username} onChange={updateField('username')} />
        </label>
        <label>
          {t('auth.email')}
          <input type="email" value={form.email} onChange={updateField('email')} />
        </label>
        <div className="two-column">
          <label>
            {t('auth.password')}
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateField('password')} />
          </label>
          <label>
            {t('auth.confirmPassword')}
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
            />
          </label>
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
          {t('auth.showPassword')}
        </label>
        <Button type="submit">{t('auth.submitRegister')}</Button>
      </form>
    </AuthFormLayout>
  );
}
