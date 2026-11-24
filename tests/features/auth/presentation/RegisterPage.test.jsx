import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { installApiMock } from '../../../helpers/mockApi.js';
import { renderApp } from '../../../helpers/renderApp.jsx';

async function fillRegister(user, overrides = {}) {
  const values = {
    name: 'Ada',
    lastname: 'Lovelace',
    email: 'ada@example.com',
    password: 'secret12',
    confirm: 'secret12',
    ...overrides,
  };

  await user.type(screen.getByTestId('register-name'), values.name);
  await user.type(screen.getByTestId('register-lastname'), values.lastname);
  await user.type(screen.getByTestId('register-email'), values.email);
  await user.type(screen.getByTestId('register-password'), values.password);
  await user.type(screen.getByTestId('register-confirm-password'), values.confirm);
  await user.click(screen.getByLabelText(/Acepto los/));
}

describe('RegisterPage', () => {
  it('creates an account and redirects to login', async () => {
    const user = userEvent.setup();
    installApiMock();
    renderApp('/registro');
    await fillRegister(user);
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta gratis' }));
    expect(await screen.findByText(/Cuenta creada correctamente/)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Ingresar' })).toBeInTheDocument();
  });

  it('shows an error when the email already exists', async () => {
    const user = userEvent.setup();
    installApiMock({ users: [{ email: 'ada@example.com', password: 'secret12' }] });
    renderApp('/registro');
    await fillRegister(user);
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta gratis' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/existe una cuenta/i);
    expect(screen.getByTestId('register-email')).toHaveValue('ada@example.com');
  });

  it('validates mismatched passwords without calling the API', async () => {
    const user = userEvent.setup();
    const api = installApiMock();
    renderApp('/registro');
    await fillRegister(user, { confirm: 'other12' });
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta gratis' }));
    expect(screen.getByTestId('register-confirm-password')).toHaveAttribute('aria-invalid', 'true');
    expect(api.calls.filter((call) => call.path.includes('signup'))).toHaveLength(0);
  });

  it('shows a network error and allows retry', async () => {
    const user = userEvent.setup();
    const api = installApiMock({
      fail: { network: ({ path }) => path.includes('signup') && api.calls.filter((call) => call.path.includes('signup')).length === 1 },
    });
    renderApp('/registro');
    await fillRegister(user);
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta gratis' }));
    expect(await screen.findByText(/Revisa tu conexión/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('heading', { name: 'Ingresar' })).toBeInTheDocument();
  });

  it('prevents a double submit', async () => {
    const user = userEvent.setup();
    const api = installApiMock({ delays: { signup: 80 } });
    renderApp('/registro');
    await fillRegister(user);
    const submit = screen.getByRole('button', { name: 'Crear mi cuenta gratis' });
    await user.click(submit);
    await user.click(submit);
    await waitFor(() => expect(api.calls.filter((call) => call.path.includes('signup'))).toHaveLength(1));
  });

  it('keeps password and confirm password as distinct accessible names', () => {
    renderApp('/registro');
    expect(screen.getByRole('textbox', { name: 'Correo electrónico', exact: true })).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña', { exact: true })).toHaveAttribute('data-field', 'password');
    expect(screen.getByLabelText('Confirmar contraseña', { exact: true })).toHaveAttribute('data-field', 'confirm-password');
    expect(screen.getByRole('button', { name: 'Cambiar tema' })).toBeInTheDocument();
    expect(document.querySelector('.locale-select')).toBeInTheDocument();
    expect(document.querySelector('.auth-preference-controls')).not.toBeInTheDocument();
  });
});
