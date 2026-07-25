'use client';

import { useState, useEffect } from 'react';
import type { Collection, Photo } from '@/lib/types';
import { getCollections, getAllPhotos } from '@/lib/api/photos';
import { MasonryGallery } from '@/components/gallery/masonry-gallery';

export default function GalleryPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    getCollections().then(setCollections).catch(() => {});
    getAllPhotos().then(setPhotos).catch(() => {});
  }, []);

  return (
    <main className="flex-1 pt-16">
      <header className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-display font-semibold tracking-tight">Gallery</h1>
        <p className="mt-2 text-muted">Browse all photos across collections</p>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <MasonryGallery collections={collections} photos={photos} />
      </div>
    </main>
  );
}
