import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totals: {
    total_books: number;
    total_users: number;
    total_orders: number;
    total_revenue: number;
  };
  orders_by_status: { status: string; count: number }[];
  low_stock: { id: number; title: string; stock: number; product_type: string }[];
  recent_orders: { id: number; customer: string; total: number; status: string; created_at: string }[];
  top_products: { id: number; title: string; units_sold: number }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API}/dashboard`);
  }
}