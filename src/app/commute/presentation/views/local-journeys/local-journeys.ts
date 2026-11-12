import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { localApi, SessionService } from '../../../../iam/infrastructure/session.service';

interface LocalJourney {
  id: string;
  origin: string;
  destination: string;
  startedAt: string;
  finishedAt: string | null;
}

@Component({
  imports: [DatePipe, FormsModule, MatIconModule],
  templateUrl: './local-journeys.html',
  styleUrls: ['../journey/journey.css', './local-journeys.css'],
})
export class LocalJourneys implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly endpoint = `${localApi}/me/journeys`;

  readonly journeys = signal<LocalJourney[] | null>(null);
  readonly active = computed(() => this.journeys()?.find((journey) => !journey.finishedAt));
  readonly history = computed(() => this.journeys()?.filter((journey) => journey.finishedAt) ?? []);
  readonly busy = signal(false);
  readonly error = signal('');

  origin = '';
  destination = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.run(this.http.get<LocalJourney[]>(this.endpoint, this.session.requestOptions()),
      (journeys) => this.journeys.set(journeys));
  }

  start(form: NgForm): void {
    if (form.invalid || this.busy()) return;
    this.run(this.http.post<LocalJourney>(this.endpoint, {
      origin: this.origin, destination: this.destination,
    }, this.session.requestOptions()), (journey) => {
      this.journeys.update((journeys) => [journey, ...(journeys ?? [])]);
      form.resetForm();
    });
  }

  finish(journey: LocalJourney): void {
    if (this.busy()) return;
    this.run(this.http.patch<LocalJourney>(`${this.endpoint}/${journey.id}/finish`, {},
      this.session.requestOptions()), (finished) => {
      this.journeys.update((journeys) =>
        (journeys ?? []).map((item) => item.id === finished.id ? finished : item));
    });
  }

  private run<T>(request: Observable<T>, apply: (result: T) => void): void {
    this.error.set('');
    this.busy.set(true);
    request.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: apply,
      error: (error) => {
        if (error.status === 401) {
          this.session.logout();
          void this.router.navigateByUrl('/login');
        } else {
          this.error.set(error.error?.message || 'No se pudo completar la operación en la API local.');
        }
      },
    });
  }
}
