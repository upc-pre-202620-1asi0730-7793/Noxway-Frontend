import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserProfile } from '../../../domain/model/user-profile.entity';
import { UserProfileService } from '../../../infrastructure/user-profile.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, MatButtonModule, MatIconModule, MatCardModule, MatCheckboxModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly profileService = inject(UserProfileService);

  readonly profile = signal<UserProfile | null>(null);

  ngOnInit(): void {
    this.profileService.getProfile().subscribe((data) => {
      this.profile.set({ ...data });
    });
  }

  onSave(): void {
    alert(
      'Cambios guardados: Se actualizaron los datos del trabajador y los ajustes de privacidad.',
    );
  }

  onChangePassword(): void {
    const current = prompt('Introduce tu contraseña actual:');
    if (!current) return;
    const newPass = prompt('Introduce la nueva contraseña segura (mínimo 8 caracteres):');
    if (newPass) {
      alert('Contraseña actualizada correctamente.');
    }
  }
}
