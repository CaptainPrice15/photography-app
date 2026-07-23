import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PhotoService } from '../../core/services/photo.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="flex-1 pt-16 flex">
      <aside class="w-64 shrink-0 border-r border-border-25 bg-surface/50 px-4 py-8">
        <nav class="space-y-1">
          <a routerLink="/admin" routerLinkActive="bg-accent/10 text-accent" [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-fg hover:bg-surface transition-colors">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </a>
          <a routerLink="/admin/collections" routerLinkActive="bg-accent/10 text-accent"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-fg hover:bg-surface transition-colors">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Collections
          </a>
          <a routerLink="/admin/orders" routerLinkActive="bg-accent/10 text-accent"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-fg hover:bg-surface transition-colors">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Orders
          </a>
        </nav>
      </aside>

      <main class="flex-1 px-8 py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
}