import type { Collection, Photo } from '../types';

const API_BASE = 'https://photography-app-api.onrender.com/api';

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getCollections(): Promise<Collection[]> {
  return request<Collection[]>(`${API_BASE}/photos/collections`);
}

export async function getCollection(slug: string): Promise<Collection | null> {
  try {
    return await request<Collection>(`${API_BASE}/photos/collections/${slug}`);
  } catch {
    return null;
  }
}

export async function getFeatured(): Promise<Photo[]> {
  return request<Photo[]>(`${API_BASE}/photos/featured`);
}

export async function getAllPhotos(): Promise<Photo[]> {
  return request<Photo[]>(`${API_BASE}/photos/all`);
}

export async function getLatest(limit = 12): Promise<Photo[]> {
  return request<Photo[]>(`${API_BASE}/photos/latest?limit=${limit}`);
}
