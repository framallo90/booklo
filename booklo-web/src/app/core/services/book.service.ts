import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

export interface BookDetail {
  id: number;
  title: string;
  subtitle: string | null;
  authors: string | null;
  description: string | null;
  isbn_10: string | null;
  isbn_13: string | null;
  publisher: string | null;
  published_date: string | null;
  page_count: number | null;
  cover_url: string | null;
  price: number;
  stock: number;
  product_type: string;
  allows_backorder: boolean;
  category_name: string | null;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getBooks(filters: BookFilters = {}): Observable<BooksResponse> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.category_id) params = params.set('category_id', filters.category_id);
    if (filters.product_type) params = params.set('product_type', filters.product_type);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.limit) params = params.set('limit', filters.limit);
    return this.http.get<BooksResponse>(`${this.API}/books`, { params });
  }

  getById(id: number): Observable<BookDetail> {
    return this.http.get<BookDetail>(`${this.API}/books/${id}`);
  }

  update(id: number, data: Partial<{ price: number; stock: number; category_id: number; cover_url: string }>) {
    return this.http.patch(`${this.API}/books/${id}`, data);
  }

  deactivate(id: number) {
    return this.http.delete(`${this.API}/books/${id}`);
  }

  create(data: { title: string; authors: string[]; price: number; stock: number; category_id: number; product_type: string; cover_url?: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.API}/books`, data);
  }

  importByIsbn(data: { isbn: string; price: number; stock: number; category_id: number; product_type: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.API}/books/import`, data);
  }
}