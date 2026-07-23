import { Component, Input, effect, ViewChild, ElementRef, inject, PLATFORM_ID, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { signal } from '@angular/core';

@Component({
  selector: 'app-reveal-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #item
      [class.opacity-0]="!isVisible()"
      [class.translate-y-10]="!isVisible()"
      [class.opacity-100]="isVisible()"
      [class.translate-y-0]="isVisible()"
      [class.transition-all]="true"
      [class.duration-700]="true"
      [class.ease-out]="true"
      [style.transition-delay.ms]="delay"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class RevealItemComponent implements AfterViewInit, OnDestroy {
  @ViewChild('item') itemRef!: ElementRef<HTMLElement>;
  @Input() delay = 0;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private observer: IntersectionObserver | null = null;

  isVisible = signal(false);

  ngAfterViewInit() {
    if (!this.isBrowser) {
      this.isVisible.set(true);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isVisible.set(true);
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    this.observer.observe(this.itemRef.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}