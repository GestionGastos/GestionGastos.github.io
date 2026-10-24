import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { installApiMock } from '../test/mockApi.js';
import { renderApp } from '../test/renderApp.jsx';

describe('FinTrack end-to-end flow', () => {
  it('registers, logs in, creates a budget, and verifies history totals', async () => {
    const user = userEvent.setup();
    const api = installApiMock();
    renderApp('/registro');

    await user.type(screen.getByTestId('register-name'), 'Ada');
    await user.type(screen.getByTestId('register-lastname'), 'Lovelace');
    await user.type(screen.getByTestId('register-username'), 'ada');
    await user.type(screen.getByTestId('register-email'), 'ada@example.com');
    await user.type(screen.getByTestId('register-password'), 'secret12');
    await user.type(screen.getByTestId('register-confirm-password'), 'secret12');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('heading', { name: 'Ingresar' })).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'E-mail', exact: true }), 'ada@example.com');
    await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'secret12');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByRole('heading', { name: 'Dashboard financiero' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nuevo presupuesto' }));

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
    await user.click(screen.getByRole('button', { name: 'Siguiente: gastos' }));

    await user.selectOptions(document.querySelector('[name="budget-expense-type-0"]'), 'rent');
    await user.type(document.querySelector('[name="budget-expense-amount-0"]'), '1450000');
    await user.click(screen.getByRole('button', { name: 'Siguiente: etiquetas' }));

    await user.type(document.querySelector('[name="budget-tag-0"]'), 'octubre-2026');
    await user.click(screen.getByRole('button', { name: 'Siguiente: confirmación' }));
    await user.click(screen.getByRole('button', { name: 'Guardar presupuesto' }));

    expect(await screen.findByText(/Disponible: \$ ?1\.750\.000/)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Octubre 2026' })).toBeInTheDocument();
    expect(api.budgets[0].tags[0].tag).toBe('octubre-2026');
    expect(screen.queryByText('Cambios guardados')).not.toBeInTheDocument();
  });
});
