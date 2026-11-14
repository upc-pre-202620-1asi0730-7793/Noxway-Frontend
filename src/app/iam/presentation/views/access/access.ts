import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../../infrastructure/session.service';
import { IamService, SecurityStatusResource } from '../../../infrastructure/iam.service';
import { ActorContextService, DemoPersona } from '../../../../shared/infrastructure/actor-context.service';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { NotificationToastService } from '../../../../shared/infrastructure/notification-toast.service';
import { extractProblemMessage } from '../../../../shared/infrastructure/problem-detail.util';

@Component({
  selector: 'app-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access.html',
  styleUrl: './access.css',
})
export class Access implements OnInit {
  readonly iam = inject(IamService);
  readonly actorContext = inject(ActorContextService);
  readonly session = inject(SessionService);
  readonly languageService = inject(LanguageService);
  private readonly toast = inject(NotificationToastService);
  private readonly router = inject(Router);

  readonly loadingStatus = signal(true);
  readonly status = signal<SecurityStatusResource | null>(null);
  readonly activeTab = signal<'signin' | 'signup' | 'reset'>('signin');
  readonly lastDeferredResponse = signal<string | null>(null);
  readonly submitting = signal(false);

  signInEmail = 'jorge.huaman@noxway.pe';
  signInPassword = 'NoxwayPreview!2026';

  signUpFullName = 'Lucía Mendoza';
  signUpEmail = 'lucia.mendoza@noxway.pe';
  signUpPhone = '+51999111222';
  signUpRole: 'WORKER' | 'TRUSTED_CONTACT' = 'WORKER';
  signUpPassword = 'NoxwayPreview!2026';

  resetEmail = 'jorge.huaman@noxway.pe';

  ngOnInit(): void {
    this.iam.loadStatus().subscribe((res) => {
      this.status.set(res);
      this.loadingStatus.set(false);
    });
  }

  selectPersona(persona: DemoPersona): void {
    this.session.switchPersona(persona.id);
    this.toast.info(`${persona.name} (${persona.role})`);
    if (persona.role === 'TRUSTED_CONTACT') {
      this.router.navigateByUrl('/companion/live');
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  submitSignIn(): void {
    this.submitting.set(true);
    this.lastDeferredResponse.set(null);
    this.iam.signIn({ email: this.signInEmail, password: this.signInPassword }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Signed in');
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = extractProblemMessage(err, '501 Not Implemented (IAM deferred)');
        this.lastDeferredResponse.set(msg);
        this.toast.info(msg);
      },
    });
  }

  submitSignUp(): void {
    this.submitting.set(true);
    this.lastDeferredResponse.set(null);
    this.iam
      .signUp({
        email: this.signUpEmail,
        password: this.signUpPassword,
        fullName: this.signUpFullName,
        phone: this.signUpPhone,
        role: this.signUpRole,
        shiftType: 'NIGHT',
        shiftStart: '22:00',
        shiftEnd: '06:00',
        timeZone: 'America/Lima',
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Signed up');
        },
        error: (err) => {
          this.submitting.set(false);
          const msg = extractProblemMessage(err, '501 Not Implemented (IAM deferred)');
          this.lastDeferredResponse.set(msg);
          this.toast.info(msg);
        },
      });
  }

  submitPasswordReset(): void {
    this.submitting.set(true);
    this.lastDeferredResponse.set(null);
    this.iam.requestPasswordReset(this.resetEmail).subscribe({
      next: () => {
        this.submitting.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = extractProblemMessage(err, '501 Not Implemented (IAM deferred)');
        this.lastDeferredResponse.set(msg);
        this.toast.info(msg);
      },
    });
  }
}
