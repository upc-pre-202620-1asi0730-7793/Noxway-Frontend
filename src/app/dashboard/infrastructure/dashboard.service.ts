import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface DashboardData {
  id: number;
  safeTripsPercentage: number;
  trustedContactStatus: string;
  restStatus: string;
  servicesStatus: string;
  journeyStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/dashboard';

  getDashboardData(): Observable<DashboardData[]> {
    return this.http.get<DashboardData[]>(this.baseUrl);
  }
}
