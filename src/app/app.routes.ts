import { LocalJourneys } from './commute/presentation/views/local-journeys/local-journeys';
import { Layout } from './shared/presentation/components/layout/layout';
import { Access } from './iam/presentation/views/access/access';
import { requireDemo, requireSession } from './iam/infrastructure/session.guard';
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from './iam/infrastructure/session.service';
import { PersonalModule } from './shared/presentation/views/personal-module/personal-module';
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

const portalRoutes: Routes = [
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
  { path: 'my-journeys', component: LocalJourneys, title: 'Noxway - Mi trayecto' },
  {
    path: 'map',
    data: { section: 'services' },
    component: MapView,
    title: `${baseTitle} - Servicios Cercanos`,
  },
  {
    path: 'community',
    data: { section: 'community' },
    component: Community,
    title: `${baseTitle} - Comunidad`,
  },
  {
    path: 'wellness',
    data: { section: 'wellness' },
    component: Wellness,
    title: `${baseTitle} - Bitácora de Descanso`,
  },
  {
    path: 'benefits',
    data: { section: 'benefits' },
    component: Benefits,
    title: `${baseTitle} - Beneficios Colectivos`,
  },
  {
    path: 'trusted-contacts',
    data: { section: 'contacts' },
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
];

export const routes: Routes = [
  { path: 'login', component: Access, title: 'Noxway - Iniciar sesión' },
  { path: 'register', component: Access, data: { registering: true }, title: 'Noxway - Registro' },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: Layout,
    canActivateChild: [requireSession],
    children: portalRoutes.flatMap((route) => {
      if (route.data?.['section']) {
        return [
          { ...route, canMatch: [() => inject(SessionService).demo()] },
          { ...route, component: PersonalModule },
        ];
      }
      return ['dashboard', 'profile', 'my-journeys'].includes(route.path ?? '')
        ? [route]
        : [{ ...route, canActivate: [requireDemo] }];
    }),
  },
  {
    path: '**',
    loadComponent: pageNotFound,
    title: `${baseTitle} - Page Not Found`,
  },
];
