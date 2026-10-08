import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserProfile } from '../domain/model/user-profile.entity';

/**
 * Fallback static user profile for the nocturnal worker.
 */
const DEFAULT_PROFILE: UserProfile = {
  id: 1,
  fullName: 'Jorge Luis Huamán Quispe',
  role: 'Vigilante de Seguridad Privada · Securitas Perú (Planta San Martín)',
  dni: '44892015',
  memberSince: 'Miembro Activo desde Agosto 2026',
  avatar: 'JL',
  phone: '+51 987 654 321',
  email: 'jorge.huaman@vigilancia.pe',
  schedule: '22:00 a 06:00 (Lunes a Sábado)',
  transport: 'Moto Lineal (Personal)',
  district: 'Cercado de Lima',
  privacyGpsActiveOnly: true,
  privacyEncryptedHistory: true,
  privacyAnonymousRatings: true,
  passwordUpdated: 'Contraseña actualizada hace 20 días.',
  activeSessions: '1 dispositivo conectado (Lima, PE)',
};

/**
 * Service managing user identity, security settings, and profile details.
 */
@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/userProfile';

  /**
   * Fetches the authenticated worker's profile entity.
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile[]>(this.baseUrl).pipe(
      map((list) => (list && list.length > 0 ? list[0] : DEFAULT_PROFILE)),
      catchError(() => of(DEFAULT_PROFILE)),
    );
  }
}
