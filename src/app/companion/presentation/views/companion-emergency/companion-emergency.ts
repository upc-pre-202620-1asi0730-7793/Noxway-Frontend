import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CompanionService } from '../../../infrastructure/companion.service';
import {
  EmergencyRescueProtocol,
  NationalLine,
  SerenazgoUnit,
} from '../../../domain/model/companion.entity';

@Component({
  selector: 'app-companion-emergency',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule],
  templateUrl: './companion-emergency.html',
  styleUrl: './companion-emergency.css',
})
export class CompanionEmergency implements OnInit {
  private readonly companionService = inject(CompanionService);

  readonly protocol = signal<EmergencyRescueProtocol | null>(null);
  readonly serenazgoList = signal<SerenazgoUnit[]>([]);
  readonly nationalLines = signal<NationalLine[]>([]);
  readonly copied = signal<boolean>(false);

  ngOnInit(): void {
    this.companionService.getEmergency().subscribe((data) => {
      this.protocol.set(data.rescueProtocol);
      this.serenazgoList.set(data.serenazgo);
      this.nationalLines.set(data.nationalLines);
    });
  }

  onCall(name: string, number: string): void {
    alert(`Iniciando llamada prioritaria a ${name} (${number})...`);
  }

  onCopyProtocol(): void {
    const p = this.protocol();
    if (!p) return;
    const text = `FICHA OFICIAL NOXWAY DE RESCATE:\nTrabajador: ${p.worker}\nEmpleador: ${p.employer}\nVehículo: ${p.vehicle}\nTeléfono: ${p.workerPhone}\nContacto: ${p.contact}\nÚltima Posición GPS: ${p.lastGps}`;
    navigator.clipboard?.writeText(text);
    this.copied.set(true);
    alert('Ficha de Rescate copiada al portapapeles para envío rápido a PNP o Serenazgo.');
    setTimeout(() => this.copied.set(false), 3000);
  }
}
