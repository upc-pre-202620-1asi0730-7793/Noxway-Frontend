import {Component, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {FooterContent} from '../footer-content/footer-content';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    FooterContent
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  readonly collapsed = signal(false);

  readonly options = [
    {link: '/home', label: 'Inicio', icon: 'home'},
    {link: '/dashboard', label: 'Panel', icon: 'dashboard'},
    {link: '/check-in', label: 'Check-in seguro', icon: 'location_on'},
    {link: '/services', label: 'Servicios nocturnos', icon: 'store'},
    {link: '/incidents', label: 'Reportes de incidentes', icon: 'warning'},
    {link: '/community', label: 'Comunidad', icon: 'groups'}
  ];

  toggleMenu(): void {
    this.collapsed.update(value => !value);
  }
}
