import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          auth.logout();
          router.navigate(['/login']);
          break;
        case 403:
          snackBar.open('No tenés permiso para realizar esta acción', 'Cerrar', { duration: 4000 });
          break;
        case 404:
          snackBar.open('Recurso no encontrado', 'Cerrar', { duration: 3000 });
          break;
        case 500:
          snackBar.open('Error del servidor. Intentá de nuevo más tarde.', 'Cerrar', { duration: 4000 });
          break;
      }
      return throwError(() => error);
    })
  );
};