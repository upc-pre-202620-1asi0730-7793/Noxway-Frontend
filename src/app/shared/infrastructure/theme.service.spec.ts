import '@angular/compiler';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeService } from './theme.service';

if (!getTestBed().platform) {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

describe('ThemeService', () => {
  let store: Map<string, string>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, String(value));
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to dark (night) mode and applies document attributes', () => {
    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
    expect(service.isLight()).toBe(false);
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('toggles between dark and light (day) mode and persists preference', () => {
    const service = TestBed.inject(ThemeService);

    service.toggle();
    expect(service.theme()).toBe('light');
    expect(service.isLight()).toBe(true);
    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(store.get('noxway_theme')).toBe('light');

    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(store.get('noxway_theme')).toBe('dark');
  });

  it('restores previously persisted light theme on initialization', () => {
    store.set('noxway_theme', 'light');
    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
    expect(service.isLight()).toBe(true);
    expect(document.documentElement.dataset['theme']).toBe('light');
  });
});
