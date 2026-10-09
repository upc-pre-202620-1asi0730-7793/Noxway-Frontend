import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MapPoint } from '../../../domain/model/night-service.entity';
import { CommunityService } from '../../../infrastructure/community.service';

@Component({
  selector: 'app-map-view',
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatChipsModule],
  templateUrl: './map-view.html',
  styleUrl: './map-view.css',
})
export class MapView implements OnInit {
  private readonly communityService = inject(CommunityService);

  readonly allPoints = signal<MapPoint[]>([]);
  readonly selectedFilter = signal<string>('all');
  readonly selectedPoint = signal<MapPoint | null>(null);
  readonly zoomLevel = signal<number>(1);

  readonly filteredPoints = computed(() => {
    const f = this.selectedFilter();
    const pts = this.allPoints();
    if (f === 'all') return pts;
    return pts.filter((p) => p.type === f);
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
    const local = prompt('Ingrese el nombre y dirección del local 24h a registrar:');
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
