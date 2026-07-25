'use client';

import { useState, useEffect } from 'react';
import type { Collection } from '@/lib/types';
import { getCollections } from '@/lib/api/photos';

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    getCollections().then(setCollections).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-h2 font-semibold tracking-tight mb-8">Collections</h1>

      <div className="overflow-x-auto rounded-xl border border-border-25 bg-surface">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-25">
              <th className="text-left px-6 py-4 text-sm font-medium text-muted">Title</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-muted">Slug</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-muted">Photos</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-muted">Accent</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr key={collection.id} className="border-b border-border-25 last:border-0 hover:bg-surface-2 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-fg">{collection.title}</td>
                <td className="px-6 py-4 text-sm text-muted font-mono">{collection.slug}</td>
                <td className="px-6 py-4 text-sm text-muted">{collection.photos?.length || 0}</td>
                <td className="px-6 py-4">
                  <span className="inline-block h-5 w-10 rounded" style={{ background: collection.accent || 'transparent' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
