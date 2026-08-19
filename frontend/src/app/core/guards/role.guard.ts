import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../services/api.service';

export function roleGuard(...allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/admin/login']);
      return false;
    }

    const currentRole = authService.role() || 'reader';

    // Admin has access to everything
    if (currentRole === 'admin') {
      return true;
    }

    // Reviewer has access to reviewer and reader routes
    if (currentRole === 'reviewer' && (allowedRoles.includes('reviewer') || allowedRoles.includes('reader'))) {
      return true;
    }

    // Reader has access to reader routes
    if (currentRole === 'reader' && allowedRoles.includes('reader')) {
      return true;
    }

    if (allowedRoles.includes(currentRole as UserRole)) {
      return true;
    }

    // No permission -> redirect to home
    router.navigate(['/']);
    return false;
  };
}
