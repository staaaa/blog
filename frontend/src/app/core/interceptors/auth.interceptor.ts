import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let request = req;
  if (token) {
    request = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        // Notify components that session expired so they can preserve unsaved drafts
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('session-expired'));
        }

        // Session expired — save current URL as return target
        const currentUrl = router.url;

        // Clear stale auth state without triggering redirect
        authService.clearAuthState();

        // Navigate to login with returnUrl so user comes back after re-auth
        router.navigate(['/admin/login'], {
          queryParams: { returnUrl: currentUrl }
        });
      }
      return throwError(() => error);
    })
  );
};
