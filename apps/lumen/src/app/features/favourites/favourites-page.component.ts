import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PhotoService } from '../../core/services/photo.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { MasonryGalleryComponent } from '../../shared/components/gallery/masonry-gallery.component';

@Component({
  selector: 'app-favourites-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MasonryGalleryComponent],
  template: `
    <main class="flex-1 pt-16">
      <header class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 class="text-display font-semibold tracking-tight">Favourites</h1>
        <p class="mt-2 text-muted">Photos you've saved</p>
      </header>

      <div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        @if (favoritesService.favoritePhotos().length > 0) {
          <app-masonry-gallery 
            [collections]="[]" 
            [photos]="favoritesService.favoritePhotos()"
          />
        } @else {
          <div class="text-center py-20">
            <p class="text-muted text-lg mb-4">No favorites yet</p>
            <a routerLink="/gallery" class="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg inline-block">
              Browse gallery
            </a>
          </div>
        }
      </div>
    </main>
  `,
  styles: []
})
export class FavouritesPageComponent implements OnInit {
  photoService = inject(PhotoService);
  favoritesService = inject(FavoritesService);

  ngOnInit() {
    this.favoritesService.loadFavoritePhotos().subscribe();
  }
}