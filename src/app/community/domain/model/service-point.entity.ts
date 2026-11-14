export interface ServiceOpeningIntervalResource {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  closesNextDay: boolean;
  is24Hours: boolean;
}

export interface ServicePointResource {
  id: string;
  reportedBy: string;
  reporterName: string;
  name: string;
  type: 'PHARMACY' | 'GAS_STATION' | 'HOSPITAL' | 'POLICE_STATION' | 'OTHER' | string;
  latitude: number;
  longitude: number;
  timeZone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  openingHours: ServiceOpeningIntervalResource[];
  trustScore: number;
  upvotes: number;
  downvotes: number;
  myVote: number;
  openAtReference: boolean;
  referenceTime?: string;
  createdAt: string;
}

export interface SubmitServicePointPayload {
  name: string;
  type: 'PHARMACY' | 'GAS_STATION' | 'HOSPITAL' | 'POLICE_STATION' | 'OTHER';
  latitude: number;
  longitude: number;
  timeZone: string;
  openingHours: ServiceOpeningIntervalResource[];
}

export interface ServiceVoteResource {
  id: string;
  serviceId: string;
  accountId: string;
  direction: number;
  createdAt: string;
}

export interface RiskZoneResource {
  id: string;
  reportedBy: string;
  reporterName: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  latitude: number;
  longitude: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED' | string;
  createdAt: string;
}

export interface ReportRiskZonePayload {
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  latitude: number;
  longitude: number;
}

export interface RouteRatingResource {
  id: string;
  commuteId: string;
  workerId: string;
  score: number;
  comments: string;
  createdAt: string;
}

export interface MapPoint {
  type: string;
  timeZone?: string;
  openingHours?: { opens: string; closes: string }[];
}

export interface RateRoutePayload {
  commuteId: string;
  score: number;
  comments: string;
}
