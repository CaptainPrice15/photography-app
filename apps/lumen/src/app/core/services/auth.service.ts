import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { Session, AuthState } from '@lumen/shared';

const API_URL = '/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _session = signal<Session | null>(null);
  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => !!this._session());
  readonly isAdmin = computed(() => this._session()?.role === 'admin');
  readonly isPaid = computed(() => this._session()?.paid ?? false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  init(): Observable<AuthState> {
    return this.http.get<AuthState>(`${API_URL}/auth/session`, { withCredentials: true }).pipe(
      tap(res => {
        if (res.session) {
          this._session.set(res.session);
        }
      }),
      catchError(() => of({ status: 'idle' as const }))
    );
  }

  login(email: string, password: string, returnTo = '/gallery'): Observable<AuthState> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.post<AuthState>(`${API_URL}/auth/login`, { email, password }, { withCredentials: true }).pipe(
      tap(res => {
        if (res.status === 'success' && res.session) {
          this._session.set(res.session);
          this.router.navigate([returnTo]);
        } else {
          this.error.set(res.message ?? 'Login failed');
        }
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Login failed');
        this.loading.set(false);
        return of({ status: 'error' as const, message: 'Login failed' });
      })
    );
  }

  register(email: string, password: string, confirm: string, returnTo = '/gallery'): Observable<AuthState> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.post<AuthState>(`${API_URL}/auth/register`, { email, password, confirm }, { withCredentials: true }).pipe(
      tap(res => {
        if (res.status === 'success' && res.session) {
          this._session.set(res.session);
          this.router.navigate([returnTo]);
        } else {
          this.error.set(res.message ?? 'Registration failed');
        }
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Registration failed');
        this.loading.set(false);
        return of({ status: 'error' as const, message: 'Registration failed' });
      })
    );
  }

  logout(): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${API_URL}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this._session.set(null);
        this.router.navigate(['/login']);
      })
    );
  }
}