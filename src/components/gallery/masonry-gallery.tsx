'use client';

import { useState, useCallback } from 'react';
import type { Photo, Collection } from '@/lib/types';
import { CollectionFilter } from './collection-filter';
import { PhotoCard } from './photo-card';
import { Lightbox } from './lightbox';

interface MasonryGalleryProps {
  collections: Collection[];
  photos: Photo[];
}

export function MasonryGallery({ collections, photos }: MasonryGalleryProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const filteredPhotos =
    activeFilter === 'all' ? photos : photos.filter((p) => p.collectionId === activeFilter);

  const openLightbox = useCallback(
    (photo: Photo) => {
      const idx = filteredPhotos.findIndex((p) => p.id === photo.id);
      if (idx >= 0) setLightboxIndex(idx);
    },
    [filteredPhotos]
  );

  const closeLightbox = useCallback(() => setLightboxIndex(-1), []);

  const navigateLightbox = useCallback((idx: number) => setLightboxIndex(idx), []);

  return (
    <div className="space-y-8">
      <CollectionFilter collections={collections} active={activeFilter} onSelect={setActiveFilter} />

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {filteredPhotos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} onOpen={openLightbox} />
        ))}
      </div>

      <Lightbox
        photos={filteredPhotos}
        index={lightboxIndex}
        onClose={closeLightbox}
        onNavigate={navigateLightbox}
      />
    </div>
  );
}
