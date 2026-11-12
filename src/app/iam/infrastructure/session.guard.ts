import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from './session.service';

export const requireSession: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.restore().pipe(map((allowed) => allowed || router.parseUrl('/login')));
};

export const requireDemo: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.demo() || router.parseUrl('/dashboard');
};
