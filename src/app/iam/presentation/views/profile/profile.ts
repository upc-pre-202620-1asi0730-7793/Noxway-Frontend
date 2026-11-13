import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  AccountProfileResource,
  NotificationPreferenceResource,
} from '../../../domain/model/user-profile.entity';
import { SessionService } from '../../../infrastructure/session.service';
import { UserProfileService } from '../../../infrastructure/user-profile.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly profileService = inject(UserProfileService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(NotificationToastService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly profile = signal<AccountProfileResource | null>(null);
  readonly preferences = signal<NotificationPreferenceResource[]>([]);

  fullName = '';
  phone = '';
  shiftType = 'NIGHT';
  shiftStart = '22:00';
  shiftEnd = '06:00';
  timeZone = 'America/Lima';

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadData());
    });
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      profile: this.profileService.getProfile(),
      preferences: this.profileService.getNotificationPreferences(),
    }).subscribe({
      next: ({ profile, preferences }) => {
        this.profile.set(profile);
        this.preferences.set(preferences);
        this.fullName = profile.fullName;
        this.phone = profile.phone;
        this.shiftType = profile.shiftType ?? 'NIGHT';
        this.shiftStart = this.trimSeconds(profile.shiftStart ?? '22:00');
        this.shiftEnd = this.trimSeconds(profile.shiftEnd ?? '06:00');
        this.timeZone = profile.timeZone || 'America/Lima';
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractProblemMessage(err, 'No se pudo cargar el perfil.'));
        this.loading.set(false);
      },
    });
  }

  saveProfile(): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.session
      .saveProfile({
        fullName: this.fullName.trim(),
        phone: this.phone.trim(),
        shiftType: this.profile()?.role === 'WORKER' ? this.shiftType : null,
        shiftStart: this.profile()?.role === 'WORKER' ? this.trimSeconds(this.shiftStart) : null,
        shiftEnd: this.profile()?.role === 'WORKER' ? this.trimSeconds(this.shiftEnd) : null,
        timeZone: this.timeZone.trim() || 'America/Lima',
      })
      .subscribe({
        next: (updated) => {
          this.profile.set(updated);
          this.saving.set(false);
          this.toast.success(this.languageService.ui('Perfil actualizado correctamente.'));
        },
        error: (err) => {
          this.saving.set(false);
          const msg = extractProblemMessage(err, 'Error al actualizar perfil.');
          this.errorMessage.set(msg);
          this.toast.error(msg);
        },
      });
  }

  savePreference(pref: NotificationPreferenceResource): void {
    this.profileService
      .updateNotificationPreference({
        channel: pref.channel,
        enabled: pref.enabled,
        priorityStart: this.trimSeconds(pref.priorityStart || '20:00'),
        priorityEnd: this.trimSeconds(pref.priorityEnd || '07:00'),
        timeZone: pref.timeZone || this.timeZone || 'America/Lima',
      })
      .subscribe({
        next: (updated) => {
          this.preferences.update((items) =>
            items.map((item) => (item.channel === updated.channel ? updated : item)),
          );
          this.toast.success(`${updated.channel} ${updated.enabled ? 'activo' : 'pausado'}`);
        },
        error: (err) => {
          this.toast.error(extractProblemMessage(err, 'Error al guardar preferencia.'));
        },
      });
  }

  private trimSeconds(value: string): string {
    return value.length >= 5 ? value.slice(0, 5) : value;
  }
}
