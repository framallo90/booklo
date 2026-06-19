import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Book {
  id: number;
  title: string;
  authors: string;
  cover_url: string | null;
  price: number;
  stock: number;
  product_type: string;
  category_name: string | null;
}

export interface BooksResponse {
  data: Book[];
  total: number;
  page: number;
  limit: number;
}

export interface BookFilters {
  search?: string;
  category_id?: number;
  product_type?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:3000';

  getBooks(filters: BookFilters = {}): Observable<BooksResponse> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.category_id) params = params.set('category_id', filters.category_id);
    if (filters.product_type) params = params.set('product_type', filters.product_type);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.limit) params = params.set('limit', filters.limit);
    return this.http.get<BooksResponse>(`${this.API}/books`, { params });
  }
}