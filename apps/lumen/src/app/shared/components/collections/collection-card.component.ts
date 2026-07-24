import { Component, Input, HostBinding, inject, PLATFORM_ID, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Collection } from '../../../core/services/photo.service';
import { PhotoService } from '../../../core/services/photo.service';
import { ParallaxImageDirective } from '../../directives/parallax-image.directive';

@Component({
  selector: 'app-collection-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ParallaxImageDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="relative group overflow-hidden rounded-xl bg-surface border border-border-25 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
      [style.aspect-ratio]="collection.cover ? '16/10' : '16/10'"
      appParallaxImage
      [distance]="featured ? 80 : 40"
    >
      <a [routerLink]="['/collections', collection.slug]" class="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg" [attr.aria-label]="'View ' + collection.title + ' collection'">
        <img
          [src]="photoService.getCollectionCoverUrl(collection, 'w640')"
          [srcset]="photoService.getCollectionCoverSrcset(collection, [400, 640, 1200])"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          [width]="coverWidth()"
          [height]="coverHeight()"
          [alt]="collection.title"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-bg/70 via-bg/10 to-transparent"></div>
      </a>

      <div class="absolute bottom-0 left-0 right-0 p-6 z-10">
        @if (featured) {
          <div class="absolute -top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
            <span class="label text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">Featured</span>
            <span class="text-6xl font-display font-bold text-white/10">{{ (index + 1 + '').padStart(2, '0') }}</span>
          </div>
        }

        <h3 class="text-h3 font-semibold tracking-tight text-white mb-2">{{ collection.title }}</h3>
        <p class="text-sm text-white/70 line-clamp-2">{{ collection.description }}</p>
        @if (collection.accent) {
          <div class="mt-3 h-1 w-16 rounded-full" [style.background]="collection.accent"></div>
        }
      </div>
    </article>
  `,
  styles: []
})
export class CollectionCardComponent {
  @Input({ required: true }) collection!: Collection;
  @Input() index = 0;
  @Input() featured = false;
  @Input() className = '';

  photoService = inject(PhotoService);

  // Look up the cover photo's intrinsic dimensions from collection.photos for CLS-safe rendering.
  private coverPhoto = computed(() =>
    this.collection.photos.find((p) => p.src === this.collection.cover) ?? this.collection.photos[0] ?? null
  );
  coverWidth = computed(() => this.coverPhoto()?.width ?? 1600);
  coverHeight = computed(() => this.coverPhoto()?.height ?? 1000);
}