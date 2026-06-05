import { httpClient } from '../../../shared/infrastructure/httpClient.js';
import { buildSession } from '../domain/authSession.js';

export async function login(credentials) {
  const payload = await httpClient('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (payload?.message !== 'success') {
    return { error: payload?.message ?? 'Invalid Password' };
  }

  return buildSession(payload);
}

export async function register(user) {
  return httpClient('/users/signup', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function logout(token) {
  return httpClient('/users/logout', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}
