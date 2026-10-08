import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CompanionService } from '../../../infrastructure/companion.service';
import { CompanionAlertChannel, CompanionAlertLog } from '../../../domain/model/companion.entity';

@Component({
  selector: 'app-companion-alerts',
  imports: [MatCardModule, MatSlideToggleModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './companion-alerts.html',
  styleUrl: './companion-alerts.css',
})
export class CompanionAlerts implements OnInit {
  private readonly companionService = inject(CompanionService);

  readonly channels = signal<CompanionAlertChannel[]>([]);
  readonly logs = signal<CompanionAlertLog[]>([]);
  readonly soundTesting = signal<string | null>(null);

  ngOnInit(): void {
    this.companionService.getAlerts().subscribe((data) => {
      this.channels.set(data.channels);
      this.logs.set(data.logs);
    });
  }

  onToggleChannel(channel: CompanionAlertChannel, newValue: boolean): void {
    channel.enabled = newValue;
    const current = this.channels();
    this.channels.set([...current]);
  }

  onTestSound(type: 'regular' | 'warning' | 'sos'): void {
    if (type === 'regular') {
      this.soundTesting.set('Notificación de checkpoint emitida (Tono suave)');
      alert('Tono de notificación ordinaria reproducido en el dispositivo de Rosa Elena.');
    } else if (type === 'warning') {
      this.soundTesting.set('Alerta preventiva emitida (Tono moderado)');
      alert('Alerta preventiva sonora y vibración probadas con éxito.');
    } else {
      this.soundTesting.set('Alarma SOS activa');
      alert('SIRENA CRÍTICA SOS DE SEGURIDAD EMITIDA A VOLUMEN MÁXIMO.');
    }

    setTimeout(() => {
      this.soundTesting.set(null);
    }, 3500);
  }
}
