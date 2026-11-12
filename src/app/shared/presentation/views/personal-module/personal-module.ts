import { ReportLocation, type ReportCoordinates } from './report-location';
import { LanguageService } from '../../../infrastructure/language.service';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { restPeriod } from '../../../../wellness/domain/model/rest-period';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { localApi, SessionService } from '../../../../iam/infrastructure/session.service';

interface PersonalRecord {
  id: string;
  title: string;
  details: string;
  location?: ReportCoordinates;
}

const sections = {
  community: {
    icon: 'forum',
    listTitle: 'Mis avisos',
    formTitle: 'Crear aviso',
    title: 'Comunidad',
    empty: 'Aún no has creado ningún aviso.',
    titleLabel: 'Título del aviso',
    detailsLabel: 'Descripción',
    action: 'Guardar aviso',
    note: 'Puedes guardar avisos en tu cuenta local. La publicación a otros usuarios está pendiente.',
  },
  wellness: {
    icon: 'bedtime',
    listTitle: 'Historial de descanso',
    formTitle: 'Registrar descanso',
    title: 'Bienestar & Sueño',
    empty: 'Aún no has registrado descansos.',
    titleLabel: 'Fecha del descanso',
    detailsLabel: 'Horario y notas del descanso',
    action: 'Guardar descanso',
    note: 'Registra tu horario de descanso para llevar tu propio historial.',
  },
  contacts: {
    icon: 'group',
    listTitle: 'Mi red de confianza',
    formTitle: 'Agregar contacto',
    title: 'Contactos de Confianza',
    empty: 'Aún no has agregado contactos de confianza.',
    titleLabel: 'Nombre del contacto',
    detailsLabel: 'Teléfono o correo electrónico',
    action: 'Guardar contacto',
    note: 'Los contactos se guardan en tu cuenta. El envío de invitaciones está pendiente.',
  },
};

@Component({
  imports: [FormsModule, MatIconModule, ReportLocation],
  templateUrl: './personal-module.html',
  styleUrl: './personal-module.css',
})
export class PersonalModule implements OnInit {
  readonly t = inject(LanguageService).ui;
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  readonly section = inject(ActivatedRoute).snapshot.data['section'] as keyof typeof sections | 'benefits';
  private readonly endpoint = `${localApi}/me/records/${this.section}`;

  readonly module = this.section === 'benefits' ? null : sections[this.section];
  readonly records = signal<PersonalRecord[] | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly location = signal<ReportCoordinates | null>(null);

  title = '';
  category = '';
  start = '';
  end = '';
  details = '';

  ngOnInit(): void {
    if (this.module) this.load();
  }

  load(): void {
    this.run(this.http.get<PersonalRecord[]>(this.endpoint, this.session.requestOptions()),
      (records) => this.records.set(records));
  }

  save(form: NgForm): void {
    if (this.busy() || form.invalid) return;
    let title = this.title.trim();
    let details = this.details.trim();

    if (this.section === 'wellness') {
      const rest = restPeriod(this.start, this.end);
      if (!rest) {
        this.error.set('El fin debe ser posterior al inicio y el descanso no puede superar 24 horas.');
        return;
      }
      title = `${this.start.replace('T', ' ')} → ${this.end.replace('T', ' ')}`;
      const duration = `${Math.floor(rest.minutes / 60)} h ${rest.minutes % 60} min`;
      details = details ? `${duration} · ${details}` : duration;
    } else if (this.category) {
      details = `${this.category} · ${details}`;
    }

    const location = this.location();
    if (!title || !details || (this.section === 'community' && !location)) return;

    this.run(this.http.post<PersonalRecord>(this.endpoint, {
      title, details, ...(location && { location }),
    }, this.session.requestOptions()), (record) => {
      this.records.update((records) => [record, ...(records ?? [])]);
      form.resetForm();
      this.location.set(null);
    });
  }

  reportMapUrl({ lat, lon }: ReportCoordinates): string {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
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
        if (error.status === 0 || error.status === 404 || error.status >= 500) {
          this.error.set('Comprueba que npm run server esté ejecutando la versión actual del proyecto y vuelve a cargar.');
          return;
        }
        this.error.set(error.error?.message || 'La API local no pudo guardar o cargar los datos.');
      },
    });
  }
}
