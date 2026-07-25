export type PhotoFormat = string;

export interface Photo {
  id: string;
  src: string;
  thumbnail?: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  collectionId: string;
  featured?: boolean;
  format: PhotoFormat;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description?: string;
  cover: string;
  accent: string;
  accentSoft?: string;
  photos: Photo[];
}

export interface Session {
  email: string;
  role: 'admin' | 'user';
  paid: boolean;
}

export interface AuthState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  session?: Session;
}

export interface ContactState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

export interface OrderWithPhoto {
  id: string;
  amount: number;
  status: string;
  stripeId: string | null;
  createdAt: string;
  photo: Photo | null;
}

export type PhotoSize = 'thumb' | 'preview' | 'lightbox' | 'w640' | 'w1200' | 'w1920';

export const OPTIMIZABLE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif'] as const;

export function isOptimizable(format: string): boolean {
  return (OPTIMIZABLE_FORMATS as readonly string[]).includes(format.toLowerCase());
}

export const API_ORIGIN = 'https://photography-app-api.onrender.com';
export const API_BASE_URL = `${API_ORIGIN}/api`;

const SIZE_BY_LONG_EDGE: { size: PhotoSize; longEdge: number }[] = [
  { size: 'thumb', longEdge: 400 },
  { size: 'w640', longEdge: 640 },
  { size: 'preview', longEdge: 900 },
  { size: 'w1200', longEdge: 1200 },
  { size: 'lightbox', longEdge: 1600 },
  { size: 'w1920', longEdge: 1920 },
];

function sizeForLongEdge(edge: number): PhotoSize {
  const match = SIZE_BY_LONG_EDGE.find((s) => s.longEdge >= edge);
  return match ? match.size : 'w1920';
}

export function getPhotoUrl(photo: Photo, size: PhotoSize = 'lightbox'): string {
  if (!photo || !photo.src) return '';
  return `${API_ORIGIN}${photo.src}?size=${size}&fm=auto`;
}

export function getCollectionCoverUrl(collection: Collection, size: PhotoSize = 'lightbox'): string {
  if (!collection || !collection.cover) return '';
  return `${API_ORIGIN}${collection.cover}?size=${size}&fm=auto`;
}

export function getPhotoSrcset(photo: Photo, longEdges: number[]): string {
  if (!photo || !photo.src) return '';
  return longEdges
    .map((edge) => {
      const size = sizeForLongEdge(edge);
      return `${API_ORIGIN}${photo.src}?size=${size}&fm=auto ${edge}w`;
    })
    .join(', ');
}

export function getCollectionCoverSrcset(collection: Collection, longEdges: number[]): string {
  if (!collection || !collection.cover) return '';
  return longEdges
    .map((edge) => {
      const size = sizeForLongEdge(edge);
      return `${API_ORIGIN}${collection.cover}?size=${size}&fm=auto ${edge}w`;
    })
    .join(', ');
}
