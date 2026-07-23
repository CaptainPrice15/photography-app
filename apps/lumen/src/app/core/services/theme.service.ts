import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private _theme = signal<Theme>('system');
  readonly theme = this._theme.asReadonly();

  readonly effectiveTheme = computed(() => {
    const theme = this._theme();
    if (theme !== 'system' || !this.isBrowser) return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  readonly isDark = computed(() => this.effectiveTheme() === 'dark');

  constructor() {
    if (this.isBrowser) {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved) {
        this._theme.set(saved);
      }
    }

    effect(() => {
      if (!this.isBrowser) return;
      const theme = this._theme();
      localStorage.setItem('theme', theme);
      this.applyTheme(this.effectiveTheme());
    });

    if (this.isBrowser) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this._theme() === 'system') {
          this._theme.set('system');
        }
      });
    }
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  toggleTheme(): void {
    const current = this.effectiveTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  private applyTheme(theme: Theme): void {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}