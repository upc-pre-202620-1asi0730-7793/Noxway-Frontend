import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { catchError, of } from 'rxjs';
import { CommuteService } from '../../../../commute/infrastructure/commute.service';
import { CompanionLiveResource } from '../../../domain/model/companion.entity';
import { CompanionService } from '../../../infrastructure/companion.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-companion-live',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companion-live.html',
  styleUrl: './companion-live.css',
})
export class CompanionLive {
  private readonly companionService = inject(CompanionService);
  private readonly commuteService = inject(CommuteService);
  private readonly toast = inject(NotificationToastService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly monitored = signal<CompanionLiveResource[]>([]);

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadLive());
    });
  }

  loadLive(): void {
    this.loading.set(true);
    this.companionService
      .getLiveMonitoring()
      .pipe(catchError(() => of([])))
      .subscribe((items) => {
        this.monitored.set(items);
        this.loading.set(false);
      });
  }

  resolveIncident(incidentId: string): void {
    this.commuteService.resolveIncident(incidentId).subscribe({
      next: () => {
        this.toast.success(this.languageService.ui('Incidente marcado como resuelto.'));
        this.loadLive();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'No se pudo resolver.')),
    });
  }
}
