'use client';

import { useState, useEffect } from 'react';
import type { Collection, Photo } from '@/lib/types';
import { getCollections, getAllPhotos } from '@/lib/api/photos';
import { useAuth } from '@/lib/auth-context';

export default function AdminDashboardPage() {
  const { session } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    getCollections().then(setCollections).catch(() => {});
    getAllPhotos().then(setPhotos).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-h2 font-semibold tracking-tight mb-8">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <div className="rounded-xl bg-surface border border-border-25 p-6">
          <p className="text-sm text-muted mb-1">Collections</p>
          <p className="text-3xl font-bold font-display">{collections.length}</p>
        </div>
        <div className="rounded-xl bg-surface border border-border-25 p-6">
          <p className="text-sm text-muted mb-1">Photos</p>
          <p className="text-3xl font-bold font-display">{photos.length}</p>
        </div>
        <div className="rounded-xl bg-surface border border-border-25 p-6">
          <p className="text-sm text-muted mb-1">Role</p>
          <p className="text-3xl font-bold font-display capitalize text-accent">{session?.role || 'N/A'}</p>
        </div>
      </div>

      <div className="rounded-xl bg-surface border border-border-25 p-6">
        <h2 className="text-h3 font-semibold tracking-tight mb-4">Overview</h2>
        <p className="text-muted">Welcome to the admin panel. Use the sidebar to manage collections and orders.</p>
      </div>
    </div>
  );
}
