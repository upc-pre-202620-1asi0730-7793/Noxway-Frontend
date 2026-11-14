import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import {
  ActorContextService,
  DEFAULT_COMPANION_ACTOR_ID,
  DEFAULT_WORKER_ACTOR_ID,
} from '../../shared/infrastructure/actor-context.service';
import { SessionService } from './session.service';

if (!getTestBed().platform) {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

describe('SessionService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('clears stale profile metadata when binding a different portal actor', () => {
    const session = TestBed.inject(SessionService);
    const actorContext = TestBed.inject(ActorContextService);

    expect(session.bindPortal(false)).toBe(false);
    expect(actorContext.activeActorId()).toBe(DEFAULT_WORKER_ACTOR_ID);

    session.loadProfile().subscribe();
    const workerReq = httpMock.expectOne(`${environment.apiBaseUrl}/accounts/me`);
    workerReq.flush({
      id: DEFAULT_WORKER_ACTOR_ID,
      email: 'jorge.huaman@noxway.pe',
      fullName: 'Jorge Luis Huamán',
      phone: '+51999000101',
      role: 'WORKER',
      timeZone: 'America/Lima',
      active: true,
      createdAt: '2026-11-13T00:00:00Z',
    });

    expect(session.profile()?.fullName).toBe('Jorge Luis Huamán');

    expect(session.bindPortal(true)).toBe(true);
    expect(actorContext.activeActorId()).toBe(DEFAULT_COMPANION_ACTOR_ID);
    expect(session.profile()).toBeNull();

    session.loadProfile().subscribe();
    const companionReq = httpMock.expectOne(`${environment.apiBaseUrl}/accounts/me`);
    companionReq.flush({
      id: DEFAULT_COMPANION_ACTOR_ID,
      email: 'rosa.paredes@noxway.pe',
      fullName: 'Rosa Elena Paredes Morales',
      phone: '+51999000201',
      role: 'TRUSTED_CONTACT',
      timeZone: 'America/Lima',
      active: true,
      createdAt: '2026-11-13T00:00:00Z',
    });

    expect(session.profile()?.fullName).toBe('Rosa Elena Paredes Morales');
  });
});
