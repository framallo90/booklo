import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItem {
  book_id: number;
  title: string;
  cover_url: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  status: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
  total: number;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  createOrder(paymentMethod?: string, notes?: string) {
    return this.http.post(`${this.API}/orders`, { payment_method: paymentMethod, notes });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API}/orders`);
  }

  getOrderById(id: number): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(`${this.API}/orders/${id}`);
  }
}