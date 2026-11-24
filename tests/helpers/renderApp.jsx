import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { AppProviders } from '../../src/app/App.jsx';
import { AppRouter } from '../../src/app/router/AppRouter.jsx';

export function renderApp(path = '/registro') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </MemoryRouter>,
  );
}

export function seedAuthenticatedSession(user = { id: 'user-1', name: 'Ada' }) {
  const encode = (value) => btoa(JSON.stringify(value)).replace(/=/g, '');
  const token = `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600, userId: user.id })}.sig`;
  localStorage.setItem('budget.session', JSON.stringify({ token, user }));
  return token;
}
