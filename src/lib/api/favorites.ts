import type { Photo } from '../types';

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

export async function getFavorites(): Promise<string[]> {
  return request<string[]>(`${API_BASE}/favorites`);
}

export async function getFavoritePhotos(): Promise<Photo[]> {
  return request<Photo[]>(`${API_BASE}/favorites/photos`);
}

export async function toggleFavorite(
  photoId: string
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`${API_BASE}/favorites/toggle`, {
    method: 'POST',
    body: JSON.stringify({ photoId }),
  });
}
