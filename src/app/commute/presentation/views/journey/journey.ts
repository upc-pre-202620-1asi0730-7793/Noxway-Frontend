import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { CommunityService } from '../../../../community/infrastructure/community.service';
import { RouteRatingResource } from '../../../../community/domain/model/service-point.entity';
import {
  CommuteResource,
  SafetyIncidentResource,
  TelemetryPingResource,
} from '../../../domain/model/commute.entity';
import { CommuteService } from '../../../infrastructure/commute.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-journey',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journey.html',
  styleUrl: './journey.css',
})
export class Journey {
  private readonly commuteService = inject(CommuteService);
  private readonly communityService = inject(CommunityService);
  private readonly toast = inject(NotificationToastService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly commutes = signal<CommuteResource[]>([]);
  readonly telemetry = signal<TelemetryPingResource[]>([]);
  readonly incidents = signal<SafetyIncidentResource[]>([]);
  readonly ratings = signal<RouteRatingResource[]>([]);

  readonly activeCommute = computed(
    () => this.commutes().find((item) => item.status !== 'ARRIVED') ?? null,
  );
  readonly historyCommutes = computed(() =>
    this.commutes().filter((item) => item.status === 'ARRIVED'),
  );
  readonly ratedCommuteIds = computed(
    () => new Set(this.ratings().map((rating) => rating.commuteId)),
  );

  // Start Commute form
  origin = '';
  destination = '';
  transport = 'Motocicleta';
  durationMinutes = 35;
  toleranceMinutes = 15;

  // Telemetry & Delay & Incident controls
  pingLat = -12.0114;
  pingLng = -77.0612;
  pingSpeed = 34;
  delayMinutes = 15;
  incidentType: 'SOS' | 'DELAY' | 'DEVIATION' | 'OTHER' = 'SOS';
  incidentDescription = '';

  // Route rating inline form
  ratingTargetId = signal<string | null>(null);
  ratingScore = 5;
  ratingComments = '';

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
      commutes: this.commuteService.getMyCommutes(0, 25).pipe(catchError(() => of(null))),
      ratings: this.communityService.myRatings().pipe(catchError(() => of([]))),
    }).subscribe(({ commutes, ratings }) => {
      const list = commutes?.items ?? [];
      this.commutes.set(list);
      this.ratings.set(ratings);
      const current = list.find((item) => item.status !== 'ARRIVED');
      if (current) {
        this.loadActiveDetails(current.id);
      } else {
        this.telemetry.set([]);
        this.incidents.set([]);
      }
      this.loading.set(false);
    });
  }

  private loadActiveDetails(commuteId: string): void {
    forkJoin({
      pings: this.commuteService.getTelemetry(commuteId).pipe(catchError(() => of([]))),
      incidents: this.commuteService.getIncidents(commuteId).pipe(catchError(() => of([]))),
    }).subscribe(({ pings, incidents }) => {
      this.telemetry.set(pings);
      this.incidents.set(incidents);
    });
  }

  startCommute(): void {
    if (!this.origin.trim() || !this.destination.trim()) {
      this.toast.error(this.languageService.ui('Ingresa origen y destino para iniciar el trayecto.'));
      return;
    }

    this.busy.set(true);
    this.errorMessage.set(null);
    const now = new Date();
    const eta = new Date(now.getTime() + Math.max(5, Number(this.durationMinutes)) * 60_000);

    this.commuteService
      .startCommute({
        origin: this.origin.trim(),
        destination: this.destination.trim(),
        transport: this.transport.trim(),
        startTime: now.toISOString(),
        estimatedArrivalTime: eta.toISOString(),
        toleranceMinutes: Number(this.toleranceMinutes),
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.origin = '';
          this.destination = '';
          this.toast.success(this.languageService.ui('Trayecto seguro iniciado.'));
          this.loadAll();
        },
        error: (err) => {
          this.busy.set(false);
          const msg = extractProblemMessage(err, 'No se pudo iniciar el trayecto.');
          this.errorMessage.set(msg);
          this.toast.error(msg);
        },
      });
  }

  sendPing(): void {
    const active = this.activeCommute();
    if (!active) return;

    this.busy.set(true);
    this.commuteService
      .recordTelemetry(active.id, {
        latitude: Number(this.pingLat),
        longitude: Number(this.pingLng),
        speed: Number(this.pingSpeed),
        recordedAt: new Date().toISOString(),
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.toast.success('GPS Ping registrado');
          this.loadActiveDetails(active.id);
        },
        error: (err) => {
          this.busy.set(false);
          this.toast.error(extractProblemMessage(err, 'Error al registrar ping GPS.'));
        },
      });
  }

  delayActiveCommute(): void {
    const active = this.activeCommute();
    if (!active) return;

    this.busy.set(true);
    this.commuteService.delayCommute(active.id, Number(this.delayMinutes)).subscribe({
      next: () => {
        this.busy.set(false);
        this.toast.info(`Demora reportada (+${this.delayMinutes} min)`);
        this.loadAll();
      },
      error: (err) => {
        this.busy.set(false);
        this.toast.error(extractProblemMessage(err, 'No se pudo reportar demora.'));
      },
    });
  }

  triggerIncident(): void {
    const active = this.activeCommute();
    if (!active) return;

    const description = this.incidentDescription.trim() || `Alerta ${this.incidentType} reportada`;
    this.busy.set(true);
    this.commuteService
      .triggerIncident(active.id, {
        type: this.incidentType,
        description,
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.incidentDescription = '';
          this.toast.error(`Incidente ${this.incidentType} emitido a contactos de confianza`);
          this.loadActiveDetails(active.id);
        },
        error: (err) => {
          this.busy.set(false);
          this.toast.error(extractProblemMessage(err, 'Error al emitir incidente.'));
        },
      });
  }

  resolveIncident(incidentId: string): void {
    const active = this.activeCommute();
    if (!active) return;

    this.commuteService.resolveIncident(incidentId).subscribe({
      next: () => {
        this.toast.success(this.languageService.ui('Incidente marcado como resuelto.'));
        this.loadActiveDetails(active.id);
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al resolver incidente.')),
    });
  }

  arriveSafe(): void {
    const active = this.activeCommute();
    if (!active) return;

    this.busy.set(true);
    this.commuteService.arriveCommute(active.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.toast.success(this.languageService.ui('Llegada segura confirmada.'));
        this.loadAll();
      },
      error: (err) => {
        this.busy.set(false);
        this.toast.error(extractProblemMessage(err, 'No se pudo confirmar llegada.'));
      },
    });
  }

  submitRouteRating(commuteId: string): void {
    this.busy.set(true);
    this.communityService
      .rateRoute({
        commuteId,
        score: Number(this.ratingScore),
        comments: this.ratingComments.trim(),
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.ratingTargetId.set(null);
          this.ratingComments = '';
          this.toast.success(this.languageService.ui('Calificación guardada.'));
          this.loadAll();
        },
        error: (err) => {
          this.busy.set(false);
          this.toast.error(extractProblemMessage(err, 'No se pudo calificar la ruta.'));
        },
      });
  }
}
