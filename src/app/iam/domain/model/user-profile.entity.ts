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

export const NOTIFICATION_CHANNELS = ['EMAIL', 'WHATSAPP', 'SMS'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export interface NotificationPreferenceResource {
  id: string;
  accountId: string;
  channel: NotificationChannel | string;
  enabled: boolean;
  priorityStart: string;
  priorityEnd: string;
  timeZone: string;
}

export function getMissingNotificationChannels(
  preferences: readonly NotificationPreferenceResource[],
): NotificationChannel[] {
  const configured = new Set(preferences.map((pref) => pref.channel));
  return NOTIFICATION_CHANNELS.filter((channel) => !configured.has(channel));
}

export interface UpdateNotificationPreferencePayload {
  channel: string;
  enabled: boolean;
  priorityStart: string;
  priorityEnd: string;
  timeZone: string;
}

export type UserProfile = AccountProfileResource;
