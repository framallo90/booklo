import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'books', pathMatch: 'full' },
      {
        path: 'books',
        loadComponent: () => import('./books/admin-books.component').then(m => m.AdminBooksComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./categories/admin-categories.component').then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/admin-orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'import', loadComponent: () => import('./import/admin-import.component').then(m => m.AdminImportComponent)
      },
      {
        path: 'users', loadComponent: () => import('./users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'catalog', loadComponent: () => import('./catalog/admin-catalog.component').then(m => m.AdminCatalogComponent)
      },
    ]
  }
];