import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WellnessSummary } from '../domain/model/sleep-record.entity';
import { environment } from '../../../environments/environment';

/**
 * Fallback static wellness summary data.
 */
const DEFAULT_WELLNESS: WellnessSummary = {
  id: 1,
  lastRestDuration: '6h 45m',
  lastRestSchedule: '07:30 AM a 02:15 PM',
  weeklyAverage: '6.8 hrs',
  weeklyTarget: 'Meta: 7.5 hrs',
  accumulatedDeficit: '-2.4 hrs',
  fatigueStatus: 'Alerta leve de fatiga',
  perceivedQuality: '82%',
  perceivedQualityRating: '4/5 promedio',
  weeklyHistory: [
    { day: 'Lun', hours: 7.2, status: 'good' },
    { day: 'Mar', hours: 6.0, status: 'warning' },
    { day: 'Mié', hours: 7.5, status: 'good' },
    { day: 'Jue', hours: 5.5, status: 'danger' },
    { day: 'Vie', hours: 7.0, status: 'good' },
    { day: 'Sáb', hours: 6.8, status: 'good' },
    { day: 'Dom', hours: 6.75, status: 'today', isToday: true },
  ],
  recentLogs: [
    {
      id: 1,
      date: 'Sábado 16 Sep',
      schedule: '07:30 AM - 02:15 PM',
      notes: 'Ruido medio · Habitación oscura con blackout',
      duration: '6h 45m',
    },
    {
      id: 2,
      date: 'Viernes 15 Sep',
      schedule: '07:45 AM - 02:45 PM',
      notes: 'Ruido bajo · Uso de tapones de silicona',
      duration: '7h 00m',
    },
  ],
  suggestions: [
    {
      id: 1,
      icon: 'visibility_off',
      title: 'Control de Luz al Descansar',
      description:
        'Adapta la luz de tu habitación al horario de descanso, tanto de día como de noche.',
    },
    {
      id: 2,
      icon: 'coffee',
      title: 'Corte Límite de Cafeína',
      description:
        'Revisa tu consumo de cafeína antes de dormir, según tu horario de descanso.',
    },
    {
      id: 3,
      icon: 'headphones',
      title: 'Ambiente de Descanso',
      description:
        'Reduce el ruido y las interrupciones durante tu descanso, sin importar el horario de tu jornada.',
    },
  ],
};

/**
 * Service managing sleep tracking, fatigue assessment, and circadian wellness suggestions.
 */
@Injectable({
  providedIn: 'root',
})
export class WellnessService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/wellness`;

  /**
   * Retrieves the aggregate wellness summary for the shift worker.
   */
  getWellnessSummary(): Observable<WellnessSummary> {
    return this.http.get<WellnessSummary[]>(this.baseUrl).pipe(
      map((list) => (list && list.length > 0 ? list[0] : DEFAULT_WELLNESS)),
      catchError(() => of(DEFAULT_WELLNESS)),
    );
  }
}
