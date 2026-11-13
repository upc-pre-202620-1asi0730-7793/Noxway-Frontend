export interface AccountProfileResource {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'WORKER' | 'TRUSTED_CONTACT' | 'ADMIN' | string;
  shiftType?: string | null;
  shiftStart?: string | null;
  shiftEnd?: string | null;
  timeZone: string;
  active: boolean;
  createdAt: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone: string;
  shiftType?: string | null;
  shiftStart?: string | null;
  shiftEnd?: string | null;
  timeZone: string;
}

export interface CreateProfilePayload {
  email: string;
  fullName: string;
  phone: string;
  role: 'WORKER' | 'TRUSTED_CONTACT';
  shiftType?: string | null;
  shiftStart?: string | null;
  shiftEnd?: string | null;
  timeZone: string;
}

export interface NotificationPreferenceResource {
  id: string;
  accountId: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | string;
  enabled: boolean;
  priorityStart: string;
  priorityEnd: string;
  timeZone: string;
}

export interface UpdateNotificationPreferencePayload {
  channel: string;
  enabled: boolean;
  priorityStart: string;
  priorityEnd: string;
  timeZone: string;
}

export type UserProfile = AccountProfileResource;
