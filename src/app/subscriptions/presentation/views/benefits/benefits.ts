import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import {
  BenefitClaimResource,
  CollectiveBenefitResource,
  PaymentTransactionResource,
  PlanResource,
  ReferralRewardResource,
  SubscriptionInvitationResource,
  SubscriptionMemberResource,
  SubscriptionResource,
} from '../../../domain/model/collective-benefit.entity';
import { SubscriptionsService } from '../../../infrastructure/subscriptions.service';
import { SessionService } from '../../../../iam/infrastructure/session.service';
import {
  ActorContextService,
  DEMO_PERSONAS,
} from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './benefits.html',
  styleUrl: './benefits.css',
})
export class Benefits {
  private readonly subService = inject(SubscriptionsService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(NotificationToastService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly busy = signal(false);

  readonly plans = signal<PlanResource[]>([]);
  readonly subscriptions = signal<SubscriptionResource[]>([]);
  readonly payments = signal<PaymentTransactionResource[]>([]);
  readonly benefits = signal<CollectiveBenefitResource[]>([]);
  readonly claims = signal<BenefitClaimResource[]>([]);
  readonly myReferralCode = signal<string>('');
  readonly rewards = signal<ReferralRewardResource[]>([]);
  readonly invitations = signal<SubscriptionInvitationResource[]>([]);
  readonly familyMembers = signal<SubscriptionMemberResource[]>([]);

  readonly ownedFamilySub = computed(
    () =>
      this.subscriptions().find(
        (sub) => sub.planCode === 'FAMILY_CREW' && sub.status === 'ACTIVE' && sub.owner,
      ) ?? null,
  );

  offlineReference = 'YAPE-987654';
  inviteWorkerEmail = 'jorge.huaman@noxway.pe';
  referralCodeInput = '';

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadAll());
    });
  }

  loadAll(): void {
    this.loading.set(true);
    const showAllPayments = this.actorContext.isAdmin();

    forkJoin({
      plans: this.subService.getPlans().pipe(catchError(() => of([]))),
      subscriptions: this.subService.getMySubscriptions().pipe(catchError(() => of([]))),
      payments: this.subService.getPayments(0, 25, showAllPayments).pipe(catchError(() => of(null))),
      benefits: this.subService.getBenefits().pipe(catchError(() => of([]))),
      claims: this.subService.getMyClaims().pipe(catchError(() => of([]))),
      referralCode: this.subService.getReferralCode().pipe(catchError(() => of(null))),
      rewards: this.subService.getReferralRewards().pipe(catchError(() => of([]))),
      invitations: this.subService.getInvitations().pipe(catchError(() => of([]))),
    }).subscribe((res) => {
      this.plans.set(res.plans);
      this.subscriptions.set(res.subscriptions);
      this.payments.set(res.payments?.items ?? []);
      this.benefits.set(res.benefits);
      this.claims.set(res.claims);
      this.myReferralCode.set(res.referralCode?.code ?? '');
      this.rewards.set(res.rewards);
      this.invitations.set(res.invitations);

      const familyOwnerSub = res.subscriptions.find(
        (sub) => sub.planCode === 'FAMILY_CREW' && sub.status === 'ACTIVE' && sub.owner,
      );
      if (familyOwnerSub) {
        this.subService
          .getMembers(familyOwnerSub.id)
          .pipe(catchError(() => of([])))
          .subscribe((members) => this.familyMembers.set(members));
      } else {
        this.familyMembers.set([]);
      }
      this.loading.set(false);
    });
  }

  subscribePlan(plan: PlanResource): void {
    this.busy.set(true);
    this.subService.subscribe(plan.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.toast.success(`Suscripción ${plan.name} creada`);
        this.loadAll();
      },
      error: (err) => {
        this.busy.set(false);
        this.toast.error(extractProblemMessage(err, 'No se pudo crear suscripción.'));
      },
    });
  }

  requestPayment(subId: string): void {
    this.subService.requestPayment(subId).subscribe({
      next: () => {
        this.toast.success(this.languageService.ui('Orden de pago offline generada.'));
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al solicitar pago.')),
    });
  }

  cancelSub(subId: string): void {
    this.subService.cancelSubscription(subId).subscribe({
      next: () => {
        this.toast.info(this.languageService.ui('Suscripción cancelada.'));
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al cancelar.')),
    });
  }

  confirmOffline(paymentId: string): void {
    this.subService
      .confirmOfflinePayment(paymentId, this.offlineReference.trim() || 'YAPE-CONFIRMED')
      .subscribe({
        next: () => {
          this.toast.success(this.languageService.ui('Pago offline confirmado y plan activado.'));
          this.loadAll();
        },
        error: (err) => this.toast.error(extractProblemMessage(err, 'Solo Admin confirma pagos.')),
      });
  }

  rejectPayment(paymentId: string): void {
    this.subService.rejectPayment(paymentId).subscribe({
      next: () => {
        this.toast.info(this.languageService.ui('Pago rechazado.'));
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Solo Admin rechaza pagos.')),
    });
  }

  claimBenefit(benefitId: string): void {
    this.subService.claimBenefit(benefitId).subscribe({
      next: (claim) => {
        this.toast.success(`Cupón generado: ${claim.code}`);
        this.loadAll();
      },
      error: (err) =>
        this.toast.error(extractProblemMessage(err, 'Tu plan actual no incluye este beneficio.')),
    });
  }

  inviteCrewMember(): void {
    const sub = this.ownedFamilySub();
    if (!sub || !this.inviteWorkerEmail.trim()) return;

    this.subService.inviteMember(sub.id, this.inviteWorkerEmail.trim()).subscribe({
      next: () => {
        this.toast.success(this.languageService.ui('Trabajador invitado al grupo familiar.'));
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'No se pudo invitar.')),
    });
  }

  removeCrewMember(memberId: string): void {
    this.subService.removeMember(memberId).subscribe({
      next: () => {
        this.toast.info(this.languageService.ui('Miembro removido.'));
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al remover miembro.')),
    });
  }

  respondInvitation(id: string, accept: boolean): void {
    const req$ = accept ? this.subService.acceptInvitation(id) : this.subService.rejectInvitation(id);
    req$.subscribe({
      next: () => {
        this.toast.success(accept ? 'Invitación aceptada' : 'Invitación rechazada');
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error procesando invitación.')),
    });
  }

  applyReferralCode(): void {
    const code = this.referralCodeInput.trim();
    if (!code) return;

    this.subService.useReferralCode(code).subscribe({
      next: () => {
        this.referralCodeInput = '';
        this.toast.success(this.languageService.ui('Código de referido aplicado.'));
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Código inválido o ya utilizado.')),
    });
  }

  redeemReward(rewardId: string): void {
    this.subService.redeemReward(rewardId).subscribe({
      next: () => {
        this.toast.success(this.languageService.ui('Recompensa de días extra canjeada.'));
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al canjear recompensa.')),
    });
  }

  switchToAdmin(): void {
    const admin = DEMO_PERSONAS.find((persona) => persona.role === 'ADMIN') ?? DEMO_PERSONAS[4];
    this.session.switchPersona(admin.id);
    this.toast.info('Administrador (0901) activo para confirmar pagos');
  }
}
