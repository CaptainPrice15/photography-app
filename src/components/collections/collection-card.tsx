'use client';

import Link from 'next/link';
import type { Collection } from '@/lib/types';
import { getCollectionCoverUrl, getCollectionCoverSrcset } from '@/lib/types';
import { useParallax } from '@/hooks/use-parallax';

interface CollectionCardProps {
  collection: Collection;
  index: number;
  featured?: boolean;
  className?: string;
}

export function CollectionCard({ collection, index, featured = false, className }: CollectionCardProps) {
  const { ref, style } = useParallax(featured ? 80 : 40);
  const coverPhoto = collection.photos?.find((p) => p.src === collection.cover) ?? collection.photos?.[0];
  const coverWidth = coverPhoto?.width ?? 1600;
  const coverHeight = coverPhoto?.height ?? 1000;

  return (
    <article
      ref={ref}
      className={`relative group overflow-hidden rounded-xl bg-surface border border-border-25 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ${className ?? ''}`}
      style={{ aspectRatio: '16/10', ...style }}
    >
      <Link href={`/collections/${collection.slug}`} className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg" aria-label={`View ${collection.title} collection`}>
        <img
          src={getCollectionCoverUrl(collection, 'w640')}
          srcSet={getCollectionCoverSrcset(collection, [400, 640, 1200])}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          width={coverWidth}
          height={coverHeight}
          alt={collection.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-bg/10 to-transparent" />
      </Link>

      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        {featured && (
          <div className="absolute -top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
            <span className="label text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">Featured</span>
            <span className="text-6xl font-display font-bold text-white/10">{String(index + 1).padStart(2, '0')}</span>
          </div>
        )}

        <h3 className="text-h3 font-semibold tracking-tight text-white mb-2">{collection.title}</h3>
        <p className="text-sm text-white/70 line-clamp-2">{collection.description}</p>
        {collection.accent && (
          <div className="mt-3 h-1 w-16 rounded-full" style={{ background: collection.accent }} />
        )}
      </div>
    </article>
  );
}
