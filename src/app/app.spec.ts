import { LanguageService } from './shared/infrastructure/language.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { SessionService } from './iam/infrastructure/session.service';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('Noxway access', () => {
  beforeEach(() => {
    sessionStorage.removeItem('noxway_demo');
    sessionStorage.removeItem('noxway_local_session');
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()] });
  });

  it('redirects a visitor to login when opening the dashboard', async () => {
    const harness = await RouterTestingHarness.create('/dashboard');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Inicia sesión');
  });

  it('rejects a stale demo session and shows blank account fields', async () => {
    sessionStorage.setItem('noxway_demo', 'true');
    const harness = await RouterTestingHarness.create('/companion/live');

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeNativeElement?.textContent).not.toMatch(/Jorge Luis|Rosa Elena/);
    expect(harness.routeNativeElement?.querySelector<HTMLInputElement>('input[name="email"]')?.value).toBe('');
    expect(harness.routeNativeElement?.querySelector<HTMLInputElement>('input[name="password"]')?.value).toBe('');
    TestBed.inject(HttpTestingController).verify();
  });

  it('renders the registration fields at the registration route', async () => {
    const harness = await RouterTestingHarness.create('/register');
    expect(harness.routeNativeElement?.querySelector('input[name="fullName"]')).toBeTruthy();
    expect(harness.routeNativeElement?.querySelector('select[name="shiftType"]')).toBeTruthy();
  });

  it('shows the signed-in identity and readable privacy preferences', async () => {
    const session = TestBed.inject(SessionService);
    const http = TestBed.inject(HttpTestingController);
    const login = firstValueFrom(session.login({ email: 'qa@example.com', password: 'Prueba123!' }));
    http.expectOne('/api/local/auth/login').flush({
      token: 'test-token',
      profile: {
        id: 1, fullName: 'QA Entrevista', avatar: 'QE', email: 'qa@example.com',
        role: 'Trabajador', shiftType: 'day', schedule: '08:00 a 17:00',
      },
    });
    await login;

    const harness = await RouterTestingHarness.create('/dashboard');
    const summary = { completedTrips: 0, activeTrip: null, contactCount: 0, lastRest: null, noticeCount: 0 };
    http.expectOne('/api/local/me/dashboard').flush(summary);
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Trayectos completados');
    expect(harness.routeNativeElement?.textContent).toContain('Hola, QA Entrevista');
    expect(harness.routeNativeElement?.textContent).not.toContain('Jorge Luis');
    await harness.navigateByUrl('/profile');
    const labels = harness.routeNativeElement?.querySelectorAll('mat-checkbox');
    expect(labels?.length).toBe(3);
    expect(labels?.[0].textContent).toContain('Compartir GPS');
    for (const [route, section, empty] of [
      ['/community', 'community', 'Aún no has creado ningún aviso'],
      ['/wellness', 'wellness', 'Aún no has registrado descansos'],
      ['/trusted-contacts', 'contacts', 'Aún no has agregado contactos'],
    ]) {
      await harness.navigateByUrl(route);
      const records = http.expectOne(`/api/local/me/records/${section}`);
      expect(records.request.headers.get('Authorization')).toBe('Bearer test-token');
      records.flush([]);
      harness.detectChanges();
      expect(harness.routeNativeElement?.textContent).toContain(empty);
      if (section === 'community') {
        expect(harness.routeNativeElement?.textContent).toContain('Publicar aviso');
        expect(harness.routeNativeElement?.textContent).toContain('Código de la Comunidad');
        const dialog = harness.routeNativeElement?.querySelector('dialog');
        expect(dialog).toBeTruthy();
        dialog!.showModal = () => dialog!.setAttribute('open', '');
        harness.routeNativeElement?.querySelector<HTMLButtonElement>('.publish-btn')?.click();
        harness.detectChanges();
        expect(dialog?.querySelector('app-report-location')).toBeTruthy();
      } else {
        const dialog = harness.routeNativeElement?.querySelector('dialog');
        expect(dialog).toBeTruthy();
        dialog!.showModal = () => dialog!.setAttribute('open', '');
        harness.routeNativeElement?.querySelector<HTMLButtonElement>('.publish-btn')?.click();
        harness.detectChanges();
        expect(dialog?.querySelector('form')).toBeTruthy();
      }
      expect(harness.routeNativeElement?.textContent).not.toContain('Primax');
    }

    await harness.navigateByUrl('/map');
    http.expectOne('/api/local/me/records/community').flush([]);
    http.expectOne('https://tiles.openfreemap.org/planet')
      .flush({ tiles: ['https://tiles.openfreemap.org/qa/{z}/{x}/{y}.pbf'] });
    const tiles = http.match((request) => request.url.startsWith('https://tiles.openfreemap.org/qa/14/'));
    expect(tiles.length).toBeGreaterThan(0);
    for (const tile of tiles) tile.flush(new ArrayBuffer(0));
    harness.detectChanges();
    const supermarket = Array.from(harness.routeNativeElement?.querySelectorAll('button') ?? [])
      .find((button) => button.textContent.includes('Supermercados'));
    expect(supermarket).toBeTruthy();
    supermarket?.click();
    http.expectNone((request) => request.url.startsWith('https://tiles.openfreemap.org/'));
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toContain('Supermercados');
    expect(harness.routeNativeElement?.textContent).not.toContain('Reportar lugar');

    await harness.navigateByUrl('/benefits');
    expect(harness.routeNativeElement?.textContent).toContain('Sin plan activo');
    TestBed.inject(LanguageService).currentLang.set('en');
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('No active plan');
    await harness.navigateByUrl('/dashboard');
    http.expectOne('/api/local/me/dashboard').flush(summary);
    expect(harness.routeNativeElement?.textContent).toContain('Hello, QA Entrevista');
    http.verify();
  });
});
