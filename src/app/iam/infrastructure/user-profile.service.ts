import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AccountProfileResource,
  CreateProfilePayload,
  NotificationPreferenceResource,
  UpdateNotificationPreferencePayload,
  UpdateProfilePayload,
} from '../domain/model/user-profile.entity';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/accounts`;

  getProfile(): Observable<AccountProfileResource> {
    return this.http.get<AccountProfileResource>(`${this.baseUrl}/me`);
  }

  updateProfile(payload: UpdateProfilePayload): Observable<AccountProfileResource> {
    return this.http.put<AccountProfileResource>(`${this.baseUrl}/me`, payload);
  }

  getDirectory(): Observable<AccountProfileResource[]> {
    return this.http.get<AccountProfileResource[]>(`${this.baseUrl}/directory`);
  }

  createProfile(payload: CreateProfilePayload): Observable<AccountProfileResource> {
    return this.http.post<AccountProfileResource>(this.baseUrl, payload);
  }

  getNotificationPreferences(): Observable<NotificationPreferenceResource[]> {
    return this.http.get<NotificationPreferenceResource[]>(`${this.baseUrl}/me/notification-preferences`);
  }

  updateNotificationPreference(
    payload: UpdateNotificationPreferencePayload,
  ): Observable<NotificationPreferenceResource> {
    return this.http.put<NotificationPreferenceResource>(
      `${this.baseUrl}/me/notification-preferences`,
      payload,
    );
  }
}
