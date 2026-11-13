import { computed, Injectable, signal } from '@angular/core';
import { AccountProfileResource } from '../../iam/domain/model/user-profile.entity';

export type PersonaRole = 'WORKER' | 'TRUSTED_CONTACT' | 'ADMIN';

export interface DemoPersona {
  id: string;
  name: string;
  email: string;
  role: PersonaRole;
  labelEs: string;
  labelEn: string;
  defaultRoute: string;
}

export const DEMO_PERSONAS: readonly DemoPersona[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    name: 'Jorge Luis Huamán',
    email: 'jorge.huaman@noxway.pe',
    role: 'WORKER',
    labelEs: 'Trabajador · Jorge Huamán',
    labelEn: 'Worker · Jorge Huamán',
    defaultRoute: '/dashboard',
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@noxway.pe',
    role: 'WORKER',
    labelEs: 'Trabajador · Carlos Mendoza',
    labelEn: 'Worker · Carlos Mendoza',
    defaultRoute: '/dashboard',
  },
  {
    id: '00000000-0000-0000-0000-000000000201',
    name: 'Rosa Elena Paredes Morales',
    email: 'rosa.paredes@noxway.pe',
    role: 'TRUSTED_CONTACT',
    labelEs: 'Contacto · Rosa Paredes',
    labelEn: 'Companion · Rosa Paredes',
    defaultRoute: '/companion/live',
  },
  {
    id: '00000000-0000-0000-0000-000000000202',
    name: 'Miguel Ángel Quispe',
    email: 'miguel.quispe@noxway.pe',
    role: 'TRUSTED_CONTACT',
    labelEs: 'Contacto · Miguel Quispe',
    labelEn: 'Companion · Miguel Quispe',
    defaultRoute: '/companion/invitations',
  },
  {
    id: '00000000-0000-0000-0000-000000000901',
    name: 'Noxway Administrator',
    email: 'admin@noxway.test',
    role: 'ADMIN',
    labelEs: 'Admin / Moderador',
    labelEn: 'Admin / Moderator',
    defaultRoute: '/community',
  },
] as const;

const STORAGE_KEY = 'noxway_actor_id';

export const DEFAULT_WORKER_ACTOR_ID = DEMO_PERSONAS[0].id;
export const DEFAULT_COMPANION_ACTOR_ID = DEMO_PERSONAS[2].id;

/**
 * Holds the active demo/test actor ID sent via X-Actor-Id while IAM login is deferred.
 */
@Injectable({ providedIn: 'root' })
export class ActorContextService {
  private readonly personasSignal = signal<DemoPersona[]>([...DEMO_PERSONAS]);

  private readonly actorIdSignal = signal<string>(this.readStoredActorId());
  private readonly revisionSignal = signal<number>(0);

  readonly activeActorId = this.actorIdSignal.asReadonly();
  readonly revision = this.revisionSignal.asReadonly();

  get personas(): readonly DemoPersona[] {
    return this.personasSignal();
  }

  readonly activePersona = computed<DemoPersona>(
    () =>
      this.personasSignal().find((p) => p.id === this.actorIdSignal()) ?? this.personasSignal()[0],
  );

  readonly isAdmin = computed(() => this.activePersona().role === 'ADMIN');
  readonly isCompanionRole = computed(() => this.activePersona().role === 'TRUSTED_CONTACT');
  readonly isWorkerRole = computed(() => this.activePersona().role === 'WORKER');

  findPersonaByRole(role: PersonaRole): DemoPersona | undefined {
    return this.personasSignal().find((persona) => persona.role === role);
  }

  /**
   * Ensures each portal runs under its single dedicated open profile:
   * Jorge Luis Huaman (WORKER) in the Worker portal and Rosa Elena Paredes Morales (TRUSTED_CONTACT) in the Companion portal.
   */
  syncPortal(isCompanion: boolean): boolean {
    const targetId = isCompanion ? DEFAULT_COMPANION_ACTOR_ID : DEFAULT_WORKER_ACTOR_ID;
    const targetRole: PersonaRole = isCompanion ? 'TRUSTED_CONTACT' : 'WORKER';
    const targetPersona =
      this.personasSignal().find((persona) => persona.id === targetId) ??
      this.findPersonaByRole(targetRole);
    if (!targetPersona || this.actorIdSignal() === targetPersona.id) {
      return false;
    }
    this.setActor(targetPersona.id);
    return true;
  }

  syncDirectory(accounts: readonly AccountProfileResource[]): void {
    if (!accounts.length) {
      return;
    }
    const seedById = new Map(DEMO_PERSONAS.map((persona) => [persona.id, persona]));
    const merged: DemoPersona[] = accounts.map((account) => {
      const seed = seedById.get(account.id);
      const normalizedRole: PersonaRole =
        account.role === 'ADMIN' || account.role === 'MODERATOR'
          ? 'ADMIN'
          : account.role === 'TRUSTED_CONTACT'
            ? 'TRUSTED_CONTACT'
            : 'WORKER';
      const defaultRoute =
        seed?.defaultRoute ??
        (normalizedRole === 'TRUSTED_CONTACT'
          ? '/companion/live'
          : normalizedRole === 'ADMIN'
            ? '/community'
            : '/dashboard');
      const rolePrefixEs =
        normalizedRole === 'ADMIN'
          ? 'Admin / Moderador'
          : normalizedRole === 'TRUSTED_CONTACT'
            ? 'Contacto'
            : 'Trabajador';
      const rolePrefixEn =
        normalizedRole === 'ADMIN'
          ? 'Admin / Moderator'
          : normalizedRole === 'TRUSTED_CONTACT'
            ? 'Companion'
            : 'Worker';

      return {
        id: account.id,
        name: account.fullName,
        email: account.email,
        role: normalizedRole,
        labelEs: seed?.labelEs ?? `${rolePrefixEs} · ${account.fullName}`,
        labelEn: seed?.labelEn ?? `${rolePrefixEn} · ${account.fullName}`,
        defaultRoute,
      };
    });
    this.personasSignal.set(merged);
    if (!merged.some((p) => p.id === this.actorIdSignal()) && merged[0]) {
      this.actorIdSignal.set(merged[0].id);
    }
  }

  setActor(actorId: string): void {
    if (!this.personasSignal().some((p) => p.id === actorId)) {
      return;
    }
    this.actorIdSignal.set(actorId);
    this.revisionSignal.update((n) => n + 1);
    try {
      localStorage.setItem(STORAGE_KEY, actorId);
    } catch {
      // Ignore storage failures in restricted environments
    }
  }

  private readStoredActorId(): string {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (DEMO_PERSONAS.some((p) => p.id === saved) || uuidPattern.test(saved))) {
        return saved;
      }
    } catch {
      // Ignore storage failures in restricted environments
    }
    return DEMO_PERSONAS[0].id;
  }
}
