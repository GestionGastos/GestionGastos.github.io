import { API_BASE_URL } from '../config/apiConfig.js';

export class HttpError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.payload = payload;
  }
}

export async function httpClient(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new HttpError(payload?.message ?? 'Request failed', response.status, payload);
  }

  return payload;
}

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
