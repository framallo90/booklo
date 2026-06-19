import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BookService, Book, BookFilters } from '../../core/services/book.service';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent implements OnInit {
  private bookService = inject(BookService);
  private categoryService = inject(CategoryService);

  books: Book[] = [];
  categories: Category[] = [];
  loading = false;
  total = 0;

  filters: BookFilters = {
  search: '',
  category_id: undefined,
  product_type: '',
  page: 1,
  limit: 12,
  };

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadCategories();
    this.loadBooks();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.filters.page = 1;
      this.loadBooks();
    });
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getBooks(this.filters).subscribe({
      next: (res) => {
        this.books = res.data;
        this.total = res.total;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => { this.categories = cats; },
      error: () => {}
    });
  }

  onSearchChange(value: string): void {
    this.filters.search = value;
    this.searchSubject.next(value);
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadBooks();
  }

  clearFilters(): void {
    this.filters = { search: '', category_id: undefined, product_type: '', page: 1, limit: 12 };
    this.loadBooks();
  }
}