import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, firstValueFrom } from 'rxjs';
import { Photo, Collection, PhotoSource } from '@lumen/shared';
import { API_ORIGIN, API_BASE_URL } from './api.config';

// Named sizes supported by the server (apps/api/src/lib/watermark.ts SIZE_CONFIG).
// Long edges: thumb=400, w640=640, preview=900, w1200=1200, lightbox=1600, w1920=1920.
export type PhotoSize = 'thumb' | 'preview' | 'lightbox' | 'w640' | 'w1200' | 'w1920';

const SIZE_BY_LONG_EDGE: { size: PhotoSize; longEdge: number }[] = [
  { size: 'thumb', longEdge: 400 },
  { size: 'w640', longEdge: 640 },
  { size: 'preview', longEdge: 900 },
  { size: 'w1200', longEdge: 1200 },
  { size: 'lightbox', longEdge: 1600 },
  { size: 'w1920', longEdge: 1920 },
];

@Injectable({ providedIn: 'root' })
export class PhotoService implements PhotoSource {
  private _collections = signal<Collection[]>([]);
  readonly collections = this._collections.asReadonly();

  private _featured = signal<Photo[]>([]);
  readonly featured = this._featured.asReadonly();

  private _allPhotos = signal<Photo[]>([]);
  readonly allPhotos = this._allPhotos.asReadonly();

  private _latest = signal<Photo[]>([]);
  readonly latest = this._latest.asReadonly();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getCollections(): Promise<Collection[]> {
    return firstValueFrom(this.loadCollections());
  }

  getCollection(slug: string): Promise<Collection | null> {
    return firstValueFrom(this.http.get<Collection>(`${API_BASE_URL}/photos/collections/${slug}`)) as Promise<Collection | null>;
  }

  getFeatured(): Promise<Photo[]> {
    return firstValueFrom(this.loadFeatured());
  }

  getAllPhotos(): Promise<Photo[]> {
    return firstValueFrom(this.loadAllPhotos());
  }

  getLatest(limit = 12): Promise<Photo[]> {
    return firstValueFrom(this.loadLatest(limit));
  }

  loadCollections(): Observable<Collection[]> {
    this.loading.set(true);
    return this.http.get<Collection[]>(`${API_BASE_URL}/photos/collections`).pipe(
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
    return this.http.get<Photo[]>(`${API_BASE_URL}/photos/featured`).pipe(
      tap(photos => this._featured.set(photos)),
      catchError(() => of([]))
    );
  }

  loadAllPhotos(): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${API_BASE_URL}/photos/all`).pipe(
      tap(photos => this._allPhotos.set(photos)),
      catchError(() => of([]))
    );
  }

  loadLatest(limit = 12): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${API_BASE_URL}/photos/latest?limit=${limit}`).pipe(
      tap(photos => this._latest.set(photos)),
      catchError(() => of([]))
    );
  }

  getPhotoUrl(photo: Photo, size: PhotoSize = 'lightbox'): string {
    // `photo.src` is already a full path like `/api/photos/{slug}/{file}`
    // (see pcloudSource.ts), so build the URL from it directly — never re-prefix `/api/photos`.
    return `${API_ORIGIN}${photo.src}?size=${size}&fm=auto`;
  }

  getCollectionCoverUrl(collection: Collection, size: PhotoSize = 'lightbox'): string {
    return `${API_ORIGIN}${collection.cover}?size=${size}&fm=auto`;
  }

  /**
   * Builds a `srcset` string from the server's existing named sizes, with `?fm=auto`
   * so avif/webp are negotiated via the Accept header (no new endpoints).
   * Pass the candidate long-edge widths (e.g. [640, 900, 1200]).
   */
  getPhotoSrcset(photo: Photo, longEdges: number[]): string {
    return longEdges
      .map((edge) => {
        const size = this.sizeForLongEdge(edge);
        return `${API_ORIGIN}${photo.src}?size=${size}&fm=auto ${edge}w`;
      })
      .join(', ');
  }

  getCollectionCoverSrcset(collection: Collection, longEdges: number[]): string {
    return longEdges
      .map((edge) => {
        const size = this.sizeForLongEdge(edge);
        return `${API_ORIGIN}${collection.cover}?size=${size}&fm=auto ${edge}w`;
      })
      .join(', ');
  }

  private sizeForLongEdge(edge: number): PhotoSize {
    const match = SIZE_BY_LONG_EDGE.find((s) => s.longEdge >= edge);
    return match ? match.size : 'w1920';
  }

  getCollectionBySlug(slug: string): Collection | undefined {
    return this._collections().find(c => c.slug === slug);
  }
}

export type { Photo, Collection, PhotoSource };
