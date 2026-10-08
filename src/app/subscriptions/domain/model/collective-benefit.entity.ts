import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents a collective discount, corporate perk, or nocturnal safety service benefit.
 */
export interface CollectiveBenefit extends BaseEntity {
  /** Name of partner merchant or service provider */
  name: string;
  /** Primary discount rate or offer headline */
  subtitle: string;
  /** Conditions and details for redemption */
  description: string;
  /** Redemption alphanumeric code or agreement key */
  code: string;
  /** Visual type label for the code (e.g. 'Código', 'Convenio', 'Póliza') */
  codeLabel: string;
  /** Material icon identifier */
  icon: string;
  /** Label for primary call-to-action button */
  actionLabel: string;
}

/**
 * Represents the worker's active nocturnal protection plan and benefits package.
 */
export interface UserSubscription extends BaseEntity {
  /** Commercial plan title (e.g. 'Plan Centinela Pro') */
  planName: string;
  /** Monthly price formatted string */
  price: string;
  /** Active membership status indicator */
  status: string;
  /** Billing cadence and renewal schedule details */
  billingDetails: string;
  /** Referral reward incentive headline */
  referralBonus: string;
  /** Explanation of the referral program */
  referralDesc: string;
  /** Worker's personal invite code */
  referralCode: string;
  /** List of benefits included under the active subscription */
  benefits: CollectiveBenefit[];
}
