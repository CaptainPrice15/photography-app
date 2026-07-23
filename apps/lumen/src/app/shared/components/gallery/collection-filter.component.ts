import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Collection } from '../../../core/services/photo.service';

@Component({
  selector: 'app-collection-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        (click)="select.emit('all')"
        [class]="filterClasses('all')"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all"
      >
        All
      </button>
      @for (collection of collections; track collection.slug) {
        <button
          (click)="select.emit(collection.slug)"
          [class]="filterClasses(collection.slug)"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all"
        >
          {{ collection.title }}
        </button>
      }
    </div>
  `,
  styles: []
})
export class CollectionFilterComponent {
  @Input() collections: Collection[] = [];
  @Input() active = 'all';
  @Output() select = new EventEmitter<string>();

  filterClasses(slug: string): string {
    const base = 'px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg';
    if (this.active === slug) {
      return `${base} bg-accent text-accent-fg shadow-glow`;
    }
    return `${base} bg-surface text-muted hover:bg-surface-65 hover:text-fg border border-border`;
  }
}