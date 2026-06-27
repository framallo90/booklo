import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  created_at: string;
  order_count: number;
}

export interface UsersResponse {
  data: AdminUser[];
  total: number;
}

export interface OutdatedBook {
  id: number;
  title: string;
  authors: string;
  price: number;
  price_updated_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getUsers(search = '', page = 1, limit = 20): Observable<UsersResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<UsersResponse>(`${this.API}/admin/users`, { params });
  }

  updateUser(id: number, data: { is_active?: boolean; role_id?: number }): Observable<void> {
    return this.http.patch<void>(`${this.API}/admin/users/${id}`, data);
  }

  getOutdatedBooks(): Observable<OutdatedBook[]> {
    return this.http.get<OutdatedBook[]>(`${this.API}/admin/catalog/outdated`);
  }
}
