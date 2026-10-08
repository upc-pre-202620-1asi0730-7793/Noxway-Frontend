import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/presentation/views/dashboard/dashboard';
import { Journey } from './commute/presentation/views/journey/journey';
import { MapView } from './community/presentation/views/map-view/map-view';
import { Community } from './community/presentation/views/community/community';
import { Wellness } from './wellness/presentation/views/wellness/wellness';
import { Benefits } from './subscriptions/presentation/views/benefits/benefits';
import { TrustedContacts } from './iam/presentation/views/trusted-contacts/trusted-contacts';
import { Profile } from './iam/presentation/views/profile/profile';
import { Home } from './shared/presentation/views/home/home';
import { CompanionLive } from './companion/presentation/views/companion-live/companion-live';
import { CompanionHistory } from './companion/presentation/views/companion-history/companion-history';
import { CompanionAlerts } from './companion/presentation/views/companion-alerts/companion-alerts';
import { CompanionEmergency } from './companion/presentation/views/companion-emergency/companion-emergency';
import { CompanionInvitations } from './companion/presentation/views/companion-invitations/companion-invitations';
import { CompanionProfile } from './companion/presentation/views/companion-profile/companion-profile';

const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);

const baseTitle = 'Noxway';

export const routes: Routes = [
  // Worker Portal Routes
  {
    path: 'dashboard',
    component: Dashboard,
    title: `${baseTitle} - Dashboard del Trabajador`,
  },
  {
    path: 'journey',
    component: Journey,
    title: `${baseTitle} - Mi Trayecto Activo`,
  },
  {
    path: 'map',
    component: MapView,
    title: `${baseTitle} - Mapa Comunitario 24h`,
  },
  {
    path: 'community',
    component: Community,
    title: `${baseTitle} - Comunidad Nocturna`,
  },
  {
    path: 'wellness',
    component: Wellness,
    title: `${baseTitle} - Bitácora de Descanso`,
  },
  {
    path: 'benefits',
    component: Benefits,
    title: `${baseTitle} - Beneficios Colectivos`,
  },
  {
    path: 'trusted-contacts',
    component: TrustedContacts,
    title: `${baseTitle} - Contactos de Confianza`,
  },
  {
    path: 'profile',
    component: Profile,
    title: `${baseTitle} - Mi Perfil`,
  },

  // Companion Portal Routes
  {
    path: 'companion/live',
    component: CompanionLive,
    title: `${baseTitle} - Monitoreo en Vivo`,
  },
  {
    path: 'companion/history',
    component: CompanionHistory,
    title: `${baseTitle} - Historial de Rutas`,
  },
  {
    path: 'companion/alerts',
    component: CompanionAlerts,
    title: `${baseTitle} - Avisos & Alertas`,
  },
  {
    path: 'companion/emergency',
    component: CompanionEmergency,
    title: `${baseTitle} - Auxilio & Serenazgo`,
  },
  {
    path: 'companion/invitations',
    component: CompanionInvitations,
    title: `${baseTitle} - Invitaciones`,
  },
  {
    path: 'companion/profile',
    component: CompanionProfile,
    title: `${baseTitle} - Mi Perfil de Contacto`,
  },

  {
    path: 'home',
    component: Home,
    title: `${baseTitle} - Home`,
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: pageNotFound,
    title: `${baseTitle} - Page Not Found`,
  },
];
