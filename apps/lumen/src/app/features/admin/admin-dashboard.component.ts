import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PhotoService } from '../../core/services/photo.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <h1 class="text-h2 font-semibold tracking-tight mb-8">Dashboard</h1>

      <div class="grid gap-6 sm:grid-cols-3 mb-8">
        <div class="rounded-xl bg-surface border border-border-25 p-6">
          <p class="text-sm text-muted mb-1">Collections</p>
          <p class="text-3xl font-bold font-display">{{ collections().length }}</p>
        </div>
        <div class="rounded-xl bg-surface border border-border-25 p-6">
          <p class="text-sm text-muted mb-1">Photos</p>
          <p class="text-3xl font-bold font-display">{{ photos().length }}</p>
        </div>
        <div class="rounded-xl bg-surface border border-border-25 p-6">
          <p class="text-sm text-muted mb-1">Role</p>
          <p class="text-3xl font-bold font-display capitalize text-accent">{{ (authService.session()?.role) || 'N/A' }}</p>
        </div>
      </div>

      <div class="rounded-xl bg-surface border border-border-25 p-6">
        <h2 class="text-h3 font-semibold tracking-tight mb-4">Overview</h2>
        <p class="text-muted">Welcome to the admin panel. Use the sidebar to manage collections and orders.</p>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  photoService = inject(PhotoService);
  authService = inject(AuthService);

  collections = this.photoService.collections;
  photos = this.photoService.allPhotos;

  ngOnInit() {
    this.photoService.loadCollections().subscribe();
    this.photoService.loadAllPhotos().subscribe();
  }
}