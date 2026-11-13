import '@angular/compiler';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { describe, expect, it } from 'vitest';
import { ActorContextService, DEMO_PERSONAS } from './actor-context.service';

if (!getTestBed().platform) {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

describe('ActorContextService', () => {
  it('defaults to Worker 0101 and updates role flags and revision when switching personas', () => {
    const service = TestBed.inject(ActorContextService);

    expect(service.activeActorId()).toBe(DEMO_PERSONAS[0].id);
    expect(service.isWorkerRole()).toBe(true);
    expect(service.isCompanionRole()).toBe(false);
    expect(service.isAdmin()).toBe(false);

    const startRevision = service.revision();

    service.setActor(DEMO_PERSONAS[2].id);
    expect(service.activePersona().role).toBe('TRUSTED_CONTACT');
    expect(service.isCompanionRole()).toBe(true);
    expect(service.revision()).toBe(startRevision + 1);

    service.setActor(DEMO_PERSONAS[4].id);
    expect(service.isAdmin()).toBe(true);
  });

  it('ignores unknown actor IDs', () => {
    const service = TestBed.inject(ActorContextService);
    const before = service.activeActorId();
    service.setActor('non-existent-id');
    expect(service.activeActorId()).toBe(before);
  });

  it('syncs personas dynamically from the backend account directory', () => {
    const service = TestBed.inject(ActorContextService);
    const customId = '11111111-1111-1111-1111-111111111111';

    service.syncDirectory([
      {
        id: DEMO_PERSONAS[0].id,
        email: DEMO_PERSONAS[0].email,
        fullName: DEMO_PERSONAS[0].name,
        phone: '+51999111222',
        role: 'WORKER',
        timeZone: 'America/Lima',
        active: true,
        createdAt: '2026-11-13T00:00:00Z',
      },
      {
        id: customId,
        email: 'nuevo.admin@noxway.pe',
        fullName: 'Lucia Vega',
        phone: '+51999000111',
        role: 'ADMIN',
        timeZone: 'America/Lima',
        active: true,
        createdAt: '2026-11-13T00:00:00Z',
      },
    ]);

    expect(service.personas.some((p) => p.id === customId)).toBe(true);
    expect(service.findPersonaByRole('ADMIN')?.id).toBe(customId);

    service.setActor(customId);
    expect(service.activeActorId()).toBe(customId);
    expect(service.isAdmin()).toBe(true);
  });
});
