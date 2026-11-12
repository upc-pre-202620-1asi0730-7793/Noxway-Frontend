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
    http.expectOne('http://127.0.0.1:3000/auth/login').flush({
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
    await harness.navigateByUrl('/map');
    const records = http.expectOne('http://127.0.0.1:3000/me/records/services');
    expect(records.request.headers.get('Authorization')).toBe('Bearer test-token');
    records.flush([]);
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Aún no has registrado servicios');
    expect(harness.routeNativeElement?.textContent).not.toContain('Primax');
    http.verify();
  });
});
