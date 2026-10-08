import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents the authenticated worker's identity, occupational role, and privacy settings.
 */
export interface UserProfile extends BaseEntity {
  /** Full legal name */
  fullName: string;
  /** Occupational position and workplace company */
  role: string;
  /** National identity card number (DNI) */
  dni: string;
  /** Membership tenure string */
  memberSince: string;
  /** Avatar initials or visual token */
  avatar: string;
  /** Primary contact phone number */
  phone: string;
  /** Registered email address */
  email: string;
  /** Working shift schedule and operational days */
  schedule: string;
  /** Primary commuting vehicle or transport mode */
  transport: string;
  /** Home district */
  district: string;
  /** Privacy flag: Share GPS position only during active commute */
  privacyGpsActiveOnly: boolean;
  /** Privacy flag: Keep historical trip routes end-to-end encrypted */
  privacyEncryptedHistory: boolean;
  /** Privacy flag: Submit road hazard ratings and comments anonymously */
  privacyAnonymousRatings: boolean;
  /** Last password update timestamp text */
  passwordUpdated: string;
  /** Count and location summary of active sessions */
  activeSessions: string;
}
