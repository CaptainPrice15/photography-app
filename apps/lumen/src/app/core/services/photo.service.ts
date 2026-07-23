import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Photo, Collection, PhotoSource } from '@lumen/shared';

const API_URL = '/api';

@Injectable({ providedIn: 'root' })
export class PhotoService implements PhotoSource {
  private _collections = signal<Collection[]>([]);
  readonly collections = this._collections.asReadonly();

  private _featured = signal<Photo[]>([]);
  readonly featured = this._featured.asReadonly();

  private _allPhotos = signal<Photo[]>([]);
  readonly allPhotos = this._allPhotos.asReadonly();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getCollections(): Promise<Collection[]> {
    return this.loadCollections().toPromise() as Promise<Collection[]>;
  }

  getCollection(slug: string): Promise<Collection | null> {
    return this.http.get<Collection>(`${API_URL}/photos/collections/${slug}`).toPromise() as Promise<Collection | null>;
  }

  getFeatured(): Promise<Photo[]> {
    return this.loadFeatured().toPromise() as Promise<Photo[]>;
  }

  getAllPhotos(): Promise<Photo[]> {
    return this.loadAllPhotos().toPromise() as Promise<Photo[]>;
  }

  loadCollections(): Observable<Collection[]> {
    this.loading.set(true);
    return this.http.get<Collection[]>(`${API_URL}/photos/collections`).pipe(
      tap(collections => {
        this._collections.set(collections);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set('Failed to load collections');
        this.loading.set(false);
        return of([]);
      })
    );
  }

  loadFeatured(): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${API_URL}/photos/featured`).pipe(
      tap(photos => this._featured.set(photos)),
      catchError(() => of([]))
    );
  }

  loadAllPhotos(): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${API_URL}/photos/all`).pipe(
      tap(photos => this._allPhotos.set(photos)),
      catchError(() => of([]))
    );
  }

  getPhotoUrl(photo: Photo, size: 'thumb' | 'preview' | 'lightbox' | 'w640' | 'w1200' | 'w1920' = 'lightbox'): string {
    return `${API_URL}/photos/${photo.src}?size=${size}`;
  }

  getCollectionCoverUrl(collection: Collection, size: 'thumb' | 'preview' | 'lightbox' | 'w640' | 'w1200' | 'w1920' = 'lightbox'): string {
    return `${API_URL}/photos/${collection.cover}?size=${size}`;
  }

  getCollectionBySlug(slug: string): Collection | undefined {
    return this._collections().find(c => c.slug === slug);
  }
}

export type { Photo, Collection, PhotoSource };