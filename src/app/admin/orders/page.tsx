'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { OrderWithPhoto } from '@/lib/types';
import { getOrders } from '@/lib/api/payment';

function statusClasses(status: string) {
  if (status === 'paid') return 'bg-green-500/10 text-green-500';
  if (status === 'pending') return 'bg-yellow-500/10 text-yellow-500';
  if (status === 'fulfilled') return 'bg-blue-500/10 text-blue-500';
  return '';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithPhoto[]>([]);

  useEffect(() => {
    getOrders().then(setOrders).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-h2 font-semibold tracking-tight mb-8">Orders</h1>

      <div className="overflow-x-auto rounded-xl border border-border-25 bg-surface">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-25">
              <th className="text-left px-6 py-4 text-sm font-medium text-muted">Order ID</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-muted">Amount</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-muted">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-muted">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-border-25 last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="px-6 py-4 text-sm text-fg font-mono">{order.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm text-fg">${(order.amount / 100).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{format(new Date(order.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted">No orders yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
