import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

  readonly options = [
    {
      link: '/dashboard',
      label: 'Dashboard',
      icon: 'circle'
    },
    {
      link: '/journey',
      label: 'Mi Trayecto',
      icon: 'circle',
      badge: 'ACTIVO',
      badgeClass: 'success'
    },
    {
      link: '/map',
      label: 'Mapa 24 Horas',
      icon: 'circle'
    },
    {
      link: '/community',
      label: 'Comunidad',
      icon: 'circle',
      badge: '3',
      badgeClass: 'danger'
    },
    {
      link: '/wellness',
      label: 'Bienestar & Sueño',
      icon: 'circle'
    },
    {
      link: '/benefits',
      label: 'Beneficios & Planes',
      icon: 'circle'
    },
    {
      link: '/trusted-contacts',
      label: 'Contactos Confianza',
      icon: 'circle'
    },
    {
      link: '/profile',
      label: 'Mi Perfil',
      icon: 'circle'
    }
  ];
}
