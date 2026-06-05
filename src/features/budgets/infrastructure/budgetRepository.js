import { authHeaders, httpClient } from '../../../shared/infrastructure/httpClient.js';

export async function getBudgetsByUser(userId, token) {
  const headers = authHeaders(token);

  try {
    return await httpClient(`/budget/users/${userId}/budgets`, { headers });
  } catch (error) {
    if (error.status && error.status !== 404) {
      throw error;
    }

    return httpClient('/budget/budgets', { headers });
  }
}

export async function getCurrentBudgetByUser(userId, token) {
  const headers = authHeaders(token);

  try {
    return await httpClient(`/budget/users/${userId}/current`, { headers });
  } catch (error) {
    if (error.status && error.status !== 404) {
      throw error;
    }

    return httpClient('/budget/', { headers });
  }
}

export async function createBudget(userId, token, budget) {
  const headers = authHeaders(token);

  try {
    return await httpClient(`/budget/users/${userId}/budgets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(budget),
    });
  } catch (error) {
    if (error.status && error.status !== 404) {
      throw error;
    }

    return httpClient('/budget/create', {
      method: 'POST',
      headers,
      body: JSON.stringify(budget),
    });
  }
}

export function updateBudget(token, budget) {
  return httpClient(`/budget/update/${budget._id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(budget),
  });
}
