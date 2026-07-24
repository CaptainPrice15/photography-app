import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Photo } from '@lumen/shared';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private _favoriteIds = signal<string[]>([]);
  readonly favoriteIds = this._favoriteIds.asReadonly();

  private _favoritePhotos = signal<Photo[]>([]);
  readonly favoritePhotos = this._favoritePhotos.asReadonly();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly isFavorite = computed(() => (id: string) => this._favoriteIds().includes(id));

  constructor(private http: HttpClient) {}

  loadFavorites(): Observable<string[]> {
    this.loading.set(true);
    return this.http.get<string[]>(`${API_BASE_URL}/favorites`, { withCredentials: true }).pipe(
      tap(ids => {
        this._favoriteIds.set(ids);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set('Failed to load favorites');
        this.loading.set(false);
        return of([]);
      })
    );
  }

  loadFavoritePhotos(): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${API_BASE_URL}/favorites/photos`, { withCredentials: true }).pipe(
      tap(photos => this._favoritePhotos.set(photos)),
      catchError(() => of([]))
    );
  }

  toggleFavorite(photoId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${API_BASE_URL}/favorites/toggle`, { photoId }, { withCredentials: true }).pipe(
      tap(() => {
        this.loadFavorites().subscribe();
        this.loadFavoritePhotos().subscribe();
      }),
      catchError(() => of({ success: false }))
    );
  }
}
