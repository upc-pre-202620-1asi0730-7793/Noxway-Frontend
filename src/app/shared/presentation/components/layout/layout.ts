import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs';
import { LanguageService } from '../../../infrastructure/language.service';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

/**
 * Representation of a navigation option in the sidebar menu.
 */
export interface NavOption {
  link: string;
  labelKey: string;
  icon?: string;
  badge?: string;
  badgeType?: 'active' | 'counter' | 'live';
}

/**
 * Root application layout shell component.
 * Manages responsive sidebar, topbar headers, internationalization, and portal context.
 */
@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    LanguageSwitcher,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  public readonly languageService = inject(LanguageService);

  private readonly currentUrlSignal = signal<string>('/dashboard');
  readonly currentTime = signal<string>('02:45:18 AM');
  readonly companionTime = signal<string>('02:45 AM');

  private timerInterval: any = null;

  /**
   * Evaluates whether the user is currently viewing the Companion Portal routes.
   */
  readonly isCompanion = computed(() => {
    return this.currentUrlSignal().startsWith('/companion');
  });

  private readonly workerNavDefinitions: NavOption[] = [
    { link: '/dashboard', labelKey: 'nav.dashboard', icon: 'circle' },
    {
      link: '/journey',
      labelKey: 'nav.journey',
      icon: 'circle',
      badge: 'ACTIVO',
      badgeType: 'active',
    },
    { link: '/map', labelKey: 'nav.map', icon: 'circle' },
    {
      link: '/community',
      labelKey: 'nav.community',
      icon: 'circle',
      badge: '3',
      badgeType: 'counter',
    },
    { link: '/wellness', labelKey: 'nav.wellness', icon: 'circle' },
    { link: '/benefits', labelKey: 'nav.benefits', icon: 'circle' },
    { link: '/trusted-contacts', labelKey: 'nav.trustedContacts', icon: 'circle' },
    { link: '/profile', labelKey: 'nav.profile', icon: 'circle' },
  ];

  private readonly companionNavDefinitions: NavOption[] = [
    { link: '/companion/live', labelKey: 'nav.companion.live', badge: 'LIVE', badgeType: 'live' },
    { link: '/companion/history', labelKey: 'nav.companion.history' },
    {
      link: '/companion/alerts',
      labelKey: 'nav.companion.alerts',
      badge: '2',
      badgeType: 'counter',
    },
    { link: '/companion/emergency', labelKey: 'nav.companion.emergency' },
    { link: '/companion/invitations', labelKey: 'nav.companion.invitations' },
    { link: '/companion/profile', labelKey: 'nav.companion.profile' },
  ];

  /**
   * Dynamic worker options reacting to language changes.
   */
  readonly workerOptions = computed(() => {
    // Trigger reactivity on current language signal
    this.languageService.currentLang();
    return this.workerNavDefinitions.map((opt) => ({
      ...opt,
      label: this.languageService.translate(opt.labelKey),
    }));
  });

  /**
   * Dynamic companion options reacting to language changes.
   */
  readonly companionOptions = computed(() => {
    this.languageService.currentLang();
    return this.companionNavDefinitions.map((opt) => ({
      ...opt,
      label: this.languageService.translate(opt.labelKey),
    }));
  });

  /**
   * Dynamic page title reflecting current route and active language.
   */
  readonly currentPageTitle = computed(() => {
    const url = this.currentUrlSignal();
    this.languageService.currentLang();

    if (url.includes('/home')) {
      return this.languageService.translate('title.home');
    }
    if (url.includes('/dashboard')) {
      return this.languageService.translate('title.dashboard');
    }

    // Companion Portal Routes
    if (url.includes('/companion/live')) {
      return this.languageService.translate('title.companion.live');
    }
    if (url.includes('/companion/history')) {
      return this.languageService.translate('title.companion.history');
    }
    if (url.includes('/companion/alerts')) {
      return this.languageService.translate('title.companion.alerts');
    }
    if (url.includes('/companion/emergency')) {
      return this.languageService.translate('title.companion.emergency');
    }
    if (url.includes('/companion/invitations')) {
      return this.languageService.translate('title.companion.invitations');
    }
    if (url.includes('/companion/profile')) {
      return this.languageService.translate('title.companion.profile');
    }

    // Worker Portal Routes
    if (url.includes('/journey')) {
      return this.languageService.translate('title.journey');
    }
    if (url.includes('/map')) {
      return this.languageService.translate('title.map');
    }
    if (url.includes('/community')) {
      return this.languageService.translate('title.community');
    }
    if (url.includes('/wellness')) {
      return this.languageService.translate('title.wellness');
    }
    if (url.includes('/benefits')) {
      return this.languageService.translate('title.benefits');
    }
    if (url.includes('/trusted-contacts')) {
      return this.languageService.translate('title.trustedContacts');
    }
    if (url.includes('/profile')) {
      return this.languageService.translate('title.profile');
    }
    return this.languageService.translate('title.dashboard');
  });

  ngOnInit(): void {
    this.currentUrlSignal.set(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrlSignal.set(event.urlAfterRedirects || event.url);
      });

    this.updateClock();
    this.timerInterval = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  /**
   * Refreshes the real-time digital clock display.
   */
  private updateClock(): void {
    const now = new Date();
    this.currentTime.set(
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
    );
    this.companionTime.set(
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    );
  }

  /**
   * Triggers the emergency SOS notification protocol.
   */
  onSosClick(): void {
    const msg =
      this.languageService.currentLang() === 'es'
        ? 'ALERTA SOS ACTIVADA: Se ha notificado a tu red de confianza y a Serenazgo de turno.'
        : 'SOS ALERT TRIGGERED: Your trusted network and on-duty Serenazgo have been notified.';
    alert(msg);
  }

  /**
   * Initiates a direct priority call to the accompanied worker.
   */
  onCallJorgeClick(): void {
    const msg =
      this.languageService.currentLang() === 'es'
        ? 'LLAMANDO A JORGE LUIS HUAMÁN (+51 987 654 321) vía línea segura.'
        : 'CALLING JORGE LUIS HUAMÁN (+51 987 654 321) via secure line.';
    alert(msg);
  }

  /**
   * Reloads the application view.
   */
  onRefreshClick(): void {
    window.location.reload();
  }
}
