import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { installApiMock } from '../../../helpers/mockApi.js';
import { renderApp, seedAuthenticatedSession } from '../../../helpers/renderApp.jsx';

const exampleGoal = { _id: '0123456789abcdef01234567', name: 'Fondo inicial', type: 'saving', value: 500000, current: 100000, objective_date: '2027-05-31T00:00:00.000Z', month: 'Mayo', status: 'in_progress', created_at: '2026-01-01T00:00:00.000Z' };

describe('goals management', () => {
  it('edits a goal in a modal and persists the changed value', async () => {
    const user = userEvent.setup();
    const api = installApiMock({ goals: [{ ...exampleGoal }] });
    seedAuthenticatedSession();
    renderApp('/app/users/user-1/goals');

    await screen.findByRole('heading', { name: 'Fondo inicial' });
    await user.click(screen.getByRole('button', { name: 'Editar Fondo inicial' }));
    await user.clear(screen.getByLabelText('Nombre'));
    await user.type(screen.getByLabelText('Nombre'), 'Fondo actualizado');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '700000');
    await user.click(screen.getAllByRole('button', { name: 'Confirmar' }).at(-1));
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByRole('heading', { name: 'Fondo actualizado' })).toBeInTheDocument();
    await waitFor(() => expect(api.calls.some((call) => call.path.endsWith(`/${exampleGoal._id}`) && call.method === 'PUT')).toBe(true));
  });

  it('deletes a goal through the backend route', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const api = installApiMock({ goals: [{ ...exampleGoal }] });
    seedAuthenticatedSession();
    renderApp('/app/users/user-1/goals');
    await screen.findByRole('heading', { name: 'Fondo inicial' });
    await user.click(screen.getByRole('button', { name: 'Eliminar Fondo inicial' }));
    await waitFor(() => expect(api.calls.some((call) => call.path.endsWith(`/${exampleGoal._id}`) && call.method === 'DELETE')).toBe(true));
    expect(screen.queryByRole('heading', { name: 'Fondo inicial' })).not.toBeInTheDocument();
    confirm.mockRestore();
  });
});
