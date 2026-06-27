import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService, AdminUser } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    FormsModule, DatePipe,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    MatChipsModule, MatSnackBarModule, MatTooltipModule,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private snackBar     = inject(MatSnackBar);

  users: AdminUser[] = [];
  total   = 0;
  loading = false;
  search  = '';
  page    = 1;
  limit   = 20;

  displayedColumns = ['name', 'email', 'role', 'orders', 'created_at', 'status', 'actions'];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.load();
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => { this.page = 1; this.load(); });
  }

  load(): void {
    this.loading = true;
    this.adminService.getUsers(this.search, this.page, this.limit).subscribe({
      next: (res) => { this.users = res.data; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onSearchChange(value: string): void {
    this.search = value;
    this.searchSubject.next(value);
  }

  toggleActive(user: AdminUser): void {
    const next = !user.is_active;
    this.adminService.updateUser(user.id, { is_active: next }).subscribe({
      next: () => {
        user.is_active = next;
        this.snackBar.open(next ? 'Cuenta activada' : 'Cuenta desactivada', 'Cerrar', { duration: 3000 });
      },
    });
  }

  toggleRole(user: AdminUser): void {
    const next = user.role_id === 1 ? 2 : 1;
    const label = next === 1 ? 'Admin' : 'Cliente';
    this.adminService.updateUser(user.id, { role_id: next }).subscribe({
      next: () => {
        user.role_id = next;
        this.snackBar.open(`Rol cambiado a ${label}`, 'Cerrar', { duration: 3000 });
      },
    });
  }
}
