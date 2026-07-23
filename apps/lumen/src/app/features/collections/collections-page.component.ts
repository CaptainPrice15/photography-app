import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Collection } from '../../core/services/photo.service';
import { PhotoService } from '../../core/services/photo.service';
import { CollectionCardComponent } from '../../shared/components/collections/collection-card.component';

@Component({
  selector: 'app-collections-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CollectionCardComponent],
  template: `
    <main class="flex-1 pt-16">
      <header class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 class="text-display font-semibold tracking-tight">Collections</h1>
        <p class="mt-2 text-muted">Curated albums with their own mood and palette</p>
      </header>

      <section class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div class="grid auto-rows-[180px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
          @for (collection of collections(); track collection.id; let i = $index) {
            <app-collection-card 
              [collection]="collection" 
              [index]="i"
              [featured]="i === 0"
              [class.sm\\:col-span-2]="i === 0"
            />
          }
        </div>
      </section>
    </main>
  `,
  styles: []
})
export class CollectionsPageComponent implements OnInit {
  private photoService = inject(PhotoService);
  collections = this.photoService.collections;

  ngOnInit() {
    this.photoService.loadCollections().subscribe();
  }
}