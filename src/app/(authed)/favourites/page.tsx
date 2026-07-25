'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Photo } from '@/lib/types';
import { getFavoritePhotos } from '@/lib/api/favorites';
import { MasonryGallery } from '@/components/gallery/masonry-gallery';

export default function FavouritesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    getFavoritePhotos().then(setPhotos).catch(() => {});
  }, []);

  return (
    <main className="flex-1 pt-16">
      <header className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-display font-semibold tracking-tight">Favourites</h1>
        <p className="mt-2 text-muted">Photos you&apos;ve saved</p>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {photos.length > 0 ? (
          <MasonryGallery collections={[]} photos={photos} />
        ) : (
          <div className="text-center py-20">
            <p className="text-muted text-lg mb-4">No favorites yet</p>
            <Link href="/gallery" className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg inline-block">
              Browse gallery
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
