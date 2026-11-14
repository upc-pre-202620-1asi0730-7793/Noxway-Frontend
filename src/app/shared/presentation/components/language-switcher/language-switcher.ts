import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LanguageService, SupportedLanguage } from '../../../infrastructure/language.service';

/**
 * Compact segmented language selector supporting Spanish (ES) and English (EN).
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  protected readonly languageService = inject(LanguageService);

  protected selectLanguage(lang: SupportedLanguage): void {
    this.languageService.setLanguage(lang);
  }
}
