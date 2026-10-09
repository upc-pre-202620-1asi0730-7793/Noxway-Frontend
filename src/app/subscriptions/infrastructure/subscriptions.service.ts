import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserSubscription } from '../domain/model/collective-benefit.entity';
import { environment } from '../../../environments/environment';

/**
 * Fallback static subscription plan and collective benefits data.
 */
const DEFAULT_SUBSCRIPTION: UserSubscription = {
  id: 1,
  planName: 'Plan Centinela Pro',
  price: 'S/. 12.00 / mes',
  status: 'MEMBRESÍA ACTIVA',
  billingDetails: 'Facturación mensual recurrente. Próxima renovación: 15 de Octubre, 2026',
  referralBonus: 'Invita a un compañero de turno y ambos reciben 1 mes gratis',
  referralDesc:
    'Comparte tu código único con otros vigilantes o enfermeros para bonificar tu mensualidad.',
  referralCode: 'JORGE-NOX26',
  benefits: [
    {
      id: 1,
      name: 'Grifos Primax & Repsol Nocturnos',
      subtitle: 'S/. 1.50 menos por galón entre 10:00 PM y 06:00 AM',
      description:
        'Aplica en todas las estaciones de Lima Metropolitana mostrando tu credencial digital.',
      code: 'NX-GAS2026',
      codeLabel: 'Código',
      icon: 'local_gas_station',
      actionLabel: 'Ver Cupón QR',
    },
    {
      id: 2,
      name: 'Boticas Inkafarma & Mifarma 24h',
      subtitle: '15% de descuento en botiquín y vitaminas',
      description: 'Descuento en bebidas rehidratantes y suplementos para el turno noche.',
      code: 'BOTICAS-NOX',
      codeLabel: 'Convenio',
      icon: 'medication',
      actionLabel: 'Ver Cupón QR',
    },
    {
      id: 3,
      name: 'Seguro Colectivo de Accidentes en Ruta',
      subtitle: 'Cobertura hasta por S/. 20,000 en convenio con Mapfre',
      description: 'Gastos médicos hospitalarios durante desplazamientos con check-in activo.',
      code: 'POL-849201-NOX',
      codeLabel: 'Póliza',
      icon: 'shield',
      actionLabel: 'Certificado',
    },
    {
      id: 4,
      name: 'Asesoría Legal Laboral Nocturna',
      subtitle: 'Consultas sin costo sobre sobretasa nocturna (35%)',
      description: 'Atención remota 24 horas sobre derechos y compensaciones laborales.',
      code: 'Canal WhatsApp Jurídico',
      codeLabel: 'Canal',
      icon: 'gavel',
      actionLabel: 'Contactar',
    },
  ],
};

/**
 * Service managing user subscriptions, membership tiers, and partner benefits.
 */
@Injectable({
  providedIn: 'root',
})
export class SubscriptionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/subscriptions`;

  /**
   * Retrieves active plan subscription information and partner benefits.
   */
  getSubscriptionInfo(): Observable<UserSubscription> {
    return this.http.get<UserSubscription[]>(this.baseUrl).pipe(
      map((list) => (list && list.length > 0 ? list[0] : DEFAULT_SUBSCRIPTION)),
      catchError(() => of(DEFAULT_SUBSCRIPTION)),
    );
  }
}
