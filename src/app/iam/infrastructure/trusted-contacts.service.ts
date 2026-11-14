import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TrustLinkResource } from '../domain/model/trusted-contact.entity';

@Injectable({ providedIn: 'root' })
export class TrustedContactsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/trust-links`;

  getContacts(): Observable<TrustLinkResource[]> {
    return this.http.get<TrustLinkResource[]>(this.baseUrl);
  }

  inviteContact(contactEmail: string): Observable<TrustLinkResource> {
    return this.http.post<TrustLinkResource>(this.baseUrl, { contactEmail });
  }

  acceptInvitation(id: string): Observable<TrustLinkResource> {
    return this.http.post<TrustLinkResource>(`${this.baseUrl}/${id}/accept`, {});
  }

  rejectInvitation(id: string): Observable<TrustLinkResource> {
    return this.http.post<TrustLinkResource>(`${this.baseUrl}/${id}/reject`, {});
  }

  revokeContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
