import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserProfileService } from '../../../../iam/infrastructure/user-profile.service';
import { AccountProfileResource } from '../../../../iam/domain/model/user-profile.entity';
import { SessionService } from '../../../../iam/infrastructure/session.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-companion-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './companion-profile.html',
  styleUrl: './companion-profile.css',
})
export class CompanionProfile {
  private readonly profileService = inject(UserProfileService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(NotificationToastService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly profile = signal<AccountProfileResource | null>(null);

  fullName = '';
  phone = '';
  timeZone = 'America/Lima';

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadProfile());
    });
  }

  loadProfile(): void {
    this.loading.set(true);
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res);
        this.fullName = res.fullName;
        this.phone = res.phone;
        this.timeZone = res.timeZone || 'America/Lima';
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(extractProblemMessage(err, 'No se pudo cargar perfil del contacto.'));
      },
    });
  }

  save(): void {
    this.saving.set(true);
    this.session
      .saveProfile({
        fullName: this.fullName.trim(),
        phone: this.phone.trim(),
        shiftType: null,
        shiftStart: null,
        shiftEnd: null,
        timeZone: this.timeZone,
      })
      .subscribe({
        next: (updated) => {
          this.profile.set(updated);
          this.saving.set(false);
          this.toast.success(this.languageService.ui('Perfil de contacto actualizado.'));
        },
        error: (err) => {
          this.saving.set(false);
          this.toast.error(extractProblemMessage(err, 'No se pudo actualizar perfil.'));
        },
      });
  }
}
