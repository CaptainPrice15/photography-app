import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-h2 font-semibold tracking-tight mb-8">Orders</h1>

      <div class="overflow-x-auto rounded-xl border border-border-25 bg-surface">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border-25">
              <th class="text-left px-6 py-4 text-sm font-medium text-muted">Order ID</th>
              <th class="text-left px-6 py-4 text-sm font-medium text-muted">Amount</th>
              <th class="text-left px-6 py-4 text-sm font-medium text-muted">Status</th>
              <th class="text-left px-6 py-4 text-sm font-medium text-muted">Date</th>
            </tr>
          </thead>
          <tbody>
            @for (order of paymentService.orders(); track order.id) {
              <tr class="border-b border-border-25 last:border-0 hover:bg-surface-2 transition-colors">
                <td class="px-6 py-4 text-sm text-fg font-mono">{{ order.id.slice(0, 8) }}...</td>
                <td class="px-6 py-4 text-sm text-fg">\${{ (order.amount / 100).toFixed(2) }}</td>
                <td class="px-6 py-4">
                  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                    [ngClass]="statusClasses(order.status)"
                  >{{ order.status }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-muted">{{ order.createdAt | date }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-6 py-8 text-center text-muted">No orders yet</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class AdminOrdersComponent implements OnInit {
  paymentService = inject(PaymentService);

  ngOnInit() {
    this.paymentService.loadOrders().subscribe();
  }

  statusClasses(status: string): Record<string, boolean> {
    return {
      'bg-green-500/10': status === 'paid',
      'text-green-500': status === 'paid',
      'bg-yellow-500/10': status === 'pending',
      'text-yellow-500': status === 'pending',
      'bg-blue-500/10': status === 'fulfilled',
      'text-blue-500': status === 'fulfilled',
    };
  }
}