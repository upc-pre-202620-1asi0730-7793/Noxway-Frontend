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
});
