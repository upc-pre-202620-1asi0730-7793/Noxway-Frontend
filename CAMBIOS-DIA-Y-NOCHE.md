# Noxway: turnos diurnos y nocturnos

## Ejecutar

1. `npm ci`
2. `npm run server` (JSON Server en el puerto 3000).
3. En otra terminal: `npm start`.

## Cambios

- Navegación, títulos en español e inglés, dashboard, comunidad, beneficios y vistas de contactos adaptados a ambos turnos.
- Perfil con turno diurno, nocturno o rotativo y horario habitual. Guarda el perfil en el almacenamiento local del navegador; el dashboard utiliza esa preferencia. No se añadió un backend de autenticación.
- Mapa de servicios cercanos con filtros por categoría y disponibilidad: todos, abiertos ahora y abiertos a la hora de llegada. Usa horarios locales de America/Lima, intervalos diarios (incluidos los que cruzan medianoche) y apertura 00:00–24:00. Actualiza la consulta con el botón de disponibilidad. Las zonas de riesgo permanecen visibles para la categoría elegida.
- `openingHours` y `timeZone` son opcionales en MapPoint. Un servicio sin horarios queda como «Horario por verificar» y no se presume abierto. Los horarios de db.json y de los respaldos son datos de demostración; no son horarios comerciales comprobados.
- Modelo del mapa renombrado a `service-point.entity.ts`; los endpoints y la interfaz MapPoint se conservan.
- Registro de descanso con fecha y hora de inicio y fin, duración calculada y validación para descansos diurnos o nocturnos, incluso al cruzar medianoche. Conserva el registro en la vista actual, como el flujo original; no se añadió persistencia remota ni se recalculan automáticamente las métricas semanales existentes.
- Contacto de confianza: preferencia editable de horario de alertas, guardada en este navegador. No altera el envío real de alertas del servidor. Un fin anterior al inicio corresponde al día siguiente.
- Se conservaron rutas, estilos principales, precios, recursos gráficos y configuración de endpoints. El ZIP original no incluye login ni registro; no se añadieron pantallas de autenticación nuevas.

## Datos remotos

`db.json` y los respaldos del código están actualizados. La configuración de producción sigue apuntando a los endpoints Beeceptor existentes. Si esos endpoints devuelven datos antiguos, deben actualizarse allí por separado. No se modificaron servicios externos ni se desplegó la aplicación.

## Verificación

- Compilación Angular de desarrollo y producción.
- Seis pruebas para disponibilidad de servicios y cálculo de descanso:
  `npx vitest run src/app/community/domain/model/service-hours.spec.ts src/app/wellness/domain/model/rest-period.spec.ts`
- Verificación local parcial en Chrome de escritorio: capturas de perfil, dashboard, mapa, descanso y perfil de contacto; revisión visual de perfil, mapa, descanso y perfil de contacto. Sin errores JavaScript en estas rutas.
- Comprobados en navegador: guardado de turno diurno y horario reflejado en dashboard, filtro de servicios por hora de llegada conservando zonas de riesgo, registro de descanso entre fechas con duración de 6h 45m y persistencia local de la preferencia de alertas tras recargar.
- No se verificó visualmente toda la aplicación ni se probó el envío real de alertas o los endpoints de producción.
