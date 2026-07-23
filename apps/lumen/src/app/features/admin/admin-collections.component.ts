import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PhotoService } from '../../core/services/photo.service';


@Component({
  selector: 'app-admin-collections',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <h1 class="text-h2 font-semibold tracking-tight mb-8">Collections</h1>

      <div class="overflow-x-auto rounded-xl border border-border-25 bg-surface">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border-25">
              <th class="text-left px-6 py-4 text-sm font-medium text-muted">Title</th>
              <th class="text-left px-6 py-4 text-sm font-medium text-muted">Slug</th>
              <th class="text-left px-6 py-4 text-sm font-medium text-muted">Photos</th>
              <th class="text-left px-6 py-4 text-sm font-medium text-muted">Accent</th>
            </tr>
          </thead>
          <tbody>
            @for (collection of collections(); track collection.id) {
              <tr class="border-b border-border-25 last:border-0 hover:bg-surface-2 transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-fg">{{ collection.title }}</td>
                <td class="px-6 py-4 text-sm text-muted font-mono">{{ collection.slug }}</td>
                <td class="px-6 py-4 text-sm text-muted">{{ collection.photos.length || 0 }}</td>
                <td class="px-6 py-4">
                  <span class="inline-block h-5 w-10 rounded" [style.background]="collection.accent || 'transparent'"></span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class AdminCollectionsComponent implements OnInit {
  private photoService = inject(PhotoService);
  collections = this.photoService.collections;

  ngOnInit() {
    this.photoService.loadCollections().subscribe();
  }
}