import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(() => localStorage.getItem('agriToken'));
  const [loading, setLoading] = useState(true);

  // On mount, verify the stored token by fetching /api/auth/me
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Token invalid or expired — clear it
        localStorage.removeItem('agriToken');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback((tokenValue, userData) => {
    localStorage.setItem('agriToken', tokenValue);
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('agriToken');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
