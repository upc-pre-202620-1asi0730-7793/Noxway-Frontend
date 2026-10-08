/**
 * Real-time companion monitoring telemetry and worker status entity.
 */
export interface CompanionLiveInfo {
  id: number;
  workerName: string;
  workerFullName: string;
  workerDni: string;
  workerAge: string;
  employer: string;
  shift: string;
  vehicle: string;
  plate: string;
  origin: string;
  destination: string;
  status: string;
  statusLabel: string;
  eta: string;
  etaDetail: string;
  battery: string;
  batteryStatus: string;
  speed: string;
  speedStatus: string;
  lastPing: string;
  lastPingDetail: string;
  currentLocation: string;
  workerPhone: string;
  protectionRules: string[];
}

/**
 * Aggregated statistical metrics for companion route audit and history.
 */
export interface CompanionHistoryStats {
  monitoredRoutes: string;
  period: string;
  safeArrivalRate: string;
  safeArrivalDetails: string;
  avgRouteTime: string;
  avgDistance: string;
  deviations: string;
  deviationsDetail: string;
}

/**
 * Individual historical journey record for worker route auditing.
 */
export interface CompanionHistoryRecord {
  id: number;
  date: string;
  time: string;
  type: string;
  transport: string;
  origin: string;
  destination: string;
  via: string;
  duration: string;
  status: string;
  statusType: 'active' | 'success' | 'warning';
  isCurrent: boolean;
}

/**
 * Notification channel configuration for trusted companion alerts.
 */
export interface CompanionAlertChannel {
  id: string;
  title: string;
  subtitle: string;
  enabled: boolean;
}

/**
 * Event log entry representing an incident, checkpoint, or routine notification.
 */
export interface CompanionAlertLog {
  id: number;
  title: string;
  time: string;
  description: string;
  type: 'check' | 'play' | 'home' | 'warning';
  icon: string;
}

/**
 * Official emergency rescue protocol sheet issued by Noxway.
 */
export interface EmergencyRescueProtocol {
  title: string;
  instruction: string;
  officialBadge: string;
  worker: string;
  employer: string;
  vehicle: string;
  workerPhone: string;
  contact: string;
  lastGps: string;
}

/**
 * Municipal district patrol unit (Serenazgo) along the commute route.
 */
export interface SerenazgoUnit {
  id: number;
  district: string;
  badge: string;
  originType: string;
  phone: string;
  whatsapp?: string;
  base?: string;
  responseTime?: string;
  module?: string;
  distance?: string;
  isCurrentZone: boolean;
}

/**
 * National free emergency and assistance hotline.
 */
export interface NationalLine {
  id: string;
  code: string;
  name: string;
  action: string;
  number: string;
}

/**
 * Pending trusted bond request from a nocturnal worker.
 */
export interface PendingInvitation {
  id: number;
  name: string;
  relation: string;
  message: string;
  category: string;
  schedule: string;
  status: string;
}

/**
 * Active nocturnal worker currently accompanied by this contact.
 */
export interface AccompaniedWorker {
  id: number;
  avatar: string;
  name: string;
  badge: string;
  relation: string;
  role: string;
  linkedSince: string;
  gpsRealTime: boolean;
  stopAlarm: boolean;
  whatsappNotification: string;
}

/**
 * Step explanation item describing the mutual consent mechanism.
 */
export interface InvitationStep {
  step: string;
  title: string;
  desc1: string;
  desc2: string;
}

/**
 * Profile and configuration settings for the trusted companion.
 */
export interface CompanionProfile {
  avatar: string;
  fullName: string;
  verified: boolean;
  verifiedBadge: string;
  relationship: string;
  location: string;
  accountProtected: boolean;
  dni: string;
  phone: string;
  phoneValidation: string;
  email: string;
  address: string;
  surveillanceStart: string;
  surveillanceEnd: string;
  autoRestTitle: string;
  autoRestDesc: string;
  encryptionTitle: string;
  encryptionDesc: string;
}
