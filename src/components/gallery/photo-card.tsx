'use client';

import type { Photo } from '@/lib/types';
import { getPhotoUrl, getPhotoSrcset } from '@/lib/types';

interface PhotoCardProps {
  photo: Photo;
  onOpen: (photo: Photo) => void;
}

export function PhotoCard({ photo, onOpen }: PhotoCardProps) {
  return (
    <article className="group relative break-inside-avoid mb-4 overflow-hidden rounded-lg bg-surface border border-border-25 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div
        className="relative aspect-auto min-h-[200px] overflow-hidden cursor-pointer"
        onClick={() => onOpen(photo)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(photo); } }}
        tabIndex={0}
        role="button"
        aria-label={`View ${photo.title || photo.alt}`}
      >
        <img
          src={getPhotoUrl(photo, 'preview')}
          srcSet={getPhotoSrcset(photo, [640, 900, 1200])}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          draggable={false}
          style={{ userSelect: 'none' }}
          onContextMenu={(e) => e.preventDefault()}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div
        className="p-4 cursor-pointer"
        onClick={() => onOpen(photo)}
        tabIndex={0}
        role="button"
        aria-label={`View ${photo.title || photo.alt}`}
      >
        <h3 className="text-sm font-medium text-fg truncate">{photo.title || 'Untitled'}</h3>
        <p className="text-xs text-muted mt-0.5 truncate">{photo.collectionId}</p>
      </div>
    </article>
  );
}
