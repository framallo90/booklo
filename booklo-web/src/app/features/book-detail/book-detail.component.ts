import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CurrencyPipe, DecimalPipe, UpperCasePipe } from '@angular/common';

import { BookService, BookDetail } from '../../core/services/book.service';
import { CartService } from '../../core/services/cart.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div mat-dialog-content style="padding:0;line-height:0">
      <img [src]="data.url" [alt]="data.title" style="max-width:85vw;max-height:85vh;display:block;border-radius:4px" />
    </div>
    <div mat-dialog-actions align="end" style="padding:8px 16px">
      <button mat-button mat-dialog-close>Cerrar</button>
    </div>
  `,
})
export class CoverZoomDialogComponent {
  data = inject(MAT_DIALOG_DATA) as { url: string; title: string };
}

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
    MatDialogModule,
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
  private dialog = inject(MatDialog);

  book: BookDetail | null = null;
  loading = true;
  notFound = false;
  isFavorite = false;
  quantity = 1;
  addingToCart = false;
  message = '';
  linkCopied = false;

  get currentUrl(): string {
    return window.location.href;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get inStock(): boolean {
    return !!this.book && (this.book.stock > 0 || this.book.allows_backorder);
  }

  isNuevoIngreso(): boolean {
    if (!this.book?.created_at) return false;
    const days30 = 30 * 24 * 60 * 60 * 1000;
    return (Date.now() - new Date(this.book.created_at).getTime()) < days30;
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

  openCoverZoom(): void {
    if (!this.book?.cover_url) return;
    this.dialog.open(CoverZoomDialogComponent, {
      data: { url: this.book.cover_url, title: this.book.title },
      panelClass: 'cover-zoom-dialog',
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

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.linkCopied = true;
      setTimeout(() => this.linkCopied = false, 2000);
    });
  }

  goBack(): void {
    this.router.navigate(['/catalog']);
  }
}
