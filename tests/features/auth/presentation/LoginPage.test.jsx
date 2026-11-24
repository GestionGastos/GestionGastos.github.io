import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { installApiMock } from '../../../helpers/mockApi.js';
import { renderApp } from '../../../helpers/renderApp.jsx';

describe('LoginPage', () => {
  it('identifies controls by accessible name', () => {
    renderApp('/login');
    expect(screen.getByRole('textbox', { name: 'Correo electrónico', exact: true })).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña', { exact: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toHaveAttribute('data-action', 'login_user');
    expect(screen.getByRole('button', { name: 'Cambiar tema' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Idioma' })).toBeInTheDocument();
    expect(document.querySelector('.auth-preference-controls')).not.toBeInTheDocument();
  });

  it('signs in and shows a success state before opening budgets', async () => {
    const user = userEvent.setup();
    installApiMock({ users: [{ email: 'ada@example.com', password: 'secret12' }] });
    renderApp('/login');
    await user.type(screen.getByRole('textbox', { name: 'Correo electrónico', exact: true }), 'ada@example.com');
    await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'secret12');
    await user.keyboard('{Enter}');
    expect(await screen.findByText(/Sesión iniciada correctamente/)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Dashboard financiero' })).toBeInTheDocument();
  });

  it('shows an invalid credentials error', async () => {
    const user = userEvent.setup();
    installApiMock({ users: [{ email: 'ada@example.com', password: 'secret12' }] });
    renderApp('/login');
    await user.type(screen.getByRole('textbox', { name: 'Correo electrónico', exact: true }), 'ada@example.com');
    await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByText('Correo o contrasena invalida')).toBeInTheDocument();
  });

  it('shows an actionable network error and preserves the entered credentials', async () => {
    const user = userEvent.setup();
    installApiMock({ fail: { network: ({ path }) => path.includes('login') } });
    renderApp('/login');
    await user.type(screen.getByRole('textbox', { name: 'Correo electrónico', exact: true }), 'ada@example.com');
    await user.type(screen.getByTestId('login-password'), 'secret12');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByText(/Revisa tu conexión/)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Correo electrónico', exact: true })).toHaveValue('ada@example.com');
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled();
  });

  it('keeps the loading message visible during latency', async () => {
    const user = userEvent.setup();
    installApiMock({
      users: [{ email: 'ada@example.com', password: 'secret12' }],
      delays: { login: 120 },
    });
    renderApp('/login');
    await user.type(screen.getByRole('textbox', { name: 'Correo electrónico', exact: true }), 'ada@example.com');
    await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'secret12');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => expect(document.querySelector('#login-feedback')).toHaveTextContent('Iniciando sesión…'));
    expect(screen.getByRole('button', { name: 'Iniciando sesión…' })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Dashboard financiero' })).toBeInTheDocument());
  });

  it('can be completed with the keyboard', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    screen.getByRole('textbox', { name: 'Correo electrónico', exact: true }).focus();
    await user.tab();
    expect(screen.getByLabelText('Contraseña', { exact: true })).toHaveFocus();
  });
});
