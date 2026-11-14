import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { DashboardService, LiveDashboardSnapshot } from './dashboard.service';

if (!getTestBed().platform) {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

describe('DashboardService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('derives completed trips from total count and falls back to backend free plan name', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const service = TestBed.inject(DashboardService);
    const httpMock = TestBed.inject(HttpTestingController);

    let snapshot: LiveDashboardSnapshot | undefined;
    service.loadSnapshot().subscribe((res) => {
      snapshot = res;
    });

    httpMock.expectOne('/api/v1/accounts/me').flush(null);
    httpMock
      .expectOne((req) => req.url.startsWith('/api/v1/commutes'))
      .flush({
        items: [
          {
            id: 'c-active',
            workerId: 'w1',
            workerName: 'Worker',
            origin: 'A',
            destination: 'B',
            transport: 'BUS',
            status: 'ACTIVE',
            startTime: '2026-11-13T00:00:00Z',
            estimatedArrivalTime: '2026-11-13T01:00:00Z',
            arrivalTime: null,
            toleranceMinutes: 10,
            delayUntil: null,
            createdAt: '2026-11-13T00:00:00Z',
          },
        ],
        page: 0,
        size: 20,
        total: 25,
      });
    httpMock.expectOne('/api/v1/trust-links').flush([]);
    httpMock.expectOne((req) => req.url.startsWith('/api/v1/wellness/summary')).flush(null);
    httpMock
      .expectOne((req) => req.url.startsWith('/api/v1/community/services'))
      .flush({ items: [], page: 0, size: 1, total: 4 });
    httpMock
      .expectOne((req) => req.url.startsWith('/api/v1/community/posts'))
      .flush({ items: [], page: 0, size: 1, total: 3 });
    httpMock.expectOne('/api/v1/subscriptions').flush([]);
    httpMock.expectOne('/api/v1/plans').flush([
      {
        id: 'p1',
        code: 'ESSENTIAL',
        name: 'Plan Esencial Gratuito',
        monthlyPrice: 0,
        maxContacts: 2,
        maxWorkers: 1,
        active: true,
      },
    ]);

    expect(snapshot).toBeDefined();
    expect(snapshot?.completedTrips).toBe(24);
    expect(snapshot?.activeSubscriptionPlan).toBe('Plan Esencial Gratuito');
    expect(snapshot?.approvedServicesCount).toBe(4);
    expect(snapshot?.communityPostsCount).toBe(3);

    httpMock.verify();
  });
});
