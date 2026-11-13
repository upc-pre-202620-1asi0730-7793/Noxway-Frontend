import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import {
  CommunityPostResource,
  CommunityReportResource,
  ModerationActionResource,
} from '../../../domain/model/community-post.entity';
import { CommunityService } from '../../../infrastructure/community.service';
import { SessionService } from '../../../../iam/infrastructure/session.service';
import {
  ActorContextService,
  DEMO_PERSONAS,
} from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community.html',
  styleUrl: './community.css',
})
export class Community {
  private readonly communityService = inject(CommunityService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(NotificationToastService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);

  readonly loading = signal(true);
  readonly posts = signal<CommunityPostResource[]>([]);
  readonly reports = signal<CommunityReportResource[]>([]);
  readonly selectedActions = signal<ModerationActionResource[]>([]);
  readonly selectedReportId = signal<string | null>(null);

  readonly district = signal('all');
  readonly reportFilter = signal('PENDING');

  // Create Post form
  postTitle = '';
  postContent = '';
  postDistrict = 'Los Olivos';

  // Submit Service Point form
  serviceName = '';
  serviceType: 'PHARMACY' | 'GAS_STATION' | 'HOSPITAL' | 'POLICE_STATION' | 'OTHER' = 'PHARMACY';
  serviceLat = -12.0112;
  serviceLng = -77.0601;
  serviceIs24h = true;
  serviceOpensAt = '08:00';
  serviceClosesAt = '22:00';

  // Report Risk Zone form
  riskDesc = '';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  riskLat = -12.0464;
  riskLng = -77.0428;

  // Moderation notes
  decisionNotes = 'Verificado y validado por moderación Noxway';

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.loadAll());
    });
  }

  loadAll(): void {
    this.loading.set(true);

    forkJoin({
      posts: this.communityService.listPosts(this.district(), 0, 30).pipe(catchError(() => of(null))),
      reports: this.communityService
        .listReports(this.reportFilter() === 'ALL' ? undefined : this.reportFilter(), 0, 30)
        .pipe(catchError(() => of(null))),
    }).subscribe(({ posts, reports }) => {
      this.posts.set(posts?.items ?? []);
      this.reports.set(reports?.items ?? []);
      this.loading.set(false);
    });
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
    if (!this.postTitle.trim() || !this.postContent.trim()) return;

    this.communityService
      .createPost({
        title: this.postTitle.trim(),
        content: this.postContent.trim(),
        district: this.postDistrict.trim(),
      })
      .subscribe({
        next: () => {
          this.postTitle = '';
          this.postContent = '';
          this.toast.success(this.languageService.ui('Aviso comunitario publicado.'));
          this.loadAll();
        },
        error: (err) => this.toast.error(extractProblemMessage(err, 'No se pudo publicar aviso.')),
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

  submitService(): void {
    if (!this.serviceName.trim()) return;

    const hours = Array.from({ length: 7 }, (_, index) => ({
      dayOfWeek: index + 1,
      opensAt: this.serviceIs24h ? '00:00' : this.serviceOpensAt,
      closesAt: this.serviceIs24h ? '00:00' : this.serviceClosesAt,
      closesNextDay: false,
      is24Hours: this.serviceIs24h,
    }));

    this.communityService
      .submitService({
        name: this.serviceName.trim(),
        type: this.serviceType,
        latitude: Number(this.serviceLat),
        longitude: Number(this.serviceLng),
        timeZone: 'America/Lima',
        openingHours: hours,
      })
      .subscribe({
        next: () => {
          this.serviceName = '';
          this.toast.success(
            this.languageService.ui('Punto enviado a cola de moderación comunitaria.'),
          );
          this.loadAll();
        },
        error: (err) => this.toast.error(extractProblemMessage(err, 'Error al registrar punto.')),
      });
  }

  reportRisk(): void {
    if (!this.riskDesc.trim()) return;

    this.communityService
      .reportRiskZone({
        description: this.riskDesc.trim(),
        riskLevel: this.riskLevel,
        latitude: Number(this.riskLat),
        longitude: Number(this.riskLng),
      })
      .subscribe({
        next: () => {
          this.riskDesc = '';
          this.toast.success(
            this.languageService.ui('Zona de riesgo enviada a moderación.'),
          );
          this.loadAll();
        },
        error: (err) => this.toast.error(extractProblemMessage(err, 'Error al reportar zona.')),
      });
  }

  decideReport(reportId: string, decision: 'APPROVE' | 'REJECT'): void {
    this.communityService.decideReport(reportId, decision, this.decisionNotes.trim()).subscribe({
      next: () => {
        this.toast.success(`Reporte ${decision}`);
        this.loadAll();
        if (this.selectedReportId() === reportId) {
          this.loadAuditActions(reportId);
        }
      },
      error: (err) => this.toast.error(extractProblemMessage(err, 'Solo Admin puede moderar reportes.')),
    });
  }

  loadAuditActions(reportId: string): void {
    this.selectedReportId.set(reportId);
    this.communityService.getReportActions(reportId).subscribe({
      next: (actions) => this.selectedActions.set(actions),
      error: () => this.selectedActions.set([]),
    });
  }

  switchToAdmin(): void {
    const admin = DEMO_PERSONAS.find((persona) => persona.role === 'ADMIN') ?? DEMO_PERSONAS[4];
    this.session.switchPersona(admin.id);
    this.toast.info('Administrador / Moderador (0901) activo');
  }
}
