import { Routes } from '@angular/router';
import { CompanionAlerts } from './companion/presentation/views/companion-alerts/companion-alerts';
import { CompanionEmergency } from './companion/presentation/views/companion-emergency/companion-emergency';
import { CompanionHistory } from './companion/presentation/views/companion-history/companion-history';
import { CompanionInvitations } from './companion/presentation/views/companion-invitations/companion-invitations';
import { CompanionLive } from './companion/presentation/views/companion-live/companion-live';
import { CompanionProfile } from './companion/presentation/views/companion-profile/companion-profile';
import { Dashboard } from './dashboard/presentation/views/dashboard/dashboard';
import { authGuard } from './iam/infrastructure/session.guard';
import { Profile } from './iam/presentation/views/profile/profile';
import { TrustedContacts } from './iam/presentation/views/trusted-contacts/trusted-contacts';
import { Layout } from './shared/presentation/components/layout/layout';
import { PageNotFound } from './shared/presentation/views/page-not-found/page-not-found';
import { Benefits } from './subscriptions/presentation/views/benefits/benefits';
import { Wellness } from './wellness/presentation/views/wellness/wellness';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard, title: 'Noxway - Dashboard' },
      {
        path: 'journey',
        loadComponent: () =>
          import('./commute/presentation/views/journey/journey').then((m) => m.Journey),
        title: 'Noxway - Mi Trayecto',
      },
      { path: 'my-journeys', redirectTo: 'journey', pathMatch: 'full' },
      {
        path: 'map',
        loadComponent: () =>
          import('./community/presentation/views/map-view/map-view').then((m) => m.MapView),
        title: 'Noxway - Mapa 24h',
      },
      {
        path: 'community',
        loadComponent: () =>
          import('./community/presentation/views/community/community').then((m) => m.Community),
        title: 'Noxway - Comunidad',
      },
      { path: 'wellness', component: Wellness, title: 'Noxway - Bienestar' },
      { path: 'benefits', component: Benefits, title: 'Noxway - Beneficios' },
      { path: 'trusted-contacts', component: TrustedContacts, title: 'Noxway - Contactos' },
      { path: 'profile', component: Profile, title: 'Noxway - Perfil' },
      { path: 'access', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'login', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'register', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'companion',
        children: [
          { path: '', redirectTo: 'live', pathMatch: 'full' },
          { path: 'live', component: CompanionLive, title: 'Noxway - Companion Live' },
          { path: 'history', component: CompanionHistory, title: 'Noxway - Historial' },
          { path: 'alerts', component: CompanionAlerts, title: 'Noxway - Alertas' },
          { path: 'emergency', component: CompanionEmergency, title: 'Noxway - Emergencia' },
          { path: 'invitations', component: CompanionInvitations, title: 'Noxway - Invitaciones' },
          { path: 'profile', component: CompanionProfile, title: 'Noxway - Perfil Contacto' },
        ],
      },
      { path: '**', component: PageNotFound, title: 'Noxway - 404' },
    ],
  },
];
