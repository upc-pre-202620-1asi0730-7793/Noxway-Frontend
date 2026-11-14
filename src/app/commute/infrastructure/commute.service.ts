import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResource } from '../../shared/domain/model/paged-resource';
import {
  CommuteResource,
  RecordTelemetryPingPayload,
  ReportIncidentPayload,
  SafetyIncidentResource,
  StartCommutePayload,
  TelemetryPingResource,
} from '../domain/model/commute.entity';

@Injectable({ providedIn: 'root' })
export class CommuteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getMyCommutes(page = 0, size = 20): Observable<PagedResource<CommuteResource>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResource<CommuteResource>>(`${this.baseUrl}/commutes/mine`, { params });
  }

  getCommute(id: string): Observable<CommuteResource> {
    return this.http.get<CommuteResource>(`${this.baseUrl}/commutes/${id}`);
  }

  startCommute(payload: StartCommutePayload): Observable<CommuteResource> {
    return this.http.post<CommuteResource>(`${this.baseUrl}/commutes`, payload);
  }

  delayCommute(id: string, minutes: number): Observable<CommuteResource> {
    return this.http.post<CommuteResource>(`${this.baseUrl}/commutes/${id}/delay`, { minutes });
  }

  arriveCommute(id: string): Observable<CommuteResource> {
    return this.http.post<CommuteResource>(`${this.baseUrl}/commutes/${id}/arrive`, {});
  }

  getTelemetry(commuteId: string): Observable<TelemetryPingResource[]> {
    return this.http.get<TelemetryPingResource[]>(`${this.baseUrl}/commutes/${commuteId}/telemetry`);
  }

  recordTelemetry(
    commuteId: string,
    payload: RecordTelemetryPingPayload,
  ): Observable<TelemetryPingResource> {
    return this.http.post<TelemetryPingResource>(
      `${this.baseUrl}/commutes/${commuteId}/telemetry`,
      payload,
    );
  }

  getIncidents(commuteId: string): Observable<SafetyIncidentResource[]> {
    return this.http.get<SafetyIncidentResource[]>(`${this.baseUrl}/commutes/${commuteId}/incidents`);
  }

  triggerIncident(
    commuteId: string,
    payload: ReportIncidentPayload,
  ): Observable<SafetyIncidentResource> {
    return this.http.post<SafetyIncidentResource>(
      `${this.baseUrl}/commutes/${commuteId}/incidents`,
      payload,
    );
  }

  resolveIncident(incidentId: string): Observable<SafetyIncidentResource> {
    return this.http.post<SafetyIncidentResource>(`${this.baseUrl}/incidents/${incidentId}/resolve`, {});
  }
}
