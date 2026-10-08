import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Commute } from '../domain/model/commute.entity';

/**
 * Fallback static commute state used when backend server is unavailable.
 */
const DEFAULT_COMMUTE: Commute = {
  id: 1,
  status: 'TRAYECTO EN CURSO · ACOMPAÑAMIENTO ACTIVO',
  companionName: 'Rosa Elena',
  companionPhone: '+51 987654321',
  remainingTime: '18:42 min',
  estimatedArrival: '03:05 AM',
  tolerance: '+10 min',
  deviceBattery: '84% (Óptimo)',
  origin: 'Planta Industrial San Martín, Los Olivos',
  destination: 'Jr. Lampa Nº 820, Cercado de Lima',
  transport: 'Moto Lineal (Personal)',
  route: 'Corredor Iluminado',
  routeRating: 5,
  routeFeedback: 'Vía rápida y con presencia de serenazgo en puentes.',
  checkpoints: [
    { id: 1, time: '02:30 AM', label: 'Salida de Planta', completed: true },
    { id: 2, time: '02:45 AM', label: 'En Tránsito (Av. Colonial)', completed: true },
    { id: 3, time: '03:05 AM', label: 'Llegada', completed: false, estimated: true },
  ],
  telemetry: [
    { timestamp: '02:30:12', message: 'Check-in iniciado en Los Olivos.', type: 'info' },
    {
      timestamp: '02:30:14',
      message: 'Notificación enviada a Rosa Elena (+51 987654321).',
      type: 'info',
    },
    {
      timestamp: '02:37:45',
      message: 'Ping GPS confirmado: -12.0124, -77.0782 (38 km/h).',
      type: 'info',
    },
    {
      timestamp: '02:45:00',
      message: 'Cruce Av. Universitaria con Morales Duárez superado.',
      type: 'info',
    },
    { timestamp: '02:48:15', message: 'Telemetría normal. Próximo ping en 45s.', type: 'success' },
  ],
};

/**
 * Service managing real-time commute monitoring, telemetry, and checkpoint updates.
 */
@Injectable({
  providedIn: 'root',
})
export class CommuteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/commute';

  /**
   * Retrieves the currently active journey for the night worker.
   */
  getActiveCommute(): Observable<Commute> {
    return this.http.get<Commute[]>(this.baseUrl).pipe(
      map((list) => (list && list.length > 0 ? list[0] : DEFAULT_COMMUTE)),
      catchError(() => of(DEFAULT_COMMUTE)),
    );
  }
}
