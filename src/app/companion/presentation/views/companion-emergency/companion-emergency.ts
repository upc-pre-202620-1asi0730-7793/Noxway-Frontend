import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { catchError, of } from 'rxjs';
import { CompanionLiveResource } from '../../../domain/model/companion.entity';
import { CompanionService } from '../../../infrastructure/companion.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';

interface EmergencyLine {
  name: string;
  number: string;
  scope: string;
}

const PERU_EMERGENCY_LINES: readonly EmergencyLine[] = [
  { name: 'Policía Nacional del Perú (PNP)', number: '105', scope: 'Emergencias policiales 24/7' },
  { name: 'SAMU Ambulancias', number: '106', scope: 'Atención médica prehospitalaria' },
  { name: 'Cuerpo General de Bomberos', number: '116', scope: 'Rescates e incendios' },
  { name: 'Serenazgo Lima Metropolitana', number: '01-318-5050', scope: 'Patrullaje municipal' },
  { name: 'Central Línea 100 / Emergencia Familiar', number: '100', scope: 'Orientación inmediata' },
];

@Component({
  selector: 'app-companion-emergency',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companion-emergency.html',
  styleUrl: './companion-emergency.css',
})
export class CompanionEmergency {
  private readonly companionService = inject(CompanionService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly directory = PERU_EMERGENCY_LINES;
  readonly monitored = signal<CompanionLiveResource[]>([]);

  readonly workersWithOpenIncidents = computed(() =>
    this.monitored().filter((worker) => worker.openIncidents.length > 0),
  );

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => {
        this.companionService
          .getLiveMonitoring()
          .pipe(catchError(() => of([])))
          .subscribe((items) => this.monitored.set(items));
      });
    });
  }
}
