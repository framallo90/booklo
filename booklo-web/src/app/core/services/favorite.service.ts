import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Favorite {
  book_id: number;
  title: string;
  cover_url: string | null;
  price: number;
  product_type: string;
}

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:3000';

  getAll(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.API}/favorites`);
  }

  add(bookId: number) {
    return this.http.post(`${this.API}/favorites/${bookId}`, {});
  }

  remove(bookId: number) {
    return this.http.delete(`${this.API}/favorites/${bookId}`);
  }
}