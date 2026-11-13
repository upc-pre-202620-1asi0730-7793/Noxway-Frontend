export interface CommuteResource {
  id: string;
  workerId: string;
  origin: string;
  destination: string;
  transport: string;
  startTime: string;
  estimatedArrivalTime: string;
  toleranceMinutes: number;
  status: 'ACTIVE' | 'DELAYED' | 'OVERDUE' | 'ARRIVED' | string;
  arrivalTime?: string | null;
  delayUntil?: string | null;
  createdAt: string;
}

export interface StartCommutePayload {
  origin: string;
  destination: string;
  transport: string;
  startTime: string;
  estimatedArrivalTime: string;
  toleranceMinutes: number;
}

export interface TelemetryPingResource {
  id: string;
  commuteId: string;
  latitude: number;
  longitude: number;
  speed: number;
  recordedAt: string;
}

export interface RecordTelemetryPingPayload {
  latitude: number;
  longitude: number;
  speed: number;
  recordedAt: string;
}

export interface SafetyIncidentResource {
  id: string;
  commuteId: string;
  workerId: string;
  type: 'SOS' | 'DELAY' | 'DEVIATION' | 'OTHER' | string;
  description: string;
  status: 'OPEN' | 'RESOLVED' | string;
  reportedAt: string;
  createdAt: string;
}

export interface ReportIncidentPayload {
  type: 'SOS' | 'DELAY' | 'DEVIATION' | 'OTHER';
  description: string;
}

export type Commute = CommuteResource;
