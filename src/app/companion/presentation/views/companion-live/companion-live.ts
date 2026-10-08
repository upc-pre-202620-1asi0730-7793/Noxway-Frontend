import { Component, inject, OnInit, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CompanionService } from '../../../infrastructure/companion.service';
import { CompanionLiveInfo } from '../../../domain/model/companion.entity';

export interface TacticalCheckpoint {
  id: string;
  name: string;
  time?: string;
  type: 'origin' | 'checkpoint' | 'current' | 'hospital' | 'destination';
  detail: string;
  status: 'passed' | 'current' | 'pending';
}

@Component({
  selector: 'app-companion-live',
  imports: [
    UpperCasePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './companion-live.html',
  styleUrl: './companion-live.css',
})
export class CompanionLive implements OnInit {
  private readonly companionService = inject(CompanionService);

  readonly liveInfo = signal<CompanionLiveInfo | null>(null);
  readonly pingSent = signal<boolean>(false);

  // Tactical Map Controls
  readonly zoomLevel = signal<number>(1);
  readonly activeView = signal<'all' | 'jorge' | 'origin' | 'destination'>('all');
  readonly layerCorridor = signal<boolean>(true);
  readonly layerSerenazgo = signal<boolean>(true);
  readonly layerMedical = signal<boolean>(true);
  readonly layerRisk = signal<boolean>(true);
  readonly selectedPoint = signal<TacticalCheckpoint | null>(null);

  readonly checkpoints: TacticalCheckpoint[] = [
    {
      id: 'origin',
      name: 'Urb. Mercurio (Los Olivos)',
      time: '02:22 AM',
      type: 'origin',
      detail: 'Punto de partida residencial seguro. Inicio de trayecto.',
      status: 'passed',
    },
    {
      id: 'habich',
      name: 'Óvalo Habich (SMP)',
      time: '02:35 AM',
      type: 'checkpoint',
      detail: 'Intercambio vial superado a 40 km/h. Alumbrado óptimo.',
      status: 'passed',
    },
    {
      id: 'bridge',
      name: 'Puente del Ejército (Río Rímac)',
      time: '02:41 AM',
      type: 'checkpoint',
      detail: 'Cruce fluvial con patrulla de serenazgo visible.',
      status: 'passed',
    },
    {
      id: 'hospital',
      name: 'Hospital Nacional Arzobispo Loayza',
      time: '02:43 AM',
      type: 'hospital',
      detail: 'Puesto médico de auxilio 24h activo en la ruta.',
      status: 'passed',
    },
    {
      id: 'current',
      name: 'Av. Alfonso Ugarte con Colonial',
      time: '02:45 AM (Ahora)',
      type: 'current',
      detail: 'Ubicación actual en vivo. Velocidad 42 km/h. Batería 84%.',
      status: 'current',
    },
    {
      id: 'destination',
      name: 'Torre Financiera San Isidro',
      time: '03:12 AM (ETA)',
      type: 'destination',
      detail: 'Centro de trabajo laboral (Sede Securitas Perú).',
      status: 'pending',
    },
  ];

  ngOnInit(): void {
    this.companionService.getLiveInfo().subscribe((info) => {
      this.liveInfo.set(info);
    });
  }

  // Zoom and Pan Handlers
  zoomIn(): void {
    const cur = this.zoomLevel();
    if (cur < 1.8) {
      this.zoomLevel.set(Math.round((cur + 0.2) * 10) / 10);
    }
  }

  zoomOut(): void {
    const cur = this.zoomLevel();
    if (cur > 0.8) {
      this.zoomLevel.set(Math.round((cur - 0.2) * 10) / 10);
    }
  }

  resetView(): void {
    this.zoomLevel.set(1);
    this.activeView.set('all');
    this.selectedPoint.set(null);
  }

  focusOnJorge(): void {
    this.zoomLevel.set(1.4);
    this.activeView.set('jorge');
    const jorgePt = this.checkpoints.find((c) => c.type === 'current');
    if (jorgePt) this.selectedPoint.set(jorgePt);
  }

  focusOnDestination(): void {
    this.zoomLevel.set(1.4);
    this.activeView.set('destination');
    const destPt = this.checkpoints.find((c) => c.type === 'destination');
    if (destPt) this.selectedPoint.set(destPt);
  }

  toggleLayer(layer: 'corridor' | 'serenazgo' | 'medical' | 'risk'): void {
    if (layer === 'corridor') this.layerCorridor.update((v) => !v);
    if (layer === 'serenazgo') this.layerSerenazgo.update((v) => !v);
    if (layer === 'medical') this.layerMedical.update((v) => !v);
    if (layer === 'risk') this.layerRisk.update((v) => !v);
  }

  selectPoint(point: TacticalCheckpoint): void {
    this.selectedPoint.set(point);
  }

  closePointDetail(): void {
    this.selectedPoint.set(null);
  }

  // Call & Ping Actions
  onCallWorker(): void {
    const info = this.liveInfo();
    const phone = info ? info.workerPhone : '+51 987 654 321';
    alert(`Llamando a Jorge Luis Huamán al ${phone}...`);
  }

  onSendWhatsAppPing(): void {
    this.pingSent.set(true);
    alert('Ping de verificación enviado vía WhatsApp a Jorge. Esperando acuse de recibo...');
    setTimeout(() => {
      this.pingSent.set(false);
    }, 4000);
  }
}
