import { Component, Input, ViewChild, ElementRef, inject, PLATFORM_ID, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { signal } from '@angular/core';

@Component({
  selector: 'app-count-up',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #counter [class]="className" class="inline-block">
      <span [class.text-accent]="true">{{ displayValue() }}</span><span *ngIf="suffix" class="text-muted ml-1">{{ suffix }}</span>
    </div>
  `,
  styles: []
})
export class CountUpComponent implements AfterViewInit, OnDestroy {
  @ViewChild('counter') counterRef!: ElementRef<HTMLElement>;
  @Input() value = 0;
  @Input() suffix = '';
  @Input() prefix = '';
  @Input() duration = 2000;
  @Input() className = '';

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private observer: IntersectionObserver | null = null;
  private animated = false;

  displayValue = signal(0);

  ngAfterViewInit() {
    if (!this.isBrowser) {
      this.displayValue.set(this.value);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animated) {
            this.animated = true;
            this.animateCount();
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    this.observer.observe(this.counterRef.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private animateCount() {
    const start = 0;
    const end = this.value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      const eased = this.easeOutQuart(progress);
      const current = Math.floor(start + (end - start) * eased);
      this.displayValue.set(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  private easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
  }
}