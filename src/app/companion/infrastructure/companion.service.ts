import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CompanionLiveInfo,
  CompanionHistoryStats,
  CompanionHistoryRecord,
  CompanionAlertChannel,
  CompanionAlertLog,
  EmergencyRescueProtocol,
  SerenazgoUnit,
  NationalLine,
  PendingInvitation,
  AccompaniedWorker,
  InvitationStep,
  CompanionProfile,
} from '../domain/model/companion.entity';

const DEFAULT_LIVE: CompanionLiveInfo = {
  id: 1,
  workerName: 'Jorge Luis Huamán',
  workerFullName: 'Jorge Luis Huamán Quispe',
  workerDni: '44.298.104',
  workerAge: '38 años',
  employer: 'Securitas Perú (Vigilante)',
  shift: 'Noche 19:00 a 07:00',
  vehicle: 'Moto Honda CB190R',
  plate: '4521-7B (Roja/Negra)',
  origin: 'Urb. Mercurio (Los Olivos)',
  destination: 'Torre Financiera San Isidro (Sede Securitas Perú)',
  status: 'EN TRAYECTO ACTIVO',
  statusLabel: 'Jorge está en camino a su centro de trabajo',
  eta: '03:12 AM',
  etaDetail: 'faltan ~27 min (4.8 km)',
  battery: '84%',
  batteryStatus: 'Cargando en moto',
  speed: '42 km/h',
  speedStatus: 'Flujo continuo',
  lastPing: 'Hace 32s',
  lastPingDetail: 'Satélite 4G',
  currentLocation: 'Av. Alfonso Ugarte',
  workerPhone: '+51 987 654 321',
  protectionRules: [
    'Alerta por parada mayor a 4 min fuera de zona segura',
    'Aviso de desvío mayor a 400m de la ruta',
    'Notificación de batería baja si es menor a 15%',
    'Enlace directo con Serenazgo Lima y San Isidro',
  ],
};

const DEFAULT_HISTORY_STATS: CompanionHistoryStats = {
  monitoredRoutes: '48 Rutas',
  period: 'Septiembre 2026',
  safeArrivalRate: '100%',
  safeArrivalDetails: '48 de 48 confirmados',
  avgRouteTime: '31.4 min',
  avgDistance: 'Distancia: 13.2 km',
  deviations: '1 Alerta',
  deviationsDetail: 'Obras en Av. Brasil (15 Sep)',
};

const DEFAULT_HISTORY_RECORDS: CompanionHistoryRecord[] = [
  {
    id: 1,
    date: 'Hoy, 18 Sep 2026',
    time: '02:22 AM · En Tránsito',
    type: 'Ida al Trabajo',
    transport: 'Moto 4521-7B',
    origin: 'Los Olivos',
    destination: 'San Isidro',
    via: 'Vía Panamericana y Ugarte',
    duration: '27m restantes',
    status: 'Monitoreo Activo',
    statusType: 'active',
    isCurrent: true,
  },
  {
    id: 2,
    date: '17 Sep 2026',
    time: '22:45 - 23:18 PM',
    type: 'Ida al Trabajo',
    transport: 'Moto 4521-7B',
    origin: 'Los Olivos',
    destination: 'San Isidro',
    via: 'Sin novedades en ruta',
    duration: '33 minutos',
    status: 'Llegada Segura Confirmada',
    statusType: 'success',
    isCurrent: false,
  },
  {
    id: 3,
    date: '17 Sep 2026',
    time: '06:05 - 06:36 AM',
    type: 'Retorno Casa',
    transport: 'Moto 4521-7B',
    origin: 'San Isidro',
    destination: 'Los Olivos',
    via: 'Vía Expresa y Panamericana',
    duration: '31 minutos',
    status: 'Llegada Segura Confirmada',
    statusType: 'success',
    isCurrent: false,
  },
  {
    id: 4,
    date: '15 Sep 2026',
    time: '22:50 - 23:35 PM',
    type: 'Ida al Trabajo',
    transport: 'Moto 4521-7B',
    origin: 'Los Olivos',
    destination: 'San Isidro',
    via: 'Desvío preventivo obras Av. Brasil',
    duration: '45 minutos (+13m)',
    status: 'Desvío Notificado y Resuelto',
    statusType: 'warning',
    isCurrent: false,
  },
];

const DEFAULT_ALERT_CHANNELS: CompanionAlertChannel[] = [
  {
    id: 'whatsapp',
    title: 'Notificaciones por WhatsApp',
    subtitle: 'Enviadas al número +51 912 345 678',
    enabled: true,
  },
  {
    id: 'sound',
    title: 'Alarma Sonora Audible (Parada Anómala)',
    subtitle: "Suena incluso en modo 'No Molestar'",
    enabled: true,
  },
  {
    id: 'sms',
    title: 'Mensajes SMS de Contingencia',
    subtitle: 'Respaldo si falla cobertura 4G',
    enabled: true,
  },
  {
    id: 'battery',
    title: 'Aviso de Batería Baja (< 15%)',
    subtitle: 'Alerta si el teléfono de Jorge corre riesgo de apagarse',
    enabled: true,
  },
];

const DEFAULT_ALERT_LOGS: CompanionAlertLog[] = [
  {
    id: 1,
    title: 'Checkpoint superado sin novedades',
    time: '02:44 AM (Hace 2 min)',
    description:
      'Jorge cruzó el punto de control en Av. Alfonso Ugarte a una velocidad normal de 42 km/h. Batería en 84%.',
    type: 'check',
    icon: 'check_circle',
  },
  {
    id: 2,
    title: 'Inicio de trayecto nocturno confirmado',
    time: '02:22 AM (Hace 24 min)',
    description:
      'Jorge inició trayecto desde Urb. Mercurio (Los Olivos) hacia San Isidro en su moto Honda CB190R.',
    type: 'play',
    icon: 'play_circle',
  },
  {
    id: 3,
    title: 'Llegada a casa exitosa (Turno anterior)',
    time: '17 Sep · 06:36 AM',
    description:
      'Jorge marcó fin de trayecto seguro al ingresar a su domicilio en Los Olivos. Sesión cerrada.',
    type: 'home',
    icon: 'home',
  },
  {
    id: 4,
    title: 'Desvío preventivo por mantenimiento vial',
    time: '15 Sep · 23:05 PM',
    description:
      'Se detectó un cambio de ruta por obras de asfaltado en Av. Alfonso Ugarte. Ruta recalculada.',
    type: 'warning',
    icon: 'warning',
  },
];

const DEFAULT_RESCUE_PROTOCOL: EmergencyRescueProtocol = {
  title: 'Protocolo de Auxilio Rápido & Ficha de Rescate',
  instruction:
    'Si Jorge no responde o se activa señal SOS, entrega esta ficha a Serenazgo distrital o PNP con sus datos exactos.',
  officialBadge: 'FICHA OFICIAL DE ASISTENCIA RÁPIDA (EMITIDA POR NOXWAY):',
  worker: 'Jorge Luis Huamán Quispe (DNI 44.298.104 · 38 años)',
  employer: 'Securitas Perú (Vigilancia en Torre Financiera San Isidro)',
  vehicle: 'Moto Honda CB190R · Placa: 4521-7B (Roja/Negra)',
  workerPhone: '+51 987 654 321',
  contact: 'Rosa Elena Paredes (+51 912 345 678)',
  lastGps: '-12.04637, -77.04279 (Av. Alfonso Ugarte con Colonial)',
};

const DEFAULT_SERENAZGO: SerenazgoUnit[] = [
  {
    id: 1,
    district: 'Serenazgo Los Olivos',
    badge: '24 HORAS',
    originType: 'Distrito de Origen (Vivienda)',
    phone: '(01) 613-6868',
    whatsapp: '942 789 123',
    base: 'Av. Carlos Izaguirre cdra. 8',
    isCurrentZone: false,
  },
  {
    id: 2,
    district: 'Serenazgo Lima Cercado',
    badge: 'EN ZONA',
    originType: 'Zona Actual de Jorge (Alfonso Ugarte)',
    phone: '(01) 318-5050',
    base: 'Plaza Dos de Mayo',
    responseTime: '~5 min',
    isCurrentZone: true,
  },
  {
    id: 3,
    district: 'Serenazgo San Isidro',
    badge: '24 HORAS',
    originType: 'Distrito de Destino (Laboral)',
    phone: '(01) 513-9000',
    module: 'Canaval y Moreyra',
    distance: '350m',
    isCurrentZone: false,
  },
];

const DEFAULT_NATIONAL_LINES: NationalLine[] = [
  {
    id: 'pnp',
    code: 'PNP 105',
    name: 'Policía Nacional / Radio Patrulla',
    action: 'Marcar 105',
    number: '105',
  },
  {
    id: 'samu',
    code: 'SAMU 106',
    name: 'Ambulancias de Urgencia Médica',
    action: 'Marcar 106',
    number: '106',
  },
  {
    id: 'bomberos',
    code: 'Bomberos 116',
    name: 'Rescate & Accidentes Viales',
    action: 'Marcar 116',
    number: '116',
  },
  {
    id: 'securitas',
    code: 'Securitas Perú',
    name: 'Supervisor de Guardia Nocturna',
    action: 'Llamar Base +51 998',
    number: '+51998000111',
  },
];

const DEFAULT_PENDING_INVITATION: PendingInvitation = {
  id: 1,
  name: 'Carlos Paredes Morales',
  relation: '(tu hermano)',
  message: 'te ha invitado a ser su contacto protector para sus rutas nocturnas de delivery.',
  category: 'Repartidor Nocturno (San Martín de Porres -> Miraflores)',
  schedule: '20:00 a 04:00 AM',
  status: 'PENDIENTE DE CONFIRMACIÓN',
};

const DEFAULT_ACTIVE_WORKERS: AccompaniedWorker[] = [
  {
    id: 1,
    avatar: 'JL',
    name: 'Jorge Luis Huamán Quispe',
    badge: 'VÍNCULO ACTIVO',
    relation: 'Esposo',
    role: 'Vigilante Nocturno en Securitas Perú',
    linkedSince: '15 Ago 2026',
    gpsRealTime: true,
    stopAlarm: true,
    whatsappNotification: '+51 912 345 678',
  },
];

const DEFAULT_STEPS: InvitationStep[] = [
  {
    step: '01',
    title: 'El Trabajador te Invita',
    desc1:
      'Desde su aplicación web Noxway, Jorge ingresa tu número de WhatsApp o correo electrónico.',
    desc2: 'Genera un enlace de vinculación seguro y cifrado con caducidad temporal.',
  },
  {
    step: '02',
    title: 'Tú Aceptas el Vínculo',
    desc1:
      'Para proteger la privacidad de ambos, la visibilidad de ubicación solo se activa cuando inicia un trayecto nocturno.',
    desc2: 'Puedes revocar o pausar el acompañamiento en cualquier momento.',
  },
  {
    step: '03',
    title: 'Protección Mutua 24h',
    desc1:
      'Recibes avisos automáticos cuando sale de casa y cuando llega a su trabajo sano y salvo.',
    desc2: 'Descansas con la certeza de que el sistema vela por su traslado.',
  },
];

/**
 * Infrastructure service providing API communication and mock fallback data
 * for the Companion Bounded Context.
 */
@Injectable({
  providedIn: 'root',
})
export class CompanionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Retrieves live telemetry and route status for the accompanied worker.
   */
  getLiveInfo(): Observable<CompanionLiveInfo> {
    return this.http.get<CompanionLiveInfo[]>(`${this.baseUrl}/companionLive`).pipe(
      map((list) => (list && list.length > 0 ? list[0] : DEFAULT_LIVE)),
      catchError(() => of(DEFAULT_LIVE)),
    );
  }

  /**
   * Fetches historical journey records and aggregated safety audit stats.
   */
  getHistory(): Observable<{ stats: CompanionHistoryStats; records: CompanionHistoryRecord[] }> {
    return this.http
      .get<{ stats: CompanionHistoryStats; records: CompanionHistoryRecord[] }>(
        `${this.baseUrl}/companionHistory`,
      )
      .pipe(
        map((data) =>
          data && data.stats
            ? data
            : { stats: DEFAULT_HISTORY_STATS, records: DEFAULT_HISTORY_RECORDS },
        ),
        catchError(() => of({ stats: DEFAULT_HISTORY_STATS, records: DEFAULT_HISTORY_RECORDS })),
      );
  }

  /**
   * Fetches notification channels configuration and historical alerts log.
   */
  getAlerts(): Observable<{ channels: CompanionAlertChannel[]; logs: CompanionAlertLog[] }> {
    return this.http
      .get<{ channels: CompanionAlertChannel[]; logs: CompanionAlertLog[] }>(
        `${this.baseUrl}/companionAlerts`,
      )
      .pipe(
        map((data) =>
          data && data.channels
            ? data
            : { channels: DEFAULT_ALERT_CHANNELS, logs: DEFAULT_ALERT_LOGS },
        ),
        catchError(() => of({ channels: DEFAULT_ALERT_CHANNELS, logs: DEFAULT_ALERT_LOGS })),
      );
  }

  /**
   * Fetches emergency rescue protocol, district Serenazgo units, and free hotlines.
   */
  getEmergency(): Observable<{
    rescueProtocol: EmergencyRescueProtocol;
    serenazgo: SerenazgoUnit[];
    nationalLines: NationalLine[];
  }> {
    return this.http
      .get<{
        rescueProtocol: EmergencyRescueProtocol;
        serenazgo: SerenazgoUnit[];
        nationalLines: NationalLine[];
      }>(`${this.baseUrl}/companionEmergency`)
      .pipe(
        map((data) =>
          data && data.rescueProtocol
            ? data
            : {
                rescueProtocol: DEFAULT_RESCUE_PROTOCOL,
                serenazgo: DEFAULT_SERENAZGO,
                nationalLines: DEFAULT_NATIONAL_LINES,
              },
        ),
        catchError(() =>
          of({
            rescueProtocol: DEFAULT_RESCUE_PROTOCOL,
            serenazgo: DEFAULT_SERENAZGO,
            nationalLines: DEFAULT_NATIONAL_LINES,
          }),
        ),
      );
  }

  /**
   * Fetches pending bond requests and accompanied workers network.
   */
  getInvitations(): Observable<{
    pending: PendingInvitation;
    activeWorkers: AccompaniedWorker[];
    steps: InvitationStep[];
  }> {
    return this.http
      .get<{
        pending: PendingInvitation;
        activeWorkers: AccompaniedWorker[];
        steps: InvitationStep[];
      }>(`${this.baseUrl}/companionInvitations`)
      .pipe(
        map((data) =>
          data && data.pending
            ? data
            : {
                pending: DEFAULT_PENDING_INVITATION,
                activeWorkers: DEFAULT_ACTIVE_WORKERS,
                steps: DEFAULT_STEPS,
              },
        ),
        catchError(() =>
          of({
            pending: DEFAULT_PENDING_INVITATION,
            activeWorkers: DEFAULT_ACTIVE_WORKERS,
            steps: DEFAULT_STEPS,
          }),
        ),
      );
  }

  /**
   * Retrieves the trusted companion profile information.
   */
  getProfile(): Observable<CompanionProfile> {
    return this.http.get<CompanionProfile>(`${this.baseUrl}/companionProfile`).pipe(
      map((data) => (data && data.fullName ? data : DEFAULT_COMPANION_PROFILE)),
      catchError(() => of(DEFAULT_COMPANION_PROFILE)),
    );
  }

  /**
   * Updates the trusted companion profile settings.
   * @param profile Partial profile data to update.
   */
  updateProfile(profile: Partial<CompanionProfile>): Observable<CompanionProfile> {
    return of({ ...DEFAULT_COMPANION_PROFILE, ...profile });
  }
}

const DEFAULT_COMPANION_PROFILE: CompanionProfile = {
  avatar: 'RP',
  fullName: 'Rosa Elena Paredes Morales',
  verified: true,
  verifiedBadge: 'CONTACTO VERIFICADO',
  relationship: 'Contacto de Confianza Primario de Jorge Luis Huamán',
  location: 'Los Olivos, Lima · Miembro activo de Noxway desde Agosto 2026',
  accountProtected: true,
  dni: '45.109.872 (Solo lectura)',
  phone: '+51 912 345 678',
  phoneValidation: 'Validado con código de seguridad OTP',
  email: 'rosaelena.paredes@correo.pe',
  address: 'Urb. Mercurio Mz. C Lt. 14, Los Olivos',
  surveillanceStart: '22:00 PM',
  surveillanceEnd: '07:30 AM',
  autoRestTitle: 'Modo Resguardo Automático',
  autoRestDesc:
    'Cuando Jorge marca llegada a casa por la mañana, el sistema entra en modo reposo para que puedas descansar en calma y sin avisos innecesarios.',
  encryptionTitle: 'Cifrado de Extremo a Extremo',
  encryptionDesc:
    'Tus datos de contacto y la ubicación GPS de Jorge solo son visibles entre ustedes dos y las centrales de auxilio distrital autorizadas.',
};
