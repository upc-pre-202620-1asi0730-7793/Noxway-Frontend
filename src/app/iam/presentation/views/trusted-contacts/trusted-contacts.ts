import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { TrustLinkResource } from '../../../domain/model/trusted-contact.entity';
import { AccountProfileResource } from '../../../domain/model/user-profile.entity';
import { TrustedContactsService } from '../../../infrastructure/trusted-contacts.service';
import { UserProfileService } from '../../../infrastructure/user-profile.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-trusted-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './trusted-contacts.html',
  styleUrl: './trusted-contacts.css',
})
export class TrustedContacts {
  private readonly contactsService = inject(TrustedContactsService);
  private readonly profileService = inject(UserProfileService);
  private readonly toast = inject(NotificationToastService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly links = signal<TrustLinkResource[]>([]);
  readonly directory = signal<AccountProfileResource[]>([]);

  contactEmail = 'miguel.quispe@noxway.pe';

  readonly companionCandidates = computed(() =>
    this.directory().filter((account) => account.role === 'TRUSTED_CONTACT'),
  );

  readonly activeCount = computed(
    () => this.links().filter((link) => link.status === 'ACTIVE').length,
  );

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadAll());
    });
  }

  loadAll(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      links: this.contactsService.getContacts().pipe(catchError(() => of([]))),
      directory: this.profileService.getDirectory().pipe(catchError(() => of([]))),
    }).subscribe(({ links, directory }) => {
      this.links.set(links);
      this.directory.set(directory);
      this.loading.set(false);
    });
  }

  inviteContact(): void {
    const email = this.contactEmail.trim();
    if (!email) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.contactsService.inviteContact(email).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success(this.languageService.ui('Invitación enviada correctamente.'));
        this.loadAll();
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = extractProblemMessage(err, 'No se pudo enviar la invitación.');
        this.errorMessage.set(msg);
        this.toast.error(msg);
      },
    });
  }

  acceptLink(link: TrustLinkResource): void {
    this.contactsService.acceptInvitation(link.id).subscribe({
      next: () => {
        this.toast.success(this.languageService.ui('Vínculo aceptado.'));
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al aceptar vínculo.')),
    });
  }

  rejectLink(link: TrustLinkResource): void {
    this.contactsService.rejectInvitation(link.id).subscribe({
      next: () => {
        this.toast.info(this.languageService.ui('Invitación rechazada.'));
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al rechazar vínculo.')),
    });
  }

  revokeLink(link: TrustLinkResource): void {
    this.contactsService.revokeContact(link.id).subscribe({
      next: () => {
        this.toast.info(this.languageService.ui('Contacto revocado.'));
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al revocar vínculo.')),
    });
  }

  isIncomingPending(link: TrustLinkResource): boolean {
    return (
      link.status === 'PENDING' && link.contactId === this.actorContext.activeActorId()
    );
  }
}
