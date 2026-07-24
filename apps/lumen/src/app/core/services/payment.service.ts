import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { OrderWithPhoto, Photo } from '@lumen/shared';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private _orders = signal<OrderWithPhoto[]>([]);
  readonly orders = this._orders.asReadonly();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  loadOrders(): Observable<OrderWithPhoto[]> {
    this.loading.set(true);
    return this.http.get<OrderWithPhoto[]>(`${API_BASE_URL}/payment/orders`, { withCredentials: true }).pipe(
      tap(orders => {
        this._orders.set(orders);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set('Failed to load orders');
        this.loading.set(false);
        return of([]);
      })
    );
  }

  createCheckoutSession(photoId: string, title: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${API_BASE_URL}/payment/checkout`, { photoId, title }, { withCredentials: true }).pipe(
      catchError(err => {
        this.error.set('Failed to create checkout session');
        return of({ url: '' });
      })
    );
  }

  getPhotoById(photoId: string): Observable<Photo | null> {
    return this.http.get<Photo | null>(`${API_BASE_URL}/payment/photo/${photoId}`).pipe(
      catchError(() => of(null))
    );
  }
}
