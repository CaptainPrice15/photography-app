'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Photo } from '@/lib/types';
import { getPhotoUrl } from '@/lib/types';
import { getPhotoById, createCheckoutSession } from '@/lib/api/payment';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const photoId = searchParams.get('photoId') || '';
  const title = searchParams.get('title') || 'Untitled';

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (photoId) {
      getPhotoById(photoId).then(setPhoto).catch(() => {});
    }
  }, [photoId]);

  const checkout = async () => {
    if (!photoId) return;
    setLoading(true);
    setError('');
    try {
      const res = await createCheckoutSession(photoId, title);
      if (res.url) {
        window.location.href = res.url;
      } else {
        setError('Failed to create checkout session');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg text-center">
      <h1 className="text-h2 font-semibold tracking-tight mb-4">Complete your purchase</h1>
      <p className="text-muted mb-8">High-res download — $15.00</p>

      {photo && (
        <div className="rounded-xl overflow-hidden mb-8 bg-surface border border-border-25">
          <img
            src={getPhotoUrl(photo, 'preview')}
            alt={photo.alt}
            className="w-full aspect-video object-cover"
          />
          <div className="p-4">
            <h3 className="font-medium text-fg">{photo.title || 'Untitled'}</h3>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <button
        onClick={checkout}
        disabled={loading}
        className="w-full rounded-full bg-accent px-4 py-3 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Redirecting to Stripe...' : 'Pay with Stripe'}
      </button>

      <p className="text-xs text-muted mt-4">
        You&apos;ll be redirected to Stripe&apos;s secure checkout page.
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="flex-1 pt-16 flex items-center justify-center min-h-screen px-4">
      <Suspense fallback={<div className="h-10 w-10 animate-shimmer rounded-full border-2 border-accent/20 border-t-accent" />}>
        <CheckoutForm />
      </Suspense>
    </main>
  );
}
