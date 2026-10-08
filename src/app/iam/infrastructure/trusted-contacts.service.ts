import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TrustedContact } from '../domain/model/trusted-contact.entity';

/**
 * Fallback static contact roster.
 */
const DEFAULT_CONTACTS: TrustedContact[] = [
  {
    id: 1,
    avatar: 'RP',
    name: 'Rosa Elena Paredes',
    relationship: 'Madre · Vinculada desde Agosto 2026',
    status: 'Activo & Enlace OK',
    statusType: 'active',
    phone: '+51 987 654 321 (WhatsApp)',
    channel: 'Notificación Push + Mensaje WhatsApp',
    permissions: 'Salida, Llegada, Demoras y Alerta SOS',
    lastInteraction: 'Recibió notificación de check-in activo hoy a las 02:30 AM.',
  },
  {
    id: 2,
    avatar: 'CH',
    name: 'Carlos Huamán',
    relationship: 'Hermano · Invitación enviada',
    status: 'Pendiente Enlace',
    statusType: 'pending',
    phone: '+51 912 345 678',
    sentDate: 'Hace 2 días vía enlace web SMS',
    note: 'No requiere descargar ninguna app',
    description: 'Tu hermano podrá acompañarte desde cualquier navegador web.',
  },
];

/**
 * Service managing trusted family and companion linkages for nocturnal monitoring.
 */
@Injectable({
  providedIn: 'root',
})
export class TrustedContactsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/trustedContacts';

  /**
   * Retrieves the list of linked and pending trusted contacts.
   */
  getContacts(): Observable<TrustedContact[]> {
    return this.http.get<TrustedContact[]>(this.baseUrl).pipe(
      map((list) => (list && list.length > 0 ? list : DEFAULT_CONTACTS)),
      catchError(() => of(DEFAULT_CONTACTS)),
    );
  }
}
