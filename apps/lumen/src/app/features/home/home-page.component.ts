import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Photo, Collection } from '../../core/services/photo.service';
import { PhotoService } from '../../core/services/photo.service';
import { HeroCarouselComponent } from '../../shared/components/home/hero-carousel.component';
import { CollectionCardComponent } from '../../shared/components/collections/collection-card.component';
import { MasonryGalleryComponent } from '../../shared/components/gallery/masonry-gallery.component';
import { TextRevealComponent } from '../../shared/components/shared/text-reveal.component';
import { RevealItemComponent } from '../../shared/components/shared/reveal-item.component';
import { ButtonComponent } from '../../shared/components/button.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroCarouselComponent, CollectionCardComponent, MasonryGalleryComponent, TextRevealComponent, RevealItemComponent, ButtonComponent],
  template: `
    <div class="min-h-screen">
      <app-hero-carousel [photos]="featured()" />

      <!-- Marquee -->
      <div class="relative overflow-hidden border-y border-border-25 bg-surface/40 py-3">
        <div class="flex gap-8 px-4 animate-marquee">
          @for (dup of [0, 1]; track dup) {
            <div class="flex shrink-0 items-center gap-8" [attr.aria-hidden]="dup === 1">
              @for (item of marqueeItems(); track $index) {
                <span class="flex items-center gap-8 text-sm font-medium text-muted">
                  {{ item }}
                  <span class="h-1.5 w-1.5 rounded-full bg-accent/60"></span>
                </span>
              }
            </div>
          }
        </div>
      </div>

      <!-- Collections -->
      <section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div class="mb-10 flex items-end justify-between gap-4">
          <app-reveal-item>
            <app-text-reveal [split]="true" class="label mb-3">Collections</app-text-reveal>
            <app-text-reveal [split]="true" class="text-h2 font-semibold tracking-tight">
              Albums with their own weather.
            </app-text-reveal>
          </app-reveal-item>
          <app-button variant="primary" size="md" [routerLink]="['/collections']" class="hidden shrink-0 sm:inline-flex">View all</app-button>
        </div>

        <div class="grid auto-rows-[180px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
          @for (collection of collections(); track collection.id; let i = $index) {
            <app-collection-card 
              [collection]="collection" 
              [index]="i"
              [featured]="i === 0"
              [class.sm\\:col-span-2]="i === 0"
            />
          }
        </div>
      </section>

      <!-- Latest -->
      <section class="cv-auto mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div class="mb-10 flex items-end justify-between gap-4">
          <app-text-reveal [split]="true" class="label mb-3">Latest</app-text-reveal>
          <app-text-reveal [split]="true" class="text-h2 font-semibold tracking-tight">Fresh frames</app-text-reveal>
          <app-button variant="primary" size="md" [routerLink]="['/gallery']" class="hidden shrink-0 sm:inline-flex">Open gallery</app-button>
        </div>

        <app-masonry-gallery 
          [collections]="collections()" 
          [photos]="latestPhotos()"
        />
      </section>
    </div>
  `,
  styles: []
})
export class HomePageComponent implements OnInit {
  private photoService = inject(PhotoService);

  collections = this.photoService.collections;
  featured = this.photoService.featured;
  latest = this.photoService.latest;

  marqueeItems = computed(() => [
    ...this.collections().map(c => c.title),
    'Available as prints',
    'Commissions open',
    'Light is the only subject'
  ]);

  latestPhotos = computed(() => this.latest());

  ngOnInit() {
    this.photoService.loadCollections().subscribe();
    this.photoService.loadFeatured().subscribe();
    this.photoService.loadLatest(12).subscribe();
  }
}