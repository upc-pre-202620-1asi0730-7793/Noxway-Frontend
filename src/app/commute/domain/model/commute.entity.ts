import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents a discrete waypoint or geographic checkpoint along the nocturnal commute.
 */
export interface CommuteCheckpoint {
  /** Checkpoint numerical identifier */
  id: number;
  /** Timestamp formatted in local time (e.g. '02:30 AM') */
  time: string;
  /** Descriptive waypoint name (e.g. 'Salida de Planta') */
  label: string;
  /** Whether the user has physically passed this waypoint */
  completed: boolean;
  /** Indicates if this timestamp is an estimated arrival time */
  estimated?: boolean;
}

/**
 * Represents a single telemetry ping from the worker's device during transit.
 */
export interface TelemetryPing {
  /** Timestamp of the event ping */
  timestamp: string;
  /** System message detailing GPS, speed, or status */
  message: string;
  /** Severity level for UI badge rendering */
  type: 'info' | 'success' | 'warning' | 'danger';
}

/**
 * Aggregate root representing the worker's active nocturnal journey and safety monitoring state.
 */
export interface Commute extends BaseEntity {
  /** Journey status text (e.g. 'TRAYECTO EN CURSO · ACOMPAÑAMIENTO ACTIVO') */
  status: string;
  /** Name of the paired companion monitoring the commute */
  companionName: string;
  /** Companion contact phone number */
  companionPhone: string;
  /** Estimated time remaining until destination */
  remainingTime: string;
  /** Projected arrival time */
  estimatedArrival: string;
  /** Grace period tolerance buffer before triggering delay alerts */
  tolerance: string;
  /** Current mobile device battery percentage and health */
  deviceBattery: string;
  /** Origin facility or workplace */
  origin: string;
  /** Final destination address */
  destination: string;
  /** Mode of transport (e.g. 'Moto Lineal') */
  transport: string;
  /** Route profile name */
  route: string;
  /** Community safety rating score (1-5) */
  routeRating: number;
  /** Descriptive feedback on route lighting and security */
  routeFeedback: string;
  /** Sequence of sequential journey milestones */
  checkpoints: CommuteCheckpoint[];
  /** Continuous telemetry and GPS log */
  telemetry: TelemetryPing[];
}
