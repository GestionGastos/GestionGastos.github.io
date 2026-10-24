import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { AppProviders } from '../app/App.jsx';
import { AppRouter } from '../app/router/AppRouter.jsx';

export function renderApp(path = '/registro') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </MemoryRouter>,
  );
}
