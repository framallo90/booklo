import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Category } from '../../../core/services/category.service';
import { Book } from '../../../core/services/book.service';

export interface BookEditData {
  book: Book;
  categories: Category[];
}

@Component({
  selector: 'app-admin-book-edit-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>Editar libro</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="edit-form">
        <mat-form-field appearance="outline">
          <mat-label>Precio ($)</mat-label>
          <input matInput type="number" formControlName="price" min="0" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Stock</mat-label>
          <input matInput type="number" formControlName="stock" min="0" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Categoría</mat-label>
          <mat-select formControlName="category_id">
            @for (cat of data.categories; track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>URL de portada (opcional)</mat-label>
          <input matInput formControlName="cover_url" placeholder="https://..." />
        </mat-form-field>
        <div class="toggles">
          <mat-checkbox formControlName="featured">Destacado (aparece en el home)</mat-checkbox>
          <mat-checkbox formControlName="hot_sale">Hot Sale (badge de oferta)</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-raised-button color="primary" (click)="confirm()" [disabled]="form.invalid">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edit-form { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; min-width: 340px; }
    .toggles { display: flex; flex-direction: column; gap: 8px; padding: 4px 0 8px; }
  `],
})
export class AdminBookEditDialogComponent {
  data: BookEditData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<AdminBookEditDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    price:       [this.data.book.price, [Validators.required, Validators.min(0)]],
    stock:       [this.data.book.stock, [Validators.required, Validators.min(0)]],
    category_id: [null as number | null],
    cover_url:   [this.data.book.cover_url || ''],
    featured:    [!!(this.data.book as any).featured],
    hot_sale:    [this.data.book.hot_sale ?? false],
  });

  confirm(): void {
    this.dialogRef.close(this.form.value);
  }
}
