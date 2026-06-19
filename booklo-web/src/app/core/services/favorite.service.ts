import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:3000';

  add(bookId: number) {
    return this.http.post(`${this.API}/favorites`, { book_id: bookId });
  }

  remove(bookId: number) {
    return this.http.delete(`${this.API}/favorites/${bookId}`);
  }
}