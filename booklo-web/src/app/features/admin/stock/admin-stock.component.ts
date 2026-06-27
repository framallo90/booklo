import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AdminService, StockMovement } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-stock',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatPaginatorModule,
  ],
  templateUrl: './admin-stock.component.html',
  styleUrl: './admin-stock.component.css',
})
export class AdminStockComponent implements OnInit {
  private adminService = inject(AdminService);

  movements: StockMovement[] = [];
  total = 0;
  loading = false;

  page  = 1;
  limit = 50;

  filterType   = '';
  filterSearch = '';

  columns = ['created_at', 'book_title', 'type', 'quantity', 'reason'];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => { this.page = 1; this.load(); });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.adminService
      .getStockMovements(this.page, this.limit, this.filterType || undefined, this.filterSearch || undefined)
      .subscribe({
        next: res => { this.movements = res.data; this.total = res.total; this.loading = false; },
        error: ()  => { this.loading = false; },
      });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.filterSearch);
  }

  onTypeChange(): void {
    this.page = 1;
    this.load();
  }

  onPage(e: PageEvent): void {
    this.page  = e.pageIndex + 1;
    this.limit = e.pageSize;
    this.load();
  }

  typeLabel(type: string): string {
    return type === 'entrada' ? 'Entrada' : type === 'venta' ? 'Venta' : 'Ajuste';
  }

  typeIcon(type: string): string {
    return type === 'entrada' ? 'arrow_upward' : type === 'venta' ? 'arrow_downward' : 'tune';
  }
}
