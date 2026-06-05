import { Link } from 'react-router-dom';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';

export function AuthFormLayout({ title, children, footer }) {
  return (
    <PublicLayout>
      <main className="auth-page">
        <section className="auth-card" aria-labelledby="auth-title">
          <Link className="auth-card__back" to="/">
            Inicio
          </Link>
          <h1 id="auth-title">{title}</h1>
          {children}
          {footer}
        </section>
      </main>
    </PublicLayout>
  );
}
