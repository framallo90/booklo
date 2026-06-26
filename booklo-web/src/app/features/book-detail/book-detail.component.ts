import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { CurrencyPipe, DecimalPipe, UpperCasePipe } from '@angular/common';


import { BookService, BookDetail } from '../../core/services/book.service';
import { CartService } from '../../core/services/cart.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DecimalPipe,
    UpperCasePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.css',
})
export class BookDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private cartService = inject(CartService);
  private favoriteService = inject(FavoriteService);
  private authService = inject(AuthService);

  book: BookDetail | null = null;
  loading = true;
  notFound = false;
  isFavorite = false;
  quantity = 1;
  addingToCart = false;
  message = '';

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get inStock(): boolean {
    return !!this.book && (this.book.stock > 0 || this.book.allows_backorder);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookService.getById(id).subscribe({
      next: (book) => {
        this.book = book;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 404) this.notFound = true;
      },
    });
  }

  addToCart(): void {
    if (!this.book) return;
    this.addingToCart = true;
    this.cartService.addItem(this.book.id, this.quantity).subscribe({
      next: () => {
        this.message = 'Agregado al carrito';
        this.addingToCart = false;
      },
      error: () => {
        this.message = 'Error al agregar al carrito';
        this.addingToCart = false;
      },
    });
  }

  toggleFavorite(): void {
    if (!this.book) return;
    if (this.isFavorite) {
      this.favoriteService.remove(this.book.id).subscribe({
        next: () => { this.isFavorite = false; }
      });
    } else {
      this.favoriteService.add(this.book.id).subscribe({
        next: () => { this.isFavorite = true; }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/catalog']);
  }
}