import { authHeaders, httpClient } from '../../../shared/infrastructure/httpClient.js';
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

export function updatePassword(token, currentPassword, newPassword) {
  return httpClient('/users/update_password', {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function deleteAccount(token) {
  return httpClient('/users/delete', { method: 'DELETE', headers: authHeaders(token) });
}

export function updateProfile(token, profile) {
  return httpClient('/users/update_user', { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(profile) });
}
