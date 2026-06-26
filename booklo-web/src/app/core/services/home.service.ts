import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book } from './book.service';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getFeatured(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.API}/home/featured`);
  }

  getNovedades(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.API}/home/novedades`);
  }

  getTopVentas(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.API}/home/top-ventas`);
  }
}
