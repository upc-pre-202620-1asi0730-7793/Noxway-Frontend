import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CompanionService } from '../../../infrastructure/companion.service';
import { CompanionProfile as CompanionProfileEntity } from '../../../domain/model/companion.entity';

@Component({
  selector: 'app-companion-profile',
  imports: [FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './companion-profile.html',
  styleUrl: './companion-profile.css',
})
export class CompanionProfile implements OnInit {
  private readonly companionService = inject(CompanionService);

  readonly profile = signal<CompanionProfileEntity | null>(null);
  readonly isSaving = signal<boolean>(false);
  readonly saveSuccess = signal<boolean>(false);

  // Form model fields
  fullName = '';
  dni = '';
  phone = '';
  email = '';
  address = '';

  ngOnInit(): void {
    this.companionService.getProfile().subscribe((data) => {
      this.profile.set(data);
      this.fullName = data.fullName;
      this.dni = data.dni;
      this.phone = data.phone;
      this.email = data.email;
      this.address = data.address;
    });
  }

  onSaveProfile(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.companionService
        .updateProfile({
          fullName: this.fullName,
          phone: this.phone,
          email: this.email,
          address: this.address,
        })
        .subscribe((updated) => {
          this.profile.set(updated);
          this.isSaving.set(false);
          this.saveSuccess.set(true);
          alert('Cambios de perfil de contacto guardados correctamente.');
          setTimeout(() => this.saveSuccess.set(false), 3000);
        });
    }, 600);
  }

  onLogout(): void {
    if (confirm('¿Deseas cerrar la sesión segura de contacto de confianza?')) {
      alert('Sesión cerrada con éxito.');
    }
  }
}
