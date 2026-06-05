import { createContext, useCallback, useMemo, useState } from 'react';
import * as authRepository from '../infrastructure/authRepository.js';

const SESSION_KEY = 'budget.session';
export const AuthContext = createContext(null);

function readStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const signIn = useCallback(async (credentials) => {
    const nextSession = await authRepository.login(credentials);

    if (nextSession.error) {
      return nextSession;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession;
  }, []);

  const signUp = useCallback((user) => authRepository.register(user), []);

  const logout = useCallback(async () => {
    const token = session?.token;
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('isLogged');
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setSession(null);

    if (token) {
      await authRepository.logout(token).catch(() => null);
    }
  }, [session?.token]);

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
