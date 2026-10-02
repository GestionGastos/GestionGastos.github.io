import { Settings } from 'lucide-react';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';

export function SettingsPage() {
  const { t } = useI18n();

  return (
    <PublicLayout>
      <main className="dashboard settings-page">
        <section className="panel settings-page__card">
          <span className="eyebrow"><Settings size={15} /> {t('settingsPage.eyebrow')}</span>
          <h1>{t('settingsPage.title')}</h1>
          <p>{t('settingsPage.description')}</p>
        </section>
      </main>
    </PublicLayout>
  );
}
