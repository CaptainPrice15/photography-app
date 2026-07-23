import { Injectable, signal, computed } from '@angular/core';
import { Photo } from '@lumen/shared';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private photoMetadata = signal<Map<string, CacheEntry<Photo>>>(new Map());
  private maxAge = 5 * 60 * 1000;

  readonly size = computed(() => this.photoMetadata().size);

  getPhoto(id: string): Photo | null {
    const entry = this.photoMetadata().get(id);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.photoMetadata.update(map => {
        const next = new Map(map);
        next.delete(id);
        return next;
      });
      return null;
    }
    return entry.data;
  }

  setPhoto(photo: Photo): void {
    this.photoMetadata.update(map => {
      const next = new Map(map);
      next.set(photo.id, { data: photo, timestamp: Date.now() });
      return next;
    });
  }

  setPhotos(photos: Photo[]): void {
    this.photoMetadata.update(map => {
      const next = new Map(map);
      const now = Date.now();
      photos.forEach(p => next.set(p.id, { data: p, timestamp: now }));
      return next;
    });
  }

  clear(): void {
    this.photoMetadata.set(new Map());
  }

  cleanup(): void {
    const now = Date.now();
    this.photoMetadata.update(map => {
      const next = new Map(map);
      for (const [id, entry] of next.entries()) {
        if (now - entry.timestamp > this.maxAge) {
          next.delete(id);
        }
      }
      return next;
    });
  }
}