import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResource } from '../../shared/domain/model/paged-resource';
import {
  CommunityPostResource,
  CommunityReportResource,
  CreateCommunityPostPayload,
  ModerationActionResource,
} from '../domain/model/community-post.entity';
import {
  RateRoutePayload,
  ReportRiskZonePayload,
  RiskZoneResource,
  RouteRatingResource,
  ServicePointResource,
  ServiceVoteResource,
  SubmitServicePointPayload,
} from '../domain/model/service-point.entity';

export interface ServiceListQuery {
  type?: string;
  openOnly?: boolean;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class CommunityService {
  private readonly http = inject(HttpClient);
  private readonly communityUrl = `${environment.apiBaseUrl}/community`;
  private readonly moderationUrl = `${environment.apiBaseUrl}/moderation`;

  listServices(query: ServiceListQuery = {}): Observable<PagedResource<ServicePointResource>> {
    let params = new HttpParams()
      .set('page', query.page ?? 0)
      .set('size', query.size ?? 50)
      .set('openOnly', query.openOnly ?? false);
    if (query.type && query.type !== 'ALL') params = params.set('type', query.type);
    if (query.latitude !== undefined) params = params.set('latitude', query.latitude);
    if (query.longitude !== undefined) params = params.set('longitude', query.longitude);
    if (query.radiusKm !== undefined) params = params.set('radiusKm', query.radiusKm);
    return this.http.get<PagedResource<ServicePointResource>>(`${this.communityUrl}/services`, { params });
  }

  myServices(): Observable<ServicePointResource[]> {
    return this.http.get<ServicePointResource[]>(`${this.communityUrl}/services/mine`);
  }

  submitService(payload: SubmitServicePointPayload): Observable<ServicePointResource> {
    return this.http.post<ServicePointResource>(`${this.communityUrl}/services`, payload);
  }

  voteService(serviceId: string, direction: -1 | 0 | 1): Observable<ServiceVoteResource> {
    return this.http.put<ServiceVoteResource>(`${this.communityUrl}/services/${serviceId}/vote`, {
      direction,
    });
  }

  listRiskZones(page = 0, size = 30): Observable<PagedResource<RiskZoneResource>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResource<RiskZoneResource>>(`${this.communityUrl}/risk-zones`, { params });
  }

  reportRiskZone(payload: ReportRiskZonePayload): Observable<RiskZoneResource> {
    return this.http.post<RiskZoneResource>(`${this.communityUrl}/risk-zones`, payload);
  }

  resolveRiskZone(id: string): Observable<RiskZoneResource> {
    return this.http.post<RiskZoneResource>(`${this.communityUrl}/risk-zones/${id}/resolve`, {});
  }

  listPosts(district?: string, page = 0, size = 30): Observable<PagedResource<CommunityPostResource>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (district && district !== 'all') {
      params = params.set('district', district);
    }
    return this.http.get<PagedResource<CommunityPostResource>>(`${this.communityUrl}/posts`, { params });
  }

  createPost(payload: CreateCommunityPostPayload): Observable<CommunityPostResource> {
    return this.http.post<CommunityPostResource>(`${this.communityUrl}/posts`, payload);
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.communityUrl}/posts/${id}`);
  }

  rateRoute(payload: RateRoutePayload): Observable<RouteRatingResource> {
    return this.http.post<RouteRatingResource>(`${this.communityUrl}/route-ratings`, payload);
  }

  myRatings(): Observable<RouteRatingResource[]> {
    return this.http.get<RouteRatingResource[]>(`${this.communityUrl}/route-ratings/mine`);
  }

  listReports(
    status?: string,
    page = 0,
    size = 30,
  ): Observable<PagedResource<CommunityReportResource>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status && status !== 'ALL') {
      params = params.set('status', status);
    }
    return this.http.get<PagedResource<CommunityReportResource>>(`${this.moderationUrl}/reports`, {
      params,
    });
  }

  submitReport(
    targetType: 'SERVICE' | 'RISK',
    targetId: string,
    reason: string,
  ): Observable<CommunityReportResource> {
    return this.http.post<CommunityReportResource>(`${this.moderationUrl}/reports`, {
      targetType,
      targetId,
      reason,
    });
  }

  decideReport(
    reportId: string,
    decision: 'APPROVE' | 'REJECT',
    notes: string,
  ): Observable<CommunityReportResource> {
    return this.http.post<CommunityReportResource>(
      `${this.moderationUrl}/reports/${reportId}/decision`,
      { decision, notes },
    );
  }

  getReportActions(reportId: string): Observable<ModerationActionResource[]> {
    return this.http.get<ModerationActionResource[]>(
      `${this.moderationUrl}/reports/${reportId}/actions`,
    );
  }
}
