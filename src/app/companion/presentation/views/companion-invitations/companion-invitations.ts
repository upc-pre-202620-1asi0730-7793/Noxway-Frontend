import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CompanionService } from '../../../infrastructure/companion.service';
import {
  AccompaniedWorker,
  InvitationStep,
  PendingInvitation,
} from '../../../domain/model/companion.entity';

@Component({
  selector: 'app-companion-invitations',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './companion-invitations.html',
  styleUrl: './companion-invitations.css',
})
export class CompanionInvitations implements OnInit {
  private readonly companionService = inject(CompanionService);

  readonly pending = signal<PendingInvitation | null>(null);
  readonly activeWorkers = signal<AccompaniedWorker[]>([]);
  readonly steps = signal<InvitationStep[]>([]);
  readonly pendingStatus = signal<'pending' | 'accepted' | 'rejected'>('pending');

  ngOnInit(): void {
    this.companionService.getInvitations().subscribe((data) => {
      this.pending.set(data.pending);
      this.activeWorkers.set(data.activeWorkers);
      this.steps.set(data.steps);
    });
  }

  onAcceptInvitation(): void {
    this.pendingStatus.set('accepted');
    alert(
      'Vínculo de confianza aceptado con éxito. Ahora también podrás acompañar a Carlos en sus turnos nocturnos.',
    );
  }

  onRejectInvitation(): void {
    this.pendingStatus.set('rejected');
    alert('Solicitud rechazada. Se ha notificado al remitente de forma respetuosa.');
  }
}
