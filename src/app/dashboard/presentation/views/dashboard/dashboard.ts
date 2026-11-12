import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { localApi, SessionService } from '../../../../iam/infrastructure/session.service';

interface DashboardSummary {
  completedTrips: number;
  activeTrip: { origin: string; destination: string } | null;
  contactCount: number;
  lastRest: string | null;
  noticeCount: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  readonly t = inject(LanguageService).ui;
  readonly session = inject(SessionService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly failed = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.failed.set(false);
    this.http.get<DashboardSummary>(`${localApi}/me/dashboard`, this.session.requestOptions())
      .subscribe({
        next: (summary) => this.summary.set(summary),
        error: (error) => {
          if (error.status === 401) {
            this.session.logout();
            void this.router.navigateByUrl('/login');
          } else {
            this.failed.set(true);
          }
        },
      });
  }
}
