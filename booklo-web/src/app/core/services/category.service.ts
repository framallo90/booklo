import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  is_active: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:3000';

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API}/categories`);
  }

  create(name: string) {
    return this.http.post(`${this.API}/categories`, { name });
  }

  update(id: number, name: string) {
    return this.http.patch(`${this.API}/categories/${id}`, { name });
  }

  delete(id: number) {
    return this.http.delete(`${this.API}/categories/${id}`);
  }
}
