import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs';
import { LanguageService } from '../../../infrastructure/language.service';
import { SessionService } from '../../../../iam/infrastructure/session.service';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

const workerNavigation = [
  { link: '/dashboard', section: 'dashboard' },
  { link: '/my-journeys', section: 'journey' },
  { link: '/map', section: 'map' },
  { link: '/community', section: 'community' },
  { link: '/wellness', section: 'wellness' },
  { link: '/benefits', section: 'benefits' },
  { link: '/trusted-contacts', section: 'trustedContacts' },
  { link: '/profile', section: 'profile' },
];

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, LanguageSwitcher],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly session = inject(SessionService);
  readonly languageService = inject(LanguageService);

  private readonly currentPath = signal('/dashboard');
  readonly currentTime = signal('');
  readonly wideContent = computed(() =>
    ['/my-journeys', '/map', '/community', '/wellness', '/benefits'].includes(this.currentPath()),
  );
  readonly workerOptions = computed(() => workerNavigation.map(({ link, section }) => ({
    link,
    label: this.languageService.translate(`nav.${section}`),
  })));
  readonly currentPageTitle = computed(() => {
    const current = workerNavigation.find(({ link }) => link === this.currentPath());
    return this.languageService.translate(`title.${current?.section ?? 'dashboard'}`);
  });

  ngOnInit(): void {
    this.setCurrentPath(this.router.url);
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((event) => this.setCurrentPath(event.urlAfterRedirects));

    this.updateClock();
    const interval = setInterval(() => this.updateClock(), 1000);
    this.destroyRef.onDestroy(() => clearInterval(interval));
  }

  private setCurrentPath(url: string): void {
    this.currentPath.set(url.split(/[?#]/)[0]);
  }

  private updateClock(): void {
    this.currentTime.set(new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }));
  }

  logout(): void {
    this.session.logout();
    void this.router.navigateByUrl('/login');
  }
}
