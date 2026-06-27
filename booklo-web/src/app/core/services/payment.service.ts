import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PreferenceResponse {
  orderId:    number;
  init_point: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private api  = environment.apiUrl;

  createPreference(): Observable<PreferenceResponse> {
    return this.http.post<PreferenceResponse>(`${this.api}/payments/create-preference`, {});
  }

  confirmOrder(orderId: number): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.api}/payments/confirm/${orderId}`, {});
  }
}
