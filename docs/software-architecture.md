# Noxway Frontend — Arquitectura de Software (Angular 21, OpenStreetMap & Signals)

> La especificación formal en Structurizr C4 DSL se encuentra en [software-architecture.dsl](software-architecture.dsl). Este documento detalla la arquitectura de contenedores, módulos por Bounded Context, flujo de mapas OpenStreetMap + OpenFreeMap y sistema de diseño Día/Noche.

---

## 1. Diagrama de Contexto e Integración del Frontend (C4)

```mermaid
flowchart LR
  Worker["👷 Trabajador\n(Portal Trabajador)"]
  Companion["🛡️ Contacto de Confianza\n(Companion Portal)"]

  subgraph SPA["Noxway Frontend SPA (Angular 21)"]
    Shell["Layout Shell · ThemeService (Día/Noche) · LanguageService (ES/EN)"]
    Modules["Módulos por Bounded Context\n(Dashboard, Journey, MapView, Community, Wellness, Benefits, Companion)"]
    Interceptor["actorContextInterceptor\n(X-Actor-Id + Accept-Language + RFC 9457)"]
  end

  API["⚙️ Noxway Platform API\n(Spring Boot /api/v1)"]
  OSM["🗺️ OpenStreetMap\n(Raster Street Tiles)"]
  OFM["📍 OpenFreeMap\n(PBF Vector Tiles z14)"]

  Worker --> Shell
  Companion --> Shell
  Shell --> Modules
  Modules --> Interceptor
  Interceptor -->|JSON / HTTP| API
  Modules -->|Leaflet Raster Tiles| OSM
  Modules -->|Decodificación PBF en navegador| OFM
```

---

## 2. Arquitectura Híbrida de `Mapa 24h` y `Comunidad`

El módulo `community` combina **datos geográficos metropolitanos en vivo** con **datos colaborativos persistidos en el backend**:

```mermaid
sequenceDiagram
  participant U as Trabajador
  participant MV as MapView / Community
  participant NP as NearbyPlacesService
  participant OFM as OpenFreeMap (PBF Tiles)
  participant API as Backend (/api/v1/community)

  U->>MV: Abre /map o filtra categoría (Farmacias, Grifos, Riesgo...)
  par POIs Metropolitanos (OpenFreeMap)
    MV->>NP: searchNearby(center, 3 km)
    NP->>OFM: GET /planet/20260311_001001_pt/14/{x}/{y}.pbf
    OFM-->>NP: Vector Tile binario (poi layer)
    NP-->>MV: NearbyPlace[] (distancia Haversine + horario 24h)
  and Puntos Colaborativos y Riesgos (Noxway Backend)
    MV->>API: GET /api/v1/community/services & /risk-zones
    API-->>MV: ServicePointResource[] + RiskZoneResource[]
  end
  MV-->>U: Renderiza pines unificados en Leaflet + lista lateral ordenada por distancia
```

---

## 3. Enrutamiento y Carga Diferida (Lazy Loading)

Las rutas pesadas que incorporan cartografía interactiva (`Leaflet`, `pbf`, `@mapbox/vector-tile`) utilizan `loadComponent` en [app.routes.ts](../src/app/app.routes.ts) para mantener el bundle inicial ligero:

| Ruta | Componente | Carga | Portal |
|---|---|---|---|
| `/dashboard` | `Dashboard` | Eager | Trabajador |
| `/journey` | `Journey` (incluye `ReportLocation`) | **Lazy (`chunk-journey`)** | Trabajador |
| `/map` | `MapView` (incluye `Leaflet` + `NearbyPlacesService`) | **Lazy (`chunk-map-view`)** | Trabajador |
| `/community` | `Community` (incluye modal `<dialog>` + `ReportLocation`) | **Lazy (`chunk-community`)** | Trabajador |
| `/wellness` | `Wellness` | Eager | Trabajador |
| `/benefits` | `Benefits` | Eager | Trabajador |
| `/trusted-contacts` | `TrustedContacts` | Eager | Trabajador |
| `/profile` | `Profile` | Eager | Trabajador |
| `/companion/live` | `CompanionLive` | Eager | Companion |
| `/companion/history` | `CompanionHistory` | Eager | Companion |
| `/companion/alerts` | `CompanionAlerts` | Eager | Companion |
| `/companion/emergency` | `CompanionEmergency` | Eager | Companion |
| `/companion/invitations` | `CompanionInvitations` | Eager | Companion |
| `/companion/profile` | `CompanionProfile` | Eager | Companion |

---

## 4. Sistema de Diseño Adaptativo (Modo Día / Modo Noche) e Internacionalización

- **Variables semánticas `--nx-*`**: Definidas en `src/styles.css` bajo `:root` / `[data-theme="dark"]` (Modo Noche) y `[data-theme="light"]` (Modo Día), garantizando contraste accesible en tarjetas, tablas, modales `<dialog>` y controles de mapa.
- **Bilingüe (`ES` / `EN`)**: `LanguageService` sincroniza las etiquetas de interfaz y envía automáticamente la cabecera `Accept-Language` al backend para recibir errores RFC 9457 en el idioma activo.
