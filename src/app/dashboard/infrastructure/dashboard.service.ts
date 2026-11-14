import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { CommunityService } from '../../community/infrastructure/community.service';
import { CommuteResource } from '../../commute/domain/model/commute.entity';
import { CommuteService } from '../../commute/infrastructure/commute.service';
import { TrustLinkResource } from '../../iam/domain/model/trusted-contact.entity';
import { AccountProfileResource } from '../../iam/domain/model/user-profile.entity';
import { TrustedContactsService } from '../../iam/infrastructure/trusted-contacts.service';
import { UserProfileService } from '../../iam/infrastructure/user-profile.service';
import {
  PlanResource,
  SubscriptionResource,
} from '../../subscriptions/domain/model/collective-benefit.entity';
import { SubscriptionsService } from '../../subscriptions/infrastructure/subscriptions.service';
import { WellnessSummaryResource } from '../../wellness/domain/model/sleep-record.entity';
import { WellnessService } from '../../wellness/infrastructure/wellness.service';

export interface LiveDashboardSnapshot {
  profile: AccountProfileResource | null;
  activeCommute: CommuteResource | null;
  completedTrips: number;
  recentCommutes: CommuteResource[];
  activeContactsCount: number;
  pendingContactsCount: number;
  contacts: TrustLinkResource[];
  wellnessSummary: WellnessSummaryResource | null;
  approvedServicesCount: number;
  communityPostsCount: number;
  activeSubscriptionPlan: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly profileService = inject(UserProfileService);
  private readonly commuteService = inject(CommuteService);
  private readonly contactsService = inject(TrustedContactsService);
  private readonly wellnessService = inject(WellnessService);
  private readonly communityService = inject(CommunityService);
  private readonly subscriptionsService = inject(SubscriptionsService);

  loadSnapshot(): Observable<LiveDashboardSnapshot> {
    return forkJoin({
      profile: this.profileService.getProfile().pipe(catchError(() => of(null))),
      commutes: this.commuteService.getMyCommutes(0, 20).pipe(catchError(() => of(null))),
      contacts: this.contactsService.getContacts().pipe(catchError(() => of([]))),
      wellness: this.wellnessService.getWellnessSummary().pipe(catchError(() => of(null))),
      services: this.communityService.listServices({ page: 0, size: 1 }).pipe(catchError(() => of(null))),
      posts: this.communityService.listPosts(undefined, 0, 1).pipe(catchError(() => of(null))),
      subscriptions: this.subscriptionsService.getMySubscriptions().pipe(catchError(() => of([]))),
      plans: this.subscriptionsService.getPlans().pipe(catchError(() => of([]))),
    }).pipe(
      // Assemble live snapshot across bounded contexts
      mapSnapshot,
    );
  }
}

const mapSnapshot = map(
  (data: {
    profile: AccountProfileResource | null;
    commutes: { items: CommuteResource[]; total: number } | null;
    contacts: TrustLinkResource[];
    wellness: WellnessSummaryResource | null;
    services: { total: number } | null;
    posts: { total: number } | null;
    subscriptions: SubscriptionResource[];
    plans: PlanResource[];
  }): LiveDashboardSnapshot => {
    const items = data.commutes?.items ?? [];
    const activeCommute = items.find((c) => c.status !== 'ARRIVED') ?? null;
    const totalCommutes = data.commutes?.total ?? items.length;
    const completedTrips = Math.max(0, totalCommutes - (activeCommute ? 1 : 0));
    const activeContactsCount = data.contacts.filter((c) => c.status === 'ACTIVE').length;
    const pendingContactsCount = data.contacts.filter((c) => c.status === 'PENDING').length;
    const activeSub = data.subscriptions.find((s) => s.status === 'ACTIVE');
    const freePlan = data.plans.find((p) => p.code === 'ESSENTIAL' || p.monthlyPrice === 0);

    return {
      profile: data.profile,
      activeCommute,
      completedTrips,
      recentCommutes: items.slice(0, 5),
      activeContactsCount,
      pendingContactsCount,
      contacts: data.contacts,
      wellnessSummary: data.wellness,
      approvedServicesCount: data.services?.total ?? 0,
      communityPostsCount: data.posts?.total ?? 0,
      activeSubscriptionPlan: activeSub?.planName ?? freePlan?.name ?? 'Essential',
    };
  },
);
