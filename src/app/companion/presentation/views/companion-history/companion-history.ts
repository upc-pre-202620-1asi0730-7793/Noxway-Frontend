import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AlertResource } from '../../../domain/model/companion.entity';
import { CompanionService } from '../../../infrastructure/companion.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';

@Component({
  selector: 'app-companion-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companion-history.html',
  styleUrl: './companion-history.css',
})
export class CompanionHistory {
  private readonly companionService = inject(CompanionService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly channelFilter = signal<string>('ALL');
  readonly alerts = signal<AlertResource[]>([]);

  readonly filteredAlerts = computed(() => {
    const channel = this.channelFilter();
    return channel === 'ALL'
      ? this.alerts()
      : this.alerts().filter((item) => item.channel === channel);
  });

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadHistory());
    });
  }

  loadHistory(): void {
    this.loading.set(true);
    this.companionService
      .getAlerts(0, 50)
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        this.alerts.set(res?.items ?? []);
        this.loading.set(false);
      });
  }
}
