import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TrustedContact } from '../../../domain/model/trusted-contact.entity';
import { TrustedContactsService } from '../../../infrastructure/trusted-contacts.service';

@Component({
  selector: 'app-trusted-contacts',
  imports: [MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './trusted-contacts.html',
  styleUrl: './trusted-contacts.css',
})
export class TrustedContacts implements OnInit {
  private readonly contactsService = inject(TrustedContactsService);

  readonly contacts = signal<TrustedContact[]>([]);

  ngOnInit(): void {
    this.contactsService.getContacts().subscribe((data) => {
      this.contacts.set(data);
    });
  }

  onLinkContact(): void {
    const name = prompt('Nombre del contacto de confianza a vincular:');
    if (!name) return;
    const phone = prompt('Número de teléfono móvil (+51 ...):');
    if (!phone) return;
    const rel = prompt('Vínculo o parentesco (ej. Hermana, Pareja, Amigo):') || 'Familiar';

    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newContact: TrustedContact = {
      id: Date.now(),
      avatar: initials || 'TC',
      name: name,
      relationship: `${rel} · Invitación enviada`,
      status: 'Pendiente Enlace',
      statusType: 'pending',
      phone: phone,
      sentDate: 'Enviado hoy vía enlace web SMS',
      note: 'No requiere descargar ninguna app',
      description:
        'Tu contacto podrá acompañarte desde cualquier navegador web con el enlace único.',
    };

    this.contacts.set([...this.contacts(), newContact]);
    alert(`Invitación generada para ${name}. Se envió el enlace de acompañamiento seguro por SMS.`);
  }

  onSendTestPing(contact: TrustedContact): void {
    alert(
      `Ping de prueba enviado a ${contact.name} (${contact.phone}). Notificación simulada por WhatsApp y Push.`,
    );
  }

  onViewCompanion(contact: TrustedContact): void {
    alert(
      `Modo Acompañante (Companion View): Abriendo la vista en tiempo real que ve ${contact.name} durante tus trayectos.`,
    );
  }

  onResendLink(contact: TrustedContact): void {
    alert(`Enlace web de invitación reenviado con éxito al número ${contact.phone}.`);
  }

  onCancelInvitation(contact: TrustedContact): void {
    if (confirm(`¿Deseas cancelar la invitación pendiente a ${contact.name}?`)) {
      this.contacts.set(this.contacts().filter((c) => c.id !== contact.id));
    }
  }
}
