import { Component, Input, ViewChild, ElementRef, inject, PLATFORM_ID, AfterViewInit, OnDestroy, effect, signal, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Photo } from '../../../core/services/photo.service';
import { PhotoService } from '../../../core/services/photo.service';
import { ParallaxImageDirective } from '../../directives/parallax-image.directive';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, ParallaxImageDirective],
  template: `
    <section class="relative w-full" [class.min-h-[60vh]]="true">
      <div class="relative overflow-hidden" #carouselContainer>
        <div class="flex transition-transform duration-1000 ease-out" [style.transform]="'translateX(' + (-currentIndex * 100) + '%)'">
          @for (photo of photos; track photo.id) {
            <div class="w-full flex-shrink-0 relative min-h-[60vh]" appParallaxImage [distance]="120">
              <img
                [src]="photoService.getPhotoUrl(photo, 'w1920')"
                [alt]="photo.alt"
                class="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent"></div>
            </div>
          }
        </div>
      </div>

      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2" role="tablist" aria-label="Hero carousel navigation">
        @for (photo of photos; track photo.id; let i = $index) {
          <button
            (click)="goToSlide(i)"
            [attr.aria-selected]="i === currentIndex()"
            [attr.aria-label]="'Go to slide ' + (i + 1)"
            class="w-2.5 h-2.5 rounded-full border-2 border-white/30 transition-all duration-300 hover:border-white hover:scale-125 focus:outline-none focus:ring-2 focus:ring-accent"
            [class.bg-white]="i === currentIndex()"
            [class.border-white]="i === currentIndex()"
            role="tab"
          ></button>
        }
      </div>

      <button
        (click)="prevSlide()"
        class="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors hidden md:block"
        aria-label="Previous slide"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        (click)="nextSlide()"
        class="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors hidden md:block"
        aria-label="Next slide"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  `,
  styles: []
})
export class HeroCarouselComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) photos!: Photo[];

  photoService = inject(PhotoService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  currentIndex = signal(0);
  private autoAdvanceId: any = null;
  private touchStartX = 0;

  ngAfterViewInit() {
    if (this.isBrowser && this.photos.length > 1) {
      this.startAutoAdvance();
    }
  }

  ngOnDestroy() {
    if (this.autoAdvanceId) {
      clearInterval(this.autoAdvanceId);
    }
  }

  goToSlide(index: number) {
    this.currentIndex.set(index);
    this.resetAutoAdvance();
  }

  nextSlide() {
    this.currentIndex.update(i => (i + 1) % this.photos.length);
    this.resetAutoAdvance();
  }

  prevSlide() {
    this.currentIndex.update(i => (i - 1 + this.photos.length) % this.photos.length);
    this.resetAutoAdvance();
  }

  private startAutoAdvance() {
    this.autoAdvanceId = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  private resetAutoAdvance() {
    if (this.autoAdvanceId) {
      clearInterval(this.autoAdvanceId);
    }
    this.startAutoAdvance();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].clientX;
    const diff = this.touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) this.nextSlide();
      else this.prevSlide();
    }
  }
}