import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  circleMarker,
  latLng,
  layerGroup,
  map,
  tileLayer,
  type LayerGroup,
  type Map,
} from 'leaflet';
import { Subscription, catchError, finalize, forkJoin, of } from 'rxjs';
import { CommunityPostResource } from '../../../domain/model/community-post.entity';
import {
  RiskZoneResource,
  ServicePointResource,
} from '../../../domain/model/service-point.entity';
import { CommunityService } from '../../../infrastructure/community.service';
import {
  NEARBY_RADIUS_METERS,
  NearbyPlacesService,
  type NearbyPlace,
} from '../../../infrastructure/nearby-places.service';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

export type MapCategoryTag = 'all' | 'pharmacy' | 'supermarket' | 'fuel' | 'noxway' | 'risk';

export interface MapCategoryOption {
  tag: MapCategoryTag;
  label: string;
}

export interface UnifiedMapItem {
  id: string;
  source: 'osm' | 'service' | 'risk' | 'post';
  category: Exclude<MapCategoryTag, 'all'>;
  typeLabel: string;
  name: string;
  subtitle?: string;
  lat: number;
  lon: number;
  distance: number;
  openAllDay?: boolean;
  openNow?: boolean;
  service?: ServicePointResource;
  riskZone?: RiskZoneResource;
  post?: CommunityPostResource;
}

const CATEGORIES: readonly MapCategoryOption[] = [
  { tag: 'all', label: 'Todos' },
  { tag: 'pharmacy', label: 'Farmacias' },
  { tag: 'supermarket', label: 'Supermercados' },
  { tag: 'fuel', label: 'Grifos' },
  { tag: 'noxway', label: 'Puntos Noxway 24h' },
  { tag: 'risk', label: 'Zonas de riesgo' },
];

const DEFAULT_CENTER = { lat: -12.0464, lon: -77.0428 };

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './map-view.html',
  styleUrl: './map-view.css',
})
export class MapView implements AfterViewInit, OnDestroy {
  private readonly communityService = inject(CommunityService);
  private readonly nearbyPlaces = inject(NearbyPlacesService);
  private readonly toast = inject(NotificationToastService);
  private readonly destroyRef = inject(DestroyRef);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private leafletMap?: Map;
  private markers?: LayerGroup;
  private poiSubscription?: Subscription;

  readonly categories = CATEGORIES;
  readonly selectedCategory = signal<MapCategoryOption>(CATEGORIES[0]);
  readonly only24Hours = signal(false);

  readonly loadingOsm = signal(false);
  readonly loadingBackend = signal(false);
  readonly osmError = signal('');
  readonly locationError = signal('');

  readonly centerLat = signal(DEFAULT_CENTER.lat);
  readonly centerLon = signal(DEFAULT_CENTER.lon);

  private readonly osmPlaces = signal<NearbyPlace[]>([]);
  private readonly backendServices = signal<ServicePointResource[]>([]);
  private readonly riskZones = signal<RiskZoneResource[]>([]);
  private readonly communityPosts = signal<CommunityPostResource[]>([]);

  readonly selectedItem = signal<UnifiedMapItem | null>(null);

  readonly visibleItems = computed<UnifiedMapItem[]>(() => {
    const center = latLng(this.centerLat(), this.centerLon());
    const catTag = this.selectedCategory().tag;
    const only24 = this.only24Hours();

    const mappedOsm: UnifiedMapItem[] = this.osmPlaces().map((place) => ({
      id: `osm:${place.id}`,
      source: 'osm',
      category:
        place.category === 'pharmacy' || place.category === 'fuel'
          ? place.category
          : 'supermarket',
      typeLabel: this.osmCategoryLabel(place.category),
      name: place.name,
      lat: place.lat,
      lon: place.lon,
      distance: place.distance,
      openAllDay: place.openAllDay,
    }));

    const mappedServices: UnifiedMapItem[] = this.backendServices().map((svc) => {
      const distance = center.distanceTo(latLng(svc.latitude, svc.longitude));
      const has24h = svc.openingHours.some((slot) => slot.is24Hours);
      return {
        id: `svc:${svc.id}`,
        source: 'service',
        category: this.mapServiceCategory(svc.type),
        typeLabel: `${this.serviceTypeLabel(svc.type)} · Noxway`,
        name: svc.name,
        subtitle: svc.reporterName,
        lat: svc.latitude,
        lon: svc.longitude,
        distance,
        openAllDay: has24h,
        openNow: svc.openAtReference,
        service: svc,
      };
    });

    const mappedRisks: UnifiedMapItem[] = this.riskZones()
      .filter((zone) => zone.status !== 'RESOLVED')
      .map((zone) => {
        const distance = center.distanceTo(latLng(zone.latitude, zone.longitude));
        return {
          id: `risk:${zone.id}`,
          source: 'risk',
          category: 'risk',
          typeLabel: `${this.languageService.ui('Zona de riesgo')} · ${zone.riskLevel}`,
          name: zone.description,
          subtitle: zone.reporterName,
          lat: zone.latitude,
          lon: zone.longitude,
          distance,
          riskZone: zone,
        };
      })
      .filter((item) => item.distance <= NEARBY_RADIUS_METERS * 3);

    const mappedPosts: UnifiedMapItem[] = this.communityPosts()
      .filter(
        (post): post is CommunityPostResource & { latitude: number; longitude: number } =>
          post.latitude != null && post.longitude != null,
      )
      .map((post) => {
        const distance = center.distanceTo(latLng(post.latitude, post.longitude));
        const isSecurityNotice =
          !post.category || post.category.toLowerCase().includes('seguridad');
        return {
          id: `post:${post.id}`,
          source: 'post',
          category: isSecurityNotice ? 'risk' : 'noxway',
          typeLabel: post.category || this.languageService.ui('Aviso de seguridad'),
          name: post.title,
          subtitle: `${post.district} · ${post.authorName || 'Noxway'}`,
          lat: post.latitude,
          lon: post.longitude,
          distance,
          post,
        };
      })
      .filter((item) => item.distance <= NEARBY_RADIUS_METERS * 3);

    const combined = [...mappedServices, ...mappedOsm, ...mappedRisks, ...mappedPosts]
      .filter((item) => {
        if (catTag === 'noxway') return item.source === 'service';
        if (catTag !== 'all' && item.category !== catTag) return false;
        if (only24 && catTag !== 'risk' && !item.openAllDay) return false;
        return true;
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 60);

    return combined;
  });

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadBackendData());
    });

    effect(() => {
      const items = this.visibleItems();
      const selectedId = this.selectedItem()?.id;
      if (selectedId) {
        const refreshed = items.find((item) => item.id === selectedId);
        if (refreshed && refreshed !== this.selectedItem()) {
          this.selectedItem.set(refreshed);
        }
      }
      this.syncMarkers(items);
    });
  }

  ngAfterViewInit(): void {
    this.leafletMap = map(this.container().nativeElement).setView(
      [DEFAULT_CENTER.lat, DEFAULT_CENTER.lon],
      13,
    );
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://openfreemap.org">OpenFreeMap</a>',
    }).addTo(this.leafletMap);

    this.markers = layerGroup().addTo(this.leafletMap);
    this.leafletMap.on('moveend', () => {
      const current = this.leafletMap?.getCenter().wrap();
      if (current) {
        this.centerLat.set(current.lat);
        this.centerLon.set(current.lng);
      }
    });

    this.searchArea();
  }

  selectCategory(cat: MapCategoryOption): void {
    this.selectedCategory.set(cat);
    if (cat.tag === 'risk') {
      this.only24Hours.set(false);
    }
    this.selectedItem.set(null);
  }

  toggleOnly24Hours(): void {
    this.only24Hours.update((enabled) => !enabled);
    this.selectedItem.set(null);
  }

  locate(): void {
    this.locationError.set('');
    const unavailable = () =>
      this.locationError.set(
        this.languageService.ui(
          'No se pudo obtener tu ubicación. Mueve el mapa y busca en esa zona.',
        ),
      );
    if (!navigator.geolocation) {
      unavailable();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.centerLat.set(coords.latitude);
        this.centerLon.set(coords.longitude);
        this.leafletMap?.setView([coords.latitude, coords.longitude], 14);
        this.searchArea();
      },
      unavailable,
      { timeout: 8000 },
    );
  }

  searchArea(): void {
    if (!this.leafletMap) return;
    const mapCenter = this.leafletMap.getCenter().wrap();
    this.centerLat.set(mapCenter.lat);
    this.centerLon.set(mapCenter.lng);

    this.poiSubscription?.unsubscribe();
    this.osmError.set('');
    this.loadingOsm.set(true);

    this.poiSubscription = this.nearbyPlaces
      .load(mapCenter)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingOsm.set(false)),
      )
      .subscribe({
        next: (places) => this.osmPlaces.set(places),
        error: () =>
          this.osmError.set(
            this.languageService.ui(
              'No se pudieron cargar los servicios de OpenStreetMap. Vuelve a intentarlo.',
            ),
          ),
      });

    this.loadBackendData();
  }

  loadBackendData(): void {
    this.loadingBackend.set(true);
    forkJoin({
      services: this.communityService.listServices({ size: 80 }).pipe(catchError(() => of(null))),
      riskZones: this.communityService.listRiskZones(0, 50).pipe(catchError(() => of(null))),
      posts: this.communityService.listPosts(undefined, 0, 50).pipe(catchError(() => of(null))),
    })
      .pipe(finalize(() => this.loadingBackend.set(false)))
      .subscribe(({ services, riskZones, posts }) => {
        this.backendServices.set(services?.items ?? []);
        this.riskZones.set(riskZones?.items ?? []);
        this.communityPosts.set(posts?.items ?? []);
      });
  }

  focusItem(item: UnifiedMapItem): void {
    this.selectedItem.set(item);
    this.leafletMap?.setView([item.lat, item.lon], 16, { animate: true });
  }

  voteService(serviceId: string, direction: -1 | 0 | 1): void {
    this.communityService.voteService(serviceId, direction).subscribe({
      next: () => {
        this.toast.success(this.languageService.ui('Voto registrado en el servicio.'));
        this.loadBackendData();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'No se pudo registrar el voto.')),
    });
  }

  resolveZone(zoneId: string): void {
    this.communityService.resolveRiskZone(zoneId).subscribe({
      next: () => {
        this.toast.success(this.languageService.ui('Zona de riesgo marcada como resuelta.'));
        this.selectedItem.set(null);
        this.loadBackendData();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Error al resolver zona.')),
    });
  }

  reportQueryParams(action: 'service' | 'risk'): Record<string, string> {
    return {
      action,
      lat: this.centerLat().toFixed(5),
      lng: this.centerLon().toFixed(5),
    };
  }

  itemTitle(item: UnifiedMapItem): string {
    return item.name || this.languageService.ui('Establecimiento sin nombre');
  }

  osmExternalUrl(item: UnifiedMapItem): string {
    return `https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lon}#map=17/${item.lat}/${item.lon}`;
  }

  dayLabel(dayOfWeek: number): string {
    return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][dayOfWeek - 1] ?? `D${dayOfWeek}`;
  }

  private syncMarkers(items: UnifiedMapItem[]): void {
    if (!this.markers) return;
    this.markers.clearLayers();
    const selectedId = this.selectedItem()?.id;

    for (const item of items) {
      const tooltipEl = document.createElement('span');
      tooltipEl.textContent = this.itemTitle(item);
      const isSelected = item.id === selectedId;
      circleMarker([item.lat, item.lon], {
        radius: isSelected ? 10 : 8,
        color: isSelected ? '#93c5fd' : '#ffffff',
        weight: isSelected ? 3 : 2,
        fillColor: this.markerColor(item),
        fillOpacity: 0.95,
      })
        .bindTooltip(tooltipEl)
        .on('click', () => this.selectedItem.set(item))
        .addTo(this.markers);
    }
  }

  private markerColor(item: UnifiedMapItem): string {
    if (item.category === 'risk') return '#ef4444';
    if (item.category === 'pharmacy') return '#10b981';
    if (item.category === 'fuel') return '#f59e0b';
    return '#2563eb';
  }

  private mapServiceCategory(type: string): Exclude<MapCategoryTag, 'all'> {
    if (type === 'PHARMACY') return 'pharmacy';
    if (type === 'GAS_STATION') return 'fuel';
    return 'noxway';
  }

  private serviceTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      PHARMACY: this.languageService.ui('Farmacia'),
      GAS_STATION: this.languageService.ui('Grifo'),
      HOSPITAL: this.languageService.ui('Hospital / Clínica'),
      POLICE_STATION: this.languageService.ui('Comisaría / Serenazgo'),
      OTHER: this.languageService.ui('Otro servicio'),
    };
    return labels[type] ?? type;
  }

  private osmCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      pharmacy: this.languageService.ui('Farmacia'),
      supermarket: this.languageService.ui('Supermercado'),
      fuel: this.languageService.ui('Grifo'),
    };
    return labels[category] ?? this.languageService.ui('Servicios Cercanos');
  }

  ngOnDestroy(): void {
    this.poiSubscription?.unsubscribe();
    this.leafletMap?.remove();
    this.leafletMap = undefined;
  }
}
