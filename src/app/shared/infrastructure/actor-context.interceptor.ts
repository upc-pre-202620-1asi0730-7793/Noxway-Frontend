import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ActorContextService } from './actor-context.service';
import { LanguageService } from './language.service';

/**
 * Attaches X-Actor-Id (when IAM enforcement is deferred) and Accept-Language to backend API calls.
 */
export const actorContextInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/v1') && !req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const actorContext = inject(ActorContextService);
  const languageService = inject(LanguageService);

  let headers = req.headers.set('Accept-Language', languageService.currentLang());
  if (!environment.iamEnabled) {
    headers = headers.set('X-Actor-Id', actorContext.activeActorId());
  }

  return next(req.clone({ headers }));
};
