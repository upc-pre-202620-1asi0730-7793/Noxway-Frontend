import { Component, inject, OnInit, signal } from '@angular/core';
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
  private readonly dashboardService = inject(DashboardService);

  readonly dashboardData = signal<DashboardData | null>(null);

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe((data) => {
      if (data && data.length > 0) {
        this.dashboardData.set(data[0]);
      }
    });
  }
}
