import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResource } from '../../shared/domain/model/paged-resource';
import {
  LogRestSessionPayload,
  RestSessionResource,
  SleepGoalResource,
  WellnessSummaryResource,
} from '../domain/model/sleep-record.entity';

@Injectable({ providedIn: 'root' })
export class WellnessService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/wellness`;

  getWellnessSummary(timeZone = 'America/Lima'): Observable<WellnessSummaryResource> {
    const params = new HttpParams().set('timeZone', timeZone);
    return this.http.get<WellnessSummaryResource>(`${this.baseUrl}/summary`, { params });
  }

  listSessions(page = 0, size = 30): Observable<PagedResource<RestSessionResource>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResource<RestSessionResource>>(`${this.baseUrl}/rest-sessions`, {
      params,
    });
  }

  logSession(payload: LogRestSessionPayload): Observable<RestSessionResource> {
    return this.http.post<RestSessionResource>(`${this.baseUrl}/rest-sessions`, payload);
  }

  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rest-sessions/${id}`);
  }

  getGoal(): Observable<SleepGoalResource> {
    return this.http.get<SleepGoalResource>(`${this.baseUrl}/goal`);
  }

  updateGoal(targetMinutes: number): Observable<SleepGoalResource> {
    return this.http.put<SleepGoalResource>(`${this.baseUrl}/goal`, { targetMinutes });
  }
}
