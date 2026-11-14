# Noxway Frontend — Diagrama de Clases y Componentes (Angular 21)

> El diagrama completo en formato PlantUML se encuentra en [class-diagram.puml](class-diagram.puml). A continuación se presenta la vista modular en Mermaid compatible con GitHub.

## 1. Arquitectura de Módulos, Servicios y Vistas por Bounded Context

```mermaid
classDiagram
  direction LR

  namespace SharedKernel {
    class ActorContextService {
      <<Service>>
      +Signal~string~ activeActorId
      +Signal~DemoPersona~ activePersona
      +Signal~number~ revision
      +setActor(string actorId)
    }
    class ThemeService {
      <<Service>>
      +Signal~ThemeMode~ theme
      +Signal~boolean~ isDark
      +Signal~boolean~ isLight
      +setTheme(ThemeMode mode)
    }
    class LanguageService {
      <<Service>>
      +Signal~string~ currentLang
      +t(string key) string
      +ui(string text) string
    }
    class Layout {
      <<Component>>
      +Signal~boolean~ isCompanion
      +Signal~boolean~ wideContent
      +syncShellContext()
    }
  }

  namespace CommunityAndMap24h {
    class NearbyPlacesService {
      <<Service>>
      +searchNearby(center, radiusKm) Promise~NearbyPlace[]~
    }
    class CommunityService {
      <<Service>>
      +listServices(params) Observable
      +submitService(payload) Observable
      +voteService(id, direction) Observable
      +listRiskZones(page, size) Observable
      +reportRiskZone(payload) Observable
      +listPosts(district) Observable
      +createPost(payload) Observable
      +getModerationQueue(status) Observable
    }
    class ReportLocation {
      <<Component>>
      +ModelSignal~ReportCoordinates~ location
      +InputSignal~ReportCoordinates~ initialCenter
      +selectCenter()
    }
    class MapView {
      <<View>>
      +Signal~MapCategoryId~ activeCategory
      +Signal~boolean~ onlyOpen24Hours
      +Signal~UnifiedMapItem[]~ filteredItems
      +searchInCurrentArea()
      +useMyLocation()
    }
    class Community {
      <<View>>
      +Signal~CommunityPostResource[]~ posts
      +Signal~ReportCoordinates~ noticeLocation
      +openCreateModal(kind)
      +submitNotice()
      +openPostOnMap(post)
    }
  }

  namespace CommuteAndCompanion {
    class CommuteService {
      <<Service>>
      +startCommute(payload) Observable
      +recordTelemetry(commuteId, payload) Observable
      +delayCommute(commuteId, minutes) Observable
      +arriveCommute(commuteId) Observable
      +triggerIncident(commuteId, payload) Observable
    }
    class CompanionService {
      <<Service>>
      +getLiveMonitoring() Observable
      +getAlerts(page, size) Observable
      +getDeliveryQueue() Observable
      +dispatchPendingDeliveries() Observable
    }
    class Journey {
      <<View>>
      +Signal~CommuteResource~ activeCommute
      +Signal~ReportCoordinates~ pingLocation
      +startCommute()
      +sendPing()
      +useMyLocationForPing()
      +openPingOnMap(ping)
    }
    class CompanionLive {
      <<View>>
      +Signal~CompanionLiveResource[]~ monitored
      +resolveIncident(id)
      +openPingOnMap(workerName, lat, lng)
    }
    class CompanionEmergency {
      <<View>>
      +Signal~CompanionLiveResource[]~ workersWithOpenIncidents
      +openPingOnMap(workerName, lat, lng)
    }
  }

  namespace IamWellnessSubscriptions {
    class UserProfileService {
      <<Service>>
      +getProfile() Observable
      +updateProfile(payload) Observable
      +getNotificationPreferences() Observable
    }
    class TrustedContactsService {
      <<Service>>
      +getContacts() Observable
      +inviteContact(email) Observable
      +acceptInvitation(id) Observable
    }
    class WellnessService {
      <<Service>>
      +getSummary(tz) Observable
      +logSession(payload) Observable
      +updateGoal(minutes) Observable
    }
    class SubscriptionsService {
      <<Service>>
      +getPlans() Observable
      +subscribe(planId) Observable
      +confirmOfflinePayment(id, ref) Observable
      +claimBenefit(id) Observable
    }
  }

  MapView --> CommunityService
  MapView --> NearbyPlacesService
  Community --> CommunityService
  Community --> ReportLocation
  Journey --> CommuteService
  Journey --> CommunityService
  Journey --> ReportLocation
  CompanionLive --> CompanionService
  CompanionLive --> CommuteService
  CompanionEmergency --> CompanionService
```

## 2. Capas Internas por Bounded Context

Cada módulo de negocio en `src/app/<contexto>/` mantiene una separación limpia en **3 capas**:

| Capa | Directorio | Responsabilidad |
|---|---|---|
| **Domain** | `domain/model/` | Interfaces de recursos tipados (`*Resource`), payloads de comandos (`*Request`) y reglas puras de cálculo (ej. `service-hours.ts`, `rest-period.ts`, `user-profile.entity.ts`). |
| **Infrastructure** | `infrastructure/` | Servicios HTTP (`HttpClient`) hacia `/api/v1/*`, decodificación de tiles vectoriales PBF (`NearbyPlacesService`), interceptores (`actorContextInterceptor`) y manejo de estado de sesión/tema/idioma. |
| **Presentation** | `presentation/views/` y `presentation/components/` | Componentes standalone Angular 21 basados en Signals (`signal`, `computed`, `effect`, `model`), mapas interactivos Leaflet (`MapView`, `ReportLocation`) y modales nativos `<dialog>`. |
