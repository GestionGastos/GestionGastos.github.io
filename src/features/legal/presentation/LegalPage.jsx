import { ArrowLeft, ShieldCheck, Scale } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';

export function LegalPage({ documentType }) {
  const { t } = useI18n();
  const location = useLocation();
  const type = documentType ?? (location.pathname === '/privacy' ? 'privacy' : 'terms');
  const document = t(`legalPages.${type}`);
  const Icon = type === 'privacy' ? ShieldCheck : Scale;

  return (
    <PublicLayout>
      <main className="legal-page">
        <article className="legal-page__content">
          <Link className="legal-page__back" to="/"><ArrowLeft size={16} />{t('authSuite.backHome')}</Link>
          <span className="eyebrow"><Icon size={16} />LifeSync · {type === 'privacy' ? t('landingSuite.privacyLink') : t('landingSuite.terms')}</span>
          <h1>{document.title}</h1>
          <p className="legal-page__intro">{document.intro}</p>
          <p className="legal-page__notice" role="note">{document.notice}</p>
          {document.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}
          <p className="legal-page__source">{t('legalPages.source')} <a href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981" target="_blank" rel="noreferrer">{t('legalPages.lawLink')}</a> · <a href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=44306" target="_blank" rel="noreferrer">{t('legalPages.consumerLink')}</a>.</p>
        </article>
      </main>
    </PublicLayout>
  );
}
