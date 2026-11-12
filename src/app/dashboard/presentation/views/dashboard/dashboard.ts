import { LanguageService } from '../../../../shared/infrastructure/language.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { SessionService } from '../../../../iam/infrastructure/session.service';
import { UserProfileService } from '../../../../iam/infrastructure/user-profile.service';
import { UserProfile } from '../../../../iam/domain/model/user-profile.entity';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { DashboardData, DashboardService } from '../../../infrastructure/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  readonly t = inject(LanguageService).ui;
  private readonly dashboardService = inject(DashboardService);

  readonly session = inject(SessionService);
  readonly workerProfile = signal<UserProfile | null>(null);
  readonly profileService = inject(UserProfileService);

  readonly dashboardData = signal<DashboardData | null>(null);

  ngOnInit(): void {
    if (!this.session.demo()) return;
    this.profileService.getProfile().subscribe(p => this.workerProfile.set(p));
    this.dashboardService.getDashboardData().subscribe((data) => {
      if (data && data.length > 0) {
        this.dashboardData.set(data[0]);
      }
    });
  }
}
