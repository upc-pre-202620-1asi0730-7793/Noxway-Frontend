import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents a trusted contact (family member or partner) invited
 * to oversee the nocturnal worker's safety and live telemetry.
 */
export interface TrustedContact extends BaseEntity {
  /** Avatar initials or visual token */
  avatar: string;
  /** Full name of the contact */
  name: string;
  /** Familial relationship or bond */
  relationship: string;
  /** Current connection status label */
  status: string;
  /** State type identifier ('active' or 'pending') */
  statusType: 'active' | 'pending';
  /** Phone number with country code */
  phone: string;
  /** Delivery notification channels enabled (e.g. WhatsApp, SMS) */
  channel?: string;
  /** Granted monitoring permissions */
  permissions?: string;
  /** Summary of the most recent interaction or alert sent */
  lastInteraction?: string;
  /** Relative date when the invitation link was dispatched */
  sentDate?: string;
  /** Technical note (e.g. no app installation required) */
  note?: string;
  /** Informational description about access capabilities */
  description?: string;
}
