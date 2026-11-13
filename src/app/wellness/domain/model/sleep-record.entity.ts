export interface RestSessionResource {
  id: string;
  workerId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  quality: number;
  notes: string;
  createdAt: string;
}

export interface LogRestSessionPayload {
  startTime: string;
  endTime: string;
  quality: number;
  notes: string;
}

export interface SleepGoalResource {
  id: string;
  workerId: string;
  targetMinutes: number;
  createdAt: string;
}

export interface DailyRestItemResource {
  date: string;
  dayLabel: string;
  minutes: number;
  hours: number;
  status: 'GOOD' | 'LOW' | 'DEFICIT' | 'NONE' | string;
}

export interface WellnessSummaryResource {
  workerId: string;
  timeZone: string;
  fromDate: string;
  toDate: string;
  targetDailyMinutes: number;
  totalMinutes: number;
  averageDailyMinutes: number;
  deficitMinutes: number;
  averageQuality: number;
  lastSessionMinutes: number;
  lastSessionNotes: string;
  dailyBreakdown: DailyRestItemResource[];
}

export type WellnessSummary = WellnessSummaryResource;
