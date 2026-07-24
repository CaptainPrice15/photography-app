import { Component, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-border-25 bg-surface/40" [class.footer-reveal]="true">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid gap-8 md:grid-cols-3">
          <div>
            <h3 class="font-display text-h3 font-semibold tracking-tight text-fg">Lumen</h3>
            <p class="mt-4 text-muted text-sm leading-relaxed">
              A modern photography showcase. Explore curated collections, a responsive masonry gallery, and the latest work.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h4 class="label mb-3">Explore</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/gallery" class="text-muted transition-colors hover:text-fg">Gallery</a></li>
              <li><a routerLink="/collections" class="text-muted transition-colors hover:text-fg">Collections</a></li>
              <li><a routerLink="/about" class="text-muted transition-colors hover:text-fg">About</a></li>
              <li><a routerLink="/contact" class="text-muted transition-colors hover:text-fg">Contact</a></li>
            </ul>
          </nav>

          <nav aria-label="Account">
            <h4 class="label mb-3">Account</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/login" class="text-muted transition-colors hover:text-fg">Login</a></li>
              <li><a routerLink="/signup" class="text-muted transition-colors hover:text-fg">Sign up</a></li>
              <li><a routerLink="/favourites" class="text-muted transition-colors hover:text-fg">Favourites</a></li>
              <li><a routerLink="/payment" class="text-muted transition-colors hover:text-fg">Purchases</a></li>
            </ul>
          </nav>
        </div>

        <div class="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border-25 pt-8 sm:flex-row">
          <p class="text-sm text-muted">&copy; {{ year }} Lumen. All rights reserved.</p>
          <div class="flex gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener" class="text-muted transition-colors hover:text-fg" aria-label="Twitter">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener" class="text-muted transition-colors hover:text-fg" aria-label="Instagram">Instagram</a>
            <a href="https://github.com" target="_blank" rel="noopener" class="text-muted transition-colors hover:text-fg" aria-label="GitHub">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-reveal {
      position: sticky;
      bottom: 0;
      z-index: 10;
    }
  `]
})
export class FooterComponent {
  @HostBinding('class') class = 'w-full';
  year = new Date().getFullYear();
}