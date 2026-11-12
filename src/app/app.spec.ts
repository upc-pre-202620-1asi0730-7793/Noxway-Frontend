import { LanguageService } from './shared/infrastructure/language.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { SessionService } from './iam/infrastructure/session.service';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
      expect(harness.routeNativeElement?.querySelector('form')).toBeTruthy();
      expect(harness.routeNativeElement?.textContent).not.toContain('Primax');
    }

    await harness.navigateByUrl('/map');
    const overpass = 'https://overpass.private.coffee/api/interpreter';
    http.expectOne((request) => request.url === overpass && request.params.get('data')?.includes('amenity=pharmacy') === true)
      .flush({ elements: [] });
    harness.detectChanges();
    const supermarket = Array.from(harness.routeNativeElement?.querySelectorAll('button') ?? [])
      .find((button) => button.textContent.includes('Supermercados'));
    expect(supermarket).toBeTruthy();
    supermarket?.click();
    http.expectOne((request) => request.url === overpass && request.params.get('data')?.includes('shop=supermarket') === true)
      .flush({ elements: [] });
    expect(harness.routeNativeElement?.textContent).not.toContain('Reportar lugar');

    await harness.navigateByUrl('/benefits');
    expect(harness.routeNativeElement?.textContent).toContain('Sin plan activo');
    TestBed.inject(LanguageService).currentLang.set('en');
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('No active plan');
    await harness.navigateByUrl('/dashboard');
    expect(harness.routeNativeElement?.textContent).toContain('Hello, QA Entrevista');
    http.verify();
  });
});
