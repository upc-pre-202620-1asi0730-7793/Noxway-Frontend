# Noxway Frontend

Aplicación web Angular (standalone components, signals, detección zoneless y Angular Material) integrada en tiempo real con el backend `/api/v1` de **Noxway Platform**.

## Arquitectura por Bounded Contexts

- `iam`: `IamService`, `SessionService`, `UserProfileService`, `TrustedContactsService`, `authGuard` abierto y vistas `Access`, `Profile` y `TrustedContacts`.
- `commute`: `CommuteService` y vista `Journey` (inicio de trayecto, telemetría GPS, demora, incidentes SOS, resolución, llegada segura y calificación de ruta).
- `community`: `CommunityService` y vistas `MapView` (mapa metropolitano 24h con horarios, votación `+1`/`-1` y zonas de riesgo) y `Community` (tablón por distrito, envío de puntos/riesgos y cola de moderación administrativa).
- `wellness`: `WellnessService` y vista `Wellness` (bitácora de descanso, meta diaria y gráfico semanal).
- `subscriptions`: `SubscriptionsService` y vista `Benefits` (planes `ESSENTIAL`/`SENTINEL_PRO`/`FAMILY_CREW`, pagos offline, cupones de beneficios, grupo familiar y referidos).
- `companion`: `CompanionService` y portal completo (`/companion/live`, `history`, `alerts`, `emergency`, `invitations`, `profile`).
- `dashboard` & `shared`: `DashboardService`, `ActorContextService`, `actorContextInterceptor` (`X-Actor-Id` y `Accept-Language`), `NotificationToastService`, `LanguageService` (ES/EN) y shell `Layout`.

## IAM Estructurado y Selector de Persona Demo

Mientras el IAM definitivo permanece diferido (`environment.iamEnabled = false`):

- `authGuard` deja habilitadas todas las rutas sin bloqueo de sesión.
- `actorContextInterceptor` adjunta el header `X-Actor-Id` e idioma `Accept-Language` a cada petición `/api/v1/**`.
- Desde el selector superior/lateral o la vista `/access` puedes cambiar al instante entre `Worker` (`0101`, `0102`), `Companion` (`0201`, `0202`) y `Admin` (`0901`), además de inspeccionar la respuesta estructurada `501` RFC 9457 de `/api/v1/auth/*`.

## Configuración de Desarrollo

El archivo [proxy.conf.json](proxy.conf.json) redirige `/api/v1/**` hacia `http://127.0.0.1:8080`. Asegúrate de tener el backend corriendo en el puerto `8080` antes de levantar el servidor de desarrollo (`ng serve` requiere Node.js compatible con Angular CLI v22).

## Verificación Técnica y Pruebas

```powershell
npm ci
npx ngc -p tsconfig.app.json --noEmit
npx ngc -p tsconfig.spec.json --noEmit
npx vitest run --environment jsdom
```

> Nota de entorno: si el equipo usa Node.js `v24`, `@angular/cli` (`ng`) bloquea la ejecución directa por restricción de versión de motor; las comprobaciones de compilación (`ngc`) y pruebas unitarias (`vitest`) se ejecutan directamente sobre las configuraciones del proyecto.
