import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LiveDashboardSnapshot, DashboardService } from '../../../infrastructure/dashboard.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly snapshot = signal<LiveDashboardSnapshot | null>(null);

  readonly sleepHoursLabel = computed(() => {
    const mins = this.snapshot()?.wellnessSummary?.averageDailyMinutes ?? 0;
    return `${(mins / 60).toFixed(1)}h`;
  });

  readonly targetHoursLabel = computed(() => {
    const mins = this.snapshot()?.wellnessSummary?.targetDailyMinutes ?? 420;
    return `${(mins / 60).toFixed(1)}h`;
  });

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.load());
    });
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.dashboardService.loadSnapshot().subscribe({
      next: (data) => {
        this.snapshot.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractProblemMessage(err, 'Error al cargar dashboard.'));
        this.loading.set(false);
      },
    });
  }
}
