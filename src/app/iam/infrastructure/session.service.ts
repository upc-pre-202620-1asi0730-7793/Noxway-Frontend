import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { UserProfile } from '../domain/model/user-profile.entity';

interface Credentials {
  email: string;
  password: string;
}

interface Registration extends Credentials {
  fullName: string;
  shiftType: NonNullable<UserProfile['shiftType']>;
}

export const localApi = '/api/local';
const sessionKey = 'noxway_local_session';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly http = inject(HttpClient);
  private token = sessionStorage.getItem(sessionKey);
  private readonly demoMode = signal(sessionStorage.getItem('noxway_demo') === 'true');
  private readonly currentProfile = signal<UserProfile | null>(null);

  readonly demo = this.demoMode.asReadonly();
  readonly profile = this.currentProfile.asReadonly();

  register(data: Registration): Observable<void> {
    return this.http.post<void>(`${localApi}/auth/register`, data);
  }

  login(data: Credentials): Observable<{ token: string; profile: UserProfile }> {
    return this.http.post<{ token: string; profile: UserProfile }>(`${localApi}/auth/login`, data).pipe(
      tap(({ token, profile }) => {
        this.clear();
        this.token = token;
        sessionStorage.setItem(sessionKey, token);
        this.currentProfile.set(profile);
      }),
    );
  }

  enterDemo(): void {
    this.logout();
    this.demoMode.set(true);
    sessionStorage.setItem('noxway_demo', 'true');
  }

  restore(): Observable<boolean> {
    if (this.demo() || this.profile()) return of(true);
    if (!this.token) return of(false);
    return this.http.get<UserProfile>(`${localApi}/me/profile`, this.requestOptions()).pipe(
      tap((profile) => this.currentProfile.set(profile)),
      map(() => true),
      catchError((error) => {
        if (error.status === 401) this.clear();
        return of(false);
      }),
    );
  }

  saveProfile(profile: UserProfile): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${localApi}/me/profile`, profile, this.requestOptions()).pipe(
      tap((updated) => this.currentProfile.set(updated)),
      catchError((error) => {
        if (error.status === 401) this.clear();
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    if (this.token) {
      this.http.post<void>(`${localApi}/me/logout`, {}, this.requestOptions()).subscribe({ error: () => {} });
    }
    this.clear();
  }

  private clear(): void {
    this.token = null;
    sessionStorage.removeItem(sessionKey);
    sessionStorage.removeItem('noxway_demo');
    this.demoMode.set(false);
    this.currentProfile.set(null);
  }

  requestOptions() {
    return { headers: { Authorization: `Bearer ${this.token}` } };
  }
}
