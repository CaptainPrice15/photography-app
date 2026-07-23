import { Directive, Input, HostListener, HostBinding, ElementRef, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appParallaxImage]',
  standalone: true
})
export class ParallaxImageDirective implements OnInit, OnDestroy {
  @Input() distance = 100;
  @Input() as = 'div';

  private el = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private ticking = false;
  private lastScrollY = 0;

  @HostBinding('style.transform') transform = 'translateY(0px)';

  ngOnInit() {
    if (this.isBrowser) {
      this.updateTransform();
      window.addEventListener('scroll', this.onScroll, { passive: true });
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('scroll', this.onScroll);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll = () => {
    if (!this.isBrowser || this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.updateTransform();
      this.ticking = false;
    });
  };

  private updateTransform() {
    if (!this.isBrowser) return;
    
    const rect = this.el.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;
    const distanceFromCenter = viewportCenter - elementCenter;
    const maxDistance = viewportHeight / 2 + rect.height / 2;
    const progress = Math.max(-1, Math.min(1, distanceFromCenter / maxDistance));
    const translateY = progress * this.distance;

    this.transform = `translateY(${translateY}px)`;
  }
}