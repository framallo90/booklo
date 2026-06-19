import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:3000';

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API}/categories`);
  }
}