import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Categorization for points of interest rendered on the community services map.
 */
export type MapPointType = 'pharmacy' | 'gas_station' | 'risk_zone';

/**
 * Represents a service point of interest, safe haven, or hazard zone on the map.
 */
export interface OpeningInterval { opens: string; closes: string; }

export interface MapPoint extends BaseEntity {
  /** Daily local opening intervals. Missing means unknown, not always open. */
  openingHours?: OpeningInterval[];
  timeZone?: string;
  /** Point classification */
  type: MapPointType;
  /** Human-readable category label (e.g. 'FARMACIA 24H', 'ZONA DE RIESGO') */
  typeLabel: string;
  /** Commercial or geographical designation */
  name: string;
  /** Distance and district description relative to the worker */
  distance: string;
  /** Trust metric evaluated by the community */
  communityTrust: string;
  /** Validation note showing shift worker endorsements */
  validatedBy: string;
  /** List of concrete safety attributes or hazard notes */
  safetyMeasures: string[];
  /** Latitude coordinate */
  lat: number;
  /** Longitude coordinate */
  lng: number;
  /** Material icon identifier */
  icon: string;
  /** Compact tag displayed on the map pin */
  tag: string;
}
