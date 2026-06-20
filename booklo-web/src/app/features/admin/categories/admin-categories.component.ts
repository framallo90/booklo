import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CategoryService, Category } from '../../../core/services/category.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.css',
})
export class AdminCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  categories: Category[] = [];
  loading = true;
  editingId: number | null = null;
  displayedColumns = ['name', 'actions'];

  addForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  editForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => { this.categories = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  add(): void {
    if (this.addForm.invalid) return;
    this.categoryService.create(this.addForm.value.name!).subscribe({
      next: () => { this.addForm.reset(); this.load(); },
    });
  }

  startEdit(cat: Category): void {
    this.editingId = cat.id;
    this.editForm.patchValue({ name: cat.name });
  }

  saveEdit(): void {
    if (this.editForm.invalid || !this.editingId) return;
    this.categoryService.update(this.editingId, this.editForm.value.name!).subscribe({
      next: () => { this.editingId = null; this.load(); },
    });
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  confirmDelete(cat: Category): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar categoría', message: `¿Desactivar "${cat.name}"?` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.categoryService.delete(cat.id).subscribe({ next: () => this.load() });
    });
  }
}