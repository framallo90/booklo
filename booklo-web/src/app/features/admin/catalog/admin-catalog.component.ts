import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService, OutdatedBook } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-catalog',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, MatTableModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './admin-catalog.component.html',
  styleUrl: './admin-catalog.component.css',
})
export class AdminCatalogComponent implements OnInit {
  private adminService = inject(AdminService);

  books: OutdatedBook[] = [];
  loading = false;
  displayedColumns = ['title', 'authors', 'price', 'price_updated_at'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.adminService.getOutdatedBooks().subscribe({
      next: (data) => { this.books = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  daysSince(dateStr: string | null): number {
    if (!dateStr) return 999;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  }
}
