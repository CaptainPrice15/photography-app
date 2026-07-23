import { Component, Input, Output, EventEmitter, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Photo } from '../../../core/services/photo.service';
import { PhotoService } from '../../../core/services/photo.service';

@Component({
  selector: 'app-photo-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="group relative break-inside-avoid mb-4 overflow-hidden rounded-lg bg-surface border border-border-25 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div
        class="relative aspect-auto min-h-[200px] overflow-hidden cursor-pointer"
        (click)="open.emit(photo)"
        (keydown.enter)="open.emit(photo)"
        (keydown.space)="open.emit(photo); $event.preventDefault()"
        tabindex="0"
        role="button"
        [attr.aria-label]="'View ' + (photo.title || photo.alt)"
      >
        <img
          [src]="photoService.getPhotoUrl(photo, 'preview')"
          [alt]="photo.alt"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          draggable="false"
          style="user-select: none"
          (contextmenu)="$event.preventDefault()"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div
        class="p-4 cursor-pointer"
        (click)="open.emit(photo)"
        tabindex="0"
        role="button"
        [attr.aria-label]="'View ' + (photo.title || photo.alt)"
      >
        <h3 class="text-sm font-medium text-fg truncate">{{ photo.title || 'Untitled' }}</h3>
        <p class="text-xs text-muted mt-0.5 truncate">{{ photo.collectionId }}</p>
      </div>
    </article>
  `,
  styles: []
})
export class PhotoCardComponent {
  @Input({ required: true }) photo!: Photo;
  @Output() open = new EventEmitter<Photo>();

  photoService = inject(PhotoService);
}