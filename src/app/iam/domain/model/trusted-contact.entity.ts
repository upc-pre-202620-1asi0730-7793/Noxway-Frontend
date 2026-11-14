export interface TrustLinkResource {
  id: string;
  workerId: string;
  workerName: string;
  workerEmail: string;
  workerPhone: string;
  workerShiftType?: string | null;
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'REVOKED' | string;
  acceptedAt?: string | null;
  createdAt: string;
}

export type TrustedContact = TrustLinkResource;
