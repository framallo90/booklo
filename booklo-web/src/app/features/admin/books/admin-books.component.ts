import { Component, OnInit, inject } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { BookService, Book } from '../../../core/services/book.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin-books.component.html',
  styleUrl: './admin-books.component.css',
})
export class AdminBooksComponent implements OnInit {
  private bookService = inject(BookService);
  private dialog = inject(MatDialog);

  books: Book[] = [];
  total = 0;
  loading = true;
  page = 1;
  limit = 15;
  search = '';
  displayedColumns = ['cover', 'title', 'authors', 'price', 'stock', 'actions'];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.load();
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.bookService.getBooks({ search: this.search, page: this.page, limit: this.limit }).subscribe({
      next: (res) => { this.books = res.data; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onSearch(value: string): void {
    this.search = value;
    this.searchSubject.next(value);
  }

  prevPage(): void {
    if (this.page > 1) { this.page--; this.load(); }
  }

  nextPage(): void {
    if (this.page * this.limit < this.total) { this.page++; this.load(); }
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  confirmDeactivate(book: Book): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Desactivar libro', message: `¿Desactivar "${book.title}"? Dejará de aparecer en el catálogo.` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.bookService.deactivate(book.id).subscribe({ next: () => this.load() });
    });
  }
}