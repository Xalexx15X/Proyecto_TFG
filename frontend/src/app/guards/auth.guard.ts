import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usar isLoggedIn() en lugar de isAuthenticated()
  if (authService.isLoggedIn()) {
    return true;
  }

  // Si no está autenticado, redirigir a login
  router.navigate(['/login'], {
    queryParams: { returnUrl: router.url }
  });
  return false;
};