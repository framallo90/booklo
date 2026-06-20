import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../../../core/services/category.service';

@Component({
  selector: 'app-admin-book-create-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Agregar libro manualmente</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="create-form">
        <mat-form-field appearance="outline">
          <mat-label>Título *</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Autores</mat-label>
          <input matInput formControlName="authors" placeholder="Ej: Frank Herbert, Isaac Asimov" />
        </mat-form-field>
        <mat-form-field appearance="outline">
            <mat-label>URL de portada (opcional)</mat-label>
            <input matInput formControlName="cover_url" placeholder="https://..." />
            </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Precio ($) *</mat-label>
          <input matInput type="number" formControlName="price" min="0" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Stock *</mat-label>
          <input matInput type="number" formControlName="stock" min="0" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Categoría *</mat-label>
          <mat-select formControlName="category_id">
            @for (cat of data; track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Tipo *</mat-label>
          <mat-select formControlName="product_type">
            <mat-option value="libro">Libro</mat-option>
            <mat-option value="comic">Cómic</mat-option>
            <mat-option value="manga">Manga</mat-option>
            <mat-option value="revista">Revista</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-raised-button color="primary" (click)="confirm()" [disabled]="form.invalid">Agregar</button>
    </mat-dialog-actions>
  `,
  styles: ['.create-form { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; min-width: 360px; }'],
})
export class AdminBookCreateDialogComponent {
  data: Category[] = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<AdminBookCreateDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    title: ['', Validators.required],
    authors: [''],
    cover_url: [''],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category_id: [null as number | null, Validators.required],
    product_type: ['libro', Validators.required],
  });

  confirm(): void {
    this.dialogRef.close(this.form.value);
  }
}