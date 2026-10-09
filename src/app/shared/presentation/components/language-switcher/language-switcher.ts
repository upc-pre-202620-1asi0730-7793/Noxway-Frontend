import { Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { LanguageService, SupportedLanguage } from '../../../infrastructure/language.service';

/**
 * Language switcher presentation component.
 * Allows users to toggle between Spanish ('ES') and English ('EN').
 */
@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonToggleModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  protected readonly languageService = inject(LanguageService);

  /**
   * Current active language code signal ('es' or 'en').
   */
  readonly currentLanguage = this.languageService.currentLang;

  /**
   * Handles user selection change on language toggle group.
   * @param lang The selected language.
   */
  onLanguageChange(lang: SupportedLanguage): void {
    if (lang) {
      this.languageService.setLanguage(lang);
    }
  }
}
