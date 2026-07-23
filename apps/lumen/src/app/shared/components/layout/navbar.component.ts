import { Component, HostBinding, Input, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemeToggleComponent } from '../theme/theme-toggle.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ThemeToggleComponent],
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

            @if (authService.session(); as session) {
              <div class="flex items-center gap-4">
                <a routerLink="/favourites" class="text-sm font-medium text-muted transition-colors hover:text-fg">Favourites</a>
                <a routerLink="/payment" class="text-sm font-medium text-muted transition-colors hover:text-fg">Purchases</a>
                @if (session.role === 'admin') {
                  <a routerLink="/admin" class="text-sm font-medium text-muted transition-colors hover:text-fg">Admin</a>
                }
                <button (click)="logout()" class="text-sm font-medium text-muted transition-colors hover:text-fg">Logout</button>
              </div>
            } @else {
              <div class="flex items-center gap-2">
                <a routerLink="/login" class="text-sm font-medium text-muted transition-colors hover:text-fg">Login</a>
                <a routerLink="/signup" class="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-all hover:border-accent/60 hover:text-accent">Sign up</a>
              </div>
            }
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: []
})
export class NavbarComponent {
  @HostBinding('class') class = 'w-full';
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  logout() {
    this.authService.logout().subscribe();
  }
}