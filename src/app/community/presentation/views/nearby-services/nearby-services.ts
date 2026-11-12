import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { circleMarker, latLng, layerGroup, map, tileLayer, type LayerGroup, type Map } from 'leaflet';
import { finalize, Subscription, timeout } from 'rxjs';

interface OverpassPlace {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface NearbyPlace {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance: number;
}

const categories = [
  { label: 'Farmacias', tag: 'amenity=pharmacy' },
  { label: 'Supermercados', tag: 'shop=supermarket' },
  { label: 'Grifos', tag: 'amenity=fuel' },
] as const;

@Component({
  templateUrl: './nearby-services.html',
  styleUrl: './nearby-services.css',
})
export class NearbyServices implements AfterViewInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private map?: Map;
  private markers?: LayerGroup;
  private search?: Subscription;

  readonly t = inject(LanguageService).ui;
  readonly categories = categories;
  readonly selected = signal<(typeof categories)[number]>(categories[0]);
  readonly results = signal<NearbyPlace[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly locationError = signal('');

  ngAfterViewInit(): void {
    this.map = map(this.container().nativeElement).setView([-12.0464, -77.0428], 13);
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
    this.markers = layerGroup().addTo(this.map);
    this.load();
  }

  select(category: (typeof categories)[number]): void {
    this.selected.set(category);
    this.load();
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
    const center = this.map.getCenter();
    const query = `[out:json][timeout:15];nwr[${this.selected().tag}](around:3000,${center.lat.toFixed(3)},${center.lng.toFixed(3)});out center;`;

    this.markers?.clearLayers();
    this.results.set([]);
    this.error.set('');
    this.loading.set(true);

    this.search = this.http.get<{ elements: OverpassPlace[] }>(
      'https://overpass.private.coffee/api/interpreter', { params: { data: query } },
    ).pipe(timeout(20000), finalize(() => this.loading.set(false))).subscribe({
      next: ({ elements }) => {
        const places = elements.flatMap((element) => {
          const lat = element.lat ?? element.center?.lat;
          const lon = element.lon ?? element.center?.lon;
          if (lat === undefined || lon === undefined) return [];
          return [{
            id: `${element.type}/${element.id}`, name: element.tags?.['name'] || element.tags?.['brand'] || '',
            lat, lon, distance: center.distanceTo(latLng(lat, lon)),
          }];
        }).sort((left, right) => left.distance - right.distance).slice(0, 40);
        this.results.set(places);
        for (const place of places) {
          const label = document.createElement('span');
          label.textContent = this.placeName(place);
          if (this.markers) {
            circleMarker([place.lat, place.lon], { radius: 8, color: '#fff', weight: 2, fillColor: '#2563eb', fillOpacity: 1 })
              .bindTooltip(label).addTo(this.markers);
          }
        }
      },
      error: () => this.error.set('No se pudieron cargar los servicios de OpenStreetMap. Vuelve a intentarlo.'),
    });
  }

  placeName(place: NearbyPlace): string {
    return place.name || this.t('Establecimiento sin nombre');
  }

  focus(place: NearbyPlace): void {
    this.map?.setView([place.lat, place.lon], 17);
  }

  ngOnDestroy(): void {
    this.search?.unsubscribe();
    this.map?.remove();
    this.map = undefined;
  }
}
