import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token');

  // Si no hay token, no puede entrar
  if (!token) {
    return router.createUrlTree(['/login']);
  }

  // Si hay token, puede entrar
  return true;
};