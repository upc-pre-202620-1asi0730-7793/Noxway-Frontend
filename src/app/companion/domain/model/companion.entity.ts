import { CommuteResource, SafetyIncidentResource, TelemetryPingResource } from '../../../commute/domain/model/commute.entity';

export interface AlertResource {
  id: string;
  commuteId: string;
  incidentId?: string | null;
  workerId: string;
  workerName: string;
  contactId: string;
  channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP' | string;
  status: 'PENDING' | 'PENDING_PROVIDER' | 'DELIVERED' | 'FAILED' | 'SUPPRESSED' | string;
  message: string;
  deliveredAt?: string | null;
  createdAt: string;
}

export interface CompanionLiveResource {
  workerId: string;
  workerName: string;
  workerPhone: string;
  shiftType?: string | null;
  shiftStart?: string | null;
  shiftEnd?: string | null;
  activeCommute?: CommuteResource | null;
  latestPing?: TelemetryPingResource | null;
  openIncidents: SafetyIncidentResource[];
  recentAlertCount: number;
}
