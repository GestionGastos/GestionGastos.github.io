import { API_BASE_URL } from '../../../shared/config/apiConfig.js';
import { authHeaders, httpClient } from '../../../shared/infrastructure/httpClient.js';

export async function listInvoices(token) {
  const response = await httpClient('/invoices', { headers: authHeaders(token) });
  return response?.invoices ?? [];
}

export function createInvoice(token, invoice) {
  return httpClient('/invoices', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(invoice) });
}

export function updateInvoice(token, id, changes) {
  return httpClient(`/invoices/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(changes) });
}

export function deleteInvoice(token, id) {
  return httpClient(`/invoices/${id}`, { method: 'DELETE', headers: authHeaders(token) });
}

export async function downloadInvoiceExport(token, format) {
  const response = await fetch(`${API_BASE_URL}/invoices/export.${format}`, { headers: authHeaders(token) });
  if (!response.ok) throw new Error('Export failed');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `facturas.${format}`;
  link.click();
  URL.revokeObjectURL(url);
}
