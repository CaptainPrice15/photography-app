import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Photo, Collection } from '../../core/services/photo.service';
import { PhotoService } from '../../core/services/photo.service';
import { MasonryGalleryComponent } from '../../shared/components/gallery/masonry-gallery.component';

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [CommonModule, MasonryGalleryComponent],
  template: `
    <main class="flex-1 pt-16">
      <header class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 class="text-display font-semibold tracking-tight">Gallery</h1>
        <p class="mt-2 text-muted">Browse all photos across collections</p>
      </header>

      <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <app-masonry-gallery 
          [collections]="collections()" 
          [photos]="photos()"
        />
      </div>
    </main>
  `,
  styles: []
})
export class GalleryPageComponent implements OnInit {
  private photoService = inject(PhotoService);

  collections = this.photoService.collections;
  photos = this.photoService.allPhotos;

  ngOnInit() {
    this.photoService.loadCollections().subscribe();
    this.photoService.loadAllPhotos().subscribe();
  }
}