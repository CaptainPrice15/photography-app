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

export interface PhotoSource {
  getCollections(): Promise<Collection[]>;
  getCollection(slug: string): Promise<Collection | null>;
  getFeatured(): Promise<Photo[]>;
  getAllPhotos(): Promise<Photo[]>;
  getLatest(limit?: number): Promise<Photo[]>;
}

export interface Session {
  email: string;
  role: "admin" | "user";
  paid: boolean;
}

export interface AuthState {
  status: "idle" | "success" | "error";
  message?: string;
  session?: Session;
}

export interface ContactState {
  status: "idle" | "success" | "error";
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

export const OPTIMIZABLE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

export function isOptimizable(format: string): boolean {
  return (OPTIMIZABLE_FORMATS as readonly string[]).includes(format.toLowerCase());
}
