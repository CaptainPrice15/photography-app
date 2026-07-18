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
