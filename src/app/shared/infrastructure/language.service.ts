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

  private readonly codeLabels: Record<SupportedLanguage, TranslationDictionary> = {
    es: {
      // Turnos / Shifts
      DAY: 'Diurno',
      NIGHT: 'Nocturno',
      ROTATING: 'Rotativo',
      FLEX: 'Flexible',
      'N/A': 'No asignado',

      // Roles
      WORKER: 'Trabajador',
      TRUSTED_CONTACT: 'Contacto de Confianza',
      ADMIN: 'Administrador',
      MODERATOR: 'Moderador',

      // Planes / Plans
      ESSENTIAL: 'Esencial',
      SENTINEL_PRO: 'Sentinel Pro',
      FAMILY_CREW: 'Cuadrilla Familiar',
      NONE: 'Sin plan',
      FREE: 'Gratuito',

      // Estados / Statuses
      STANDBY: 'En espera',
      ACTIVE: 'Activo',
      ARRIVED: 'Llegó a destino',
      DELAYED: 'Demorado',
      OVERDUE: 'Retraso crítico',
      CANCELLED: 'Cancelado',
      PENDING: 'Pendiente',
      PENDING_PAYMENT: 'Pendiente de pago',
      CONFIRMED: 'Confirmado',
      REJECTED: 'Rechazado',
      APPROVED: 'Aprobado',
      REVOKED: 'Revocado',
      AVAILABLE: 'Disponible',
      REDEEMED: 'Canjeado',
      CLAIMED: 'Canjeado',
      EXPIRED: 'Vencido',
      OPEN: 'Abierto',
      RESOLVED: 'Resuelto',
      'EN REPOSO': 'En reposo',
      DELIVERED: 'Entregado',
      PENDING_PROVIDER: 'En envío (proveedor)',
      FAILED: 'Fallido',
      SENT: 'Enviado',
      INACTIVE: 'Inactivo',

      // Canales de notificación / Notification channels
      ALL: 'Todos',
      IN_APP: 'En la app',
      EMAIL: 'Correo',
      SMS: 'SMS',
      WHATSAPP: 'WhatsApp',
      PUSH: 'Notificación push',

      // Incidentes / Incidents
      SOS: 'Emergencia SOS',
      DELAY: 'Demora',
      DEVIATION: 'Desvío de ruta',
      OTHER: 'Otro',

      // Niveles de riesgo / Risk levels
      LOW: 'Bajo',
      MEDIUM: 'Medio',
      HIGH: 'Alto',
      CRITICAL: 'Crítico',

      // Moderación y tipos / Moderation & types
      SERVICE: 'Servicio',
      RISK: 'Zona de riesgo',
      RISK_ZONE: 'Zona de riesgo',
      REVIEW: 'Reseña',
      COMMENT: 'Comentario',
      APPROVE: 'Aprobar',
      REJECT: 'Rechazar',
      PHARMACY: 'Farmacia',
      GAS_STATION: 'Grifo',
      HOSPITAL: 'Hospital / Clínica',
      POLICE: 'Comisaría / Serenazgo',
      SUPERMARKET: 'Supermercado',
      STORE: 'Tienda / Minimarket',
    },
    en: {
      // Shifts
      DAY: 'Day',
      NIGHT: 'Night',
      ROTATING: 'Rotating',
      FLEX: 'Flexible',
      'N/A': 'Unassigned',

      // Roles
      WORKER: 'Worker',
      TRUSTED_CONTACT: 'Trusted Contact',
      ADMIN: 'Administrator',
      MODERATOR: 'Moderator',

      // Plans
      ESSENTIAL: 'Essential',
      SENTINEL_PRO: 'Sentinel Pro',
      FAMILY_CREW: 'Family Crew',
      NONE: 'No plan',
      FREE: 'Free',

      // Statuses
      STANDBY: 'Standby',
      ACTIVE: 'Active',
      ARRIVED: 'Arrived',
      DELAYED: 'Delayed',
      OVERDUE: 'Overdue',
      CANCELLED: 'Cancelled',
      PENDING: 'Pending',
      PENDING_PAYMENT: 'Pending payment',
      CONFIRMED: 'Confirmed',
      REJECTED: 'Rejected',
      APPROVED: 'Approved',
      REVOKED: 'Revoked',
      AVAILABLE: 'Available',
      REDEEMED: 'Redeemed',
      CLAIMED: 'Claimed',
      EXPIRED: 'Expired',
      OPEN: 'Open',
      RESOLVED: 'Resolved',
      'EN REPOSO': 'Resting',
      DELIVERED: 'Delivered',
      PENDING_PROVIDER: 'Pending provider',
      FAILED: 'Failed',
      SENT: 'Sent',
      INACTIVE: 'Inactive',

      // Notification channels
      ALL: 'All',
      IN_APP: 'In-App',
      EMAIL: 'Email',
      SMS: 'SMS',
      WHATSAPP: 'WhatsApp',
      PUSH: 'Push notification',

      // Incidents
      SOS: 'SOS Emergency',
      DELAY: 'Delay',
      DEVIATION: 'Route deviation',
      OTHER: 'Other',

      // Risk levels
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: 'High',
      CRITICAL: 'Critical',

      // Moderation & types
      SERVICE: 'Service',
      RISK: 'Risk zone',
      RISK_ZONE: 'Risk zone',
      REVIEW: 'Review',
      COMMENT: 'Comment',
      APPROVE: 'Approve',
      REJECT: 'Reject',
      PHARMACY: 'Pharmacy',
      GAS_STATION: 'Gas station',
      HOSPITAL: 'Hospital / Clinic',
      POLICE: 'Police / Security',
      SUPERMARKET: 'Supermarket',
      STORE: 'Store / Minimarket',
    },
  };

  readonly ui = (text: string): string => {
    const lang = this.currentLang();
    if (lang === 'en' && Object.hasOwn(accountTranslations, text)) {
      return accountTranslations[text];
    }
    if (Object.hasOwn(this.codeLabels[lang], text)) {
      return this.codeLabels[lang][text];
    }
    return text;
  };

  readonly code = (value: string | null | undefined): string => {
    if (!value) {
      return '';
    }
    const normalized = value.trim();
    if (!normalized) {
      return '';
    }
    const lang = this.currentLang();
    const mapped = this.codeLabels[lang];
    if (Object.hasOwn(mapped, normalized)) {
      return mapped[normalized];
    }
    const upper = normalized.toUpperCase();
    if (Object.hasOwn(mapped, upper)) {
      return mapped[upper];
    }
    if (lang === 'en' && Object.hasOwn(accountTranslations, normalized)) {
      return accountTranslations[normalized];
    }
    return normalized.replace(/_/g, ' ');
  };

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

      // Topbar
      'topbar.activeJourney': 'Monitoreo conectado a API v1',
      'topbar.activeNetwork': 'Red Activa · Día y Noche',
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

      // Topbar
      'topbar.activeJourney': 'Connected to API v1',
      'topbar.activeNetwork': 'Active Network · Day & Night',
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
