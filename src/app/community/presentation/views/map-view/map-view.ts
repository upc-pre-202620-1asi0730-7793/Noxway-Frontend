import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import {
  RiskZoneResource,
  ServicePointResource,
} from '../../../domain/model/service-point.entity';
import { CommunityService } from '../../../infrastructure/community.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map-view.html',
  styleUrl: './map-view.css',
})
export class MapView {
  private readonly communityService = inject(CommunityService);
  private readonly toast = inject(NotificationToastService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly services = signal<ServicePointResource[]>([]);
  readonly riskZones = signal<RiskZoneResource[]>([]);
  readonly selectedService = signal<ServicePointResource | null>(null);

  readonly category = signal<string>('ALL');
  readonly openOnly = signal(false);
  readonly filterNearLima = signal(false);

  readonly categories = ['ALL', 'PHARMACY', 'GAS_STATION', 'HOSPITAL', 'POLICE_STATION'];

  private readonly mapBounds = computed(() => {
    const activeZones = this.riskZones().filter((zone) => zone.status !== 'RESOLVED');
    const lats = [
      ...this.services().map((item) => item.latitude),
      ...activeZones.map((zone) => zone.latitude),
    ];
    const lngs = [
      ...this.services().map((item) => item.longitude),
      ...activeZones.map((zone) => zone.longitude),
    ];
    const minLat = Math.min(-12.16, ...lats);
    const maxLat = Math.max(-11.94, ...lats);
    const minLng = Math.min(-77.14, ...lngs);
    const maxLng = Math.max(-76.96, ...lngs);
    return {
      minLat,
      maxLat: maxLat > minLat ? maxLat : minLat + 0.01,
      minLng,
      maxLng: maxLng > minLng ? maxLng : minLng + 0.01,
    };
  });

  readonly mapPins = computed(() => {
    const bounds = this.mapBounds();
    return this.services().map((item) => ({
      service: item,
      leftPct: this.toPercent(item.longitude, bounds.minLng, bounds.maxLng),
      topPct: 100 - this.toPercent(item.latitude, bounds.minLat, bounds.maxLat),
    }));
  });

  readonly riskPins = computed(() => {
    const bounds = this.mapBounds();
    return this.riskZones()
      .filter((zone) => zone.status !== 'RESOLVED')
      .map((zone) => ({
        zone,
        leftPct: this.toPercent(zone.longitude, bounds.minLng, bounds.maxLng),
        topPct: 100 - this.toPercent(zone.latitude, bounds.minLat, bounds.maxLat),
      }));
  });

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadMapData());
    });
  }

  loadMapData(): void {
    this.loading.set(true);

    forkJoin({
      services: this.communityService
        .listServices({
          type: this.category(),
          openOnly: this.openOnly(),
          ...(this.filterNearLima()
            ? { latitude: -12.0464, longitude: -77.0428, radiusKm: 15 }
            : {}),
          size: 50,
        })
        .pipe(catchError(() => of(null))),
      riskZones: this.communityService.listRiskZones(0, 30).pipe(catchError(() => of(null))),
    }).subscribe(({ services, riskZones }) => {
      const list = services?.items ?? [];
      this.services.set(list);
      this.riskZones.set(riskZones?.items ?? []);
      const currentSelectedId = this.selectedService()?.id;
      this.selectedService.set(
        list.find((s) => s.id === currentSelectedId) ?? list[0] ?? null,
      );
      this.loading.set(false);
    });
  }

  setCategory(cat: string): void {
    this.category.set(cat);
    this.loadMapData();
  }

  toggleOpenOnly(): void {
    this.openOnly.update((val) => !val);
    this.loadMapData();
  }

  toggleRadius(): void {
    this.filterNearLima.update((val) => !val);
    this.loadMapData();
  }

  vote(serviceId: string, direction: -1 | 0 | 1): void {
    this.communityService.voteService(serviceId, direction).subscribe({
      next: () => {
        this.toast.success(this.languageService.ui('Voto registrado en el servicio.'));
        this.loadMapData();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'No se pudo registrar el voto.')),
    });
  }

  resolveZone(zoneId: string): void {
    this.communityService.resolveRiskZone(zoneId).subscribe({
      next: () => {
        this.toast.success(this.languageService.ui('Zona de riesgo marcada como resuelta.'));
        this.loadMapData();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al resolver zona.')),
    });
  }

  dayLabel(dayOfWeek: number): string {
    return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][dayOfWeek - 1] ?? `D${dayOfWeek}`;
  }

  private toPercent(val: number, min: number, max: number): number {
    const raw = ((val - min) / (max - min)) * 100;
    return Math.min(92, Math.max(8, raw));
  }
}
