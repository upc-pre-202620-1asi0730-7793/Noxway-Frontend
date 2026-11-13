import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ActorContextService } from '../../shared/infrastructure/actor-context.service';
import {
  AccountProfileResource,
  UpdateProfilePayload,
} from '../domain/model/user-profile.entity';
import { UserProfileService } from './user-profile.service';

/**
 * Coordinates the active actor profile with the backend /api/v1/accounts/me endpoint.
 * Replaces legacy demo/Express session management while IAM enforcement is deferred.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly profileService = inject(UserProfileService);
  private readonly actorContext = inject(ActorContextService);

  private readonly currentProfile = signal<AccountProfileResource | null>(null);
  readonly profile = computed(() => {
    const loaded = this.currentProfile();
    return loaded && loaded.id === this.actorContext.activeActorId() ? loaded : null;
  });
  readonly demo = computed(() => true);
  readonly activeActor = this.actorContext.activePersona;

  loadProfile(): Observable<AccountProfileResource> {
    return this.profileService.getProfile().pipe(
      tap((profile) => this.currentProfile.set(profile)),
    );
  }

  saveProfile(payload: UpdateProfilePayload): Observable<AccountProfileResource> {
    return this.profileService.updateProfile(payload).pipe(
      tap((updated) => this.currentProfile.set(updated)),
    );
  }

  bindPortal(isCompanion: boolean): boolean {
    const switched = this.actorContext.syncPortal(isCompanion);
    if (switched) {
      this.currentProfile.set(null);
    }
    return switched;
  }

  switchPersona(actorId: string): void {
    if (this.currentProfile()?.id !== actorId) {
      this.currentProfile.set(null);
    }
    this.actorContext.setActor(actorId);
    this.loadProfile().subscribe({ error: () => {} });
  }
}
