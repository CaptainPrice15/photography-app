// Formats the Next.js image optimizer can transcode. Anything else
// (heic, svg, gif, tiff, …) must be served unoptimized.
export const OPTIMIZABLE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

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
  blurDataURL?: string;
  featured?: boolean;
  format: PhotoFormat;
  // True when the image cannot go through Next's optimizer (e.g. HEIC).
  unoptimized: boolean;
}

export function isOptimizable(format: string): boolean {
  return (OPTIMIZABLE_FORMATS as readonly string[]).includes(
    format.toLowerCase()
  );
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
}
