import { Component, HostBinding, OnInit, OnDestroy, inject, signal, effect, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-cursor-spotlight',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isBrowser && !reducedMotion) {
      <div 
        class="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
        [style.background]="spotlightStyle()"
        aria-hidden="true"
      ></div>
    }
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: -10;
      pointer-events: none;
    }
  `]
})
export class CursorSpotlightComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'fixed inset-0 -z-10 pointer-events-none overflow-hidden';
  
  private themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);
  
  isBrowser = isPlatformBrowser(this.platformId);
  reducedMotion = false;
  private mouseX = signal(0);
  private mouseY = signal(0);
  private animationId: number | null = null;

  spotlightStyle = signal('none');

  constructor() {
    effect(() => {
      const theme = this.themeService.effectiveTheme();
      const x = this.mouseX();
      const y = this.mouseY();

      if (!this.isBrowser || this.reducedMotion) {
        this.spotlightStyle.set('none');
        return;
      }

      const color = theme === 'dark' ? 'rgb(var(--accent) / 0.08)' : 'rgb(var(--accent) / 0.04)';
      this.spotlightStyle.set(`radial-gradient(600px circle at ${x}px ${y}px, ${color}, transparent 70%)`);
    });
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = mediaQuery.matches;
    
    if (!this.reducedMotion && window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', this.onMouseMove);
      this.animate();
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('mousemove', this.onMouseMove);
      if (this.animationId) cancelAnimationFrame(this.animationId);
    }
  }

  private onMouseMove = (e: MouseEvent) => {
    this.mouseX.set(e.clientX);
    this.mouseY.set(e.clientY);
  };

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
  };
}