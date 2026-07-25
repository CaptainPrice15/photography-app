'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Collection } from '@/lib/types';
import { getCollections } from '@/lib/api/photos';
import { getCollectionCoverUrl } from '@/lib/types';
import { MasonryGallery } from '@/components/gallery/masonry-gallery';
import { useCollectionTheme } from '@/hooks/use-collection-theme';

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [collection, setCollection] = useState<Collection | null>(null);

  useCollectionTheme(collection?.accent, collection?.accentSoft);

  useEffect(() => {
    if (!slug) return;
    getCollections().then((collections) => {
      const found = collections.find((c) => c.slug === slug) || null;
      setCollection(found);
    }).catch(() => {});
  }, [slug]);

  if (!collection) {
    return (
      <div className="flex-1 pt-16 flex items-center justify-center">
        <p className="text-muted">Collection not found</p>
      </div>
    );
  }

  return (
    <div>
      <header className="relative min-h-[40vh] max-h-[50vh] flex items-end overflow-hidden">
        <img
          src={getCollectionCoverUrl(collection, 'w1920')}
          alt={collection.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/30 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 z-10">
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-fg">Home</Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-fg">Collections</Link>
            <span>/</span>
            <span className="text-fg">{collection.title}</span>
          </nav>

          <h1 className="text-display font-semibold tracking-tight text-white mb-4">{collection.title}</h1>
          <p className="text-lg text-white/80 max-w-2xl">{collection.description}</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <MasonryGallery collections={[]} photos={collection.photos} />
      </main>
    </div>
  );
}
