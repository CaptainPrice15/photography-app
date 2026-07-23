import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.session()) {
    return true;
  }
  router.navigate(['/login'], { queryParams: { returnTo: state.url } });
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.session()?.role === 'admin') {
    return true;
  }
  router.navigate(['/']);
  return false;
};

export const paidGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.session()?.paid) {
    return true;
  }
  router.navigate(['/payment'], { queryParams: { required: 'true' } });
  return false;
};