import { Injectable, signal } from '@angular/core';
import { accountTranslations } from './account-translations';

export type SupportedLanguage = 'es' | 'en';

export interface TranslationDictionary {
  [key: string]: string;
}

/**
 * Service managing application internationalization and locale state.
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  readonly currentLang = signal<SupportedLanguage>('es');

  readonly ui = (text: string): string =>
    this.currentLang() === 'en' && Object.hasOwn(accountTranslations, text)
      ? accountTranslations[text]
      : text;

  private readonly translations: Record<SupportedLanguage, TranslationDictionary> = {
    es: {
      // Worker Navigation
      'nav.dashboard': 'Dashboard',
      'nav.journey': 'Mi Trayecto',
      'nav.map': 'Mapa 24h',
      'nav.community': 'Comunidad',
      'nav.wellness': 'Bienestar & Sueño',
      'nav.benefits': 'Beneficios & Planes',
      'nav.trustedContacts': 'Contactos Confianza',
      'nav.profile': 'Mi Perfil',
      'nav.access': 'IAM / Acceso',

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
      'sidebar.accompaniedBy': 'ACOMPAÑAMIENTO',
      'sidebar.onMotorcycle': 'Red Activa',
      'sidebar.companionRole': 'Contacto de Confianza',
      'sidebar.workerRole': 'Trabajador Nocturno',
      'sidebar.adminRole': 'Moderador / Admin',
      'sidebar.callJorge': 'LLAMAR AL TRABAJADOR',
      'sidebar.sosAlert': 'ESTADO SOS',
      'sidebar.switchPortal': 'Cambiar Portal',
      'sidebar.persona': 'Persona Activa (IAM abierto)',
      'sidebar.iamBanner': 'IAM estructurado · Acceso abierto',

      // Topbar
      'topbar.activeJourney': 'Monitoreo conectado a API v1',
      'topbar.activeNetwork': 'Red Activa · Día y Noche',
      'topbar.iamStatus': 'Estado IAM',
      'topbar.dayMode': 'Día',
      'topbar.nightMode': 'Noche',
      'topbar.themeSelector': 'Modo de apariencia',

      // Page Titles
      'title.home': 'Inicio',
      'title.dashboard': 'Dashboard del Trabajador',
      'title.journey': 'Mi Trayecto Activo y Check-In Seguro',
      'title.map': 'Mapa Comunitario 24h y Zonas de Riesgo',
      'title.community': 'Comunidad, Reportes & Moderación',
      'title.wellness': 'Bitácora de Descanso & Salud del Sueño',
      'title.benefits': 'Beneficios Colectivos, Planes & Referidos',
      'title.trustedContacts': 'Gestión de Contactos de Confianza',
      'title.profile': 'Perfil del Usuario & Preferencias',
      'title.access': 'Estructura IAM & Cambio de Persona',
      'title.companion.live': 'Monitoreo en Vivo · Red Familiar',
      'title.companion.history': 'Historial de Alertas y Desplazamientos',
      'title.companion.alerts': 'Centro de Avisos & Canales de Alerta',
      'title.companion.emergency': 'Directorio de Auxilio & Central de Emergencias',
      'title.companion.invitations': 'Invitaciones de Vínculos & Planes',
      'title.companion.profile': 'Mi Perfil de Contacto de Confianza',
    },
    en: {
      // Worker Navigation
      'nav.dashboard': 'Dashboard',
      'nav.journey': 'My Commute',
      'nav.map': '24h Map',
      'nav.community': 'Community',
      'nav.wellness': 'Wellness & Sleep',
      'nav.benefits': 'Benefits & Plans',
      'nav.trustedContacts': 'Trusted Contacts',
      'nav.profile': 'My Profile',
      'nav.access': 'IAM / Access',

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
      'sidebar.accompaniedBy': 'MONITORING',
      'sidebar.onMotorcycle': 'Live Network',
      'sidebar.companionRole': 'Trusted Contact',
      'sidebar.workerRole': 'Night Shift Worker',
      'sidebar.adminRole': 'Moderator / Admin',
      'sidebar.callJorge': 'CALL WORKER',
      'sidebar.sosAlert': 'SOS STATUS',
      'sidebar.switchPortal': 'Switch Portal',
      'sidebar.persona': 'Active Persona (Open IAM)',
      'sidebar.iamBanner': 'IAM structured · Open preview',

      // Topbar
      'topbar.activeJourney': 'Connected to API v1',
      'topbar.activeNetwork': 'Active Network · Day & Night',
      'topbar.iamStatus': 'IAM Status',
      'topbar.dayMode': 'Day',
      'topbar.nightMode': 'Night',
      'topbar.themeSelector': 'Appearance mode',

      // Page Titles
      'title.home': 'Home',
      'title.dashboard': 'Worker Dashboard',
      'title.journey': 'Active Commute & Safe Check-In',
      'title.map': '24h Community Map and Risk Zones',
      'title.community': 'Community, Reports & Moderation',
      'title.wellness': 'Rest Log & Sleep Health',
      'title.benefits': 'Collective Benefits, Plans & Referrals',
      'title.trustedContacts': 'Trusted Contacts Management',
      'title.profile': 'User Profile & Preferences',
      'title.access': 'Structured IAM & Persona Switcher',
      'title.companion.live': 'Live Monitoring · Family Network',
      'title.companion.history': 'Alerts & Commute History',
      'title.companion.alerts': 'Alerts Center & Notification Channels',
      'title.companion.emergency': 'Emergency Directory & Security Central',
      'title.companion.invitations': 'Trust Link & Family Invitations',
      'title.companion.profile': 'Trusted Contact Profile',
    },
  };

  setLanguage(lang: SupportedLanguage): void {
    if (this.currentLang() !== lang) {
      this.currentLang.set(lang);
      try {
        localStorage.setItem('noxway_lang', lang);
      } catch {
        // LocalStorage fallback
      }
    }
  }

  translate(key: string): string {
    const lang = this.currentLang();
    return this.translations[lang]?.[key] ?? this.translations['es']?.[key] ?? key;
  }

  t(key: string): string {
    return this.translate(key);
  }

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
