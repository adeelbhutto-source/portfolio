'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Family, FamilyMember } from '@/types/shared';
import { apiFetch, saveTokens, clearTokens } from '@/lib/api';

interface AuthState {
  user: User | null;
  family: Family | null;
  familyMember: FamilyMember | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setFamilyData: (family: Family, member: FamilyMember) => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    family: null,
    familyMember: null,
    loading: true,
  });

  const refreshMe = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: User; family: Family | null; familyMember: FamilyMember | null }>('/auth/me');
      setState({ user: data.user, family: data.family, familyMember: data.familyMember, loading: false });
    } catch (err) {
      // apiFetch already tries to refresh the token on 401 and redirects to /login
      // if the refresh also fails. If we get here it's a non-auth error (network, etc.)
      // — clear state so the app renders the unauthenticated view cleanly.
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'Session expired') {
        // apiFetch has already called window.location.href = '/login', nothing more to do
        return;
      }
      setState({ user: null, family: null, familyMember: null, loading: false });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // refreshMe calls apiFetch which handles token refresh + redirect on total expiry
      refreshMe();
    } else {
      // No token at all — not logged in, stop loading immediately
      setState((s) => ({ ...s, loading: false }));
    }
  }, [refreshMe]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const data = await apiFetch<{ user: User; family: Family | null; familyMember: FamilyMember | null; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password, name }) }
    );
    saveTokens(data.tokens.accessToken, data.tokens.refreshToken);
    setState({ user: data.user, family: data.family, familyMember: data.familyMember, loading: false });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ user: User; family: Family | null; familyMember: FamilyMember | null; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
    saveTokens(data.tokens.accessToken, data.tokens.refreshToken);
    setState({ user: data.user, family: data.family, familyMember: data.familyMember, loading: false });
  }, []);

  const loginWithTokens = useCallback(async (accessToken: string, refreshToken: string) => {
    saveTokens(accessToken, refreshToken);
    const data = await apiFetch<{ user: User; family: Family | null; familyMember: FamilyMember | null }>('/auth/me');
    setState({ user: data.user, family: data.family, familyMember: data.familyMember, loading: false });
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) });
    } catch {
      // ignore
    }
    clearTokens();
    setState({ user: null, family: null, familyMember: null, loading: false });
  }, []);

  const setFamilyData = useCallback((family: Family, member: FamilyMember) => {
    setState((s) => ({ ...s, family, familyMember: member }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, register, login, loginWithTokens, logout, setFamilyData, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
