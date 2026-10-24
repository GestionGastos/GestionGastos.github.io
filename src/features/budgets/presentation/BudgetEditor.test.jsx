import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { installApiMock } from '../../../test/mockApi.js';
import { renderApp } from '../../../test/renderApp.jsx';

describe('BudgetEditor autosave', () => {
  it('persists changes to all basic budget fields automatically', async () => {
    const user = userEvent.setup();
    const budget = {
      _id: 'budget-1',
      year: '2026',
      month: 'Septiembre',
      basics: { salary: '3000000', save: '200000', additionalIncome: '0', cash: '100000' },
      expenses: [],
      additionals: [],
      tags: [],
    };
    const api = installApiMock({ users: [{ email: 'ada@example.com', password: 'secret12' }], budgets: [budget] });
    renderApp('/login');

    await user.type(screen.getByRole('textbox', { name: 'E-mail', exact: true }), 'ada@example.com');
    await user.type(screen.getByTestId('login-password'), 'secret12');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await user.click(await screen.findByRole('button', { name: 'Septiembre 2026' }));
    await screen.findByTestId('budget-editor-year');

    await user.clear(screen.getByTestId('budget-editor-year'));
    await user.type(screen.getByTestId('budget-editor-year'), '2027');
    await user.clear(screen.getByTestId('budget-editor-month'));
    await user.type(screen.getByTestId('budget-editor-month'), 'Octubre');
    await user.clear(screen.getByTestId('budget-editor-salary'));
    await user.type(screen.getByTestId('budget-editor-salary'), '4000000');
    await user.clear(screen.getByTestId('budget-editor-savings'));
    await user.type(screen.getByTestId('budget-editor-savings'), '300000');
    await user.clear(screen.getByTestId('budget-editor-additional-income'));
    await user.type(screen.getByTestId('budget-editor-additional-income'), '500000');
    await user.clear(screen.getByTestId('budget-editor-cash'));
    await user.type(screen.getByTestId('budget-editor-cash'), '250000');

    await waitFor(() => {
      const update = api.calls.find((call) => call.method === 'PUT' && call.path.includes('/budget/update/'));
      expect(update).toBeDefined();
      expect(update.body).toMatchObject({
        year: '2027',
        month: 'Octubre',
        basics: { salary: '4000000', save: '300000', additionalIncome: '500000', cash: '250000' },
      });
    }, { timeout: 3000 });
  });
});
