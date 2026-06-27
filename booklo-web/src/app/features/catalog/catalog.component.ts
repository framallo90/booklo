import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { BookService, Book, BookFilters } from '../../core/services/book.service';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    FormsModule, RouterLink, CurrencyPipe, DecimalPipe,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule, MatPaginatorModule,
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent implements OnInit {
  private bookService     = inject(BookService);
  private categoryService = inject(CategoryService);
  private route           = inject(ActivatedRoute);
  private router          = inject(Router);

  books: Book[]         = [];
  categories: Category[] = [];
  loading = false;
  total   = 0;

  readonly letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  filters: BookFilters = {
    search: '', letter: '', category_id: undefined,
    condition: '', sort: '', min_price: undefined, max_price: undefined,
    page: 1, limit: 24,
  };

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParams;
    this.filters.search      = qp['search']      || '';
    this.filters.letter      = qp['letter']      || '';
    this.filters.category_id = qp['category_id'] ? Number(qp['category_id']) : undefined;
    this.filters.condition   = qp['condition']   || '';
    this.filters.sort        = qp['sort']        || '';

    this.loadCategories();
    this.loadBooks();

    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.filters.page = 1;
      this.loadBooks();
      this.updateUrl();
    });
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getBooks(this.filters).subscribe({
      next: (res) => { this.books = res.data; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({ next: (cats) => this.categories = cats });
  }

  onSearchChange(value: string): void {
    this.filters.search = value;
    this.filters.letter = '';
    this.searchSubject.next(value);
  }

  onLetterFilter(letter: string): void {
    this.filters.letter  = this.filters.letter === letter ? '' : letter;
    this.filters.search  = '';
    this.filters.page    = 1;
    this.loadBooks();
    this.updateUrl();
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadBooks();
    this.updateUrl();
  }

  onPageChange(event: PageEvent): void {
    this.filters.page  = event.pageIndex + 1;
    this.filters.limit = event.pageSize;
    this.loadBooks();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.filters = {
      search: '', letter: '', category_id: undefined,
      condition: '', sort: '', min_price: undefined, max_price: undefined,
      page: 1, limit: 24,
    };
    this.loadBooks();
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  isNuevoIngreso(createdAt: string): boolean {
    return (Date.now() - new Date(createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;
  }

  private updateUrl(): void {
    const qp: Record<string, string> = {};
    if (this.filters.search)      qp['search']      = this.filters.search;
    if (this.filters.letter)      qp['letter']      = this.filters.letter;
    if (this.filters.category_id) qp['category_id'] = String(this.filters.category_id);
    if (this.filters.condition)   qp['condition']   = this.filters.condition;
    if (this.filters.sort)        qp['sort']        = this.filters.sort;
    this.router.navigate([], { queryParams: qp, replaceUrl: true });
  }
}
