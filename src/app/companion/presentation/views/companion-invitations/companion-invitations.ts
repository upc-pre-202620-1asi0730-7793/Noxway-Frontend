import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { TrustLinkResource } from '../../../../iam/domain/model/trusted-contact.entity';
import { SessionService } from '../../../../iam/infrastructure/session.service';
import { TrustedContactsService } from '../../../../iam/infrastructure/trusted-contacts.service';
import { SubscriptionInvitationResource } from '../../../../subscriptions/domain/model/collective-benefit.entity';
import { SubscriptionsService } from '../../../../subscriptions/infrastructure/subscriptions.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-companion-invitations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companion-invitations.html',
  styleUrl: './companion-invitations.css',
})
export class CompanionInvitations {
  private readonly contactsService = inject(TrustedContactsService);
  private readonly subService = inject(SubscriptionsService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(NotificationToastService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly trustLinks = signal<TrustLinkResource[]>([]);
  readonly familyInvites = signal<SubscriptionInvitationResource[]>([]);

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadAll());
    });
  }

  loadAll(): void {
    this.loading.set(true);

    forkJoin({
      links: this.contactsService.getContacts().pipe(catchError(() => of([]))),
      family: this.subService.getInvitations().pipe(catchError(() => of([]))),
    }).subscribe(({ links, family }) => {
      this.trustLinks.set(links);
      this.familyInvites.set(family);
      this.loading.set(false);
    });
  }

  respondTrustLink(id: string, accept: boolean): void {
    const call$ = accept
      ? this.contactsService.acceptInvitation(id)
      : this.contactsService.rejectInvitation(id);

    call$.subscribe({
      next: () => {
        this.toast.success(accept ? 'Vínculo aceptado' : 'Vínculo rechazado');
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error procesando vínculo.')),
    });
  }

  respondFamilyInvite(id: string, accept: boolean): void {
    const call$ = accept
      ? this.subService.acceptInvitation(id)
      : this.subService.rejectInvitation(id);

    call$.subscribe({
      next: () => {
        this.toast.success(accept ? 'Plan familiar aceptado' : 'Invitación rechazada');
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error procesando invitación.')),
    });
  }

  switchToMiguel(): void {
    const contacts = this.actorContext.personas.filter(
      (persona) => persona.role === 'TRUSTED_CONTACT',
    );
    const contact = contacts[1] ?? contacts[0];
    if (contact) {
      this.session.switchPersona(contact.id);
      this.toast.info(`Contacto activo: ${contact.name}`);
    }
  }
}
