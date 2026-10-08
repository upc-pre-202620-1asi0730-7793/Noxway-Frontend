import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import {
  UserSubscription,
  CollectiveBenefit,
} from '../../../domain/model/collective-benefit.entity';
import { SubscriptionsService } from '../../../infrastructure/subscriptions.service';

@Component({
  selector: 'app-benefits',
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatChipsModule],
  templateUrl: './benefits.html',
  styleUrl: './benefits.css',
})
export class Benefits implements OnInit {
  private readonly subscriptionsService = inject(SubscriptionsService);

  readonly subscription = signal<UserSubscription | null>(null);

  ngOnInit(): void {
    this.subscriptionsService.getSubscriptionInfo().subscribe((data) => {
      this.subscription.set(data);
    });
  }

  onManageMembership(): void {
    alert('Panel de Membresía: Tu plan actual es Centinela Pro (Facturación recurrente activa).');
  }

  onViewCoupon(benefit: CollectiveBenefit): void {
    alert(
      `Cupón Digital: Presenta el código [${benefit.code}] o tu credencial digital Noxway para validar el beneficio en ${benefit.name}.`,
    );
  }

  onCopyReferralCode(): void {
    const code = this.subscription()?.referralCode || 'JORGE-NOX26';
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`https://noxway.pe/register?ref=${code}`);
    }
    alert(`Enlace de referido copiado al portapapeles: https://noxway.pe/register?ref=${code}`);
  }
}
