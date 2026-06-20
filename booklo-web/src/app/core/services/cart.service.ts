import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CartItem {
  book_id: number;
  title: string;
  cover_url: string | null;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getCart(): Observable<Cart> {
    return this.http.get<CartItem[]>(`${this.API}/cart`).pipe(
      map(items => ({
        items,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      }))
    );
  }

  addItem(bookId: number, quantity: number = 1) {
    return this.http.post(`${this.API}/cart`, { bookId, quantity });
  }

  updateItem(bookId: number, quantity: number) {
    return this.http.patch(`${this.API}/cart/${bookId}`, { quantity });
  }

  removeItem(bookId: number) {
    return this.http.delete(`${this.API}/cart/${bookId}`);
  }

  clearCart() {
    return this.http.delete(`${this.API}/cart`);
  }
}