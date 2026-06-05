import { ArrowRight, BarChart3, History, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { Button } from '../../../shared/presentation/Button.jsx';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';

export function LandingPage() {
  const { t } = useI18n();
  const features = t('landing.features');

  return (
    <PublicLayout>
      <main className="landing">
        <section className="landing__hero">
          <div className="landing__copy">
            <p className="eyebrow">Financial Integrity</p>
            <h1>{t('landing.title')}</h1>
            <p>{t('landing.subtitle')}</p>
            <div className="hero-actions">
              <Button as={Link} to="/registro">
                {t('landing.primary')} <ArrowRight size={18} />
              </Button>
              <Button as={Link} to="/login" variant="secondary">
                {t('landing.secondary')}
              </Button>
            </div>
          </div>
          <div className="budget-preview" aria-label={t('landing.currentBudget')}>
            <div>
              <span>{t('landing.currentBudget')}</span>
              <strong>$ 2,450,000</strong>
            </div>
            <div className="preview-chart">
              <span style={{ '--value': '58%' }} />
              <span style={{ '--value': '26%' }} />
              <span style={{ '--value': '42%' }} />
              <span style={{ '--value': '18%' }} />
            </div>
            <div className="preview-metrics">
              <p>
                <small>{t('landing.available')}</small>
                $ 780,000
              </p>
              <p>
                <small>{t('landing.fixedExpenses')}</small>
                $ 1,220,000
              </p>
              <p>
                <small>{t('landing.savings')}</small>
                $ 450,000
              </p>
            </div>
          </div>
        </section>
        <section className="feature-strip" aria-label={t('nav.features')}>
          {features.map((feature, index) => {
            const icons = [History, BarChart3, ShieldCheck];
            const Icon = icons[index] ?? ShieldCheck;
            return (
              <article key={feature}>
                <Icon size={22} />
                <span>{feature}</span>
              </article>
            );
          })}
        </section>
      </main>
    </PublicLayout>
  );
}
