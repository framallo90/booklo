import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { OrderService } from '../../core/services/order.service';
import { CartService, Cart } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,

  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],

  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})

export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
  private orderService = inject(OrderService);

  cart: Cart | null = null;
  loading = true;
  confirming = false;
  message = '';

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  updateQuantity(bookId: number, quantity: number): void {
    if (quantity < 1) return;
    this.cartService.updateItem(bookId, quantity).subscribe({
      next: () => this.loadCart(),
    });
  }

  removeItem(bookId: number): void {
    this.cartService.removeItem(bookId).subscribe({
      next: () => this.loadCart(),
    });
  }

  confirmOrder(): void {
    this.confirming = true;
    this.message = '';
    this.orderService.createOrder().subscribe({
      next: () => {
        this.message = 'Pedido confirmado correctamente';
        this.cart = { items: [], total: 0 };
        this.confirming = false;
      },
      error: (err) => {
        this.message = err.error?.message || 'Error al confirmar el pedido';
        this.confirming = false;
      },
    });
  }
}