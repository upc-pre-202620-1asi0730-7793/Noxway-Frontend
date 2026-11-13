import { LocalJourneys } from './commute/presentation/views/local-journeys/local-journeys';
import { Layout } from './shared/presentation/components/layout/layout';
import { Access } from './iam/presentation/views/access/access';
import { requireSession } from './iam/infrastructure/session.guard';
import { Routes } from '@angular/router';
import { PersonalModule } from './shared/presentation/views/personal-module/personal-module';
import { Dashboard } from './dashboard/presentation/views/dashboard/dashboard';
import { Profile } from './iam/presentation/views/profile/profile';

export const routes: Routes = [
  { path: 'login', component: Access, title: 'Noxway - Iniciar sesión' },
  { path: 'register', component: Access, data: { registering: true }, title: 'Noxway - Registro' },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'journey', redirectTo: 'my-journeys', pathMatch: 'full' },
  { path: 'home', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'companion', children: [{ path: '**', redirectTo: '/dashboard' }] },
  {
    path: '',
    component: Layout,
    canActivateChild: [requireSession],
    children: [
      { path: 'dashboard', component: Dashboard, title: 'Noxway - Dashboard del Trabajador' },
      { path: 'my-journeys', component: LocalJourneys, title: 'Noxway - Mi trayecto' },
      {
        path: 'map',
        title: 'Noxway - Servicios Cercanos',
        loadComponent: () => import('./community/presentation/views/nearby-services/nearby-services')
          .then((module) => module.NearbyServices),
      },
      { path: 'community', component: PersonalModule, data: { section: 'community' }, title: 'Noxway - Comunidad' },
      { path: 'wellness', component: PersonalModule, data: { section: 'wellness' }, title: 'Noxway - Bitácora de Descanso' },
      { path: 'benefits', component: PersonalModule, data: { section: 'benefits' }, title: 'Noxway - Beneficios Colectivos' },
      { path: 'trusted-contacts', component: PersonalModule, data: { section: 'contacts' }, title: 'Noxway - Contactos de Confianza' },
      { path: 'profile', component: Profile, title: 'Noxway - Mi Perfil' },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./shared/presentation/views/page-not-found/page-not-found')
      .then((module) => module.PageNotFound),
    title: 'Noxway - Page Not Found',
  },
];
