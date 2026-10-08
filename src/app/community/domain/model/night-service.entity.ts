import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Categorization for points of interest rendered on the nocturnal 24-hour map.
 */
export type MapPointType = 'pharmacy' | 'gas_station' | 'risk_zone';

/**
 * Represents a nocturnal point of interest, safe haven, or hazard zone on the map.
 */
export interface MapPoint extends BaseEntity {
  /** Point classification */
  type: MapPointType;
  /** Human-readable category label (e.g. 'FARMACIA 24H', 'ZONA DE RIESGO') */
  typeLabel: string;
  /** Commercial or geographical designation */
  name: string;
  /** Distance and district description relative to the worker */
  distance: string;
  /** Trust metric evaluated by the nocturnal community */
  communityTrust: string;
  /** Validation note showing nocturnal worker endorsements */
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
