import { Component, Input, effect, ViewChild, ElementRef, inject, PLATFORM_ID, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-section-reveal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      #section
      [attr.tag]="tag"
      [class]="className"
      [class.opacity-0]="!isVisible()"
      [class.translate-y-10]="!isVisible()"
      [class.opacity-100]="isVisible()"
      [class.translate-y-0]="isVisible()"
      class="transition-all duration-700 ease-out"
    >
      <ng-content></ng-content>
    </section>
  `,
  styles: []
})
export class SectionRevealComponent implements AfterViewInit, OnDestroy {
  @ViewChild('section') sectionRef!: ElementRef<HTMLElement>;
  @Input() tag: string = 'section';
  @Input() className = '';
  @Input() stagger = false;
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
            setTimeout(() => {
              this.isVisible.set(true);
            }, this.delay);
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    this.observer.observe(this.sectionRef.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}