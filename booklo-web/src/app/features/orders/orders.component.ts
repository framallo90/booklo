import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

import { OrderService, Order, OrderDetail } from '../../core/services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    RouterLink,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders: Order[] = [];
  loading = true;
  details: Record<number, OrderDetail> = {};
  loadingDetail: Record<number, boolean> = {};

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (data) => { this.orders = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  loadDetail(orderId: number): void {
    if (this.details[orderId]) return;
    this.loadingDetail[orderId] = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (detail) => {
        this.details[orderId] = detail;
        this.loadingDetail[orderId] = false;
      },
      error: () => { this.loadingDetail[orderId] = false; },
    });
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'status-pending',
      confirmado: 'status-confirmed',
      enviado: 'status-shipped',
      entregado: 'status-delivered',
      cancelado: 'status-cancelled',
    };
    return map[status] ?? 'status-pending';
  }
}