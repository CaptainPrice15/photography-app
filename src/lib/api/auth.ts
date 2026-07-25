import type { AuthState, Session } from '../types';

const API_BASE = 'https://photography-app-api.onrender.com/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getSession(): Promise<Session | null> {
  try {
    const res = await request<AuthState>(`${API_BASE}/auth/session`);
    return res.session ?? null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<AuthState> {
  return request<AuthState>(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  email: string,
  password: string,
  confirm: string
): Promise<AuthState> {
  return request<AuthState>(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email, password, confirm }),
  });
}

export async function logout(): Promise<{ status: string }> {
  return request<{ status: string }>(`${API_BASE}/auth/logout`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
