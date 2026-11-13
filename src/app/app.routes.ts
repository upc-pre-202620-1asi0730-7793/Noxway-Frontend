import { Routes } from '@angular/router';
import { Community } from './community/presentation/views/community/community';
import { MapView } from './community/presentation/views/map-view/map-view';
import { Journey } from './commute/presentation/views/journey/journey';
import { CompanionAlerts } from './companion/presentation/views/companion-alerts/companion-alerts';
import { CompanionEmergency } from './companion/presentation/views/companion-emergency/companion-emergency';
import { CompanionHistory } from './companion/presentation/views/companion-history/companion-history';
import { CompanionInvitations } from './companion/presentation/views/companion-invitations/companion-invitations';
import { CompanionLive } from './companion/presentation/views/companion-live/companion-live';
import { CompanionProfile } from './companion/presentation/views/companion-profile/companion-profile';
import { Dashboard } from './dashboard/presentation/views/dashboard/dashboard';
import { authGuard } from './iam/infrastructure/session.guard';
import { Access } from './iam/presentation/views/access/access';
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
      { path: 'journey', component: Journey, title: 'Noxway - Mi Trayecto' },
      { path: 'my-journeys', redirectTo: 'journey', pathMatch: 'full' },
      { path: 'map', component: MapView, title: 'Noxway - Mapa 24h' },
      { path: 'community', component: Community, title: 'Noxway - Comunidad' },
      { path: 'wellness', component: Wellness, title: 'Noxway - Bienestar' },
      { path: 'benefits', component: Benefits, title: 'Noxway - Beneficios' },
      { path: 'trusted-contacts', component: TrustedContacts, title: 'Noxway - Contactos' },
      { path: 'profile', component: Profile, title: 'Noxway - Perfil' },
      { path: 'access', component: Access, title: 'Noxway - IAM Estructurado' },
      { path: 'login', redirectTo: 'access', pathMatch: 'full' },
      { path: 'register', redirectTo: 'access', pathMatch: 'full' },
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
