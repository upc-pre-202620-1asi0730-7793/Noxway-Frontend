import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../../infrastructure/session.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserProfile } from '../../../domain/model/user-profile.entity';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, MatButtonModule, MatIconModule, MatCardModule, MatCheckboxModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  readonly t = inject(LanguageService).ui;

  readonly session = inject(SessionService);
  private readonly router = inject(Router);
  readonly saving = signal(false);
  readonly status = signal('');
  readonly error = signal('');

  readonly profile = signal<UserProfile | null>(null);

  ngOnInit(): void {
    const profile = this.session.profile();
    if (profile) this.profile.set({ ...profile });
  }

  onSave(): void {
    const profile = this.profile();
    if (!profile) return;
    this.status.set('');
    this.error.set('');
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
