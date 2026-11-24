import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { installApiMock } from '../../../helpers/mockApi.js';
import { renderApp, seedAuthenticatedSession } from '../../../helpers/renderApp.jsx';

describe('user settings', () => {
  it('stores module visibility and updates the password using the user API', async () => {
    const user = userEvent.setup();
    const api = installApiMock();
    seedAuthenticatedSession();
    renderApp('/app/users/user-1/settings');

    await user.click(screen.getByRole('checkbox', { name: 'FitPulse · Rutinas' }));
    expect(JSON.parse(localStorage.getItem('lifesync.enabledModules'))).not.toContain('fitpulse');

    await user.type(screen.getByLabelText('Contraseña actual'), 'secret12');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'newsecret12');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'newsecret12');
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }));
    expect(await screen.findByText('Contraseña actualizada.')).toBeInTheDocument();
    expect(api.calls.some((call) => call.path === '/users/update_password' && call.method === 'PUT')).toBe(true);
  });

  it('exposes privacy and terms documents publicly', () => {
    const { rerender } = renderApp('/terms');
    expect(screen.getByRole('heading', { name: 'Términos de servicio' })).toBeInTheDocument();
    rerender(null);
    renderApp('/privacy');
    expect(screen.getByRole('heading', { name: 'Política de tratamiento de datos personales' })).toBeInTheDocument();
  });
});
