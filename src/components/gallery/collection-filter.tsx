'use client';

import type { Collection } from '@/lib/types';
import { clsx } from 'clsx';

interface CollectionFilterProps {
  collections: Collection[];
  active: string;
  onSelect: (slug: string) => void;
}

export function CollectionFilter({ collections, active, onSelect }: CollectionFilterProps) {
  const base = 'px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg';

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelect('all')}
        className={clsx(
          base,
          active === 'all'
            ? 'bg-accent text-accent-fg shadow-glow'
            : 'bg-surface text-muted hover:bg-surface-65 hover:text-fg border border-border'
        )}
      >
        All
      </button>
      {collections.map((c) => (
        <button
          key={c.slug}
          onClick={() => onSelect(c.slug)}
          className={clsx(
            base,
            active === c.slug
              ? 'bg-accent text-accent-fg shadow-glow'
              : 'bg-surface text-muted hover:bg-surface-65 hover:text-fg border border-border'
          )}
        >
          {c.title}
        </button>
      ))}
    </div>
  );
}
