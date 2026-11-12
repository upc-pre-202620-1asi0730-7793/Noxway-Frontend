import { AfterViewInit, Component, effect, ElementRef, inject, model, OnDestroy, viewChild } from '@angular/core';
import { circleMarker, layerGroup, map, tileLayer, type LayerGroup, type Map } from 'leaflet';
import { LanguageService } from '../../../infrastructure/language.service';

export interface ReportCoordinates {
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-report-location',
  template: `
    <div #map class="location-map" [attr.aria-label]="t('Mapa del lugar del aviso')"></div>
    <button type="button" (click)="selectCenter()">{{ t('Marcar el centro del mapa') }}</button>
    @if (location(); as point) {
      <p role="status">{{ t('Ubicación marcada') }} · {{ point.lat.toFixed(5) }}, {{ point.lon.toFixed(5) }}</p>
    }
  `,
  styles: `
    :host { display: grid; gap: 8px; }
    .location-map { height: 240px; border-radius: 8px; isolation: isolate; background: #182641; }
    button { justify-self: start; padding: 7px 10px; background: #172642; border: 1px solid #415779; border-radius: 8px; color: #f8fafc; font: inherit; cursor: pointer; }
    p { margin: 0; color: #bfdbfe; }
  `,
})
export class ReportLocation implements AfterViewInit, OnDestroy {
  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private map?: Map;
  private markers?: LayerGroup;
  readonly location = model<ReportCoordinates | null>(null);
  readonly t = inject(LanguageService).ui;

  constructor() {
    effect(() => {
      const point = this.location();
      this.markers?.clearLayers();
      if (point && this.markers) {
        circleMarker([point.lat, point.lon], { radius: 9, color: '#fff', weight: 2, fillColor: '#2563eb', fillOpacity: 1 })
          .addTo(this.markers);
      }
    });
  }

  ngAfterViewInit(): void {
    this.map = map(this.container().nativeElement).setView([-12.0464, -77.0428], 13);
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
    this.markers = layerGroup().addTo(this.map);
    this.map.on('click', ({ latlng }) => this.select(latlng.lat, latlng.wrap().lng));
  }

  selectCenter(): void {
    const center = this.map?.getCenter().wrap();
    if (center) this.select(center.lat, center.lng);
  }

  private select(lat: number, lon: number): void {
    this.location.set({ lat: Number(lat.toFixed(5)), lon: Number(lon.toFixed(5)) });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
