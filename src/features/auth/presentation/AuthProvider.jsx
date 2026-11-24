import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authRepository from '../infrastructure/authRepository.js';
import { isTokenExpired } from '../domain/authSession.js';

const SESSION_KEY = 'budget.session';
export const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const storedSession = JSON.parse(localStorage.getItem(SESSION_KEY));

    if (isTokenExpired(storedSession?.token)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return storedSession;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const clearExpiredSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('isLogged');
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setSession(null);
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => clearExpiredSession();
    window.addEventListener('auth:session-expired', handleExpiredSession);

    return () => window.removeEventListener('auth:session-expired', handleExpiredSession);
  }, [clearExpiredSession]);

  useEffect(() => {
    if (!session?.token) {
      return undefined;
    }

    if (isTokenExpired(session.token)) {
      clearExpiredSession();
      return undefined;
    }

    const decodedPayload = decodeTokenPayload(session.token);
    if (!decodedPayload?.exp) {
      return undefined;
    }

    const timeout = window.setTimeout(clearExpiredSession, Math.max(0, decodedPayload.exp * 1000 - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [clearExpiredSession, session?.token]);

  const signIn = useCallback(async (credentials) => {
    const nextSession = await authRepository.login(credentials);

    if (nextSession.error) {
      return nextSession;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    localStorage.setItem('currency', nextSession.user?.currency ?? 'COP');
    localStorage.setItem('locale', (nextSession.user?.language ?? 'ES').toLowerCase());
    localStorage.setItem('theme', (nextSession.user?.theme ?? 'Light').toLowerCase());
    window.dispatchEvent(new Event('lifesync:locale-updated'));
    window.dispatchEvent(new Event('lifesync:theme-updated'));
    setSession(nextSession);
    return nextSession;
  }, []);

  const signUp = useCallback((user) => authRepository.register(user), []);

  const logout = useCallback(async () => {
    const token = session?.token;
    clearExpiredSession();

    if (token) {
      await authRepository.logout(token).catch(() => null);
    }
  }, [clearExpiredSession, session?.token]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session?.token),
      token: session?.token,
      user: session?.user,
      signIn,
      signUp,
      logout,
    }),
    [logout, session, signIn, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function decodeTokenPayload(token) {
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
