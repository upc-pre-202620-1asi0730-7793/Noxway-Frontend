import { restPeriod } from '../../../domain/model/rest-period';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { WellnessSummary, SleepLogRecord } from '../../../domain/model/sleep-record.entity';
import { WellnessService } from '../../../infrastructure/wellness.service';

@Component({
  selector: 'app-wellness',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './wellness.html',
  styleUrl: './wellness.css',
})
export class Wellness implements OnInit {
  private readonly wellnessService = inject(WellnessService);

  readonly summary = signal<WellnessSummary | null>(null);

  ngOnInit(): void {
    this.wellnessService.getWellnessSummary().subscribe((data) => {
      this.summary.set(data);
    });
  }

  onRegisterRest(): void {
    const startText = prompt('Fecha y hora de inicio del descanso (AAAA-MM-DDTHH:mm):');
    if (!startText) return;
    const endText = prompt('Fecha y hora de fin (AAAA-MM-DDTHH:mm; usa el día siguiente si cruza medianoche):');
    if (!endText) return;
    const period = restPeriod(startText, endText);
    if (!period) {
      alert('Introduce fechas válidas: el fin debe ser posterior al inicio y el descanso no debe superar 24 horas.');
      return;
    }
    const { start, minutes } = period;
    const duration = `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    const schedule = `${startText.replace('T', ' ')} → ${endText.replace('T', ' ')}`;
    const notes = prompt('Condiciones de descanso (ruido, luz, etc.):') || 'Sin observaciones';

    const current = this.summary();
    if (!current) return;

    const newLog: SleepLogRecord = {
      id: Date.now(),
      date: start.toLocaleDateString('es-PE'),
      schedule: schedule,
      notes: notes,
      duration: duration,
    };

    this.summary.set({
      ...current,
      lastRestDuration: duration,
      lastRestSchedule: schedule,
      recentLogs: [newLog, ...current.recentLogs],
    });

    alert('Descanso registrado en la vista actual.');
  }
}
