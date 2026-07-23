import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { PhotoService } from '../../core/services/photo.service';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="flex-1 pt-16">
      <header class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 class="text-display font-semibold tracking-tight">Purchases</h1>
        <p class="mt-2 text-muted">Your order history</p>
      </header>

      <section class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        @if (paymentService.orders().length > 0) {
          <div class="space-y-4">
            @for (order of paymentService.orders(); track order.id) {
              <div class="rounded-xl bg-surface border border-border-25 p-6 flex items-center gap-6">
                @if (order.photo) {
                  <img
                    [src]="photoService.getPhotoUrl(order.photo, 'thumb')"
                    [alt]="order.photo.alt"
                    class="w-20 h-20 rounded-lg object-cover shrink-0"
                  />
                }
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-fg truncate">{{ order.photo?.title || 'Photo' }}</p>
                  <p class="text-xs text-muted mt-1">{{ order.createdAt | date }}</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-sm font-medium text-fg">\${{ (order.amount / 100).toFixed(2) }}</p>
                  <span class="inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    [ngClass]="statusClasses(order.status)"
                  >{{ order.status }}</span>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-20">
            <p class="text-muted text-lg mb-4">No purchases yet</p>
            <a routerLink="/gallery" class="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg inline-block">
              Browse gallery
            </a>
          </div>
        }
      </section>
    </main>
  `,
  styles: []
})
export class PaymentPageComponent implements OnInit {
  paymentService = inject(PaymentService);
  photoService = inject(PhotoService);

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