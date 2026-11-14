import '@angular/compiler';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { actorContextInterceptor } from './actor-context.interceptor';
import { ActorContextService, DEMO_PERSONAS } from './actor-context.service';
import { LanguageService } from './language.service';

if (!getTestBed().platform) {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

describe('actorContextInterceptor', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('attaches X-Actor-Id and Accept-Language headers to /api/v1 requests', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([actorContextInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);
    const actorContext = TestBed.inject(ActorContextService);
    const languageService = TestBed.inject(LanguageService);

    actorContext.setActor(DEMO_PERSONAS[4].id);
    languageService.setLanguage('en');

    http.get('/api/v1/accounts/me').subscribe();

    const req = httpMock.expectOne('/api/v1/accounts/me');
    expect(req.request.headers.get('X-Actor-Id')).toBe(DEMO_PERSONAS[4].id);
    expect(req.request.headers.get('Accept-Language')).toBe('en');
    req.flush({});
    httpMock.verify();
  });

  it('does not attach X-Actor-Id to external URLs', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([actorContextInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    http.get('https://example.org/data').subscribe();

    const req = httpMock.expectOne('https://example.org/data');
    expect(req.request.headers.has('X-Actor-Id')).toBe(false);
    req.flush({});
    httpMock.verify();
  });
});
