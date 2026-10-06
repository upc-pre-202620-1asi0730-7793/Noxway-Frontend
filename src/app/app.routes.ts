import {Routes} from '@angular/router';
import {Home} from './shared/presentation/views/home/home';
import {Dashboard} from './dashboard/presentation/views/dashboard/dashboard';

const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found')
    .then(m => m.PageNotFound);

const baseTitle = 'Noxway';

export const routes: Routes = [
  {
    path: 'home',
    component: Home,
    title: `${baseTitle} - Home`
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: `${baseTitle} - Dashboard`
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: pageNotFound,
    title: `${baseTitle} - Page Not Found`
  }
];
