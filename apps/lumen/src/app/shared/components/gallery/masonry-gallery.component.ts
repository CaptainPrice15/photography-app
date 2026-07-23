import { Component, Input, Output, EventEmitter, inject, signal, computed, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Photo } from '../../../core/services/photo.service';
import { PhotoService } from '../../../core/services/photo.service';
import { PhotoCardComponent } from '../gallery/photo-card.component';
import { CollectionFilterComponent } from '../gallery/collection-filter.component';
import { LightboxComponent } from '../gallery/lightbox.component';
import { Collection } from '../../../core/services/photo.service';

@Component({
  selector: 'app-masonry-gallery',
  standalone: true,
  imports: [CommonModule, PhotoCardComponent, CollectionFilterComponent, LightboxComponent],
  template: `
    <div class="space-y-8">
      <app-collection-filter
        [collections]="collections"
        [active]="activeFilter()"
        (select)="setFilter($event)"
      ></app-collection-filter>

      <div
        class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4"
        [class.perspective]="lightboxOpen()"
        [style.perspective-origin]="perspectiveOrigin()"
      >
        @for (photo of filteredPhotos(); track photo.id) {
          <app-photo-card
            [photo]="photo"
            (open)="openLightbox($event)"
          ></app-photo-card>
        }
      </div>

      <app-lightbox
        [photos]="filteredPhotos()"
        [index]="lightboxIndex()"
        (close)="closeLightbox()"
        (navigate)="navigateLightbox($event)"
      ></app-lightbox>
    </div>
  `,
  styles: []
})
export class MasonryGalleryComponent implements OnInit, OnDestroy {
  @Input() collections: Collection[] = [];
  @Input() photos: Photo[] = [];

  photoService = inject(PhotoService);

  activeFilter = signal<string>('all');
  lightboxOpen = signal(false);
  lightboxIndex = signal(0);

  filteredPhotos = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'all') return this.photos;
    return this.photos.filter(p => p.collectionId === filter);
  });

  perspectiveOrigin = computed(() => {
    if (!this.lightboxOpen()) return '50% 50%';
    return `${50}% ${50}%`;
  });

  ngOnInit() {
    // Initialize with first 20 photos for performance
  }

  ngOnDestroy() {}

  setFilter(slug: string) {
    this.activeFilter.set(slug);
  }

  openLightbox(photo: Photo) {
    const index = this.filteredPhotos().findIndex(p => p.id === photo.id);
    if (index >= 0) {
      this.lightboxIndex.set(index);
      this.lightboxOpen.set(true);
    }
  }

  closeLightbox() {
    this.lightboxOpen.set(false);
  }

  navigateLightbox(index: number) {
    this.lightboxIndex.set(index);
  }
}