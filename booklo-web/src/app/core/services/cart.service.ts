import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:3000';

  addItem(bookId: number, quantity: number = 1) {
    return this.http.post(`${this.API}/cart`, { book_id: bookId, quantity });
  }
}