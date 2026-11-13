import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import {
  CommunityPostResource,
  CommunityReportResource,
  ModerationActionResource,
} from '../../../domain/model/community-post.entity';
import { CommunityService } from '../../../infrastructure/community.service';
import {
  ReportLocation,
  type ReportCoordinates,
} from '../../components/report-location/report-location';
import { ActorContextService } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

export type ComposerMode = 'post' | 'service' | 'risk';

const DEFAULT_CENTER: ReportCoordinates = { lat: -12.0464, lon: -77.0428 };

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ReportLocation],
  templateUrl: './community.html',
  styleUrl: './community.css',
})
export class Community {
  private readonly communityService = inject(CommunityService);
  private readonly toast = inject(NotificationToastService);
  private readonly route = inject(ActivatedRoute);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  private readonly composerDialog = viewChild<ElementRef<HTMLDialogElement>>('composer');

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly composing = signal(false);
  readonly composerMode = signal<ComposerMode>('post');
  readonly dialogError = signal('');

  readonly posts = signal<CommunityPostResource[]>([]);
  readonly reports = signal<CommunityReportResource[]>([]);
  readonly selectedActions = signal<ModerationActionResource[]>([]);
  readonly selectedReportId = signal<string | null>(null);
  readonly moderationExpanded = signal(false);

  readonly district = signal('all');
  readonly reportFilter = signal('PENDING');
  readonly knownDistricts = signal<string[]>([
    'Lima Centro',
    'Miraflores',
    'Lince',
    'Los Olivos',
    'San Isidro',
    'Cercado de Lima',
  ]);

  readonly selectedLocation = signal<ReportCoordinates | null>(null);
  readonly modalMapCenter = signal<ReportCoordinates>(DEFAULT_CENTER);

  readonly locatedPostCount = computed(
    () =>
      this.posts().filter((post) => post.latitude != null && post.longitude != null).length,
  );

  readonly noticeCategories = [
    'Aviso de seguridad',
    'Reporte de local',
    'Recomendación',
    'Consulta',
  ];

  // Post form fields
  postCategory = 'Aviso de seguridad';
  postTitle = '';
  postContent = '';
  postDistrict = '';

  // Service Point form fields
  serviceName = '';
  serviceType: 'PHARMACY' | 'GAS_STATION' | 'HOSPITAL' | 'POLICE_STATION' | 'OTHER' = 'PHARMACY';
  serviceIs24h = true;
  serviceOpensAt = '08:00';
  serviceClosesAt = '22:00';
  serviceClosesNextDay = false;

  // Risk Zone form fields
  riskDesc = '';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

  // Moderation notes
  decisionNotes = '';

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadAll());
    });

    effect(() => {
      const shouldOpen = this.composing();
      const dialog = this.composerDialog()?.nativeElement;
      if (!dialog) return;
      if (shouldOpen && !dialog.open && typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else if (!shouldOpen && dialog.open && typeof dialog.close === 'function') {
        dialog.close();
      }
    });

    this.route.queryParamMap.subscribe((params) => {
      const action = params.get('action');
      const notice = params.get('notice');
      const lat = Number(params.get('lat'));
      const lng = Number(params.get('lng'));
      const hasValidCoords =
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        params.has('lat') &&
        params.has('lng');

      const center: ReportCoordinates = hasValidCoords
        ? { lat: Number(lat.toFixed(5)), lon: Number(lng.toFixed(5)) }
        : DEFAULT_CENTER;
      this.modalMapCenter.set(center);

      if (action === 'service' || notice === 'place') {
        this.openComposer('service', hasValidCoords ? center : null);
      } else if (action === 'risk' || notice === 'hazard') {
        this.openComposer('risk', hasValidCoords ? center : null);
      } else if (action === 'post') {
        this.openComposer('post', hasValidCoords ? center : null);
      }
    });
  }

  loadAll(): void {
    this.loading.set(true);

    forkJoin({
      posts: this.communityService.listPosts(this.district(), 0, 50).pipe(catchError(() => of(null))),
      reports: this.communityService
        .listReports(this.reportFilter() === 'ALL' ? undefined : this.reportFilter(), 0, 30)
        .pipe(catchError(() => of(null))),
    }).subscribe(({ posts, reports }) => {
      const postItems = posts?.items ?? [];
      this.posts.set(postItems);
      const discovered = postItems
        .map((post) => post.district?.trim())
        .filter((value): value is string => Boolean(value));
      if (discovered.length > 0) {
        this.knownDistricts.update((existing) =>
          Array.from(new Set([...existing, ...discovered])).sort((a, b) => a.localeCompare(b)),
        );
      }
      this.reports.set(reports?.items ?? []);
      this.loading.set(false);
    });
  }

  openComposer(mode: ComposerMode, initialPoint: ReportCoordinates | null = null): void {
    this.dialogError.set('');
    this.composerMode.set(mode);
    if (initialPoint) {
      this.selectedLocation.set(initialPoint);
    } else if (!this.selectedLocation()) {
      this.selectedLocation.set(this.modalMapCenter());
    }
    this.composing.set(true);
    const dialog = this.composerDialog()?.nativeElement;
    if (dialog && !dialog.open && typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  }

  switchComposerMode(mode: ComposerMode): void {
    this.dialogError.set('');
    this.composerMode.set(mode);
  }

  closeComposer(): void {
    const dialog = this.composerDialog()?.nativeElement;
    if (dialog?.open && typeof dialog.close === 'function') {
      dialog.close();
    }
    this.composing.set(false);
    this.dialogError.set('');
  }

  onServiceHoursChange(): void {
    this.serviceClosesNextDay = this.serviceClosesAt <= this.serviceOpensAt;
  }

  changeDistrict(nextDistrict: string): void {
    this.district.set(nextDistrict);
    this.loadAll();
  }

  changeReportFilter(status: string): void {
    this.reportFilter.set(status);
    this.loadAll();
  }

  publishPost(): void {
    if (this.submitting()) return;
    if (!this.postTitle.trim() || !this.postContent.trim()) {
      this.dialogError.set(this.languageService.ui('Completa ambos campos.'));
      return;
    }
    const point = this.selectedLocation();
    if (!point) {
      this.dialogError.set(this.languageService.ui('Marca el lugar del aviso en el mapa.'));
      return;
    }

    const districtValue = this.postDistrict.trim() || 'Lima Centro';
    this.submitting.set(true);
    this.dialogError.set('');

    this.communityService
      .createPost({
        title: this.postTitle.trim(),
        content: this.postContent.trim(),
        district: districtValue,
        category: this.postCategory || null,
        latitude: point.lat,
        longitude: point.lon,
      })
      .subscribe({
        next: () => {
          this.postTitle = '';
          this.postContent = '';
          this.postDistrict = '';
          this.selectedLocation.set(null);
          this.submitting.set(false);
          this.closeComposer();
          this.toast.success(this.languageService.ui('Aviso comunitario publicado.'));
          this.loadAll();
        },
        error: (err) => {
          this.submitting.set(false);
          this.dialogError.set(extractProblemMessage(err, 'No se pudo publicar aviso.'));
        },
      });
  }

  deletePost(id: string): void {
    this.communityService.deletePost(id).subscribe({
      next: () => {
        this.toast.info(this.languageService.ui('Publicación eliminada.'));
        this.loadAll();
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'No se pudo eliminar.')),
    });
  }

  canDeletePost(post: CommunityPostResource): boolean {
    return (
      post.authorId === this.actorContext.activeActorId() || this.actorContext.isAdmin()
    );
  }

  isSecurityPost(post: CommunityPostResource): boolean {
    return post.category === 'Aviso de seguridad';
  }

  osmUrl(lat: number, lon: number): string {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
  }

  submitService(): void {
    if (this.submitting()) return;
    if (!this.serviceName.trim()) {
      this.dialogError.set(this.languageService.ui('Nombre del establecimiento') + ' requerido.');
      return;
    }
    const point = this.selectedLocation();
    if (!point) {
      this.dialogError.set(this.languageService.ui('Marca el lugar del aviso en el mapa.'));
      return;
    }

    const hours = Array.from({ length: 7 }, (_, index) => ({
      dayOfWeek: index + 1,
      opensAt: this.serviceIs24h ? '00:00' : this.serviceOpensAt,
      closesAt: this.serviceIs24h ? '00:00' : this.serviceClosesAt,
      closesNextDay: this.serviceIs24h ? false : this.serviceClosesNextDay,
      is24Hours: this.serviceIs24h,
    }));

    this.submitting.set(true);
    this.dialogError.set('');

    this.communityService
      .submitService({
        name: this.serviceName.trim(),
        type: this.serviceType,
        latitude: point.lat,
        longitude: point.lon,
        timeZone: 'America/Lima',
        openingHours: hours,
      })
      .subscribe({
        next: () => {
          this.serviceName = '';
          this.selectedLocation.set(null);
          this.submitting.set(false);
          this.closeComposer();
          this.toast.success(
            this.languageService.ui('Punto enviado a cola de moderación comunitaria.'),
          );
          this.loadAll();
        },
        error: (err) => {
          this.submitting.set(false);
          this.dialogError.set(extractProblemMessage(err, 'Error al registrar punto.'));
        },
      });
  }

  reportRisk(): void {
    if (this.submitting()) return;
    if (!this.riskDesc.trim()) {
      this.dialogError.set(this.languageService.ui('Descripción') + ' requerida.');
      return;
    }
    const point = this.selectedLocation();
    if (!point) {
      this.dialogError.set(this.languageService.ui('Marca el lugar del aviso en el mapa.'));
      return;
    }

    this.submitting.set(true);
    this.dialogError.set('');

    this.communityService
      .reportRiskZone({
        description: this.riskDesc.trim(),
        riskLevel: this.riskLevel,
        latitude: point.lat,
        longitude: point.lon,
      })
      .subscribe({
        next: () => {
          this.riskDesc = '';
          this.selectedLocation.set(null);
          this.submitting.set(false);
          this.closeComposer();
          this.toast.success(
            this.languageService.ui('Zona de riesgo enviada a moderación.'),
          );
          this.loadAll();
        },
        error: (err) => {
          this.submitting.set(false);
          this.dialogError.set(extractProblemMessage(err, 'Error al reportar zona.'));
        },
      });
  }

  decideReport(reportId: string, decision: 'APPROVE' | 'REJECT'): void {
    const notes =
      this.decisionNotes.trim() ||
      (decision === 'APPROVE' ? 'Aprobado por moderación' : 'Rechazado por moderación');
    this.communityService.decideReport(reportId, decision, notes).subscribe({
      next: () => {
        this.decisionNotes = '';
        this.toast.success(`Reporte ${decision}`);
        this.loadAll();
        if (this.selectedReportId() === reportId) {
          this.loadAuditActions(reportId);
        }
      },
      error: (err) =>
        this.toast.error(extractProblemMessage(err, 'Solo Admin puede moderar reportes.')),
    });
  }

  loadAuditActions(reportId: string): void {
    this.selectedReportId.set(reportId);
    this.communityService.getReportActions(reportId).subscribe({
      next: (actions) => this.selectedActions.set(actions),
      error: () => this.selectedActions.set([]),
    });
  }
}
