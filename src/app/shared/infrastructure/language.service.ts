import { Injectable, signal, computed } from '@angular/core';

export type SupportedLanguage = 'es' | 'en';

export interface TranslationDictionary {
  [key: string]: string;
}

/**
 * Service managing application internationalization and locale state.
 * Provides reactive signals for the current language and translation lookups.
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  /**
   * Reactive signal tracking the currently selected language ('es' or 'en').
   */
  readonly currentLang = signal<SupportedLanguage>('es');

  private readonly translations: Record<SupportedLanguage, TranslationDictionary> = {
    es: {
      // Worker Navigation
      'nav.dashboard': 'Dashboard',
      'nav.journey': 'Mi Trayecto',
      'nav.map': 'Mapa 24 Horas',
      'nav.community': 'Comunidad',
      'nav.wellness': 'Bienestar & Sueño',
      'nav.benefits': 'Beneficios & Planes',
      'nav.trustedContacts': 'Contactos Confianza',
      'nav.profile': 'Mi Perfil',

      // Companion Navigation
      'nav.companion.live': 'Monitoreo en Vivo',
      'nav.companion.history': 'Historial de Rutas',
      'nav.companion.alerts': 'Avisos & Alertas',
      'nav.companion.emergency': 'Auxilio & Serenazgo',
      'nav.companion.invitations': 'Invitaciones',
      'nav.companion.profile': 'Mi Perfil de Contacto',

      // Section Titles
      'sidebar.workerModules': 'MÓDULOS DEL TRABAJADOR',
      'sidebar.contactPanel': 'PANEL DEL CONTACTO',
      'sidebar.accompaniedBy': 'ACOMPAÑANDO A:',
      'sidebar.onMotorcycle': 'En moto',
      'sidebar.companionRole': 'Contacto de Confianza',
      'sidebar.workerRole': 'Vigilante Nocturno',
      'sidebar.callJorge': 'LLAMAR A JORGE',
      'sidebar.sosAlert': 'ALERTA SOS',
      'sidebar.switchPortal': 'Portal Contacto',
      'sidebar.logout': 'Salir',

      // Topbar
      'topbar.activeJourney': 'Jorge en trayecto activo',
      'topbar.activeNetwork': 'Red Nocturna Activa 24h',
      'topbar.hubScreens': 'Ver Hub Pantallas',

      // Page Titles
      'title.dashboard': 'Dashboard del Trabajador',
      'title.journey': 'Mi Trayecto Activo y Check-In Seguro',
      'title.map': 'Mapa Comunitario 24h y Zonas de Riesgo',
      'title.community': 'Comunidad Nocturna & Reportes Colaborativos',
      'title.wellness': 'Bitácora de Descanso & Salud del Sueño',
      'title.benefits': 'Beneficios Colectivos & Membresía',
      'title.trustedContacts': 'Gestión de Contactos de Confianza',
      'title.profile': 'Perfil del Usuario & Configuración',
      'title.companion.live': 'Monitoreo en Vivo · Jorge Luis Huamán',
      'title.companion.history': 'Historial de Desplazamientos de Jorge',
      'title.companion.alerts': 'Centro de Avisos & Configuración de Alertas',
      'title.companion.emergency': 'Directorio de Auxilio & Central de Emergencias',
      'title.companion.invitations': 'Gestión de Invitaciones & Vínculos de Confianza',
      'title.companion.profile': 'Mi Perfil de Contacto de Confianza',
    },
    en: {
      // Worker Navigation
      'nav.dashboard': 'Dashboard',
      'nav.journey': 'My Route',
      'nav.map': '24-Hour Map',
      'nav.community': 'Community',
      'nav.wellness': 'Wellness & Sleep',
      'nav.benefits': 'Benefits & Plans',
      'nav.trustedContacts': 'Trusted Contacts',
      'nav.profile': 'My Profile',

      // Companion Navigation
      'nav.companion.live': 'Live Monitoring',
      'nav.companion.history': 'Route History',
      'nav.companion.alerts': 'Notices & Alerts',
      'nav.companion.emergency': 'Assistance & Serenazgo',
      'nav.companion.invitations': 'Invitations',
      'nav.companion.profile': 'Contact Profile',

      // Section Titles
      'sidebar.workerModules': 'WORKER MODULES',
      'sidebar.contactPanel': 'COMPANION PANEL',
      'sidebar.accompaniedBy': 'ACCOMPANYING:',
      'sidebar.onMotorcycle': 'On motorcycle',
      'sidebar.companionRole': 'Trusted Contact',
      'sidebar.workerRole': 'Night Security Guard',
      'sidebar.callJorge': 'CALL JORGE',
      'sidebar.sosAlert': 'SOS ALERT',
      'sidebar.switchPortal': 'Companion View',
      'sidebar.logout': 'Logout',

      // Topbar
      'topbar.activeJourney': 'Jorge on active commute',
      'topbar.activeNetwork': 'Active Night Network 24h',
      'topbar.hubScreens': 'View Screens Hub',

      // Page Titles
      'title.dashboard': 'Night Worker Dashboard',
      'title.journey': 'Active Route & Safe Check-In',
      'title.map': '24h Community Map & Risk Zones',
      'title.community': 'Night Community & Collaborative Reports',
      'title.wellness': 'Rest Log & Sleep Health',
      'title.benefits': 'Collective Benefits & Membership',
      'title.trustedContacts': 'Trusted Contacts Management',
      'title.profile': 'User Profile & Settings',
      'title.companion.live': 'Live Monitoring · Jorge Luis Huamán',
      'title.companion.history': 'Jorge Route Journey History',
      'title.companion.alerts': 'Alerts Center & Notification Settings',
      'title.companion.emergency': 'Emergency Directory & Security Central',
      'title.companion.invitations': 'Invitations & Trusted Bonds',
      'title.companion.profile': 'Trusted Contact Profile',
    },
  };

  /**
   * Sets the active application language.
   * @param lang The language code ('es' or 'en').
   */
  setLanguage(lang: SupportedLanguage): void {
    if (this.currentLang() !== lang) {
      this.currentLang.set(lang);
      try {
        localStorage.setItem('noxway_lang', lang);
      } catch {
        // LocalStorage fallback for restricted sandbox environments
      }
    }
  }

  /**
   * Retrieves the translated string for a given key in the current language.
   * Falls back to the key if translation is missing.
   * @param key Translation token identifier.
   */
  translate(key: string): string {
    const lang = this.currentLang();
    return this.translations[lang]?.[key] ?? this.translations['es']?.[key] ?? key;
  }

  /**
   * Initializes the language from stored preference if present.
   */
  constructor() {
    try {
      const saved = localStorage.getItem('noxway_lang') as SupportedLanguage;
      if (saved === 'es' || saved === 'en') {
        this.currentLang.set(saved);
      }
    } catch {
      // Default to Spanish
    }
  }
}
