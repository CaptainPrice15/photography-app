import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-checkout-success-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="flex-1 pt-16 flex items-center justify-center min-h-screen px-4">
      <div class="w-full max-w-lg text-center">
        <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <svg class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 class="text-h2 font-semibold tracking-tight mb-4">Payment successful!</h1>
        <p class="text-muted mb-8">
          Thank you for your purchase. Your download is now available.
        </p>

        <div class="space-y-4">
          <a routerLink="/gallery" class="inline-block rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-fg transition-all hover:border-accent/60 hover:text-accent">
            Continue browsing
          </a>
        </div>
      </div>
    </main>
  `,
  styles: []
})
export class CheckoutSuccessPageComponent {}