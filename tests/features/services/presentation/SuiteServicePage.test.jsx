import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { installApiMock } from '../../../helpers/mockApi.js';
import { renderApp, seedAuthenticatedSession } from '../../../helpers/renderApp.jsx';

describe('service modules', () => {
  it('creates a TaskFlow task through its backend endpoint', async () => {
    const user = userEvent.setup();
    const api = installApiMock();
    seedAuthenticatedSession();
    renderApp('/app/users/user-1/taskflow');
    await user.click(screen.getByRole('button', { name: 'Nueva tarea' }));
    await user.type(screen.getByLabelText('Nombre'), 'Preparar presupuesto');
    await user.click(screen.getByRole('button', { name: 'Guardar registro' }));
    expect(await screen.findByRole('heading', { name: 'Preparar presupuesto' })).toBeInTheDocument();
    expect(api.calls.some((call) => call.path === '/tasks' && call.method === 'POST')).toBe(true);
  });

  it('creates a collection account using the backend resource contract', async () => {
    const user = userEvent.setup();
    const api = installApiMock();
    seedAuthenticatedSession();
    renderApp('/app/users/user-1/receivables');
    await user.click(screen.getByRole('button', { name: 'Nueva cuenta de cobro' }));
    await user.type(screen.getByLabelText('Cliente / restaurante'), 'Cliente de prueba');
    await user.type(screen.getByLabelText('Servicio prestado'), 'Diseño');
    await user.type(screen.getByLabelText('Valor'), '150000');
    await user.click(screen.getByRole('button', { name: 'Guardar registro' }));
    expect(await screen.findByRole('heading', { name: 'Cliente de prueba' })).toBeInTheDocument();
    expect(api.calls.some((call) => call.path === '/collection-accounts' && call.method === 'POST')).toBe(true);
  });
});
