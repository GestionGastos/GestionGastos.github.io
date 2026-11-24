export function buildSession(payload) {
  const token = payload?.token;
  const userFromPayload = payload?.user ?? {};
  const decodedUser = decodeJwt(token);
  const user = {
    id: userFromPayload._id ?? userFromPayload.id ?? decodedUser?.id ?? decodedUser?._id ?? decodedUser?.sub ?? 'me',
    name: userFromPayload.name ?? decodedUser?.name ?? '',
    lastname: userFromPayload.lastname ?? decodedUser?.lastname ?? '',
    username: userFromPayload.username ?? decodedUser?.username ?? '',
    email: userFromPayload.email ?? decodedUser?.email ?? '',
    isAdmin: Boolean(userFromPayload.admin ?? decodedUser?.admin ?? false),
    currency: userFromPayload.currency ?? 'COP',
    language: userFromPayload.language ?? 'ES',
    theme: userFromPayload.theme ?? 'Light',
  };

  return { token, user };
}

export function isTokenExpired(token, now = Date.now()) {
  const decodedToken = decodeJwt(token);

  // Tokens without an exp claim are left to the API to validate. This keeps
  // compatibility with the current backend while still enforcing JWT expiry.
  if (!decodedToken?.exp) {
    return false;
  }

  return decodedToken.exp * 1000 <= now;
}

function decodeJwt(token) {
  if (!token?.includes('.')) {
    return null;
  }

  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}
