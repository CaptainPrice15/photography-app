import { Component, HostBinding, Input, inject, signal, HostListener, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemeToggleComponent } from '../theme/theme-toggle.component';
import { ButtonComponent } from '../button.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ThemeToggleComponent, ButtonComponent],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 glass border-b border-border-25">
      <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center">
            <a routerLink="/" class="font-display text-h3 font-semibold tracking-tight text-fg" aria-label="Lumen home">
              Lumen
            </a>
          </div>

          <div class="hidden md:flex md:items-center md:gap-8">
            <a routerLink="/gallery" routerLinkActive="text-accent" class="text-sm font-medium text-muted transition-colors hover:text-fg">Gallery</a>
            <a routerLink="/collections" routerLinkActive="text-accent" class="text-sm font-medium text-muted transition-colors hover:text-fg">Collections</a>
            <a routerLink="/about" routerLinkActive="text-accent" class="text-sm font-medium text-muted transition-colors hover:text-fg">About</a>
            <a routerLink="/contact" routerLinkActive="text-accent" class="text-sm font-medium text-muted transition-colors hover:text-fg">Contact</a>
          </div>

          <div class="flex items-center gap-4">
            <app-theme-toggle />

            <div class="hidden md:flex md:items-center md:gap-4">
              @if (authService.session(); as session) {
                <a routerLink="/favourites" class="text-sm font-medium text-muted transition-colors hover:text-fg">Favourites</a>
                <a routerLink="/payment" class="text-sm font-medium text-muted transition-colors hover:text-fg">Purchases</a>
                @if (session.role === 'admin') {
                  <a routerLink="/admin" class="text-sm font-medium text-muted transition-colors hover:text-fg">Admin</a>
                }
                <button (click)="logout()" class="text-sm font-medium text-muted transition-colors hover:text-fg">Logout</button>
              } @else {
                <a routerLink="/login" class="text-sm font-medium text-muted transition-colors hover:text-fg">Login</a>
                <app-button variant="primary" [routerLink]="['/signup']">Sign up</app-button>
              }
            </div>

            <!-- Mobile menu toggle -->
            <button
              type="button"
              class="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted transition-colors hover:text-fg focus:outline-none focus:ring-2 focus:ring-accent"
              [attr.aria-expanded]="mobileOpen()"
              aria-controls="mobile-menu"
              [attr.aria-label]="mobileOpen() ? 'Close menu' : 'Open menu'"
              (click)="mobileOpen.set(!mobileOpen())"
            >
              @if (mobileOpen()) {
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              } @else {
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>
          </div>
        </div>
      </nav>

      <!-- Mobile slide-down panel -->
      @if (mobileOpen()) {
        <div id="mobile-menu" class="md:hidden glass border-t border-border-25 animate-fade-in">
          <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 flex flex-col gap-1">
            <a routerLink="/gallery" routerLinkActive="text-accent" (click)="close()" class="rounded-md px-3 py-2 text-base font-medium text-muted transition-colors hover:text-fg hover:bg-surface-2">Gallery</a>
            <a routerLink="/collections" routerLinkActive="text-accent" (click)="close()" class="rounded-md px-3 py-2 text-base font-medium text-muted transition-colors hover:text-fg hover:bg-surface-2">Collections</a>
            <a routerLink="/about" routerLinkActive="text-accent" (click)="close()" class="rounded-md px-3 py-2 text-base font-medium text-muted transition-colors hover:text-fg hover:bg-surface-2">About</a>
            <a routerLink="/contact" routerLinkActive="text-accent" (click)="close()" class="rounded-md px-3 py-2 text-base font-medium text-muted transition-colors hover:text-fg hover:bg-surface-2">Contact</a>

            <div class="my-2 h-px bg-border-25"></div>

            @if (authService.session(); as session) {
              <a routerLink="/favourites" (click)="close()" class="rounded-md px-3 py-2 text-base font-medium text-muted transition-colors hover:text-fg hover:bg-surface-2">Favourites</a>
              <a routerLink="/payment" (click)="close()" class="rounded-md px-3 py-2 text-base font-medium text-muted transition-colors hover:text-fg hover:bg-surface-2">Purchases</a>
              @if (session.role === 'admin') {
                <a routerLink="/admin" (click)="close()" class="rounded-md px-3 py-2 text-base font-medium text-muted transition-colors hover:text-fg hover:bg-surface-2">Admin</a>
              }
              <button (click)="close(); logout()" class="rounded-md px-3 py-2 text-left text-base font-medium text-muted transition-colors hover:text-fg hover:bg-surface-2">Logout</button>
            } @else {
              <a routerLink="/login" (click)="close()" class="rounded-md px-3 py-2 text-base font-medium text-muted transition-colors hover:text-fg hover:bg-surface-2">Login</a>
              <app-button variant="primary" [routerLink]="['/signup']" (clicked)="close()" class="mt-1 w-full justify-center">Sign up</app-button>
            }
          </div>
        </div>
      }
    </header>
  `,
  styles: []
})
export class NavbarComponent implements OnDestroy {
  @HostBinding('class') class = 'w-full';
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  mobileOpen = signal(false);

  constructor() {
    // Close the mobile panel whenever navigation completes.
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => this.mobileOpen.set(false));
  }

  ngOnDestroy() {
    this.mobileOpen.set(false);
  }

  close() {
    this.mobileOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.mobileOpen()) this.mobileOpen.set(false);
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
