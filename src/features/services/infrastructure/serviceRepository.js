import { authHeaders, httpClient } from '../../../shared/infrastructure/httpClient.js';

const resources = {
  taskflow: { path: '/tasks', collection: 'tasks', entity: 'task', updateMethod: 'PATCH' },
  receivables: { path: '/collection-accounts', collection: 'accounts', entity: 'account', updateMethod: 'PATCH' },
  outings: { path: '/restaurant-plans', collection: 'plans', entity: 'plan', updateMethod: 'PATCH' },
  fitpulse: { path: '/fitness/routines', collection: 'routines', entity: 'routine', updateMethod: 'PATCH' },
};

export async function listServiceItems(service, token) {
  const resource = resources[service];
  if (!resource) return [];
  const response = await httpClient(resource.path, { headers: authHeaders(token) });
  return response?.[resource.collection] ?? [];
}

export async function createServiceItem(service, token, data) {
  const resource = resources[service];
  if (!resource) throw new Error('Unknown service');
  return httpClient(resource.path, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) });
}

export async function updateServiceItem(service, token, id, data) {
  const resource = resources[service];
  if (!resource) throw new Error('Unknown service');
  return httpClient(`${resource.path}/${id}`, { method: resource.updateMethod, headers: authHeaders(token), body: JSON.stringify(data) });
}

export async function createShoppingList(token, data) {
  const body = typeof data === 'string' ? { name: data } : data;
  return httpClient('/shopping', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(body) });
}

export async function updateShoppingList(token, id, data) {
  return httpClient(`/shopping/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(data) });
}

export function markShoppingListPaid(token, id, establishmentNit) {
  return httpClient(`/shopping/${id}/status`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify({ establishmentNit }) });
}

export function synchronizeShoppingList(token, id) {
  return httpClient(`/shopping/${id}/synchronize`, { method: 'POST', headers: authHeaders(token) });
}

export async function listExpenseTypes(token) {
  const response = await httpClient('/expense-type', { headers: authHeaders(token) });
  return response?.expenseTypes ?? response?.types ?? [];
}

export function listOutingPlaces(token) { return getServiceRecords('/restaurant-plans/places', token, 'places'); }
export function createOutingPlace(token, body) { return createServiceRecord('/restaurant-plans/places', token, body); }
export function listOutings(token) { return getServiceRecords('/restaurant-plans', token, 'plans'); }
export function createOuting(token, body) { return createServiceRecord('/restaurant-plans', token, body); }
export function updateOuting(token, id, body) { return updateServiceRecord('/restaurant-plans', token, id, body); }
export function completeOuting(token, id, body) { return httpClient(`/restaurant-plans/${id}/complete`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(body) }); }
export function synchronizeOuting(token, id) { return httpClient(`/restaurant-plans/${id}/synchronize`, { method: 'POST', headers: authHeaders(token) }); }
export function deleteOuting(token, id) { return httpClient(`/restaurant-plans/${id}`, { method: 'DELETE', headers: authHeaders(token) }); }
export async function getOutingSummary(token, from, to) {
  const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
  return httpClient(`/restaurant-plans/summary?${params}`, { headers: authHeaders(token) });
}

export function getUserPreferences(token) { return httpClient('/users/me/preferences', { headers: authHeaders(token) }); }
export function updateUserPreferences(token, body) { return httpClient('/users/me/preferences', { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(body) }); }

export async function listShoppingLists(token) {
  const response = await httpClient('/shopping', { headers: authHeaders(token) });
  return response?.lists ?? [];
}

export async function getShoppingList(token, id) {
  const response = await httpClient(`/shopping/${id}`, { headers: authHeaders(token) });
  return response?.list ?? null;
}

export async function listShoppingCategories(token) {
  const response = await httpClient('/shopping/categories', { headers: authHeaders(token) });
  return response?.categories ?? [];
}

export async function listShoppingEstablishments(token) {
  const response = await httpClient('/shopping/establishments', { headers: authHeaders(token) });
  return response?.establishments ?? [];
}

export function createShoppingEstablishment(token, data) {
  return httpClient('/shopping/establishments', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) });
}

export function deleteShoppingList(token, id) {
  return httpClient(`/shopping/${id}`, { method: 'DELETE', headers: authHeaders(token) });
}

export function deleteShoppingItem(token, listId, itemId) {
  return httpClient(`/shopping/${listId}/items/${itemId}`, { method: 'DELETE', headers: authHeaders(token) });
}

export async function createShoppingItem(token, listId, item) {
  return httpClient(`/shopping/${listId}/items`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(item) });
}

export async function updateShoppingItem(token, listId, itemId, item) {
  return httpClient(`/shopping/${listId}/items/${itemId}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(item) });
}

export async function getServiceRecords(path, token, collection) {
  const response = await httpClient(path, { headers: authHeaders(token) });
  return response?.[collection] ?? [];
}

export function createServiceRecord(path, token, body) {
  return httpClient(path, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(body) });
}

export function updateServiceRecord(path, token, id, body, method = 'PATCH') {
  return httpClient(`${path}/${id}`, { method, headers: authHeaders(token), body: JSON.stringify(body) });
}

export async function listTaskPeople(token) {
  const response = await httpClient('/tasks/people', { headers: authHeaders(token) });
  return response?.people ?? [];
}

export function createTaskPerson(token, person) {
  return httpClient('/tasks/people', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(person) });
}
