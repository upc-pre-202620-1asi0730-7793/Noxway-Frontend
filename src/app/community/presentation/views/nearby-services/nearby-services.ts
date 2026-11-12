import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { localApi, SessionService } from '../../../../iam/infrastructure/session.service';
import { NearbyPlaces, type NearbyPlace } from './nearby-places';
import { AfterViewInit, Component, DestroyRef, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { circleMarker, latLng, layerGroup, map, tileLayer, type LayerGroup, type Map } from 'leaflet';
import { finalize, Subscription } from 'rxjs';

const categories = [
  { label: 'Todos', tag: 'all' },
  { label: 'Farmacias', tag: 'pharmacy' },
  { label: 'Supermercados', tag: 'supermarket' },
  { label: 'Grifos', tag: 'fuel' },
  { label: 'Zonas de riesgo', tag: 'risk' },
] as const;

interface LocatedNotice {
  id: string;
  title: string;
  details: string;
  location?: { lat: number; lon: number };
}

@Component({
  selector: 'app-nearby-services',
  imports: [RouterLink],
  templateUrl: './nearby-services.html',
  styleUrl: './nearby-services.css',
})
export class NearbyServices implements AfterViewInit, OnDestroy {
  private readonly nearbyPlaces = inject(NearbyPlaces);
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);
  private notices: LocatedNotice[] = [];
  private places: NearbyPlace[] = [];
  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private map?: Map;
  private markers?: LayerGroup;
  private search?: Subscription;

  readonly t = inject(LanguageService).ui;
  readonly categories = categories;
  readonly selected = signal<(typeof categories)[number]>(categories[0]);
  readonly results = signal<NearbyPlace[]>([]);
  readonly selectedPlace = signal<NearbyPlace | null>(null);
  readonly only24Hours = signal(false);
  readonly noticeError = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly locationError = signal('');

  ngAfterViewInit(): void {
    this.map = map(this.container().nativeElement).setView([-12.0464, -77.0428], 13);
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://openfreemap.org">OpenFreeMap</a> · <a href="https://openmaptiles.org">OpenMapTiles</a>',
    }).addTo(this.map);
    this.markers = layerGroup().addTo(this.map);
    this.load();
    this.http.get<LocatedNotice[]>(`${localApi}/me/records/community`, this.session.requestOptions())
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (notices) => {
          this.notices = notices.filter(({ details, location }) => location && details.startsWith('Aviso de seguridad · '));
          this.renderPlaces();
        },
        error: () => this.noticeError.set(true),
      });
  }

  select(category: (typeof categories)[number]): void {
    this.selected.set(category);
    if (category.tag === 'risk') this.only24Hours.set(false);
    this.selectedPlace.set(null);
    this.renderPlaces();
  }

  toggle24Hours(): void {
    this.only24Hours.update((enabled) => !enabled);
    this.selectedPlace.set(null);
    this.renderPlaces();
  }

  locate(): void {
    this.locationError.set('');
    const unavailable = () => this.locationError.set('No se pudo obtener tu ubicación. Mueve el mapa y busca en esa zona.');
    if (!navigator.geolocation) {
      unavailable();
      return;
    }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (!this.map) return;
      this.map.setView([coords.latitude, coords.longitude], 13);
      this.load();
    }, unavailable, { timeout: 8000 });
  }

  load(): void {
    if (!this.map) return;
    this.search?.unsubscribe();
    this.places = [];
    this.selectedPlace.set(null);
    this.renderPlaces();
    this.error.set('');
    this.loading.set(true);

    this.search = this.nearbyPlaces.load(this.map.getCenter())
      .pipe(finalize(() => this.loading.set(false))).subscribe({
        next: (places) => {
          this.places = places;
          this.renderPlaces();
        },
        error: () => this.error.set('No se pudieron cargar los servicios de OpenStreetMap. Vuelve a intentarlo.'),
      });
  }

  private renderPlaces(): void {
    const category = this.selected().tag;
    const center = this.map?.getCenter();
    const risks: NearbyPlace[] = center ? this.notices.flatMap((notice) => {
      if (!notice.location) return [];
      const { lat, lon } = notice.location;
      const distance = center.distanceTo(latLng(lat, lon));
      return distance <= 3000 ? [{ id: notice.id, category: 'risk', name: notice.title, lat, lon, distance }] : [];
    }) : [];
    const places = [...this.places, ...risks]
      .filter((place) => (category === 'all' || place.category === category) && (!this.only24Hours() || place.openAllDay))
      .sort((left, right) => left.distance - right.distance).slice(0, 40);
    this.markers?.clearLayers();
    this.results.set(places);
    for (const place of places) {
      const label = document.createElement('span');
      label.textContent = this.placeName(place);
      if (this.markers) {
        circleMarker([place.lat, place.lon], { radius: 8, color: '#fff', weight: 2, fillColor: place.category === 'risk' ? '#ef4444' : place.category === 'pharmacy' ? '#10b981' : '#2563eb', fillOpacity: 1 })
          .bindTooltip(label).on('click', () => this.selectedPlace.set(place)).addTo(this.markers);
      }
    }
  }

  categoryLabel(place: NearbyPlace): string {
    return this.t(categories.find(({ tag }) => tag === place.category)?.label ?? 'Servicios Cercanos');
  }

  placeName(place: NearbyPlace): string {
    return place.name || this.t('Establecimiento sin nombre');
  }

  focus(place: NearbyPlace): void {
    this.selectedPlace.set(place);
    this.map?.setView([place.lat, place.lon], 17);
  }

  placeUrl(place: NearbyPlace): string {
    return `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=17/${place.lat}/${place.lon}`;
  }

  ngOnDestroy(): void {
    this.search?.unsubscribe();
    this.map?.remove();
    this.map = undefined;
  }
}
