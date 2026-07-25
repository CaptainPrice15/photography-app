'use client';

import { useState, useEffect } from 'react';
import type { Collection } from '@/lib/types';
import { getCollections } from '@/lib/api/photos';
import { CollectionCard } from '@/components/collections/collection-card';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    getCollections().then(setCollections).catch(() => {});
  }, []);

  return (
    <main className="flex-1 pt-16">
      <header className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-display font-semibold tracking-tight">Collections</h1>
        <p className="mt-2 text-muted">Curated albums with their own mood and palette</p>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
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
    </main>
  );
}
