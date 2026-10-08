import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Commute, CommuteCheckpoint, TelemetryPing } from '../../../domain/model/commute.entity';
import { CommuteService } from '../../../infrastructure/commute.service';

@Component({
  selector: 'app-journey',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './journey.html',
  styleUrl: './journey.css',
})
export class Journey implements OnInit {
  private readonly commuteService = inject(CommuteService);

  readonly commute = signal<Commute | null>(null);
  readonly progressPercentage = signal<number>(65);
  readonly isCompleted = signal<boolean>(false);

  ngOnInit(): void {
    this.commuteService.getActiveCommute().subscribe((data) => {
      this.commute.set(data);
    });
  }

  confirmArrival(): void {
    const current = this.commute();
    if (!current) return;

    this.isCompleted.set(true);
    this.progressPercentage.set(100);

    const updatedCheckpoints: CommuteCheckpoint[] = current.checkpoints.map((cp) => ({
      ...cp,
      completed: true,
    }));

    const newPing: TelemetryPing = {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      message:
        'Llegada segura confirmada por el trabajador. Notificación enviada a red de confianza.',
      type: 'success',
    };

    this.commute.set({
      ...current,
      status: 'TRAYECTO FINALIZADO · LLEGADA CONFIRMADA',
      remainingTime: '00:00 min',
      checkpoints: updatedCheckpoints,
      telemetry: [...current.telemetry, newPing],
    });
  }

  reportDelay(): void {
    const current = this.commute();
    if (!current) return;

    const newPing: TelemetryPing = {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: 'Demora de +10m reportada por tráfico nocturno. Tolerancia recalculada.',
      type: 'warning',
    };

    this.commute.set({
      ...current,
      tolerance: '+20 min',
      telemetry: [...current.telemetry, newPing],
    });
  }

  simulateIncident(): void {
    const current = this.commute();
    if (!current) return;

    const newPing: TelemetryPing = {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: 'INCIDENTE SIMULADO: Alerta preventiva disparada a Rosa Elena (+51 987654321).',
      type: 'danger',
    };

    this.commute.set({
      ...current,
      status: 'ALERTA DE INCIDENTE EN EVALUACIÓN',
      telemetry: [...current.telemetry, newPing],
    });
  }
}
