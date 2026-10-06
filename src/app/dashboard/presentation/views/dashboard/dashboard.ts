import {Component, inject, OnInit, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {
  DashboardData,
  DashboardService
} from '../../../infrastructure/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private readonly dashboardService = inject(DashboardService);

  readonly dashboardData = signal<DashboardData | null>(null);

  ngOnInit(): void {
    this.dashboardService.getDashboardData()
      .subscribe(data => {
        this.dashboardData.set(data[0]);
      });
  }
}
