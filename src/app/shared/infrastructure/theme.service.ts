import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';

export type NoxwayTheme = 'dark' | 'light';

const STORAGE_KEY = 'noxway_theme';

/**
 * Manages Day (light) and Night (dark) visual themes across desktop and mobile shifts.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT, { optional: true });
  private readonly themeSignal = signal<NoxwayTheme>(this.readInitialTheme());

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');
  readonly isLight = computed(() => this.themeSignal() === 'light');

  constructor() {
    this.applyTheme(this.themeSignal());
  }

  setTheme(theme: NoxwayTheme): void {
    if (this.themeSignal() !== theme) {
      this.themeSignal.set(theme);
    }
    this.applyTheme(theme);
    this.persistTheme(theme);
  }

  toggle(): void {
    this.setTheme(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  private applyTheme(theme: NoxwayTheme): void {
    const root = this.document?.documentElement;
    if (!root) {
      return;
    }
    root.dataset['theme'] = theme;
    root.style.colorScheme = theme;
  }

  private persistTheme(theme: NoxwayTheme): void {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures in restricted browser environments.
    }
  }

  private readInitialTheme(): NoxwayTheme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // Fall back to Night mode default when storage is unavailable.
    }
    return 'dark';
  }
}
