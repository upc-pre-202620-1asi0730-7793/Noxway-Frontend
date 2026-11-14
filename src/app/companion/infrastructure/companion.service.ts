import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResource } from '../../shared/domain/model/paged-resource';
import { AlertResource, CompanionLiveResource } from '../domain/model/companion.entity';

@Injectable({ providedIn: 'root' })
export class CompanionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getLiveMonitoring(): Observable<CompanionLiveResource[]> {
    return this.http.get<CompanionLiveResource[]>(`${this.baseUrl}/companion/live`);
  }

  getAlerts(page = 0, size = 30): Observable<PagedResource<AlertResource>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResource<AlertResource>>(`${this.baseUrl}/companion/alerts`, {
      params,
    });
  }

  getDeliveryQueue(): Observable<AlertResource[]> {
    return this.http.get<AlertResource[]>(`${this.baseUrl}/alerts/deliveries`);
  }

  retryDelivery(id: string): Observable<AlertResource> {
    return this.http.post<AlertResource>(`${this.baseUrl}/alerts/deliveries/${id}/retry`, {});
  }

  dispatchPendingDeliveries(): Observable<Record<string, number>> {
    return this.http.post<Record<string, number>>(`${this.baseUrl}/alerts/deliveries/dispatch`, {});
  }
}
