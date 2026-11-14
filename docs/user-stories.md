# Noxway Frontend — Historias de Usuario y Criterios de Aceptación UI

Este documento describe las Historias de Usuario (`US-FE-*`) y Technical Stories (`TS-FE-*`) implementadas en **Noxway Frontend** (Angular 21) conectadas en vivo con `/api/v1`.

---

## 1. Historias Técnicas Transversales (`shared`)

### TS-FE001 — Conmutación de Tema Adaptativo (Modo Día / Modo Noche) e Idioma (`ES` / `EN`)
**Como** trabajador de turno diurno o nocturno, **quiero** alternar entre **Modo Día** y **Modo Noche** y cambiar el idioma entre **Español (`ES`)** e **Inglés (`EN`)** desde la barra superior, **para** adaptar el contraste visual a las condiciones de luz de mi jornada.

**Criterios de aceptación:**
- **Dado** que el usuario hace clic en `Día` o `Noche` en la barra superior
- **Cuando** `ThemeService` actualiza la señal `theme`
- **Entonces** el atributo `data-theme` en `<html>` y `localStorage['noxway.theme.mode']` se actualizan al instante, aplicando los tokens `--nx-*` en todas las vistas y modales.

### TS-FE002 — Propagación Automática de Contexto y Manejo de Errores RFC 9457
**Como** usuario de la plataforma, **quiero** que todas las acciones muestren notificaciones claras cuando ocurra una validación o regla de negocio del backend, **para** saber exactamente cómo corregir mi solicitud.

**Criterios de aceptación:**
- **Dado** cualquier petición hacia `/api/v1/**`
- **Cuando** `actorContextInterceptor` procesa la solicitud y el backend responde con un error `ProblemDetail` (RFC 9457)
- **Entonces** `extractProblemMessage` extrae el `detail` o los errores por campo y `NotificationToastService` presenta el mensaje localizado en pantalla.

---

## 2. Mapa Comunitario 24h y Tablón de Comunidad (`community`)

### US-FE001 — Explorar Establecimientos 24h en OpenStreetMap + OpenFreeMap (`/map`)
**Como** trabajador nocturno, **quiero** explorar en un mapa interactivo OpenStreetMap las **Farmacias**, **Supermercados**, **Grifos**, **Hospitales**, **Comisarías**, **Puntos Noxway 24h** y **Zonas de riesgo** cercanos a mi ubicación, filtrando por *"Solo abiertos 24 horas"* o buscando en la zona visible del mapa, **para** encontrar paradas seguras durante la madrugada.

**Criterios de aceptación:**
- **Escenario: Filtrado y selección de establecimiento**
  - **Dado** que el usuario abre `/map`
  - **Cuando** selecciona un filtro de categoría (ej. *Farmacias* o *Grifos*) o activa *Solo abiertos 24 horas*
  - **Entonces** el mapa Leaflet y la lista lateral muestran únicamente los puntos coincidentes ordenados por distancia en kilómetros (`km`), permitiendo centrar el mapa al hacer clic en cualquier elemento.
- **Escenario: Reportar local o peligro desde el mapa**
  - **Dado** que el usuario hace clic en **Reportar local** o **Reportar peligro** en `/map`
  - **Cuando** navega automáticamente a `/community?compose=service` o `/community?compose=risk`
  - **Entonces** se abre el modal correspondiente con el selector de ubicación OpenStreetMap listo para marcar el punto.

### US-FE002 — Publicar Avisos Comunitarios con Selector de Ubicación OpenStreetMap (`/community`)
**Como** trabajador nocturno, **quiero** abrir el modal **Crear aviso** al pulsar `+ Publicar aviso`, elegir una categoría (*Aviso de seguridad*, *Zona de riesgo*, *Farmacia*, *Tienda 24 horas*, *Grifo*) y marcar en el mapa OpenStreetMap dónde ocurrió, **para** compartir reportes geolocalizados con la comunidad.

**Criterios de aceptación:**
- **Escenario: Crear aviso con ubicación marcada**
  - **Dado** que el usuario abre `+ Publicar aviso` en `/community`
  - **Cuando** selecciona una categoría, escribe título y descripción, hace clic en el mapa interactivo (`<app-report-location>`) o pulsa *Marcar el centro del mapa* y guarda el aviso
  - **Entonces** el aviso se persiste en `POST /api/v1/community/posts`, aparece en el listado con su insignia de categoría y muestra el botón **Ver ubicación del aviso** que redirige y centra `/map` en esa coordenada.

---

## 3. Mi Trayecto y Telemetría GPS con OpenStreetMap (`/journey`)

### US-FE003 — Iniciar Trayecto, Enviar Ping GPS desde el Mapa y Emitir Alertas SOS
**Como** trabajador nocturno, **quiero** iniciar mi trayecto seguro, marcar mi posición actual en el mapa interactivo OpenStreetMap (o con el botón *Usar mi ubicación*), registrar pings GPS, reportar demoras o disparar una alerta SOS, y calificar la ruta al llegar, **para** mantener informados a mis contactos de confianza.

**Criterios de aceptación:**
- **Escenario: Registro de Ping GPS interactivo**
  - **Dado** un trayecto activo en `/journey`
  - **Cuando** el trabajador marca un punto en `<app-report-location>` o pulsa *Usar mi ubicación* y hace clic en **Enviar Ping GPS**
  - **Entonces** se registra el ping en `POST /api/v1/commutes/{id}/telemetry` y aparece en la lista de *Pings de Telemetría* con el botón **Ver en mapa**.

---

## 4. Companion Portal para Contactos de Confianza (`/companion/*`)

### US-FE004 — Monitorear Trabajadores en Vivo y Abrir su Último GPS en el Mapa (`/companion/live`)
**Como** contacto de confianza, **quiero** visualizar el estado en tiempo real de los trabajadores vinculados, ver su último ping GPS con un botón directo **Ver en mapa** y resolver incidentes SOS abiertos desde `/companion/live` y `/companion/emergency`, **para** asistirlos oportunamente ante cualquier eventualidad.

---

## 5. Bienestar, Planes y Red de Confianza (`/wellness`, `/benefits`, `/trusted-contacts`, `/profile`)

### US-FE005 — Seguimiento de Descanso Semanal y Meta de Sueño (`/wellness`)
**Como** trabajador nocturno, **quiero** visualizar mis KPIs semanales de sueño (promedio diario, meta, déficit acumulado y gráfico de 7 días), registrar nuevas sesiones de descanso y ajustar mi meta diaria (`240`–`720` min), **para** cuidar mi recuperación física.

### US-FE006 — Gestión de Suscripciones, Pagos Offline, Beneficios y Referidos (`/benefits`)
**Como** trabajador, **quiero** suscribirme a los planes `ESSENTIAL`, `SENTINEL_PRO` o `FAMILY_CREW`, generar órdenes de pago offline, canjear cupones de beneficios colectivos, invitar miembros a mi grupo familiar y aplicar códigos de referido, **para** aprovechar las ventajas de la red Noxway.
