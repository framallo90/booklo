import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API = `${environment.apiUrl}/auth`;

  private _user = new BehaviorSubject<AuthUser | null>(null);
  user$ = this._user.asObservable();

  constructor() {
    const stored = localStorage.getItem('user');
    if (stored) this._user.next(JSON.parse(stored));
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: AuthUser }>(`${this.API}/login`, { email, password }).pipe(
      tap(({ token, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this._user.next(user);
      })
    );
  }

  register(name: string, email: string, password: string) {
    return this.http.post(`${this.API}/register`, { name, email, password });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this._user.getValue()?.role_id === 1;
  }
}