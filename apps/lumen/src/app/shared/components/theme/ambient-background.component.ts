import { Component, HostBinding, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-ambient-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      [style.background]="backgroundStyle()"
      aria-hidden="true"
    >
      <div class="absolute inset-0" [class.animate-mesh-drift-a]="true"></div>
      <div class="absolute inset-0" [class.animate-mesh-drift-b]="true"></div>
    </div>
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
export class AmbientBackgroundComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'fixed inset-0 -z-10 overflow-hidden pointer-events-none';
  
  private themeService = inject(ThemeService);
  
  backgroundStyle = signal('');

  constructor() {
    effect(() => {
      const theme = this.themeService.effectiveTheme();
      this.backgroundStyle.set(theme === 'dark'
        ? 'radial-gradient(ellipse 80% 50% at 50% -20%, rgb(var(--accent) / 0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgb(var(--accent-soft) / 0.1), transparent)'
        : 'radial-gradient(ellipse 80% 50% at 50% -20%, rgb(var(--accent) / 0.08), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgb(var(--accent-soft) / 0.05), transparent)'
      );
    });
  }

  ngOnInit() {}

  ngOnDestroy() {}
}