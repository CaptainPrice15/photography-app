import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../../core/services/favorites.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="toggle($event)"
      [class.text-accent]="isFavorite()"
      [class.text-muted]="!isFavorite()"
      class="p-2 rounded-full bg-bg/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-bg focus:outline-none focus:ring-2 focus:ring-accent"
      [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'"
      [attr.aria-pressed]="isFavorite()"
    >
      <svg
        [class.fill-accent]="isFavorite()"
        [class.stroke-accent]="isFavorite()"
        class="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  `,
  styles: []
})
export class FavoriteButtonComponent {
  @Input({ required: true }) photoId!: string;
  @Input() initialFavorite = false;
  @Output() toggled = new EventEmitter<{ photoId: string; isFavorite: boolean }>();

  favoritesService = inject(FavoritesService);

  isFavorite() {
    return this.favoritesService.isFavorite(this.photoId) || this.initialFavorite;
  }

  toggle(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggleFavorite(this.photoId).subscribe(result => {
      if (result.success) {
        this.toggled.emit({ photoId: this.photoId, isFavorite: !this.isFavorite() });
      }
    });
  }
}