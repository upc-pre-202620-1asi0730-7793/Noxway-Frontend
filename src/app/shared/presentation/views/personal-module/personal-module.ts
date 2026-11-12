import { NgTemplateOutlet } from '@angular/common';
import { ReportLocation, type ReportCoordinates } from './report-location';
import { LanguageService } from '../../../infrastructure/language.service';
import { HttpClient } from '@angular/common/http';
import { Component, computed, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
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
  district?: string;
  relationship?: string;
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
    title: 'Red de Contactos de Confianza',
    empty: 'Aún no has agregado contactos de confianza.',
    titleLabel: 'Nombre del contacto',
    detailsLabel: 'Teléfono o correo electrónico',
    action: 'Guardar contacto',
    note: 'Los contactos se guardan en tu cuenta. El envío de invitaciones está pendiente.',
  },
};

@Component({
  imports: [FormsModule, MatIconModule, NgTemplateOutlet, ReportLocation],
  templateUrl: './personal-module.html',
  styleUrls: ['../../../../community/presentation/views/community/community.css', './personal-module.css'],
})
export class PersonalModule implements OnInit {
  readonly t = inject(LanguageService).ui;
  private readonly http = inject(HttpClient);
  readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly section = this.route.snapshot.data['section'] as keyof typeof sections | 'benefits';
  private readonly endpoint = `${localApi}/me/records/${this.section}`;

  readonly module = this.section === 'benefits' ? null : sections[this.section];
  readonly records = signal<PersonalRecord[] | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly location = signal<ReportCoordinates | null>(null);
  private readonly composer = viewChild<ElementRef<HTMLDialogElement>>('composer');
  readonly composing = signal(false);
  readonly selectedDistrict = signal('');
  readonly districts = computed(() => [...new Set((this.records() ?? []).flatMap(({ district }) => district ? [district] : []))]);
  readonly visibleNotices = computed(() => {
    const district = this.selectedDistrict();
    return (this.records() ?? []).filter((record) => !district || record.district === district);
  });

  readonly benefitCategories = [
    { icon: 'local_gas_station', label: 'Combustible', color: 'blue' },
    { icon: 'local_pharmacy', label: 'Farmacias', color: 'green' },
    { icon: 'health_and_safety', label: 'Seguros', color: 'red' },
    { icon: 'balance', label: 'Asesoría legal', color: 'violet' },
  ];
  readonly locatedNoticeCount = computed(() => (this.records() ?? []).filter((record) => record.location).length);
  private readonly noticeCategories = ['Aviso de seguridad', 'Reporte de local', 'Recomendación', 'Consulta'];

  noticeCategory(details: string): string {
    const prefix = details.split(' · ', 1)[0];
    return this.noticeCategories.includes(prefix) ? prefix : '';
  }

  noticeDescription(details: string): string {
    const category = this.noticeCategory(details);
    return category ? details.slice(category.length + 3) : details;
  }

  readonly restChart = computed(() => (this.records() ?? []).slice(0, 7).reverse().flatMap((record) => {
    const duration = /^(\d+) h (\d+) min/.exec(record.details);
    if (!duration) return [];
    const minutes = Number(duration[1]) * 60 + Number(duration[2]);
    return [{ id: record.id, title: record.title.split(' ')[0], minutes, label: duration[0] }];
  }));
  readonly chartMaximum = computed(() => Math.max(480, ...this.restChart().map((entry) => entry.minutes)));
  readonly averageRest = computed(() => {
    const entries = this.restChart();
    if (!entries.length) return '—';
    const minutes = Math.round(entries.reduce((total, entry) => total + entry.minutes, 0) / entries.length);
    return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
  });

  readonly longestRest = computed(() =>
    this.restChart().reduce<{ minutes: number; label: string } | null>(
      (longest, entry) => !longest || entry.minutes > longest.minutes ? entry : longest, null)?.label ?? '—');

  title = '';
  category = '';
  district = '';
  relationship = '';
  start = '';
  end = '';
  details = '';

  ngOnInit(): void {
    const notice = this.route.snapshot.queryParamMap.get('notice');
    if (this.module) this.load(this.section === 'community' ? notice : null);
  }

  load(notice: string | null = null): void {
    this.run(this.http.get<PersonalRecord[]>(this.endpoint, this.session.requestOptions()), (records) => {
      this.records.set(records);
      if (notice === 'place' || notice === 'hazard') {
        this.category = notice === 'place' ? 'Reporte de local' : 'Aviso de seguridad';
        this.openComposer();
      }
    });
  }

  save(form: NgForm): void {
    if (this.busy() || form.invalid) return;
    let title = (this.title ?? '').trim();
    let details = (this.details ?? '').trim();

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
      title, details, ...(location && { location, district: this.district }),
      ...(this.section === 'contacts' && { relationship: this.relationship }),
    }, this.session.requestOptions()), (record) => {
      this.records.update((records) => [record, ...(records ?? [])]);
      form.resetForm();
      this.location.set(null);
      this.selectedDistrict.set('');
      this.closeComposer();
    });
  }

  openComposer(): void {
    this.error.set('');
    this.composing.set(true);
    this.composer()?.nativeElement.showModal();
  }

  closeComposer(): void {
    this.composer()?.nativeElement.close();
    this.composing.set(false);
  }

  contactUrl(details: string): string | null {
    const value = details.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${encodeURIComponent(value)}`;
    if (/^\+?[\d ()-]+$/.test(value) && /\d/.test(value)) return `tel:${value.replace(/[^+\d]/g, '')}`;
    return null;
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
