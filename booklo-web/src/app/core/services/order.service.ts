import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:3000';

  createOrder(paymentMethod?: string, notes?: string) {
    return this.http.post(`${this.API}/orders`, { payment_method: paymentMethod, notes });
  }
}