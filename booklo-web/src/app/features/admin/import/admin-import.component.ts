import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { ExternalBookService, ExternalBook } from '../../../core/services/external-book.service';
import { BookService } from '../../../core/services/book.service';
import { CategoryService, Category } from '../../../core/services/category.service';

@Component({
  selector: 'app-admin-import',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './admin-import.component.html',
  styleUrl: './admin-import.component.css',
})
export class AdminImportComponent implements OnInit {
  private externalBookService = inject(ExternalBookService);
  private bookService = inject(BookService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  categories: Category[] = [];
  preview: ExternalBook | null = null;
  searching = false;
  saving = false;
  searchError = '';
  saveMessage = '';
  saveError = false;


  isbnForm = this.fb.group({
    isbn: ['', [Validators.required, Validators.minLength(10)]],
  });

  importForm = this.fb.group({
    price: ['', [Validators.required, Validators.min(0)]],
    stock: ['', [Validators.required, Validators.min(0)]],
    category_id: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => (this.categories = cats),
    });
  }

  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/[^\d,]/g, '');
    const parts = val.split(',');
    if (parts.length > 2) parts.splice(2);
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = parts.join(',');
    const raw = val.replace(',', '.');
    this.importForm.get('price')?.setValue(raw, { emitEvent: false });
  }

  search(): void {
    if (this.isbnForm.invalid) return;
    this.searching = true;
    this.preview = null;
    this.searchError = '';
    this.saveMessage = '';
    const isbn = this.isbnForm.value.isbn!.trim();
    this.externalBookService.search(isbn).subscribe({
      next: (book) => { this.preview = book; this.searching = false; },
      error: () => { this.searchError = 'ISBN no encontrado en Open Library ni Google Books.'; this.searching = false; },
    });
  }

  save(): void {
    if (this.importForm.invalid || !this.preview) return;
    this.saving = true;
    this.saveMessage = '';
    const isbn = this.isbnForm.value.isbn!.trim();
    const { price, stock, category_id } = this.importForm.value;
    this.bookService.importByIsbn({
            isbn,
            price: Number(String(price).replace(/\./g, '').replace(',', '.')),
            stock: Number(stock),
            category_id: Number(category_id),
            product_type: 'libro',
        }).subscribe({
      next: () => {
        this.saveMessage = 'Libro importado correctamente.';
        this.saveError = false;
        this.saving = false;
        this.preview = null;
        this.isbnForm.reset();
        this.importForm.reset();
      },
     error: () => { this.saveMessage = 'Error al guardar el libro.'; this.saveError = true; this.saving = false; },
    });
  }
}