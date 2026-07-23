import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { PhotoService } from '../../core/services/photo.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="flex-1 pt-16 flex items-center justify-center min-h-screen px-4">
      <div class="w-full max-w-lg text-center">
        <h1 class="text-h2 font-semibold tracking-tight mb-4">Complete your purchase</h1>
        <p class="text-muted mb-8">High-res download — \$15.00</p>

        @if (photo()) {
          <div class="rounded-xl overflow-hidden mb-8 bg-surface border border-border-25">
            <img
              [src]="photoService.getPhotoUrl(photo()!, 'preview')"
              [alt]="photo()!.alt"
              class="w-full aspect-video object-cover"
            />
            <div class="p-4">
              <h3 class="font-medium text-fg">{{ photo()!.title || 'Untitled' }}</h3>
            </div>
          </div>
        }

        @if (error()) {
          <div class="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-4">
            <p class="text-sm text-red-500">{{ error() }}</p>
          </div>
        }

        <button
          (click)="checkout()"
          [disabled]="loading()"
          class="w-full rounded-full bg-accent px-4 py-3 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          @if (loading()) {
            <span>Redirecting to Stripe...</span>
          } @else {
            Pay with Stripe
          }
        </button>

        <p class="text-xs text-muted mt-4">
          You'll be redirected to Stripe's secure checkout page.
        </p>
      </div>
    </main>
  `,
  styles: []
})
export class CheckoutPageComponent implements OnInit {
  private paymentService = inject(PaymentService);
  photoService = inject(PhotoService);
  private route = inject(ActivatedRoute);

  photo = signal<any>(null);
  loading = signal(false);
  error = signal('');

  private photoId = '';
  private title = '';

  ngOnInit() {
    this.photoId = this.route.snapshot.queryParamMap.get('photoId') || '';
    this.title = this.route.snapshot.queryParamMap.get('title') || 'Untitled';

    if (this.photoId) {
      this.paymentService.getPhotoById(this.photoId).subscribe({
        next: (photo) => {
          if (photo) this.photo.set(photo);
        }
      });
    }
  }

  checkout() {
    if (!this.photoId) return;
    this.loading.set(true);
    this.error.set('');

    this.paymentService.createCheckoutSession(this.photoId, this.title).subscribe({
      next: (res) => {
        if (res.url) {
          window.location.href = res.url;
        } else {
          this.error.set('Failed to create checkout session');
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Something went wrong');
        this.loading.set(false);
      }
    });
  }
}