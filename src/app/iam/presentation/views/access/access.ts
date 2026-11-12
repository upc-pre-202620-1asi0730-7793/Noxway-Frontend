import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { UserProfile } from '../../../domain/model/user-profile.entity';
import { SessionService } from '../../../infrastructure/session.service';

@Component({
  imports: [FormsModule, RouterLink],
  templateUrl: './access.html',
  styleUrl: './access.css',
})
export class Access {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  readonly registering = inject(ActivatedRoute).snapshot.data['registering'] === true;
  readonly busy = signal(false);
  readonly error = signal('');
  readonly registered = inject(ActivatedRoute).snapshot.queryParamMap.has('registered');

  fullName = '';
  email = '';
  password = '';
  shiftType: NonNullable<UserProfile['shiftType']> | '' = '';

  submit(form: NgForm): void {
    if (form.invalid || this.busy()) return;
    this.error.set('');
    this.busy.set(true);
    const credentials = { email: this.email, password: this.password };
    const request: Observable<unknown> = this.registering
      ? this.session.register({ ...credentials, fullName: this.fullName, shiftType: this.shiftType as NonNullable<UserProfile['shiftType']> })
      : this.session.login(credentials);
    request.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => {
        if (this.registering) {
          void this.router.navigate(['/login'], { queryParams: { registered: 1 } });
        } else {
          void this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => this.error.set(error.error?.message || 'No se pudo conectar con la API local. Comprueba que npm run server esté ejecutándose.'),
    });
  }

  enterDemo(): void {
    this.session.enterDemo();
    void this.router.navigate(['/dashboard']);
  }
}
