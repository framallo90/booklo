import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExternalBook {
  title: string;
  subtitle: string | null;
  authors: string[];
  description: string | null;
  publisher: string | null;
  published_date: string | null;
  page_count: number | null;
  cover_url: string | null;
  isbn_10: string | null;
  isbn_13: string | null;
}

@Injectable({ providedIn: 'root' })
export class ExternalBookService {
    private http = inject(HttpClient);
    private readonly API = 'http://localhost:3000';
    search(isbn: string): Observable<ExternalBook> {
    return this.http.get<ExternalBook>(`${this.API}/external-books/isbn/${isbn}`);
  }
}