import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SecurityStatusResource {
  securityEnabled: boolean;
  mode: string;
  message: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'WORKER' | 'TRUSTED_CONTACT';
  shiftType?: string;
  shiftStart?: string;
  shiftEnd?: string;
  timeZone: string;
}

/**
 * Structured IAM contract client matching backend /api/v1/auth/*.
 * Security enforcement is intentionally deferred (app.security.enabled=false).
 */
@Injectable({ providedIn: 'root' })
export class IamService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  readonly status = signal<SecurityStatusResource | null>(null);

  loadStatus(): Observable<SecurityStatusResource> {
    return this.http.get<SecurityStatusResource>(`${this.baseUrl}/status`).pipe(
      tap((res) => this.status.set(res)),
      catchError(() =>
        of({
          securityEnabled: environment.iamEnabled,
          mode: 'STRUCTURED_PENDING_IMPLEMENTATION',
          message: 'IAM module is structured and deferred for open functional verification.',
        }),
      ),
    );
  }

  signIn(payload: SignInPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/sign-in`, payload);
  }

  signUp(payload: SignUpPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/sign-up`, payload);
  }

  signOut(): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/sign-out`, {});
  }

  requestPasswordReset(email: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/password-reset`, null, { params: { email } });
  }
}
