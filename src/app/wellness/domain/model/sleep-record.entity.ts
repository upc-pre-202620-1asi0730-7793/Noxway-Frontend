import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Metric entry representing recorded rest hours for a specific day of the week.
 */
export interface SleepDailyMetric {
  /** Day abbreviation (e.g. 'Lun', 'Mar', 'Mon') */
  day: string;
  /** Rest duration in decimal hours (e.g. 7.2) */
  hours: number;
  /** Quality state identifier for visual status bar color */
  status: 'good' | 'warning' | 'danger' | 'today';
  /** Flag denoting if this metric corresponds to the current day */
  isToday?: boolean;
}

/**
 * Detailed daily sleep log item recorded by the nocturnal worker.
 */
export interface SleepLogRecord {
  /** Record numerical ID */
  id: number;
  /** Formatted calendar date string */
  date: string;
  /** Rest schedule span (e.g. '07:30 AM - 02:15 PM') */
  schedule: string;
  /** Observational notes regarding room conditions or noise */
  notes: string;
  /** Total sleep duration string */
  duration: string;
}

/**
 * Actionable sleep hygiene or circadian rhythm recommendation.
 */
export interface HygieneSuggestion {
  /** Unique recommendation ID */
  id: number;
  /** Material icon name */
  icon: string;
  /** Suggestion headline */
  title: string;
  /** Scientific or practical guidance text */
  description: string;
}

/**
 * Aggregate summary entity capturing sleep metrics, fatigue alerts, and hygiene tips.
 */
export interface WellnessSummary extends BaseEntity {
  /** Rest duration logged in the last session */
  lastRestDuration: string;
  /** Exact time range of the last rest session */
  lastRestSchedule: string;
  /** 7-day rolling average rest hours */
  weeklyAverage: string;
  /** Daily recommended target rest hours */
  weeklyTarget: string;
  /** Cumulative sleep debt deficit compared to target */
  accumulatedDeficit: string;
  /** Perceived or calculated fatigue alert status */
  fatigueStatus: string;
  /** Sleep recovery quality percentage score */
  perceivedQuality: string;
  /** Star rating representation string */
  perceivedQualityRating: string;
  /** Array of daily metrics for the current week */
  weeklyHistory: SleepDailyMetric[];
  /** Chronological history of recent sleep session entries */
  recentLogs: SleepLogRecord[];
  /** Tailored circadian hygiene suggestions */
  suggestions: HygieneSuggestion[];
}
