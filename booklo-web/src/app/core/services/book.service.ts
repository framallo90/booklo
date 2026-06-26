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
  original_price: number | null;
  stock: number;
  product_type: string;
  condition: string;
  publisher: string | null;
  language: string | null;
  category_name: string | null;
  hot_sale: boolean;
  created_at: string;
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
  condition?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
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
  original_price: number | null;
  stock: number;
  product_type: string;
  condition: string;
  language: string | null;
  binding: string | null;
  collection: string | null;
  weight_grams: number | null;
  country: string | null;
  dimensions: string | null;
  allows_backorder: boolean;
  category_name: string | null;
  hot_sale: boolean;
  created_at: string;
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
    if (filters.condition) params = params.set('condition', filters.condition);
    if (filters.min_price !== undefined) params = params.set('min_price', filters.min_price);
    if (filters.max_price !== undefined) params = params.set('max_price', filters.max_price);
    if (filters.sort) params = params.set('sort', filters.sort);
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