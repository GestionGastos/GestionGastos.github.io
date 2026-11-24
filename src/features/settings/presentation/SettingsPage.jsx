import { useEffect, useState } from 'react';
import { KeyRound, Settings, ShieldAlert } from 'lucide-react';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { useAuth } from '../../auth/presentation/useAuth.js';
import * as authRepository from '../../auth/infrastructure/authRepository.js';
import { useTheme } from '../../../shared/theme/ThemeProvider.jsx';
import { getUserPreferences, updateUserPreferences } from '../../services/infrastructure/serviceRepository.js';

const services = ['fintrack', 'homesync', 'taskflow', 'receivables', 'fitpulse'];
const moduleLabels = { fintrack: 'userSettings.fintrack', homesync: 'userSettings.homesync', taskflow: 'userSettings.taskflow', receivables: 'userSettings.receivables', fitpulse: 'userSettings.fitpulse' };
const MODULES_KEY = 'lifesync.enabledModules';

function readEnabledModules() {
  try { return JSON.parse(localStorage.getItem(MODULES_KEY)) ?? services; } catch { return services; }
}

export function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { token, logout, user } = useAuth();
  const [enabled, setEnabled] = useState(readEnabledModules);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') ?? user?.currency ?? 'COP');
  const [restDuration, setRestDuration] = useState(() => localStorage.getItem('fitpulse.restSeconds') ?? '60');

  useEffect(() => {
    let mounted = true;
    getUserPreferences(token).then((response) => {
      const prefs = response?.preferences ?? response;
      if (!mounted || !prefs) return;
      if (prefs.currency) { setCurrency(prefs.currency); localStorage.setItem('currency', prefs.currency); }
      if (prefs.language) setLocale(prefs.language.toLowerCase());
      if (prefs.theme) setTheme(prefs.theme.toLowerCase());
      if (Number.isInteger(prefs.fitnessRestSeconds)) { setRestDuration(String(prefs.fitnessRestSeconds)); localStorage.setItem('fitpulse.restSeconds', String(prefs.fitnessRestSeconds)); }
    }).catch(() => {});
    return () => { mounted = false; };
  }, [token, setLocale, setTheme]);

  const savePreferences = async (changes) => {
    const next = { currency, language: locale.toUpperCase(), theme: theme === 'dark' ? 'Dark' : 'Light', ...changes };
    try {
      await updateUserPreferences(token, next);
      localStorage.setItem('currency', next.currency);
      setCurrency(next.currency);
      setStatus(t('preferences.saved'));
    } catch { setStatus(t('preferences.localSaved')); }
  };

  const toggleModule = (module) => {
    setEnabled((current) => {
      const next = current.includes(module) ? current.filter((entry) => entry !== module) : [...current, module];
      localStorage.setItem(MODULES_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('lifesync:modules-updated'));
      return next;
    });
  };

  const changePassword = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    if (values.newPassword.length < 8 || values.newPassword !== values.confirmPassword) {
      setStatus(t('userSettings.passwordMismatch'));
      return;
    }
    setSaving(true);
    try {
      await authRepository.updatePassword(token, values.currentPassword, values.newPassword);
      form.reset();
      setStatus(t('userSettings.passwordSaved'));
    } catch { setStatus(t('userSettings.error')); }
    finally { setSaving(false); }
  };

  const closeAccount = async () => {
    if (deletePhrase !== expectedDeletePhrase(t)) return;
    setSaving(true);
    try {
      await authRepository.deleteAccount(token);
      await logout();
    } catch { setStatus(t('userSettings.error')); }
    finally { setSaving(false); }
  };

  return (
    <PublicLayout>
      <main className="suite-page user-settings-page">
        <header className="suite-module-header"><div><p className="suite-eyebrow"><span />LifeSync</p><h1>{t('userSettings.title')}</h1><p>{t('userSettings.intro')}</p></div></header>
        {status ? <p className="suite-notice" role="status">{status}</p> : null}
        <section className="suite-panel user-settings-card"><span className="eyebrow"><Settings size={16} />{t('userSettings.modulesTitle')}</span><p>{t('userSettings.modulesHelp')}</p><div className="user-settings-modules">{services.map((service) => <label key={service}><span>{t(moduleLabels[service])}</span><input type="checkbox" checked={enabled.includes(service)} onChange={() => toggleModule(service)} aria-label={t(moduleLabels[service])} /></label>)}</div></section>
        <section className="suite-panel user-settings-card"><span className="eyebrow"><Settings size={16} />{t('preferences.title')}</span><div className="user-settings-password"><label>{t('preferences.currency')}<select value={currency} onChange={(event) => { const value = event.target.value; setCurrency(value); localStorage.setItem('currency', value); savePreferences({ currency: value }); }}><option value="COP">COP · Peso colombiano</option><option value="USD">USD · US Dollar</option><option value="EUR">EUR · Euro</option></select></label><label>{t('preferences.language')}<select value={locale} onChange={(event) => { const value = event.target.value; setLocale(value); savePreferences({ language: value.toUpperCase() }); }}><option value="es">Español</option><option value="en">English</option></select></label><label>{t('preferences.theme')}<select value={theme} onChange={(event) => { const value = event.target.value; setTheme(value); savePreferences({ theme: value === 'dark' ? 'Dark' : 'Light' }); }}><option value="light">{t('preferences.light')}</option><option value="dark">{t('preferences.dark')}</option></select></label><label>{t('preferences.restDuration')}<select value={restDuration} onChange={(event) => { const value = event.target.value; setRestDuration(value); localStorage.setItem('fitpulse.restSeconds', value); savePreferences({ fitnessRestSeconds: Number(value) }); }}><option value="30">30 {t('preferences.seconds')}</option><option value="45">45 {t('preferences.seconds')}</option><option value="60">60 {t('preferences.seconds')}</option><option value="90">90 {t('preferences.seconds')}</option><option value="120">120 {t('preferences.seconds')}</option></select></label></div></section>
        <section className="suite-panel user-settings-card"><span className="eyebrow"><KeyRound size={16} />{t('userSettings.passwordTitle')}</span><form className="form-stack user-settings-password" onSubmit={changePassword}><label>{t('userSettings.currentPassword')}<input name="currentPassword" type="password" autoComplete="current-password" required /></label><label>{t('userSettings.newPassword')}<input name="newPassword" type="password" autoComplete="new-password" minLength="8" required /></label><label>{t('userSettings.confirmPassword')}<input name="confirmPassword" type="password" autoComplete="new-password" minLength="8" required /></label><button className="suite-button suite-button--primary" type="submit" disabled={saving}>{t('userSettings.save')}</button></form></section>
        <section className="suite-panel user-settings-card user-settings-danger"><span className="eyebrow"><ShieldAlert size={16} />{t('userSettings.accountTitle')}</span><p>{t('userSettings.accountHelp')}</p><label>{t('userSettings.confirmDelete')}<input value={deletePhrase} onChange={(event) => setDeletePhrase(event.target.value)} autoComplete="off" /></label><button className="suite-button user-settings-delete" type="button" disabled={saving || deletePhrase !== expectedDeletePhrase(t)} onClick={closeAccount}>{t('userSettings.deleteAccount')}</button></section>
      </main>
    </PublicLayout>
  );
}

function expectedDeletePhrase(t) {
  return t('userSettings.deleteConfirm').includes('ELIMINAR') ? 'ELIMINAR' : 'DELETE';
}
