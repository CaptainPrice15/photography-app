import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);

  submitContact(data: ContactFormData): Observable<ContactState> {
    return this.http.post<ContactState>(`${API_BASE_URL}/contact`, data);
  }
}