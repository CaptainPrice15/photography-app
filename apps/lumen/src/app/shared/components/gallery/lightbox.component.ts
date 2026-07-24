import { Component, input, output, computed, inject, HostListener, effect, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Photo } from '../../../core/services/photo.service';
import { PhotoService } from '../../../core/services/photo.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { FavoriteButtonComponent } from './favorite-button.component';
import { BuyButtonComponent } from './buy-button.component';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [CommonModule, FavoriteButtonComponent, BuyButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in"
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

        @if (photos().length > 1) {
          <button
            (click)="previous()"
            class="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Previous image"
            [disabled]="index() === 0"
          >
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        }

        <div class="relative max-w-[90vw] max-h-[90vh] animate-scale-in">
          <!-- Shimmer placeholder while the large image streams in -->
          @if (!imgLoaded()) {
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="h-10 w-10 animate-shimmer rounded-full border-2 border-white/20 border-t-white/80"></div>
            </div>
          }
          @if (currentPhoto(); as photo) {
            <img
              [src]="photoService.getPhotoUrl(photo, 'lightbox')"
              [alt]="photo.alt"
              [width]="photo.width"
              [height]="photo.height"
              class="max-w-[90vw] max-h-[90vh] object-contain"
              decoding="async"
              (load)="onImgLoad()"
            />
          }

          @if (currentPhoto(); as photo) {
            <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-white font-medium">{{ photo.title || 'Untitled' }}</h3>
                  <p class="text-white/70 text-sm">{{ photo.collectionId }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <app-favorite-button [photoId]="photo.id" />
                  <app-buy-button [photoId]="photo.id" [title]="photo.title || 'Untitled'" />
                </div>
              </div>
            </div>
          }
        </div>

        @if (photos().length > 1) {
          <button
            (click)="next()"
            class="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Next image"
            [disabled]="index() === photos().length - 1"
          >
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        }
      </div>
    }

    <!-- Preload adjacent images so prev/next navigation feels instant. -->
    @if (prevPhoto(); as prev) {
      <img [src]="photoService.getPhotoUrl(prev, 'lightbox')" alt="" aria-hidden="true" class="hidden" />
    }
    @if (nextPhoto(); as next) {
      <img [src]="photoService.getPhotoUrl(next, 'lightbox')" alt="" aria-hidden="true" class="hidden" />
    }
  `,
  styles: []
})
export class LightboxComponent {
  photos = input<Photo[]>([]);
  index = input<number>(0);
  close = output<void>();
  navigate = output<number>();

  photoService = inject(PhotoService);
  favoritesService = inject(FavoritesService);

  imgLoaded = signal(false);

  isOpen = computed(() => this.index() >= 0 && this.index() < this.photos().length);
  currentPhoto = computed(() => this.photos()[this.index()] || null);
  prevPhoto = computed(() => {
    const i = this.index() - 1;
    return i >= 0 ? this.photos()[i] : null;
  });
  nextPhoto = computed(() => {
    const i = this.index() + 1;
    return i < this.photos().length ? this.photos()[i] : null;
  });

  constructor() {
    // Reset the load state whenever the displayed photo changes so the shimmer re-shows.
    effect(() => {
      this.currentPhoto();
      this.imgLoaded.set(false);
    });
  }

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
    if (this.index() > 0) this.navigate.emit(this.index() - 1);
  }

  next() {
    if (this.index() < this.photos().length - 1) this.navigate.emit(this.index() + 1);
  }

  onImgLoad() {
    this.imgLoaded.set(true);
  }
}
