# Architecture Decision Records (ADRs) — Noxway Frontend

Este documento registra las Decisiones de Arquitectura (ADRs) de **Noxway Frontend** siguiendo el formato de Michael Nygard.

---

## Índice

- [ADR-FE-001: Arquitectura Modular por Bounded Contexts en Angular 21](#adr-fe-001-arquitectura-modular-por-bounded-contexts-en-angular-21)
- [ADR-FE-002: Gestión de Estado Reactivo con Angular Signals](#adr-fe-002-gestión-de-estado-reactivo-con-angular-signals)
- [ADR-FE-003: Cartografía Híbrida con Leaflet, OpenStreetMap y Vector Tiles PBF de OpenFreeMap](#adr-fe-003-cartografía-híbrida-con-leaflet-openstreetmap-y-vector-tiles-pbf-de-openfreemap)
- [ADR-FE-004: Componente Reutilizable `ReportLocation` y Modales Nativos `<dialog>`](#adr-fe-004-componente-reutilizable-reportlocation-y-modales-nativos-dialog)
- [ADR-FE-005: Carga Diferida (`loadComponent`) para Rutas con Dependencias Cartográficas](#adr-fe-005-carga-diferida-loadcomponent-para-rutas-con-dependencias-cartográficas)
- [ADR-FE-006: Sistema de Diseño Adaptativo Día/Noche Basado en Tokens CSS `--nx-*`](#adr-fe-006-sistema-de-diseño-adaptativo-díanoche-basado-en-tokens-css---nx-)
- [ADR-FE-007: Interceptor HTTP Unificado (`X-Actor-Id`, `Accept-Language` y RFC 9457)](#adr-fe-007-interceptor-http-unificado-x-actor-id-accept-language-y-rfc-9457)

---

## ADR-FE-001: Arquitectura Modular por Bounded Contexts en Angular 21
- **Estado**: Aceptado
- **Contexto**: Una aplicación que cubre dos portales (Trabajador y Contacto de Confianza) y múltiples dominios tiende a desordenarse si se agrupa únicamente por tipo técnico (`components/`, `services/`).
- **Decisión**: Estructurar `src/app/` reflejando los Bounded Contexts del dominio (`iam`, `commute`, `community`, `wellness`, `subscriptions`, `companion`, `dashboard`, `shared`), cada uno dividido en `domain/model`, `infrastructure` y `presentation`.
- **Consecuencias**: Alineación directa 1 a 1 con los contextos del backend y alta mantenibilidad.

## ADR-FE-002: Gestión de Estado Reactivo con Angular Signals
- **Estado**: Aceptado
- **Contexto**: Se requiere reactividad predecible y sin sobrecarga de suscripciones manuales para sincronizar vistas, filtros de mapas y cambios de idioma/tema.
- **Decisión**: Adoptar **Angular Signals** (`signal`, `computed`, `effect`, `model`, `input`) en todos los servicios y componentes standalone.
- **Consecuencias**: Código declarativo, derivado automáticamente (`filteredItems`, `activeCommute`, `myNoticeStats`) y preparado para detección de cambios zoneless.

## ADR-FE-003: Cartografía Híbrida con Leaflet, OpenStreetMap y Vector Tiles PBF de OpenFreeMap
- **Estado**: Aceptado
- **Contexto**: La vista `Mapa 24h` necesita mostrar tanto los puntos colaborativos y zonas de riesgo moderados en el backend como miles de establecimientos reales de la ciudad (farmacias, supermercados, grifos, hospitales y comisarías) sin depender de llaves API de pago ni servidores Overpass lentos.
- **Decisión**: Renderizar mapas interactivos con **Leaflet** + tiles de **OpenStreetMap**, y decodificar en el navegador tiles vectoriales PBF (`z=14`) de **OpenFreeMap** mediante `pbf` y `@mapbox/vector-tile` en `NearbyPlacesService`, fusionándolos con `/api/v1/community/services` y `/api/v1/community/risk-zones`.
- **Consecuencias**: Respuesta inmediata al explorar cualquier zona de Lima, cálculo local de distancia Haversine y evaluación de horarios 24h sin llaves propietarias.

## ADR-FE-004: Componente Reutilizable `ReportLocation` y Modales Nativos `<dialog>`
- **Estado**: Aceptado
- **Contexto**: Tanto la creación de avisos/locales/riesgos en `Comunidad` como el envío de pings GPS en `Mi Trayecto` requieren seleccionar coordenadas exactas sobre un mapa interactivo.
- **Decisión**: Crear el componente standalone `<app-report-location>` con `model<ReportCoordinates | null>()` y utilizar el elemento nativo HTML `<dialog>` para el compositor de avisos en `Comunidad`.
- **Consecuencias**: Accesibilidad nativa (cierre con `Esc`, foco controlado) y reutilización del selector OpenStreetMap en `Comunidad` y `Mi Trayecto`.

## ADR-FE-005: Carga Diferida (`loadComponent`) para Rutas con Dependencias Cartográficas
- **Estado**: Aceptado
- **Contexto**: Las librerías cartográficas (`leaflet`, `pbf`, `@mapbox/vector-tile`) incrementan el tamaño del bundle si se cargan en el arranque inicial.
- **Decisión**: Configurar `loadComponent` en `app.routes.ts` para `/map`, `/community` y `/journey`.
- **Consecuencias**: El bundle inicial se mantiene por debajo de `645 kB` sin advertencias de presupuesto en `ng build`.

## ADR-FE-006: Sistema de Diseño Adaptativo Día/Noche Basado en Tokens CSS `--nx-*`
- **Estado**: Aceptado
- **Contexto**: Los trabajadores utilizan la aplicación tanto de madrugada (baja luminosidad) como de día (alta luz ambiental).
- **Decisión**: Centralizar todos los colores de fondo, texto, bordes e insignias en variables CSS `--nx-*` conmutadas por `ThemeService` mediante `[data-theme="dark"]` y `[data-theme="light"]`.
- **Consecuencias**: Transición instantánea entre Modo Día y Modo Noche sin estilos hardcodeados.

## ADR-FE-007: Interceptor HTTP Unificado (`X-Actor-Id`, `Accept-Language` y RFC 9457)
- **Estado**: Aceptado
- **Contexto**: Todas las llamadas a `/api/v1/**` deben propagar la identidad activa del portal y el idioma seleccionado, además de interpretar errores RFC 9457.
- **Decisión**: Implementar `actorContextInterceptor` para inyectar `X-Actor-Id` y `Accept-Language`, y `extractProblemMessage` para decodificar `ProblemDetail`.
- **Consecuencias**: Integración limpia y uniforme entre todos los servicios Angular y Spring Boot.
