import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp, seedAuthenticatedSession } from '../../../helpers/renderApp.jsx';

describe('manual invoice form', () => {
  it('stores a manual invoice with seller, buyer, tax, and total', async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession();
    renderApp('/app/users/user-1/invoices');
    await user.click(screen.getByRole('button', { name: /Nueva Factura/ }));
    await user.type(screen.getByLabelText('Número / consecutivo'), 'FV-2026-001');
    await user.type(screen.getByLabelText('Nombre o razón social del vendedor'), 'Proveedor SAS');
    await user.type(screen.getByLabelText('NIT / identificación del vendedor'), '900123456');
    await user.type(screen.getByLabelText('Nombre o razón social del adquirente'), 'Cliente SAS');
    await user.type(screen.getByLabelText('NIT / identificación del adquirente'), '800123456');
    await user.type(screen.getByLabelText('Descripción del bien o servicio'), 'Asesoría');
    await user.type(screen.getByLabelText('Valor unitario (COP)'), '100000');
    await user.click(screen.getByRole('button', { name: 'Guardar registro' }));
    expect(await screen.findByText('FV-2026-001')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('lifesync.manualInvoices'))[0]).toMatchObject({ supplier: 'Proveedor SAS', buyerId: '800123456', subtotal: 100000, tax: 19000 });
  });
});
