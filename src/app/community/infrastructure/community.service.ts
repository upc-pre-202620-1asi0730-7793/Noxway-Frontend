import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MapPoint } from '../domain/model/night-service.entity';
import { CommunityPost, CommunityLeader } from '../domain/model/community-post.entity';

/**
 * Fallback static map points representing key safe havens and risk areas in Lima.
 */
const DEFAULT_MAP_POINTS: MapPoint[] = [
  {
    id: 1,
    type: 'pharmacy',
    typeLabel: 'FARMACIA 24H',
    name: 'Inkafarma - Av. Universitaria 3105',
    distance: 'A 650 metros de tu posición actual · Los Olivos',
    communityTrust: '98% Confiable',
    validatedBy: 'Validado por 24 vigilantes y repartidores.',
    safetyMeasures: [
      'Reja metálica para atención nocturna',
      'Cámara de seguridad exterior operando',
      'Vereda con alumbrado público funcional',
      'Acepta pagos Yape, Plin y tarjetas',
    ],
    lat: -11.992,
    lng: -77.072,
    icon: 'medication',
    tag: 'Inkafarma 24h',
  },
  {
    id: 2,
    type: 'gas_station',
    typeLabel: 'GRIFO 24H',
    name: 'Grifo Primax - Av. Mayolo / Universitaria',
    distance: 'A 1.2 km de tu posición actual · Los Olivos',
    communityTrust: '95% Confiable',
    validatedBy: 'Validado por 32 repartidores nocturnos.',
    safetyMeasures: [
      'Guardia de seguridad 24h',
      'Buena iluminación en pista y surtidores',
      'Tienda de conveniencia abierta',
      'Cámaras de vigilancia activas',
    ],
    lat: -11.995,
    lng: -77.075,
    icon: 'local_gas_station',
    tag: 'Primax 24h',
  },
  {
    id: 3,
    type: 'risk_zone',
    typeLabel: 'ZONA DE RIESGO',
    name: 'Tramo Oscuro - Cruce Av. Perú con Dueñas',
    distance: 'A 3.4 km en tu ruta · San Martín de Porres',
    communityTrust: 'Alerta Activa',
    validatedBy: 'Reportado por 19 trabajadores nocturnos.',
    safetyMeasures: [
      'Tres postes de luz apagados',
      'Poca visibilidad nocturna',
      'Recomendado desvío por Av. Lima',
    ],
    lat: -12.015,
    lng: -77.065,
    icon: 'warning',
    tag: 'Tramo Oscuro',
  },
];

/**
 * Fallback nocturnal community posts for local feed.
 */
const DEFAULT_POSTS: CommunityPost[] = [
  {
    id: 1,
    authorName: 'Marcos Huamán',
    authorRole: 'Repartidor Nocturno',
    avatar: 'MH',
    timeAgo: 'Hace 24 min',
    location: 'Los Olivos (Av. Antúnez de Mayolo)',
    badge: 'Local Verificado',
    badgeType: 'verified',
    district: 'los-olivos',
    title: 'Grifo Primax de Av. Mayolo tiene atención rápida y guardia 24h',
    content:
      'Compañeros, acabo de recargar en el Primax con Universitaria. Tienen guardia armado afuera y excelente iluminación en la pista. Muy seguro para detenerse de noche.',
    upvotes: 28,
    actionLabel: 'Es verídico',
  },
  {
    id: 2,
    authorName: 'Valeria Ríos',
    authorRole: 'Enfermera de Guardia',
    avatar: 'VR',
    timeAgo: 'Hace 55 min',
    location: 'Cercado de Lima (Av. Alfonso Ugarte)',
    badge: 'Zona Oscura / Riesgo',
    badgeType: 'danger',
    district: 'cercado',
    title: 'Postes apagados en cruce Alfonso Ugarte con Jr. Zepita',
    content:
      'Al salir de mi guardia en el Hospital Loayza noté que la cuadra frente al Metropolitano está sin luz. No hay serenazgo a esta hora. Si van a tomar bus, caminen hacia Av. España que tiene luz.',
    upvotes: 19,
    actionLabel: 'Confirmar alerta',
  },
];

/**
 * Fallback nocturnal safety contributors and leaders.
 */
const DEFAULT_LEADERS: CommunityLeader[] = [
  { rank: 1, name: 'Jorge Luis Huamán (Tú)', contributions: 38, isCurrentUser: true },
  { rank: 2, name: 'Valeria Ríos', contributions: 31 },
  { rank: 3, name: 'Marcos Huamán', contributions: 27 },
];

/**
 * Service managing community safety reports, leaderboards, and nocturnal map points of interest.
 */
@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private readonly http = inject(HttpClient);
  private readonly mapUrl = 'http://localhost:3000/mapPoints';
  private readonly postsUrl = 'http://localhost:3000/communityPosts';

  /**
   * Retrieves verified 24h points of interest and risk zones for map visualization.
   * Falls back to high-fidelity mock data if the JSON server is unavailable.
   */
  getMapPoints(): Observable<MapPoint[]> {
    return this.http.get<MapPoint[]>(this.mapUrl).pipe(
      map((list) => (list && list.length > 0 ? list : DEFAULT_MAP_POINTS)),
      catchError(() => of(DEFAULT_MAP_POINTS)),
    );
  }

  /**
   * Retrieves nocturnal community posts, street updates, and warnings.
   */
  getCommunityPosts(): Observable<CommunityPost[]> {
    return this.http.get<CommunityPost[]>(this.postsUrl).pipe(
      map((list) => (list && list.length > 0 ? list : DEFAULT_POSTS)),
      catchError(() => of(DEFAULT_POSTS)),
    );
  }

  /**
   * Retrieves the ranking of top nocturnal community contributors.
   */
  getLeaders(): Observable<CommunityLeader[]> {
    return of(DEFAULT_LEADERS);
  }
}
