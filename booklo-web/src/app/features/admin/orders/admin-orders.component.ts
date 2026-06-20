import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService, AdminOrder, OrderStatus } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    CurrencyPipe,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css',
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders: AdminOrder[] = [];
  loading = false;
  filterStatus = '';
  expandedOrder: (AdminOrder & { items?: any[] }) | null = null;
  loadingDetail = false;

  readonly statuses: { value: OrderStatus | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'enviado', label: 'Enviado' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  displayedColumns = ['id', 'user_email', 'total', 'status', 'created_at', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.orderService.getAdminOrders(this.filterStatus || undefined).subscribe({
      next: (orders) => { this.orders = orders; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onFilterChange(): void {
    this.expandedOrder = null;
    this.load();
  }

  toggleDetail(order: AdminOrder & { items?: any[] }): void {
    if (this.expandedOrder?.id === order.id) {
      this.expandedOrder = null;
      return;
    }
    if (order.items) {
      this.expandedOrder = order;
      return;
    }
    this.loadingDetail = true;
    this.orderService.getOrderById(order.id).subscribe({
      next: (detail) => {
        order.items = detail.items;
        this.expandedOrder = order;
        this.loadingDetail = false;
      },
      error: () => { this.loadingDetail = false; },
    });
  }

  changeStatus(order: AdminOrder, status: OrderStatus): void {
    this.orderService.updateStatus(order.id, status).subscribe({
      next: () => { order.status = status; },
    });
  }

  statusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label ?? status;
  }
}
