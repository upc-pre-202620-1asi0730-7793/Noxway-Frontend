import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { isOpenAt, localTime } from '../../../domain/model/service-hours';
import { MapPoint } from '../../../domain/model/service-point.entity';
import { CommunityService } from '../../../infrastructure/community.service';

@Component({
  selector: 'app-map-view',
  imports: [FormsModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule],
  templateUrl: './map-view.html',
  styleUrl: './map-view.css',
})
export class MapView implements OnInit {
  private readonly communityService = inject(CommunityService);

  readonly allPoints = signal<MapPoint[]>([]);
  readonly selectedFilter = signal<string>('all');
  readonly selectedPoint = signal<MapPoint | null>(null);
  readonly availability = signal<'all' | 'now' | 'arrival'>('all');
  readonly arrivalTime = signal('12:00');
  readonly clock = signal(new Date());
  readonly zoomLevel = signal<number>(1);

  readonly filteredPoints = computed(() => {
    const f = this.selectedFilter();
    const pts = this.allPoints();
    return pts.filter(p => (f === 'all' || p.type === f) &&
      (this.availability() === 'all' || isOpenAt(p,
        this.availability() === 'arrival' ? this.arrivalTime() : localTime(p, this.clock()))));
  });

  ngOnInit(): void {
    this.communityService.getMapPoints().subscribe((points) => {
      this.allPoints.set(points);
      if (points.length > 0) {
        this.selectedPoint.set(points[0]);
      }
    });
  }

  setFilter(filter: string): void {
    this.selectedFilter.set(filter);
    this.syncSelection();
  }

  refreshAvailability(): void {
    this.clock.set(new Date());
    this.syncSelection();
  }

  syncSelection(): void {
    const visible = this.filteredPoints();
    if (!visible.some(p => p.id === this.selectedPoint()?.id)) this.selectedPoint.set(visible[0] ?? null);
  }

  selectPointById(id: number): void {
    const point = this.filteredPoints().find(p => p.id === id);
    if (point) this.selectedPoint.set(point);
  }

  countType(type: string): number { return this.allPoints().filter(p => p.type === type).length; }

  hasPoint(id: number): boolean { return this.filteredPoints().some(p => p.id === id); }

  hoursLabel(point: MapPoint): string {
    return point.openingHours?.map(h => h.opens + '–' + h.closes).join(', ') || 'Horario por verificar';
  }

  selectPoint(point: MapPoint): void {
    this.selectedPoint.set(point);
  }

  zoomIn(): void {
    const z = this.zoomLevel();
    if (z < 1.7) this.zoomLevel.set(Math.round((z + 0.2) * 10) / 10);
  }

  zoomOut(): void {
    const z = this.zoomLevel();
    if (z > 0.8) this.zoomLevel.set(Math.round((z - 0.2) * 10) / 10);
  }

  resetZoom(): void {
    this.zoomLevel.set(1);
  }

  onAddRoute(): void {
    alert(`Punto agregado: ${this.selectedPoint()?.name} ha sido añadido a tu trayecto activo.`);
  }

  onVerify(): void {
    alert(
      `Confirmación registrada: Has validado la veracidad de las medidas de seguridad de este local.`,
    );
  }

  onReportLocal(): void {
    const local = prompt('Ingrese el nombre, dirección y horario del servicio cercano a registrar:');
    if (local) {
      alert(`Local "${local}" enviado a revisión comunitaria.`);
    }
  }

  onReportDanger(): void {
    const danger = prompt('Describe la zona de riesgo o poste apagado:');
    if (danger) {
      alert(`Alerta de riesgo comunitaria reportada para verificación.`);
    }
  }
}
