import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ɵresolveComponentResources as resolveComponentResources } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { Community } from './community';

if (!getTestBed().platform) {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

describe('Community view & composer workflows', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  async function setup(queryParams: Record<string, string> = {}) {
    await resolveComponentResources((url) => Promise.resolve(url.endsWith('.html') ? '<div></div>' : ''));
    await TestBed.configureTestingModule({
      imports: [Community],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap(queryParams)),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Community);
    const httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Flush initial loadAll requests (posts + moderation reports)
    httpMock.expectOne((req) => req.url.startsWith('/api/v1/community/posts')).flush({
      items: [
        {
          id: 'p1',
          authorId: '00000000-0000-0000-0000-000000000101',
          authorName: 'Jorge Huamán',
          authorRole: 'WORKER',
          title: 'Operativo en Av. Arequipa',
          content: 'Patrullaje activo',
          district: 'Lince',
          category: 'Aviso de seguridad',
          latitude: -12.0849,
          longitude: -77.0358,
          createdAt: '2026-11-13T10:00:00Z',
        },
      ],
      page: 0,
      size: 50,
      total: 1,
    });
    httpMock.expectOne((req) => req.url.startsWith('/api/v1/moderation/reports')).flush({
      items: [],
      page: 0,
      size: 30,
      total: 0,
    });

    return { component: fixture.componentInstance, httpMock };
  }

  it('pre-opens modal on queried mode and map coordinates from Mapa 24h deep links', async () => {
    const { component } = await setup({ action: 'service', lat: '-12.055', lng: '-77.035' });
    expect(component.composing()).toBe(true);
    expect(component.composerMode()).toBe('service');
    expect(component.selectedLocation()).toEqual({ lat: -12.055, lon: -77.035 });
    expect(component.locatedPostCount()).toBe(1);
  });

  it('publishes community post with category, fallback district, and map coordinates', async () => {
    const { component, httpMock } = await setup();

    component.openComposer('post', { lat: -12.0485, lon: -77.0315 });
    component.postCategory = 'Aviso de seguridad';
    component.postTitle = 'Poste sin luz';
    component.postContent = 'Cuadra oscura entre Jr. Union e Ica';
    component.postDistrict = '';

    component.publishPost();

    const postReq = httpMock.expectOne(
      (req) => req.method === 'POST' && req.url === '/api/v1/community/posts',
    );
    expect(postReq.request.body).toEqual({
      title: 'Poste sin luz',
      content: 'Cuadra oscura entre Jr. Union e Ica',
      district: 'Lima Centro',
      category: 'Aviso de seguridad',
      latitude: -12.0485,
      longitude: -77.0315,
    });

    postReq.flush({
      id: 'p2',
      authorId: '00000000-0000-0000-0000-000000000101',
      authorName: 'Jorge Huamán',
      authorRole: 'WORKER',
      title: 'Poste sin luz',
      content: 'Cuadra oscura entre Jr. Union e Ica',
      district: 'Lima Centro',
      category: 'Aviso de seguridad',
      latitude: -12.0485,
      longitude: -77.0315,
      createdAt: '2026-11-13T11:00:00Z',
    });

    // Reload triggered after successful publish
    httpMock.expectOne((req) => req.url.startsWith('/api/v1/community/posts')).flush({
      items: [],
      page: 0,
      size: 50,
      total: 0,
    });
    httpMock.expectOne((req) => req.url.startsWith('/api/v1/moderation/reports')).flush({
      items: [],
      page: 0,
      size: 30,
      total: 0,
    });

    expect(component.composing()).toBe(false);
    expect(component.selectedLocation()).toBeNull();
  });
});
