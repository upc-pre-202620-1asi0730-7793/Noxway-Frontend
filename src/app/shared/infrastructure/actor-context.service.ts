import { computed, Injectable, signal } from '@angular/core';

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

/**
 * Holds the active demo/test actor ID sent via X-Actor-Id while IAM login is deferred.
 */
@Injectable({ providedIn: 'root' })
export class ActorContextService {
  readonly personas = DEMO_PERSONAS;

  private readonly actorIdSignal = signal<string>(this.readStoredActorId());
  private readonly revisionSignal = signal<number>(0);

  readonly activeActorId = this.actorIdSignal.asReadonly();
  readonly revision = this.revisionSignal.asReadonly();

  readonly activePersona = computed<DemoPersona>(
    () =>
      this.personas.find((p) => p.id === this.actorIdSignal()) ?? this.personas[0],
  );

  readonly isAdmin = computed(() => this.activePersona().role === 'ADMIN');
  readonly isCompanionRole = computed(() => this.activePersona().role === 'TRUSTED_CONTACT');
  readonly isWorkerRole = computed(() => this.activePersona().role === 'WORKER');

  setActor(actorId: string): void {
    if (!this.personas.some((p) => p.id === actorId)) {
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
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && DEMO_PERSONAS.some((p) => p.id === saved)) {
        return saved;
      }
    } catch {
      // Ignore storage failures in restricted environments
    }
    return DEMO_PERSONAS[0].id;
  }
}
