import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents a community post published by nocturnal workers,
 * sharing live safety alerts, road hazards, or verified 24h services.
 */
export interface CommunityPost extends BaseEntity {
  /** Full name of the worker authoring the post */
  authorName: string;
  /** Professional occupational role (e.g. Security Guard, Courier) */
  authorRole: string;
  /** Avatar initials or visual token */
  avatar: string;
  /** Relative publication time string (e.g. '24 min ago') */
  timeAgo: string;
  /** Geographic location or avenue reference */
  location: string;
  /** Badge label displaying the category */
  badge: string;
  /** Visual theme for the badge ('verified' or 'danger') */
  badgeType: 'verified' | 'danger';
  /** District identifier for territorial filtering */
  district: string;
  /** Title summarizing the community update */
  title: string;
  /** Detailed content with on-the-ground observations */
  content: string;
  /** Number of community endorsements or upvotes */
  upvotes: number;
  /** Label for the interactive confirmation button */
  actionLabel: string;
}

/**
 * Represents a recognized community contributor or nocturnal guardian.
 */
export interface CommunityLeader {
  /** Leaderboard position ranking */
  rank: number;
  /** Full name of the contributor */
  name: string;
  /** Total validated reports and contributions */
  contributions: number;
  /** Whether this contributor is the authenticated user */
  isCurrentUser?: boolean;
}
