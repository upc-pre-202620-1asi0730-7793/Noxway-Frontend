import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import {
  RestSessionResource,
  WellnessSummaryResource,
} from '../../../domain/model/sleep-record.entity';
import { WellnessService } from '../../../infrastructure/wellness.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-wellness',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wellness.html',
  styleUrl: './wellness.css',
})
export class Wellness {
  private readonly wellnessService = inject(WellnessService);
  private readonly toast = inject(NotificationToastService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly summary = signal<WellnessSummaryResource | null>(null);
  readonly sessions = signal<RestSessionResource[]>([]);

  targetMinutes = 420;
  logDate = new Date().toISOString().slice(0, 10);
  startTimeStr = '08:00';
  endTimeStr = '14:30';
  quality = 4;
  notes = '';

  readonly maxChartMinutes = computed(() => {
    const items = this.summary()?.dailyBreakdown ?? [];
    const peak = Math.max(this.summary()?.targetDailyMinutes ?? 420, ...items.map((d) => d.minutes));
    return peak > 0 ? peak : 480;
  });

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadAll());
    });
  }

  loadAll(): void {
    this.loading.set(true);

    forkJoin({
      summary: this.wellnessService.getWellnessSummary('America/Lima').pipe(catchError(() => of(null))),
      sessions: this.wellnessService.listSessions(0, 20).pipe(catchError(() => of(null))),
      goal: this.wellnessService.getGoal().pipe(catchError(() => of(null))),
    }).subscribe(({ summary, sessions, goal }) => {
      this.summary.set(summary);
      this.sessions.set(sessions?.items ?? []);
      if (goal) {
        this.targetMinutes = goal.targetMinutes;
      } else if (summary) {
        this.targetMinutes = summary.targetDailyMinutes;
      }
      this.loading.set(false);
    });
  }

  saveGoal(): void {
    this.busy.set(true);
    this.wellnessService.updateGoal(Number(this.targetMinutes)).subscribe({
      next: (goal) => {
        this.busy.set(false);
        this.targetMinutes = goal.targetMinutes;
        this.toast.success(`Meta diaria actualizada a ${(goal.targetMinutes / 60).toFixed(1)}h`);
        this.loadAll();
      },
      error: (err) => {
        this.busy.set(false);
        this.toast.error(extractProblemMessage(err, 'Meta debe estar entre 240 y 720 minutos.'));
      },
    });
  }

  logSession(): void {
    const start = new Date(`${this.logDate}T${this.startTimeStr}:00`);
    let end = new Date(`${this.logDate}T${this.endTimeStr}:00`);
    if (end.getTime() <= start.getTime()) {
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    }

    this.busy.set(true);
    this.wellnessService
      .logSession({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        quality: Number(this.quality),
        notes: this.notes.trim(),
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.toast.success(this.languageService.ui('Sesión de descanso registrada.'));
          this.loadAll();
        },
        error: (err) => {
          this.busy.set(false);
          this.toast.error(extractProblemMessage(err, 'No se pudo registrar descanso.'));
        },
      });
  }

  deleteSession(id: string): void {
    this.wellnessService.deleteSession(id).subscribe({
      next: () => {
        this.toast.info(this.languageService.ui('Sesión eliminada.'));
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al eliminar sesión.')),
    });
  }

  barHeightPct(minutes: number): number {
    return Math.min(100, Math.max(4, Math.round((minutes / this.maxChartMinutes()) * 100)));
  }
}
