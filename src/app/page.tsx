'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Collection, Photo } from '@/lib/types';
import { getCollections, getFeatured, getLatest } from '@/lib/api/photos';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { CollectionCard } from '@/components/collections/collection-card';
import { MasonryGallery } from '@/components/gallery/masonry-gallery';
import { TextReveal } from '@/components/ui/text-reveal';
import { RevealItem } from '@/components/ui/reveal-item';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [featured, setFeatured] = useState<Photo[]>([]);
  const [latest, setLatest] = useState<Photo[]>([]);

  useEffect(() => {
    getCollections().then(setCollections).catch(() => {});
    getFeatured().then(setFeatured).catch(() => {});
    getLatest(12).then(setLatest).catch(() => {});
  }, []);

  const marqueeItems = [
    ...collections.map((c) => c.title),
    'Available as prints',
    'Commissions open',
    'Light is the only subject',
  ];

  return (
    <div className="min-h-screen">
      <HeroCarousel photos={featured} />

      <div className="relative overflow-hidden border-y border-border-25 bg-surface/40 py-3">
        <div className="flex gap-8 px-4 animate-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-8" aria-hidden={dup === 1}>
              {marqueeItems.map((item, i) => (
                <span key={i} className="flex items-center gap-8 text-sm font-medium text-muted">
                  {item}
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <RevealItem>
            <TextReveal split className="label mb-3">Collections</TextReveal>
            <TextReveal split className="text-h2 font-semibold tracking-tight">
              Albums with their own weather.
            </TextReveal>
          </RevealItem>
          <Button href="/collections" variant="primary" size="md" className="hidden shrink-0 sm:inline-flex">View all</Button>
        </div>

        <div className="grid auto-rows-[180px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection, i) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={i}
              featured={i === 0}
              className={i === 0 ? 'sm:col-span-2' : ''}
            />
          ))}
        </div>
      </section>

      <section className="cv-auto mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <TextReveal split className="label mb-3">Latest</TextReveal>
          <TextReveal split className="text-h2 font-semibold tracking-tight">Fresh frames</TextReveal>
          <Button href="/gallery" variant="primary" size="md" className="hidden shrink-0 sm:inline-flex">Open gallery</Button>
        </div>

        <MasonryGallery collections={collections} photos={latest} />
      </section>
    </div>
  );
}
