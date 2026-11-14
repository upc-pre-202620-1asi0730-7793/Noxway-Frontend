import '@angular/compiler';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageService } from '../../../infrastructure/language.service';
import { LanguageSwitcher } from './language-switcher';

if (!getTestBed().platform) {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

describe('LanguageSwitcher', () => {
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
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders ES and EN controls and updates active language cleanly', async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSwitcher],
    }).compileComponents();

    const fixture = TestBed.createComponent(LanguageSwitcher);
    const languageService = TestBed.inject(LanguageService);
    fixture.detectChanges();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    expect(buttons.map((b) => b.textContent?.trim())).toEqual(['ES', 'EN']);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');

    buttons[1].click();
    fixture.detectChanges();

    expect(languageService.currentLang()).toBe('en');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(store.get('noxway_lang')).toBe('en');
  });

  it('should format domain enum codes in Spanish and English without raw underscores', () => {
    const languageService = TestBed.inject(LanguageService);

    languageService.setLanguage('es');
    expect(languageService.code('NIGHT')).toBe('Nocturno');
    expect(languageService.code('FAMILY_CREW')).toBe('Cuadrilla Familiar');
    expect(languageService.code('WORKER')).toBe('Trabajador');
    expect(languageService.code('TRUSTED_CONTACT')).toBe('Contacto de Confianza');
    expect(languageService.code('PENDING')).toBe('Pendiente');
    expect(languageService.code('ACTIVE')).toBe('Activo');

    languageService.setLanguage('en');
    expect(languageService.code('NIGHT')).toBe('Night');
    expect(languageService.code('FAMILY_CREW')).toBe('Family Crew');
    expect(languageService.code('WORKER')).toBe('Worker');
    expect(languageService.code('TRUSTED_CONTACT')).toBe('Trusted Contact');
    expect(languageService.code('PENDING')).toBe('Pending');
    expect(languageService.code('ACTIVE')).toBe('Active');
  });
});
