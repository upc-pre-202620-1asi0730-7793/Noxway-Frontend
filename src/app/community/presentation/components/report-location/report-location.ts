import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { circleMarker, layerGroup, map, tileLayer, type LayerGroup, type Map } from 'leaflet';
import { LanguageService } from '../../../../shared/infrastructure/language.service';

export interface ReportCoordinates {
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-report-location',
  standalone: true,
  template: `
    <div
      #map
      class="nx-location-map"
      [attr.aria-label]="languageService.ui('Mapa del lugar del aviso')"></div>
    <div class="nx-location-footer">
      <button type="button" class="nx-btn nx-btn-secondary nx-btn-sm" (click)="selectCenter()">
        {{ languageService.ui('Marcar el centro del mapa') }}
      </button>
      @if (location(); as point) {
        <p class="nx-location-status" role="status">
          {{ languageService.ui('Ubicación marcada') }} · {{ point.lat.toFixed(5) }},
          {{ point.lon.toFixed(5) }}
        </p>
      }
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: 10px;
    }
    .nx-location-map {
      height: 220px;
      border-radius: 10px;
      border: 1px solid var(--nx-border-strong);
      isolation: isolate;
      background: var(--nx-surface-inset);
    }
    .nx-location-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .nx-location-status {
      margin: 0;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--nx-primary-soft-text);
    }
  `,
})
export class ReportLocation implements AfterViewInit, OnDestroy {
  readonly languageService = inject(LanguageService);

  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private leafletMap?: Map;
  private markers?: LayerGroup;
  private resizeTimer?: ReturnType<typeof setTimeout>;

  readonly location = model<ReportCoordinates | null>(null);
  readonly initialCenter = input<ReportCoordinates>({ lat: -12.0464, lon: -77.0428 });

  constructor() {
    effect(() => {
      const point = this.location();
      this.markers?.clearLayers();
      if (point && this.markers) {
        circleMarker([point.lat, point.lon], {
          radius: 9,
          color: '#ffffff',
          weight: 2,
          fillColor: '#2563eb',
          fillOpacity: 1,
        }).addTo(this.markers);
      }
    });
  }

  ngAfterViewInit(): void {
    const startPoint = this.location() ?? this.initialCenter();
    this.leafletMap = map(this.container().nativeElement).setView(
      [startPoint.lat, startPoint.lon],
      14,
    );
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.leafletMap);
    this.markers = layerGroup().addTo(this.leafletMap);

    const existing = this.location();
    if (existing) {
      circleMarker([existing.lat, existing.lon], {
        radius: 9,
        color: '#ffffff',
        weight: 2,
        fillColor: '#2563eb',
        fillOpacity: 1,
      }).addTo(this.markers);
    }

    this.leafletMap.on('click', ({ latlng }) => {
      const wrapped = latlng.wrap();
      this.select(wrapped.lat, wrapped.lng);
    });

    // Ensure Leaflet measures container geometry properly after modal opens
    this.resizeTimer = setTimeout(() => this.leafletMap?.invalidateSize(), 60);
  }

  selectCenter(): void {
    const center = this.leafletMap?.getCenter().wrap();
    if (center) {
      this.select(center.lat, center.lng);
    }
  }

  private select(lat: number, lon: number): void {
    this.location.set({
      lat: Number(lat.toFixed(5)),
      lon: Number(lon.toFixed(5)),
    });
  }

  ngOnDestroy(): void {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    this.leafletMap?.remove();
    this.leafletMap = undefined;
  }
}
