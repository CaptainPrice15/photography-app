'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Photo } from '@/lib/types';
import { getPhotoUrl } from '@/lib/types';
import { FavoriteButton } from './favorite-button';
import { BuyButton } from './buy-button';

interface LightboxProps {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ photos, index, onClose, onNavigate }: LightboxProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isOpen = index >= 0 && index < photos.length;
  const currentPhoto = photos[index] || null;

  useEffect(() => {
    setImgLoaded(false);
  }, [index]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && index > 0) onNavigate(index - 1);
      else if (e.key === 'ArrowRight' && index < photos.length - 1) onNavigate(index + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, index, photos.length, onClose, onNavigate]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Close lightbox"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); if (index > 0) onNavigate(index - 1); }}
          className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Previous image"
          disabled={index === 0}
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}

      <div className="relative max-w-[90vw] max-h-[90vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 animate-shimmer rounded-full border-2 border-white/20 border-t-white/80" />
          </div>
        )}
        <img
          src={getPhotoUrl(currentPhoto, 'lightbox')}
          alt={currentPhoto.alt}
          width={currentPhoto.width}
          height={currentPhoto.height}
          className="max-w-[90vw] max-h-[90vh] object-contain"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
        />

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">{currentPhoto.title || 'Untitled'}</h3>
              <p className="text-white/70 text-sm">{currentPhoto.collectionId}</p>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteButton photoId={currentPhoto.id} />
              <BuyButton photoId={currentPhoto.id} title={currentPhoto.title || 'Untitled'} />
            </div>
          </div>
        </div>
      </div>

      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); if (index < photos.length - 1) onNavigate(index + 1); }}
          className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Next image"
          disabled={index === photos.length - 1}
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      )}

      {index > 0 && <img src={getPhotoUrl(photos[index - 1], 'lightbox')} alt="" aria-hidden="true" className="hidden" />}
      {index < photos.length - 1 && <img src={getPhotoUrl(photos[index + 1], 'lightbox')} alt="" aria-hidden="true" className="hidden" />}
    </div>
  );
}
