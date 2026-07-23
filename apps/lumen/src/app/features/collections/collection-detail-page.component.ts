import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Collection, Photo } from '../../core/services/photo.service';
import { PhotoService } from '../../core/services/photo.service';
import { MasonryGalleryComponent } from '../../shared/components/gallery/masonry-gallery.component';
import { CollectionThemeSetterDirective } from '../../shared/directives/collection-theme-setter.directive';

@Component({
  selector: 'app-collection-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MasonryGalleryComponent, CollectionThemeSetterDirective],
  template: `
    @if (collection()) {
      <div appCollectionTheme [accent]="collection()!.accent" [accentSoft]="collection()!.accentSoft">
        <header class="relative min-h-[40vh] max-h-[50vh] flex items-end overflow-hidden">
          <img
            [src]="photoService.getCollectionCoverUrl(collection()!, 'w1920')"
            [alt]="collection()!.title"
            class="absolute inset-0 w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/30 to-transparent"></div>
          
          <div class="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 z-10">
            <nav class="mb-8 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
              <a routerLink="/" class="hover:text-fg">Home</a>
              <span>/</span>
              <a routerLink="/collections" class="hover:text-fg">Collections</a>
              <span>/</span>
              <span class="text-fg">{{ collection()!.title }}</span>
            </nav>
            
            <h1 class="text-display font-semibold tracking-tight text-white mb-4">{{ collection()!.title }}</h1>
            <p class="text-lg text-white/80 max-w-2xl">{{ collection()!.description }}</p>
          </div>
        </header>

        <main class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <app-masonry-gallery 
            [collections]="[]" 
            [photos]="collection()!.photos"
          />
        </main>
      </div>
    } @else {
      <div class="flex-1 pt-16 flex items-center justify-center">
        <p class="text-muted">Collection not found</p>
      </div>
    }
  `,
  styles: []
})
export class CollectionDetailPageComponent implements OnInit {
  photoService = inject(PhotoService);
  private route = inject(ActivatedRoute);

  collection = computed(() => {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return null;
    return this.photoService.getCollectionBySlug(slug);
  });

  ngOnInit() {
    this.photoService.loadCollections().subscribe();
  }
}