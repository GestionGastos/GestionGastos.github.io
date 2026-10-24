import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { installApiMock } from '../../../test/mockApi.js';
import { renderApp } from '../../../test/renderApp.jsx';

async function signIn(user) {
  installApiMock({ users: [{ email: 'ada@example.com', password: 'secret12' }] });
  renderApp('/login');
  await user.type(screen.getByRole('textbox', { name: 'E-mail', exact: true }), 'ada@example.com');
  await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'secret12');
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  expect(await screen.findByRole('heading', { name: 'Dashboard financiero' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Nuevo presupuesto' }));
}

async function fillBasics(user) {
  await user.clear(document.querySelector('[name="budget-year"]'));
  await user.type(document.querySelector('[name="budget-year"]'), '2026');
  await user.selectOptions(document.querySelector('[name="budget-month"]'), 'Octubre');
  await user.type(document.querySelector('[name="budget-salary"]'), '3500000');
  await user.clear(document.querySelector('[name="budget-savings"]'));
  await user.type(document.querySelector('[name="budget-savings"]'), '500000');
  await user.clear(document.querySelector('[name="budget-additional-income"]'));
  await user.type(document.querySelector('[name="budget-additional-income"]'), '300000');
  await user.clear(document.querySelector('[name="budget-cash"]'));
  await user.type(document.querySelector('[name="budget-cash"]'), '100000');
}

describe('BudgetFormModal', () => {
  it('blocks the tags step without a tag', async () => {
    const user = userEvent.setup();
    await signIn(user);
    await fillBasics(user);
    await user.click(screen.getByRole('button', { name: 'Siguiente: gastos' }));
    await user.selectOptions(document.querySelector('[name="budget-expense-type-0"]'), 'rent');
    await user.type(document.querySelector('[name="budget-expense-amount-0"]'), '1450000');
    await user.click(screen.getByRole('button', { name: 'Siguiente: etiquetas' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente: confirmación' }));
    await waitFor(() => expect(document.querySelector('[name="budget-tag-0"]')).toHaveAttribute('aria-invalid', 'true'));
    expect(document.querySelector('[name="budget-tag-0"]')).toHaveAttribute('aria-invalid', 'true');
  });

  it('saves a valid budget and shows it in history', async () => {
    const user = userEvent.setup();
    await signIn(user);
    await fillBasics(user);
    await user.click(screen.getByRole('button', { name: 'Siguiente: gastos' }));
    await user.selectOptions(document.querySelector('[name="budget-expense-type-0"]'), 'rent');
    await user.type(document.querySelector('[name="budget-expense-amount-0"]'), '1450000');
    await user.click(screen.getByRole('button', { name: 'Añadir gasto' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente: etiquetas' }));
    await user.type(document.querySelector('[name="budget-tag-0"]'), 'octubre-2026');
    await user.click(screen.getByRole('button', { name: 'Siguiente: confirmación' }));
    await user.click(screen.getByRole('button', { name: 'Guardar presupuesto' }));
    expect(await screen.findByText(/Presupuesto de Octubre de 2026 guardado correctamente/)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Octubre 2026' })).toBeInTheDocument();
  });

  it('retries after a save error without losing values', async () => {
    const user = userEvent.setup();
    const api = installApiMock({
      users: [{ email: 'ada@example.com', password: 'secret12' }],
      fail: { saveBudget: true },
    });
    renderApp('/login');
    await user.type(screen.getByRole('textbox', { name: 'E-mail', exact: true }), 'ada@example.com');
    await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'secret12');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await user.click(await screen.findByRole('button', { name: 'Nuevo presupuesto' }));
    await fillBasics(user);
    await user.click(screen.getByRole('button', { name: 'Siguiente: gastos' }));
    await user.selectOptions(document.querySelector('[name="budget-expense-type-0"]'), 'rent');
    await user.type(document.querySelector('[name="budget-expense-amount-0"]'), '1450000');
    await user.click(screen.getByRole('button', { name: 'Siguiente: etiquetas' }));
    await user.type(document.querySelector('[name="budget-tag-0"]'), 'octubre-2026');
    await user.click(screen.getByRole('button', { name: 'Siguiente: confirmación' }));
    await user.click(screen.getByRole('button', { name: 'Guardar presupuesto' }));
    expect(await screen.findByText(/No pudimos completar la operación/)).toBeInTheDocument();
    api.fail.saveBudget = false;
    await user.click(screen.getByRole('button', { name: 'Reintentar guardado' }));
    expect(await screen.findByText(/guardado correctamente/)).toBeInTheDocument();
    expect(screen.getByText(/octubre-2026/i)).toBeInTheDocument();
  });

  it('prevents a duplicate save while the request is pending', async () => {
    const user = userEvent.setup();
    const api = installApiMock({ users: [{ email: 'ada@example.com', password: 'secret12' }], delays: { saveBudget: 100 } });
    renderApp('/login');
    await user.type(screen.getByRole('textbox', { name: 'E-mail', exact: true }), 'ada@example.com');
    await user.type(screen.getByTestId('login-password'), 'secret12');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await user.click(await screen.findByRole('button', { name: 'Nuevo presupuesto' }));
    await fillBasics(user);
    await user.click(screen.getByRole('button', { name: 'Siguiente: gastos' }));
    await user.selectOptions(document.querySelector('[name="budget-expense-type-0"]'), 'rent');
    await user.type(document.querySelector('[name="budget-expense-amount-0"]'), '1450000');
    await user.click(screen.getByRole('button', { name: 'Siguiente: etiquetas' }));
    await user.type(document.querySelector('[name="budget-tag-0"]'), 'octubre-2026');
    await user.click(screen.getByRole('button', { name: 'Siguiente: confirmación' }));
    const save = screen.getByRole('button', { name: 'Guardar presupuesto' });
    await user.click(save);
    await user.click(save);
    await waitFor(() => expect(api.calls.filter((call) => call.method === 'POST' && call.path.includes('budget')).length).toBe(1));
  });

  it('does not expose duplicate critical action names', async () => {
    const user = userEvent.setup();
    await signIn(user);
    const dialog = screen.getByRole('dialog', { name: 'Nuevo presupuesto' });
    const names = within(dialog).getAllByRole('button').map((button) => button.getAttribute('aria-label') || button.textContent);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });
});
