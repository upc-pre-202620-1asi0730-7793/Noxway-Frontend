import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../../infrastructure/session.service';
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

  readonly session = inject(SessionService);
  private readonly router = inject(Router);
  readonly saving = signal(false);
  readonly status = signal('');
  readonly error = signal('');

  readonly profile = signal<UserProfile | null>(null);

  ngOnInit(): void {
    const profile = this.session.profile();
    if (profile) {
      this.profile.set({ ...profile });
      return;
    }
    this.profileService.getProfile().subscribe((data) => {
      this.profile.set({ ...data });
    });
  }

  onSave(): void {
    const profile = this.profile();
    if (!profile) return;
    this.status.set('');
    this.error.set('');
    if (this.session.demo()) {
      try {
        this.profileService.saveProfile(profile);
        this.status.set('Cambios guardados en la demostración.');
      } catch {
        this.error.set('No fue posible guardar los cambios en este navegador.');
      }
      return;
    }

    this.saving.set(true);
    this.session.saveProfile(profile).subscribe({
      next: (updated) => {
        this.profile.set({ ...updated });
        this.status.set('Cambios guardados.');
        this.saving.set(false);
      },
      error: (error) => {
        this.saving.set(false);
        if (error.status === 401) {
          void this.router.navigateByUrl('/login');
        } else {
          this.error.set(error.error?.message || 'No fue posible guardar los cambios en la API local.');
        }
      },
    });
  }
}
