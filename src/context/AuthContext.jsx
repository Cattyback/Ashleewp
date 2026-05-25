import { createContext, useContext, useEffect, useState } from 'react';

/*
 * AuthContext stores:
 *   - user: { name, email, picture }  (from Google /userinfo)
 *   - accessToken: string             (used as Bearer for Drive API calls)
 *   - sessionExpired: boolean         (set when a Drive call 401s; surfaces a
 *                                      banner on Landing so the user knows why
 *                                      they were bounced out)
 *
 * Persisted to localStorage so a page refresh doesn't sign the user out.
 * Google access tokens expire after ~1 hour. When that happens callers throw
 * AuthExpiredError → we call expireSession() to clear auth + flag the banner.
 * ProtectedRoute then redirects to Landing automatically.
 */

const AuthContext = createContext(null);
const STORAGE_KEY = 'workpuzzle:auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEY);
  }, [auth]);

  const login = (user, accessToken) => {
    setAuth({ user, accessToken });
    setSessionExpired(false);
  };
  const logout = () => {
    setAuth(null);
    setSessionExpired(false);
  };
  // Same as logout, but flags the "session expired" banner for Landing.
  const expireSession = () => {
    setAuth(null);
    setSessionExpired(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user: auth?.user ?? null,
        accessToken: auth?.accessToken ?? null,
        sessionExpired,
        login,
        logout,
        expireSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
