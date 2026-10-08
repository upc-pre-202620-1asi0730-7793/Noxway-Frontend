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
    const hours = prompt('Horas descansadas (ej. 7.5):');
    if (!hours) return;
    const schedule =
      prompt('Horario de descanso (ej. 08:00 AM - 03:30 PM):') || '08:00 AM - 03:30 PM';
    const notes =
      prompt('Condiciones de descanso (ruido, luz, etc.):') || 'Descanso con antifaz y tapones';

    const current = this.summary();
    if (!current) return;

    const newLog: SleepLogRecord = {
      id: Date.now(),
      date: 'Hoy',
      schedule: schedule,
      notes: notes,
      duration: `${hours}h`,
    };

    this.summary.set({
      ...current,
      lastRestDuration: `${hours}h`,
      lastRestSchedule: schedule,
      recentLogs: [newLog, ...current.recentLogs],
    });

    alert('Descanso registrado exitosamente. Se ha actualizado el cálculo de déficit circadiano.');
  }
}
