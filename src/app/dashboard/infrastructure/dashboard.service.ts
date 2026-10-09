import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Represents aggregated dashboard statistics and active shift summary for the nocturnal worker.
 */
export interface DashboardData {
  /** Record unique identifier */
  id: number;
  /** Percentage score of completed safe trips without security incidents */
  safeTripsPercentage: number;
  /** Human-readable string of confirmed trips */
  confirmedTrips: string;
  /** Name of the active linked trusted contact */
  trustedContactName: string;
  /** Connection and channel status of the trusted contact */
  trustedContactStatus: string;
  /** Familial relationship or bond */
  trustedContactRelation: string;
  /** Total sleep duration logged in the last rest session */
  restDuration: string;
  /** Comparison text versus previous day */
  restComparison: string;
  /** Number of community-validated 24h services near the route */
  servicesCount: number;
  /** Community validation status badge text */
  servicesStatus: string;
  /** Current state of the scheduled commute */
  journeyStatus: string;
  /** Short name of origin point */
  origin: string;
  /** Full street address of origin */
  originAddress: string;
  /** Short name of destination point */
  destination: string;
  /** Full street address of destination */
  destinationAddress: string;
  /** Route distance */
  distance: string;
  /** Estimated duration in transit */
  estimatedTime: string;
  /** Safe tolerance buffer */
  tolerance: string;
  /** Transport mode */
  transport: string;
}

/**
 * Fallback static dashboard metrics.
 */
const DEFAULT_DASHBOARD_DATA: DashboardData = {
  id: 1,
  safeTripsPercentage: 100,
  confirmedTrips: '28 de 28 confirmados',
  trustedContactName: 'Rosa Elena',
  trustedContactStatus: 'Conectada (WhatsApp)',
  trustedContactRelation: 'Madre · Vinculada',
  restDuration: '6h 45m',
  restComparison: '+45m vs ayer',
  servicesCount: 14,
  servicesStatus: 'Validados por la red',
  journeyStatus: 'Esperando Salida',
  origin: 'Planta Industrial San Martín',
  originAddress: 'Av. Universitaria Nº 3400, Los Olivos',
  destination: 'Hogar Familiar',
  destinationAddress: 'Jr. Lampa Nº 820, Cercado de Lima',
  distance: '12.4 km',
  estimatedTime: '35 min',
  tolerance: '+10 min',
  transport: 'Moto Lineal',
};

/**
 * Service providing high-level operational overview and health indicators for the worker dashboard.
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  /**
   * Fetches dashboard metric entries.
   */
  getDashboardData(): Observable<DashboardData[]> {
    return this.http
      .get<DashboardData[]>(this.baseUrl)
      .pipe(catchError(() => of([DEFAULT_DASHBOARD_DATA])));
  }
}
