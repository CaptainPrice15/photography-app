import type { OrderWithPhoto, Photo } from '../types';

const API_BASE = 'https://photography-app-api.onrender.com/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getOrders(): Promise<OrderWithPhoto[]> {
  return request<OrderWithPhoto[]>(`${API_BASE}/payment/orders`);
}

export async function createCheckoutSession(
  photoId: string,
  title: string
): Promise<{ url: string }> {
  return request<{ url: string }>(`${API_BASE}/payment/checkout`, {
    method: 'POST',
    body: JSON.stringify({ photoId, title }),
  });
}

export async function getPhotoById(photoId: string): Promise<Photo | null> {
  try {
    return await request<Photo | null>(`${API_BASE}/payment/photo/${photoId}`);
  } catch {
    return null;
  }
}
