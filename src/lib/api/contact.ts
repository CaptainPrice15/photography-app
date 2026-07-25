import type { ContactState } from '../types';

const API_BASE = 'https://photography-app-api.onrender.com/api';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export async function submitContact(data: ContactFormData): Promise<ContactState> {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
