'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { OrderWithPhoto } from '@/lib/types';
import { getPhotoUrl } from '@/lib/types';
import { getOrders } from '@/lib/api/payment';

function statusClasses(status: string) {
  if (status === 'paid') return 'bg-green-500/10 text-green-500';
  if (status === 'pending') return 'bg-yellow-500/10 text-yellow-500';
  if (status === 'fulfilled') return 'bg-blue-500/10 text-blue-500';
  return '';
}

export default function PaymentPage() {
  const [orders, setOrders] = useState<OrderWithPhoto[]>([]);

  useEffect(() => {
    getOrders().then(setOrders).catch(() => {});
  }, []);

  return (
    <main className="flex-1 pt-16">
      <header className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-display font-semibold tracking-tight">Purchases</h1>
        <p className="mt-2 text-muted">Your order history</p>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl bg-surface border border-border-25 p-6 flex items-center gap-6">
                {order.photo && (
                  <img
                    src={getPhotoUrl(order.photo, 'thumb')}
                    alt={order.photo.alt}
                    className="w-20 h-20 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fg truncate">{order.photo?.title || 'Photo'}</p>
                  <p className="text-xs text-muted mt-1">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-fg">${(order.amount / 100).toFixed(2)}</p>
                  <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted text-lg mb-4">No purchases yet</p>
            <Link href="/gallery" className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg inline-block">
              Browse gallery
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
