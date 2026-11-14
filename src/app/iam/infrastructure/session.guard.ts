import { CanActivateFn } from '@angular/router';

/**
 * Structured pass-through IAM route guard while authentication is deferred
 * (environment.iamEnabled === false). Keeps routing architecture ready for future JWT enforcement.
 */
export const authGuard: CanActivateFn = () => true;

export const requireSession: CanActivateFn = authGuard;
export const requireDemo: CanActivateFn = authGuard;
