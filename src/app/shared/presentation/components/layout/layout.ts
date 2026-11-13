import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { catchError, filter, forkJoin, of } from 'rxjs';
import { CommuteService } from '../../../../commute/infrastructure/commute.service';
import { CompanionService } from '../../../../companion/infrastructure/companion.service';
import { SessionService } from '../../../../iam/infrastructure/session.service';
import { UserProfileService } from '../../../../iam/infrastructure/user-profile.service';
import { ActorContextService } from '../../../infrastructure/actor-context.service';
import { LanguageService } from '../../../infrastructure/language.service';
import { ThemeService } from '../../../infrastructure/theme.service';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

interface NavOption {
  label: string;
  link: string;
  badge?: string;
  badgeType?: 'active' | 'live' | 'counter';
}

const TITLE_KEYS: Record<string, string> = {
  '/dashboard': 'title.dashboard',
  '/journey': 'title.journey',
  '/map': 'title.map',
  '/community': 'title.community',
  '/wellness': 'title.wellness',
  '/benefits': 'title.benefits',
  '/trusted-contacts': 'title.trustedContacts',
  '/profile': 'title.profile',
  '/access': 'title.access',
  '/companion/live': 'title.companion.live',
  '/companion/history': 'title.companion.history',
  '/companion/alerts': 'title.companion.alerts',
  '/companion/emergency': 'title.companion.emergency',
  '/companion/invitations': 'title.companion.invitations',
  '/companion/profile': 'title.companion.profile',
};

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, LanguageSwitcher],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit, OnDestroy {
  readonly router = inject(Router);
  readonly session = inject(SessionService);
  readonly actorContext = inject(ActorContextService);
  readonly languageService = inject(LanguageService);
  readonly themeService = inject(ThemeService);
  private readonly commuteService = inject(CommuteService);
  private readonly companionService = inject(CompanionService);
  private readonly profileService = inject(UserProfileService);

  readonly currentUrl = signal(this.router.url || '/dashboard');
  readonly activeCommuteCount = signal(0);
  readonly companionAlertCount = signal(0);
  readonly liveMonitoredName = signal<string | null>(null);
  readonly liveMonitoredTransport = signal<string | null>(null);

  readonly isCompanion = computed(() => this.currentUrl().startsWith('/companion'));
  readonly wideContent = computed(() => this.currentUrl().startsWith('/map'));

  readonly currentTime = signal(this.formatTime());
  readonly companionTime = signal(this.formatTime(true));
  private clockTimer: ReturnType<typeof setInterval> | null = null;
  private routerSub: { unsubscribe(): void } | null = null;

  readonly roleLabel = computed(() => {
    const role = this.actorContext.activePersona().role;
    if (role === 'ADMIN') return this.languageService.t('sidebar.adminRole');
    if (role === 'TRUSTED_CONTACT') return this.languageService.t('sidebar.companionRole');
    return this.languageService.t('sidebar.workerRole');
  });

  readonly userInitials = computed(() => {
    const name = this.session.profile()?.fullName ?? this.actorContext.activePersona().name;
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  });

  readonly currentPageTitle = computed(() => {
    const url = this.currentUrl().split('?')[0];
    const match = Object.keys(TITLE_KEYS).find((prefix) => url.startsWith(prefix));
    return match
      ? this.languageService.t(TITLE_KEYS[match])
      : this.languageService.ui('Noxway');
  });

  readonly workerOptions = computed<NavOption[]>(() => {
    const activeCount = this.activeCommuteCount();
    return [
      { label: this.languageService.t('nav.dashboard'), link: '/dashboard' },
      {
        label: this.languageService.t('nav.journey'),
        link: '/journey',
        badge: activeCount > 0 ? (this.languageService.currentLang() === 'en' ? 'Active' : 'Activo') : undefined,
        badgeType: activeCount > 0 ? 'active' : undefined,
      },
      { label: this.languageService.t('nav.map'), link: '/map' },
      { label: this.languageService.t('nav.community'), link: '/community' },
      { label: this.languageService.t('nav.wellness'), link: '/wellness' },
      { label: this.languageService.t('nav.benefits'), link: '/benefits' },
      { label: this.languageService.t('nav.trustedContacts'), link: '/trusted-contacts' },
      { label: this.languageService.t('nav.profile'), link: '/profile' },
      { label: this.languageService.t('nav.access'), link: '/access' },
    ];
  });

  readonly companionOptions = computed<NavOption[]>(() => {
    const alerts = this.companionAlertCount();
    return [
      {
        label: this.languageService.t('nav.companion.live'),
        link: '/companion/live',
        badge: 'LIVE',
        badgeType: 'live',
      },
      { label: this.languageService.t('nav.companion.history'), link: '/companion/history' },
      {
        label: this.languageService.t('nav.companion.alerts'),
        link: '/companion/alerts',
        badge: alerts > 0 ? String(alerts) : undefined,
        badgeType: alerts > 0 ? 'counter' : undefined,
      },
      { label: this.languageService.t('nav.companion.emergency'), link: '/companion/emergency' },
      { label: this.languageService.t('nav.companion.invitations'), link: '/companion/invitations' },
      { label: this.languageService.t('nav.companion.profile'), link: '/companion/profile' },
      { label: this.languageService.t('nav.access'), link: '/access' },
    ];
  });

  constructor() {
    effect(() => {
      this.actorContext.revision();
      untracked(() => this.syncShellContext());
    });
  }

  ngOnInit(): void {
    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });

    this.clockTimer = setInterval(() => {
      this.currentTime.set(this.formatTime());
      this.companionTime.set(this.formatTime(true));
    }, 1000);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }
  }

  syncShellContext(): void {
    this.session.loadProfile().pipe(catchError(() => of(null))).subscribe();

    forkJoin({
      directory: this.profileService.getDirectory().pipe(catchError(() => of([]))),
      commutes: this.commuteService.getMyCommutes(0, 5).pipe(catchError(() => of(null))),
      live: this.companionService.getLiveMonitoring().pipe(catchError(() => of([]))),
      alerts: this.companionService.getAlerts(0, 5).pipe(catchError(() => of(null))),
    }).subscribe(({ directory, commutes, live, alerts }) => {
      this.actorContext.syncDirectory(directory);
      const openCommutes = (commutes?.items ?? []).filter((c) => c.status !== 'ARRIVED').length;
      this.activeCommuteCount.set(openCommutes);

      const firstMonitored = live[0] ?? null;
      this.liveMonitoredName.set(firstMonitored?.workerName ?? null);
      this.liveMonitoredTransport.set(firstMonitored?.activeCommute?.transport ?? null);
      this.companionAlertCount.set(alerts?.total ?? 0);
    });
  }

  onActorChange(event: Event): void {
    const actorId = (event.target as HTMLSelectElement).value;
    if (!actorId) return;

    this.session.switchPersona(actorId);
    const persona = this.actorContext.personas.find((item) => item.id === actorId);
    if (persona?.role === 'TRUSTED_CONTACT' && !this.currentUrl().startsWith('/companion')) {
      this.router.navigateByUrl('/companion/live');
    } else if (persona && persona.role !== 'TRUSTED_CONTACT' && this.currentUrl().startsWith('/companion')) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  onSosClick(): void {
    this.router.navigateByUrl('/journey');
  }

  onCallWorkerClick(): void {
    this.router.navigateByUrl('/companion/live');
  }

  onRefreshClick(): void {
    this.syncShellContext();
    this.actorContext.setActor(this.actorContext.activeActorId());
  }

  private formatTime(withSeconds = false): string {
    return new Date().toLocaleTimeString('es-PE', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      ...(withSeconds ? { second: '2-digit' } : {}),
    });
  }
}
