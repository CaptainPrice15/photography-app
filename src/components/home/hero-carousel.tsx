'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Photo } from '@/lib/types';
import { getPhotoUrl, getPhotoSrcset } from '@/lib/types';

interface HeroCarouselProps {
  photos: Photo[];
}

export function HeroCarousel({ photos }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    if (!photos.length) return;
    setCurrentIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  const prevSlide = useCallback(() => {
    if (!photos.length) return;
    setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const resetAutoAdvance = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 6000);
  }, [nextSlide]);

  useEffect(() => {
    if (photos.length > 1) {
      timerRef.current = setInterval(nextSlide, 6000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [photos.length, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  if (!photos.length) return null;

  return (
    <section className="relative w-full min-h-[60vh]">
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-1000 ease-out"
          style={{ transform: `translateX(${-currentIndex * 100}%)` }}
        >
          {photos.map((photo, i) => (
            <div key={photo.id} className="w-full flex-shrink-0 relative min-h-[60vh]">
              <img
                src={getPhotoUrl(photo, i === currentIndex ? 'w1200' : 'w640')}
                srcSet={getPhotoSrcset(photo, [640, 1200, 1920])}
                sizes="100vw"
                width={photo.width}
                height={photo.height}
                alt={photo.alt}
                className="absolute inset-0 w-full h-full object-cover"
                loading={i === currentIndex ? 'eager' : 'lazy'}
                fetchPriority={i === currentIndex ? 'high' : 'low'}
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2" role="tablist" aria-label="Hero carousel navigation">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => { goToSlide(i); resetAutoAdvance(); }}
            aria-selected={i === currentIndex}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2.5 h-2.5 rounded-full border-2 border-white/30 transition-all duration-300 hover:border-white hover:scale-125 focus:outline-none focus:ring-2 focus:ring-accent ${
              i === currentIndex ? 'bg-white border-white' : ''
            }`}
            role="tab"
          />
        ))}
      </div>

      <button
        onClick={() => { prevSlide(); resetAutoAdvance(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors hidden md:block"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => { nextSlide(); resetAutoAdvance(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors hidden md:block"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
