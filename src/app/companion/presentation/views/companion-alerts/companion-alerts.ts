import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import {
  getMissingNotificationChannels,
  NotificationChannel,
  NotificationPreferenceResource,
} from '../../../../iam/domain/model/user-profile.entity';
import { UserProfileService } from '../../../../iam/infrastructure/user-profile.service';
import { AlertResource } from '../../../domain/model/companion.entity';
import { CompanionService } from '../../../infrastructure/companion.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-companion-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companion-alerts.html',
  styleUrl: './companion-alerts.css',
})
export class CompanionAlerts {
  private readonly companionService = inject(CompanionService);
  private readonly profileService = inject(UserProfileService);
  private readonly toast = inject(NotificationToastService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly alerts = signal<AlertResource[]>([]);
  readonly deliveries = signal<AlertResource[]>([]);
  readonly preferences = signal<NotificationPreferenceResource[]>([]);
  readonly missingChannels = computed(() => getMissingNotificationChannels(this.preferences()));

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadAll());
    });
  }

  loadAll(): void {
    this.loading.set(true);

    forkJoin({
      alerts: this.companionService.getAlerts(0, 30).pipe(catchError(() => of(null))),
      deliveries: this.companionService.getDeliveryQueue().pipe(catchError(() => of([]))),
      prefs: this.profileService.getNotificationPreferences().pipe(catchError(() => of([]))),
    }).subscribe(({ alerts, deliveries, prefs }) => {
      this.alerts.set(alerts?.items ?? []);
      this.deliveries.set(deliveries);
      this.preferences.set(prefs);
      this.loading.set(false);
    });
  }

  configureChannel(channel: NotificationChannel): void {
    this.toggleChannel(
      {
        id: '',
        accountId: this.actorContext.activeActorId(),
        channel,
        enabled: true,
        priorityStart: '20:00',
        priorityEnd: '07:00',
        timeZone: 'America/Lima',
      },
      true,
    );
  }

  toggleChannel(pref: NotificationPreferenceResource, enabled: boolean): void {
    this.profileService
      .updateNotificationPreference({
        channel: pref.channel,
        enabled,
        priorityStart: (pref.priorityStart || '20:00').slice(0, 5),
        priorityEnd: (pref.priorityEnd || '07:00').slice(0, 5),
        timeZone: pref.timeZone || 'America/Lima',
      })
      .subscribe({
        next: (updated) => {
          this.preferences.update((items) =>
            items.some((item) => item.channel === updated.channel)
              ? items.map((item) => (item.channel === updated.channel ? updated : item))
              : [...items, updated],
          );
          this.toast.success(`${updated.channel} actualizado`);
        },
        error: (err) => this.toast.error(extractProblemMessage(err, 'Error al actualizar canal.')),
      });
  }

  dispatchPending(): void {
    this.companionService.dispatchPendingDeliveries().subscribe({
      next: (res) => {
        const count = res?.['processed'] ?? 0;
        this.toast.success(`Despacho ejecutado (${count} alertas procesadas)`);
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al despachar cola.')),
    });
  }

  retryDelivery(id: string): void {
    this.companionService.retryDelivery(id).subscribe({
      next: () => {
        this.toast.info('Reintento programado');
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al reintentar.')),
    });
  }
}
