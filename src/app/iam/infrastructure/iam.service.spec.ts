import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { IamService } from './iam.service';

if (!getTestBed().platform) {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

describe('IamService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads structured /api/v1/auth/status and updates status signal', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const service = TestBed.inject(IamService);
    const httpMock = TestBed.inject(HttpTestingController);

    let receivedMode = '';
    service.loadStatus().subscribe((res) => {
      receivedMode = res.mode;
    });

    const req = httpMock.expectOne('/api/v1/auth/status');
    expect(req.request.method).toBe('GET');
    req.flush({
      securityEnabled: false,
      mode: 'STRUCTURED_PENDING_IMPLEMENTATION',
      message: 'IAM module is structured and deferred.',
    });

    expect(receivedMode).toBe('STRUCTURED_PENDING_IMPLEMENTATION');
    expect(service.status()?.securityEnabled).toBe(false);
    httpMock.verify();
  });
});
