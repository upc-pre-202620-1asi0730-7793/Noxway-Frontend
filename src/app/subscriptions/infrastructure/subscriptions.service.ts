import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResource } from '../../shared/domain/model/paged-resource';
import {
  BenefitClaimResource,
  CollectiveBenefitResource,
  PaymentTransactionResource,
  PlanResource,
  ReferralCodeResource,
  ReferralRewardResource,
  ReferralUseResource,
  SubscriptionInvitationResource,
  SubscriptionMemberResource,
  SubscriptionResource,
} from '../domain/model/collective-benefit.entity';

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getPlans(): Observable<PlanResource[]> {
    return this.http.get<PlanResource[]>(`${this.baseUrl}/plans`);
  }

  getMySubscriptions(): Observable<SubscriptionResource[]> {
    return this.http.get<SubscriptionResource[]>(`${this.baseUrl}/subscriptions`);
  }

  subscribe(planId: string): Observable<SubscriptionResource> {
    return this.http.post<SubscriptionResource>(`${this.baseUrl}/subscriptions`, { planId });
  }

  cancelSubscription(id: string): Observable<SubscriptionResource> {
    return this.http.post<SubscriptionResource>(`${this.baseUrl}/subscriptions/${id}/cancel`, {});
  }

  requestPayment(subscriptionId: string): Observable<PaymentTransactionResource> {
    return this.http.post<PaymentTransactionResource>(
      `${this.baseUrl}/subscriptions/${subscriptionId}/payments`,
      {},
    );
  }

  getPayments(
    page = 0,
    size = 20,
    all = false,
  ): Observable<PagedResource<PaymentTransactionResource>> {
    const params = new HttpParams().set('page', page).set('size', size).set('all', all);
    return this.http.get<PagedResource<PaymentTransactionResource>>(`${this.baseUrl}/payments`, {
      params,
    });
  }

  confirmOfflinePayment(paymentId: string, reference: string): Observable<PaymentTransactionResource> {
    return this.http.post<PaymentTransactionResource>(
      `${this.baseUrl}/payments/${paymentId}/confirm-offline`,
      { reference },
    );
  }

  rejectPayment(paymentId: string): Observable<PaymentTransactionResource> {
    return this.http.post<PaymentTransactionResource>(`${this.baseUrl}/payments/${paymentId}/reject`, {});
  }

  getBenefits(): Observable<CollectiveBenefitResource[]> {
    return this.http.get<CollectiveBenefitResource[]>(`${this.baseUrl}/benefits`);
  }

  claimBenefit(benefitId: string): Observable<BenefitClaimResource> {
    return this.http.post<BenefitClaimResource>(`${this.baseUrl}/benefits/${benefitId}/claims`, {});
  }

  getMyClaims(): Observable<BenefitClaimResource[]> {
    return this.http.get<BenefitClaimResource[]>(`${this.baseUrl}/benefit-claims`);
  }

  getReferralCode(): Observable<ReferralCodeResource> {
    return this.http.get<ReferralCodeResource>(`${this.baseUrl}/referral-code`);
  }

  useReferralCode(code: string): Observable<ReferralUseResource> {
    return this.http.post<ReferralUseResource>(`${this.baseUrl}/referrals`, { code });
  }

  getReferralRewards(): Observable<ReferralRewardResource[]> {
    return this.http.get<ReferralRewardResource[]>(`${this.baseUrl}/referral-rewards`);
  }

  redeemReward(id: string): Observable<ReferralRewardResource> {
    return this.http.post<ReferralRewardResource>(`${this.baseUrl}/referral-rewards/${id}/redeem`, {});
  }

  inviteMember(subscriptionId: string, workerEmail: string): Observable<SubscriptionMemberResource> {
    return this.http.post<SubscriptionMemberResource>(
      `${this.baseUrl}/subscriptions/${subscriptionId}/members`,
      { workerEmail },
    );
  }

  getMembers(subscriptionId: string): Observable<SubscriptionMemberResource[]> {
    return this.http.get<SubscriptionMemberResource[]>(
      `${this.baseUrl}/subscriptions/${subscriptionId}/members`,
    );
  }

  getInvitations(): Observable<SubscriptionInvitationResource[]> {
    return this.http.get<SubscriptionInvitationResource[]>(
      `${this.baseUrl}/subscription-invitations`,
    );
  }

  acceptInvitation(id: string): Observable<SubscriptionMemberResource> {
    return this.http.post<SubscriptionMemberResource>(
      `${this.baseUrl}/subscription-invitations/${id}/accept`,
      {},
    );
  }

  rejectInvitation(id: string): Observable<SubscriptionMemberResource> {
    return this.http.post<SubscriptionMemberResource>(
      `${this.baseUrl}/subscription-invitations/${id}/reject`,
      {},
    );
  }

  removeMember(memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/subscription-members/${memberId}`);
  }
}
