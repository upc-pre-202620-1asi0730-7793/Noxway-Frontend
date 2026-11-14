# Noxway Frontend — Web Application (SPA)

Aplicación web **Single-Page Application (SPA)** de **Noxway** desarrollada con **Angular 21**, **TypeScript 5.9**, **Angular Signals**, **Angular Material** y cartografía interactiva **Leaflet + OpenStreetMap + OpenFreeMap Vector Tiles**, conectada en tiempo real con el backend REST `/api/v1` de **Noxway Platform**.

---

## Tech Stack

- **Framework:** Angular 21 (Standalone Components, Signals, Control Flow `@if` / `@for`)
- **Lenguaje:** TypeScript 5.9
- **Cartografía y Geodatos:**
  - **Leaflet 1.9** + **OpenStreetMap** (tiles raster interactivos y selector de coordenadas `<app-report-location>`)
  - **OpenFreeMap Vector Tiles** decodificados en navegador con `pbf` y `@mapbox/vector-tile` para POIs metropolitanos (farmacias, supermercados, grifos, hospitales y comisarías)
- **UI & Estilos:** Tokens CSS adaptativos `--nx-*` (**Modo Día / Modo Noche**), modales nativos `<dialog>` y Angular Material Icons/Buttons
- **Internacionalización:** Bilingüe Español (`ES`) / Inglés (`EN`) vía `LanguageService` + cabecera `Accept-Language`
- **Manejo de Errores API:** Compatible con **RFC 9457 Problem Details** (`extractProblemMessage`)
- **Pruebas:** Vitest + Angular TestBed (`ng test`)

---

## Requisitos Previos

- **Node.js 20.19+ o 22.12+** y **npm 10+**
- **Noxway Platform Backend** ejecutándose en `http://localhost:8080` (el archivo [proxy.conf.json](proxy.conf.json) redirige `/api/v1/**` hacia `http://127.0.0.1:8080`)

---

## Estructura del Proyecto por Bounded Contexts

El código fuente dentro de `src/app/` está organizado por **Bounded Contexts** siguiendo la estructura de 3 capas (`domain`, `infrastructure`, `presentation`):

```text
src/app/
├── iam/            # Perfil del trabajador/contacto, directorio, preferencias de notificación y TrustLinks
├── commute/        # Mi Trayecto (/journey): check-in, ping GPS con mapa OSM, demoras, SOS y calificación
├── community/      # Mapa 24h (/map) con OpenStreetMap + OpenFreeMap y Comunidad (/community) con modal de avisos
├── wellness/       # Bienestar (/wellness): bitácora de descanso, meta diaria (240-720 min) y gráfico de 7 días
├── subscriptions/  # Beneficios y Planes (/benefits): planes, pagos offline, cupones, FAMILY_CREW y referidos
├── companion/      # Companion Portal (/companion/*): monitoreo en vivo, alertas, cola de entregas y emergencias
├── dashboard/      # Resumen operativo en vivo (/dashboard)
└── shared/         # Layout shell, ThemeService (Día/Noche), LanguageService (ES/EN), ActorContextService e interceptor
```

---

## Portales y Rutas Principales

### 1. Portal del Trabajador
- `/dashboard` — **Resumen Operativo**: KPIs de jornada nocturna, trayectos completados, red de confianza, descanso promedio y accesos rápidos.
- `/journey` — **Mi Trayecto & Monitoreo Activo**: inicio de trayecto seguro, selector interactivo OpenStreetMap + botón *Usar mi ubicación* para registrar pings GPS, reporte de demoras, emisión de alertas SOS y calificación de rutas.
- `/map` — **Mapa Comunitario 24h y Zonas de Riesgo**: explorador interactivo con filtros (*Todos*, *Farmacias*, *Supermercados*, *Grifos*, *Hospitales*, *Comisarías*, *Puntos Noxway 24h*, *Zonas de riesgo*), filtro *Solo abiertos 24 horas*, *Buscar en esta zona*, votación de confianza (`+1` / `-1`) y acceso directo para reportar locales o peligros.
- `/community` — **Comunidad & Reportes Colaborativos**: filtro por distrito, botón **+ Publicar aviso** con modal `<dialog>` (categoría, título, descripción, distrito opcional y mapa interactivo `<app-report-location>`), enlace directo **Ver ubicación del aviso** hacia el mapa 24h y cola de moderación administrativa.
- `/wellness` — **Bienestar & Recuperación de Sueño**: KPIs semanales, gráfico de barras de 7 días, registro de sesiones sin solapamientos y meta diaria.
- `/benefits` — **Planes, Beneficios & Grupo Familiar**: catálogo `ESSENTIAL`, `SENTINEL_PRO` y `FAMILY_CREW`, pagos offline (`Yape / Plin / Agente`), canje de cupones, invitaciones familiares y programa de referidos.
- `/trusted-contacts` — **Red de Contactos de Confianza**: invitación por correo y gestión de vínculos `ACTIVE` / `PENDING`.
- `/profile` — **Mi Perfil & Jornada**: datos personales, horario de turno y canales de notificación (`IN_APP`, `EMAIL`, `SMS`, `WHATSAPP`).

### 2. Companion Portal (Contacto de Confianza)
- `/companion/live` — **Monitoreo en Vivo**: seguimiento de trabajadores vinculados, último ping GPS con botón **Ver en mapa** y resolución de incidentes.
- `/companion/history` — **Historial de Rutas & Eventos**: bitácora filtrable por canal.
- `/companion/alerts` — **Centro de Avisos & Cola de Entregas**: alertas recibidas, canales habilitados y despacho/reintento de entregas.
- `/companion/emergency` — **Directorio de Auxilio & Central de Emergencias**: incidentes SOS activos con enlace al mapa y líneas oficiales de emergencia en Perú (`105`, `106`, `116`, `100`).
- `/companion/invitations` — **Invitaciones de Vínculos & Planes**: aceptación o rechazo de solicitudes `TrustLink` y `FAMILY_CREW`.
- `/companion/profile` — **Mi Perfil de Contacto de Confianza**.

---

## Ejecución en Desarrollo

1. Asegúrate de iniciar primero el backend en el puerto `8080`:
   ```powershell
   .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
   ```
2. Instala las dependencias e inicia el servidor de desarrollo de Angular:
   ```powershell
   npm install
   npm start
   ```
3. Abre en tu navegador: `http://localhost:4200`

---

## Compilación y Pruebas Automatizadas

```powershell
# Compilar bundle de producción (verifica tipos, templates y presupuestos de bundle)
npm run build

# Ejecutar las 28 pruebas unitarias en 14 suites con Vitest
npx ng test --watch=false
```

---

## Documentación Técnica (`docs/`)

Consulta la carpeta `docs/` para los diagramas y especificaciones del frontend:
- [Diagrama de Clases y Componentes (PlantUML)](docs/class-diagram.puml) y [Vista Modular Mermaid](docs/class-diagram.md)
- [Arquitectura de Software (Structurizr C4 DSL)](docs/software-architecture.dsl) y [Guía C4 + Flujo OpenStreetMap](docs/software-architecture.md)
- [Historias de Usuario y Criterios de Aceptación UI](docs/user-stories.md)
- [Architecture Decision Records (ADRs Frontend)](docs/adrs.md)
