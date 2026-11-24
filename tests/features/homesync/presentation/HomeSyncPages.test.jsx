import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { installApiMock } from '../../../helpers/mockApi.js';
import { renderApp, seedAuthenticatedSession } from '../../../helpers/renderApp.jsx';

describe('HomeSync pages', () => {
  it('creates a shopping list through the backend route', async () => {
    const user = userEvent.setup();
    const api = installApiMock();
    seedAuthenticatedSession();
    renderApp('/app/users/user-1/homesync/shopping');
    await user.click(screen.getByRole('button', { name: /Crear nueva lista/ }));
    const dialog = screen.getByRole('dialog');
    await user.clear(screen.getByRole('textbox', { name: 'Nueva lista' }));
    await user.type(screen.getByRole('textbox', { name: 'Nueva lista' }), 'Mercado de prueba');
    await user.selectOptions(screen.getByLabelText('Categoría de gasto'), '1123456789abcdef01234567');
    await user.click(withinDialogButton(dialog, 'Guardar registro'));
    expect(await screen.findByRole('tab', { name: /Mercado de prueba/ })).toBeInTheDocument();
    expect(api.calls.some((call) => call.path === '/shopping' && call.method === 'POST')).toBe(true);
  });

  it('creates a household chore from the modal and persists it', async () => {
    const user = userEvent.setup();
    const api = installApiMock();
    seedAuthenticatedSession();
    renderApp('/app/users/user-1/homesync/chores');
    await user.click(screen.getByRole('button', { name: 'Nuevo quehacer' }));
    await user.type(screen.getByLabelText('Nombre de la tarea'), 'Limpiar balcón');
    await user.click(screen.getByRole('button', { name: /Agregar tarea/ }));
    expect(await screen.findByRole('heading', { name: 'Limpiar balcón' })).toBeInTheDocument();
    expect(api.calls.some((call) => call.path === '/tasks' && call.method === 'POST')).toBe(true);
  });
});

function withinDialogButton(dialog, name) {
  return [...dialog.querySelectorAll('button')].find((button) => button.textContent.includes(name));
}
