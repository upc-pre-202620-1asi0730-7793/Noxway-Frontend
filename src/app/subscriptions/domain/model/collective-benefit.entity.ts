export interface PlanResource {
  id: string;
  code: string;
  name: string;
  monthlyPrice: number;
  maxContacts: number;
  maxWorkers: number;
  active: boolean;
  createdAt: string;
}

export interface SubscriptionResource {
  id: string;
  workerId: string;
  planId: string;
  planCode: string;
  planName: string;
  monthlyPrice: number;
  maxContacts: number;
  maxWorkers: number;
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'CANCELLED' | string;
  owner: boolean;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface PaymentTransactionResource {
  id: string;
  subscriptionId: string;
  workerId: string;
  workerName: string;
  planCode: string;
  amount: number;
  currency: string;
  reference: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | string;
  createdAt: string;
}

export interface CollectiveBenefitResource {
  id: string;
  name: string;
  description: string;
  planCode: string;
  active: boolean;
  createdAt: string;
}

export interface BenefitClaimResource {
  id: string;
  workerId: string;
  benefitId: string;
  benefitName: string;
  benefitDescription: string;
  planCode: string;
  code: string;
  createdAt: string;
}

export interface ReferralCodeResource {
  id: string;
  workerId: string;
  code: string;
  createdAt: string;
}

export interface ReferralUseResource {
  id: string;
  referralId: string;
  referredWorkerId: string;
  createdAt: string;
}

export interface ReferralRewardResource {
  id: string;
  workerId: string;
  referralUseId: string;
  days: number;
  status: 'AVAILABLE' | 'REDEEMED' | string;
  createdAt: string;
}

export interface SubscriptionMemberResource {
  id: string;
  subscriptionId: string;
  workerId: string;
  workerName: string;
  workerEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVOKED' | string;
  createdAt: string;
}

export interface SubscriptionInvitationResource {
  id: string;
  subscriptionId: string;
  workerId: string;
  planCode: string;
  planName: string;
  ownerName: string;
  subscriptionStatus: string;
  status: string;
  createdAt: string;
}

export type CollectiveBenefit = CollectiveBenefitResource;
