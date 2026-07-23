import { Component, Input, ViewChild, ElementRef, inject, PLATFORM_ID, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { signal } from '@angular/core';

@Component({
  selector: 'app-text-reveal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #container [class]="className" [attr.tag]="tag">
      @if (split) {
        @for (line of lines; track $index) {
          <div class="overflow-hidden" [style.transition-delay.ms]="delay + $index * 100">
            <span
              [class.opacity-0]="!visibleLines()[$index]"
              [class.translate-y-full]="!visibleLines()[$index]"
              [class.opacity-100]="visibleLines()[$index]"
              [class.translate-y-0]="visibleLines()[$index]"
              class="inline-block transition-all duration-700 ease-out"
            >
              {{ line }}
            </span>
          </div>
        }
      } @else {
        <span
          [class.opacity-0]="!isVisible()"
          [class.translate-y-full]="!isVisible()"
          [class.opacity-100]="isVisible()"
          [class.translate-y-0]="isVisible()"
          class="inline-block transition-all duration-700 ease-out"
        >
          <ng-content></ng-content>
        </span>
      }
    </div>
  `,
  styles: []
})
export class TextRevealComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;
  @Input() className = '';
  @Input() delay = 0;
  @Input() tag = 'div';
  @Input() split = false;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private observer: IntersectionObserver | null = null;

  isVisible = signal(false);
  visibleLines = signal<boolean[]>([]);
  lines: string[] = [];

  ngAfterViewInit() {
    if (this.split) {
      const text = this.containerRef.nativeElement.textContent || '';
      this.lines = text.split('\n').filter(l => l.trim());
      this.visibleLines.set(this.lines.map(() => false));
    }

    if (!this.isBrowser) {
      this.isVisible.set(true);
      if (this.split) {
        this.visibleLines.set(this.lines.map(() => true));
      }
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              this.isVisible.set(true);
              if (this.split) {
                this.lines.forEach((_, i) => {
                  setTimeout(() => {
                    this.visibleLines.update(arr => {
                      const next = [...arr];
                      next[i] = true;
                      return next;
                    });
                  }, i * 100);
                });
              }
            }, this.delay);
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    this.observer.observe(this.containerRef.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}