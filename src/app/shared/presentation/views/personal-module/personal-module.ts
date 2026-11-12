import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { localApi, SessionService } from '../../../../iam/infrastructure/session.service';

interface PersonalRecord {
  id: string;
  title: string;
  details: string;
}

const sections = {
  services: {
    title: 'Servicios Cercanos y Zonas de Riesgo',
    empty: 'Aún no has registrado servicios ni zonas de riesgo.',
    titleLabel: 'Nombre del lugar o zona',
    detailsLabel: 'Dirección y descripción',
    action: 'Guardar reporte',
    note: 'Tus reportes se guardan en tu cuenta. El mapa en vivo y la verificación comunitaria están pendientes.',
  },
  community: {
    title: 'Comunidad',
    empty: 'Aún no has creado ningún aviso.',
    titleLabel: 'Título del aviso',
    detailsLabel: 'Descripción',
    action: 'Guardar aviso',
    note: 'Puedes guardar avisos en tu cuenta local. La publicación a otros usuarios está pendiente.',
  },
  wellness: {
    title: 'Bienestar & Sueño',
    empty: 'Aún no has registrado descansos.',
    titleLabel: 'Fecha del descanso',
    detailsLabel: 'Horario y notas del descanso',
    action: 'Guardar descanso',
    note: 'Registra tu horario de descanso para llevar tu propio historial.',
  },
  contacts: {
    title: 'Contactos de Confianza',
    empty: 'Aún no has agregado contactos de confianza.',
    titleLabel: 'Nombre del contacto',
    detailsLabel: 'Teléfono o correo electrónico',
    action: 'Guardar contacto',
    note: 'Los contactos se guardan en tu cuenta. El envío de invitaciones está pendiente.',
  },
};

@Component({
  imports: [FormsModule],
  templateUrl: './personal-module.html',
  styleUrls: ['../../../../commute/presentation/views/local-journeys/local-journeys.css', './personal-module.css'],
})
export class PersonalModule implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly section = inject(ActivatedRoute).snapshot.data['section'] as keyof typeof sections | 'benefits';
  private readonly endpoint = `${localApi}/me/records/${this.section}`;

  readonly module = this.section === 'benefits' ? null : sections[this.section];
  readonly records = signal<PersonalRecord[] | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');

  title = '';
  details = '';

  ngOnInit(): void {
    if (this.module) this.load();
  }

  load(): void {
    this.run(this.http.get<PersonalRecord[]>(this.endpoint, this.session.requestOptions()),
      (records) => this.records.set(records));
  }

  save(form: NgForm): void {
    if (this.busy() || form.invalid || !this.title.trim() || !this.details.trim()) return;

    this.run(this.http.post<PersonalRecord>(this.endpoint, {
      title: this.title, details: this.details,
    }, this.session.requestOptions()), (record) => {
      this.records.update((records) => [record, ...(records ?? [])]);
      form.resetForm();
    });
  }

  private run<T>(request: Observable<T>, apply: (result: T) => void): void {
    this.error.set('');
    this.busy.set(true);
    request.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: apply,
      error: (error) => {
        if (error.status === 401) {
          this.session.logout();
          void this.router.navigateByUrl('/login');
          return;
        }
        this.error.set(error.status === 0
          ? 'Inicia la API local con npm run server y vuelve a intentarlo.'
          : error.error?.message || 'No se pudo completar la operación.');
      },
    });
  }
}
