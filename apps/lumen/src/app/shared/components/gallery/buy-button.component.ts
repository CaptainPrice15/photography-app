import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buy-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="navigate($event)"
      class="p-2 rounded-full bg-bg/80 backdrop-blur-sm text-muted transition-all duration-200 hover:scale-110 hover:bg-bg hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent"
      [attr.aria-label]="'Buy ' + (title || 'this photo')"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    </button>
  `,
  styles: []
})
export class BuyButtonComponent {
  @Input({ required: true }) photoId!: string;
  @Input() title?: string;

  private router = inject(Router);

  navigate(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/payment/checkout'], { queryParams: { photoId: this.photoId, title: this.title } });
  }
}