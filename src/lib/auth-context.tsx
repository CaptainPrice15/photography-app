'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Session } from '../lib/types';
import * as authApi from '../lib/api/auth';

interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPaid: boolean;
  loading: boolean;
  error: string | null;
  init: () => Promise<void>;
  login: (email: string, password: string, returnTo?: string) => Promise<void>;
  register: (email: string, password: string, confirm: string, returnTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!session;
  const isAdmin = session?.role === 'admin';
  const isPaid = session?.paid ?? false;

  const init = useCallback(async () => {
    try {
      const s = await authApi.getSession();
      if (s) setSession(s);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const handleLogin = useCallback(
    async (email: string, password: string, returnTo = '/gallery') => {
      setLoading(true);
      setError(null);
      try {
        const res = await authApi.login(email, password);
        if (res.status === 'success' && res.session) {
          setSession(res.session);
          window.location.href = returnTo;
        } else {
          setError(res.message ?? 'Login failed');
        }
      } catch (err: any) {
        setError(err.message ?? 'Login failed');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleRegister = useCallback(
    async (email: string, password: string, confirm: string, returnTo = '/gallery') => {
      setLoading(true);
      setError(null);
      try {
        const res = await authApi.register(email, password, confirm);
        if (res.status === 'success' && res.session) {
          setSession(res.session);
          window.location.href = returnTo;
        } else {
          setError(res.message ?? 'Registration failed');
        }
      } catch (err: any) {
        setError(err.message ?? 'Registration failed');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setSession(null);
      window.location.href = '/login';
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated,
        isAdmin,
        isPaid,
        loading,
        error,
        init,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
