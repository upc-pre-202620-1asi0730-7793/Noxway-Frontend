import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { CompanionService } from '../../../infrastructure/companion.service';
import {
  CompanionHistoryRecord,
  CompanionHistoryStats,
} from '../../../domain/model/companion.entity';

@Component({
  selector: 'app-companion-history',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
  ],
  templateUrl: './companion-history.html',
  styleUrl: './companion-history.css',
})
export class CompanionHistory implements OnInit {
  private readonly companionService = inject(CompanionService);

  readonly stats = signal<CompanionHistoryStats | null>(null);
  readonly allRecords = signal<CompanionHistoryRecord[]>([]);
  readonly activeFilter = signal<'all' | 'work' | 'home'>('all');

  displayedColumns: string[] = ['date', 'type', 'route', 'duration', 'status', 'action'];

  ngOnInit(): void {
    this.companionService.getHistory().subscribe((data) => {
      this.stats.set(data.stats);
      this.allRecords.set(data.records);
    });
  }

  get filteredRecords(): CompanionHistoryRecord[] {
    const filter = this.activeFilter();
    const records = this.allRecords();
    if (filter === 'work') {
      return records.filter((r) => r.type.includes('Ida'));
    }
    if (filter === 'home') {
      return records.filter((r) => r.type.includes('Retorno'));
    }
    return records;
  }

  setFilter(filter: 'all' | 'work' | 'home'): void {
    this.activeFilter.set(filter);
  }

  onDownloadPdf(): void {
    alert('Generando y descargando Reporte Oficial de Auditoría Nocturna (PDF)...');
  }

  onViewDetail(record: CompanionHistoryRecord): void {
    alert(
      `Detalle del Trayecto ${record.date} (${record.type}):\nOrigen: ${record.origin}\nDestino: ${record.destination}\nVía: ${record.via}\nDuración: ${record.duration}\nEstado: ${record.status}`,
    );
  }
}
