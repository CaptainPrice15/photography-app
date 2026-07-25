'use client';

import { useState, useEffect } from 'react';
import type { Photo } from '@/lib/types';
import { toggleFavorite, getFavorites } from '@/lib/api/favorites';
import { useAuth } from '@/lib/auth-context';

interface FavoriteButtonProps {
  photoId: string;
}

export function FavoriteButton({ photoId }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    getFavorites().then((ids) => setIsFavorite(ids.includes(photoId))).catch(() => {});
  }, [photoId, isAuthenticated]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      const res = await toggleFavorite(photoId);
      if (res.success) setIsFavorite((prev) => !prev);
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-full bg-bg/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-bg focus:outline-none focus:ring-2 focus:ring-accent ${
        isFavorite ? 'text-accent' : 'text-muted'
      }`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorite}
    >
      <svg
        className={`w-5 h-5 ${isFavorite ? 'fill-accent stroke-accent' : ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
