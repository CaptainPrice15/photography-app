import { Component, Input, Output, EventEmitter, inject, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Photo } from '../../../core/services/photo.service';
import { PhotoService } from '../../../core/services/photo.service';
import { FavoritesService } from '../../../core/services/favorites.service';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
        (click)="close.emit()"
        role="dialog"
        aria-modal="true"
        aria-label="Image lightbox"
      >
        <button
          (click)="close.emit()"
          class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Close lightbox"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <button
          *ngIf="photos.length > 1"
          (click)="previous()"
          class="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Previous image"
          [disabled]="index === 0"
        >
          <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div class="relative max-w-[90vw] max-h-[90vh]">
          <img
          [src]="currentPhoto() ? photoService.getPhotoUrl(currentPhoto()!, 'lightbox') : ''"
          [alt]="currentPhoto() ? currentPhoto()!.alt : ''"
            class="max-w-[90vw] max-h-[90vh] object-contain"
          />

          <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-white font-medium">{{ currentPhoto() ? (currentPhoto()!.title || 'Untitled') : 'Untitled' }}</h3>
                <p class="text-white/70 text-sm">{{ currentPhoto() ? currentPhoto()!.collectionId : '' }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  (click)="toggleFavorite($event)"
                  [attr.aria-label]="isFavorite(currentPhoto() ? currentPhoto()!.id : '') ? 'Remove from favorites' : 'Add to favorites'"
                  class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <svg class="h-5 w-5" [class.fill-current]="isFavorite(currentPhoto() ? currentPhoto()!.id : '')" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
                <a
                  [href]="'/payment/checkout?photoId=' + (currentPhoto() ? currentPhoto()!.id : '') + '&title=' + encodeComponent(currentPhoto() ? currentPhoto()!.title || 'Untitled' : 'Untitled')"
                  class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <button
          *ngIf="photos.length > 1"
          (click)="next()"
          class="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Next image"
          [disabled]="index === photos.length - 1"
        >
          <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    }
  `,
  styles: []
})
export class LightboxComponent {
  @Input() photos: Photo[] = [];
  @Input() index = 0;
  @Output() close = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<number>();
  @Output() favoriteToggle = new EventEmitter<string>();

  photoService = inject(PhotoService);
  favoritesService = inject(FavoritesService);

  isOpen = computed(() => this.index >= 0 && this.index < this.photos.length);
  currentPhoto = computed(() => this.photos[this.index] || null);

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.close.emit();
    } else if (event.key === 'ArrowLeft') {
      this.previous();
    } else if (event.key === 'ArrowRight') {
      this.next();
    }
  }

  previous() {
    if (this.index > 0) this.navigate.emit(this.index - 1);
  }

  next() {
    if (this.index < this.photos.length - 1) this.navigate.emit(this.index + 1);
  }

  toggleFavorite(event: Event) {
    event.stopPropagation();
    if (this.currentPhoto()) {
      this.favoriteToggle.emit(this.currentPhoto()!.id);
    }
  }

  isFavorite(id: string): boolean {
    return this.favoritesService.isFavorite()(id);
  }

  encodeComponent(value: string): string {
    return encodeURIComponent(value);
  }
}