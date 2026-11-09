# AUD-REN — Auditoría de rendimiento
Ejecución: Mon Nov 9 16:59:13 HPS 2026 – Mon Nov 9 17:33:57 HPS 2026, según `date`. Hubo una pausa de 17:03:42 a 17:20:36 porque un error de límite de la API cortó al agente; el trabajo se retomó en el mismo punto.
Entorno: rama master, commit `3200a4d` (`git describe`: `ENTREGA-T2-2-g3200a4d`, LB-9). Backend Spring Boot en :8080 con `spring.jpa.show-sql=true`. Frontend `ng serve` (modo **desarrollo**) en :4200. MySQL 8.0.46, BD `posta_medica_valdiviezo` recargada a las 16:57:43 (21 citas). Build de producción en el scratchpad, servido por un servidor estático de Node propio en :4310 (gzip). Chromium de Playwright tomado de `e2e/node_modules`. Windows 11.

## Resumen
| ID | Título | Severidad | Relación | Apto integrante |
|---|---|---|---|---|
| AUD-REN-01 | `index.html` carga Bootstrap (CSS y JS) y Font Awesome desde CDN externos, además del Bootstrap que ya va en el bundle | Media | Nuevo | Sí |
| AUD-REN-02 | El bundle inicial de producción (808,17 kB) supera el presupuesto de 500 kB; 165 kB son jQuery, Bootstrap JS y Popper como scripts globales | Media | Nuevo (en relación con H-035) | Sí (parcial) / No (completo) |
| AUD-REN-03 | "Gráficos" (`cant-estado-cita`) importa ECharts completo: chunk de 1,13 MB y el doble de FCP | Media | Nuevo | Sí |
| AUD-REN-04 | "Historial Médico": una petición por cada evolución para el médico y otra para el CIE, más la descarga completa de `evolucion_clinica` | Media | H-013 / H-014 (se amplía) | No |
| AUD-REN-05 | "Mis Citas" sigue con peticiones en cascada (5 peticiones para 2 citas) | Media | H-014 (se confirma en LB-9) | No |
| AUD-REN-06 | "Informes" consulta cada 10 s: 2 peticiones y 5 SQL por ciclo y por pestaña abierta | Baja | Nuevo | Sí |
| AUD-REN-07 | `Cita` no tiene índice compuesto para médico + fecha (+ hora) | Baja (hoy) | En relación con H-012 | Sí (índice) / No (UNIQUE) |
| AUD-REN-08 | jQuery entra dos veces en el build (global y dentro del chunk `main-medico`) | Baja | En relación con H-035 | No |
| AUD-REN-09 | El login hace hasta 3 SELECT en serie (admin y DNI inválido) | Informativa | En relación con H-019 | No (no se recomienda cambiar) |

## Mediciones (tablas)

### M1 — SQL por petición en el backend (`grep -c "^Hibernate:"` en `backend.log` antes y después de cada `curl`, 3 repeticiones; 17:00:00–17:00:10)
| Petición | HTTP | Tamaño | SQL (rep. 1/2/3) |
|---|---|---|---|
| GET /api/cita | 200 | 2818 B | 1/1/1 |
| GET /api/reportes/dashboard | 200 | 80 B | **4/4/4** |
| GET /api/reportes/resumen | 200 | 3064 B | 1/1/1 |
| GET /api/reportes/ingresosMensuales | 200 | 211 B | 1/1/1 |
| GET /api/citas/medico/1?estado=Pendiente | 200 | 2 B | 1/1/1 |
| GET /api/citas/medico/1/pacientes | 200 | 885 B | 1/1/1 |
| GET /api/medico | 200 | 2007 B | 1/1/1 |
| GET /api/medico/conEspecialidad | 200 | 2586 B | 1/1/1 |
| GET /api/cita/porEstado | 200 | 162 B | 1/1/1 |
| GET /api/cita/porEspecialidad | 200 | 251 B | 1/1/1 |
| GET /api/historia_clinica | 200 | 750 B | 1/1/1 |
| GET /api/paciente | 200 | 2949 B | 1/1/1 |
| GET /api/medico/codigo/1, /api/especialidad/1, /api/cie/5, /api/evolucion_clinica, /api/especialidad (17:33:33) | 200 | — | 1 cada una |

### M2 — SQL del login (`POST /login`, clave 123456, 2 repeticiones; 17:00:40)
| DNI (rol) | HTTP | SQL |
|---|---|---|
| 12345678 (paciente) | 200 | 1/1 |
| 10000001 (médico) | 200 | 2/2 |
| 87654321 (admin) | 200 | 3/3 |
| 99999999 (no existe) | 401 | 3/3 |

Las SQL salen en este orden: `... from Paciente p1_0 where p1_0.dni=?`, `... from medico m1_0 where m1_0.dni=?`, `... from Administrador um1_0 where um1_0.dni=?`.

### M3 — Índices (`information_schema.STATISTICS`, 17:00:51)
| Tabla | Índices |
|---|---|
| paciente | PRIMARY(idPaciente), **dni UNIQUE**, id_estado_paciente, id_ubigeo |
| medico | PRIMARY(id_medico), **dni UNIQUE**, cmp UNIQUE, id_especialidad |
| administrador | PRIMARY, **dni UNIQUE** |
| cita | PRIMARY(idCita), estado_cita, id_medico, id_paciente (de una columna cada uno; **no hay (id_medico, fecha_cita, hora_cita)**) |
| disponibilidad_medico | PRIMARY, id_medico |
| historia_clinica | PRIMARY, id_paciente |
| evolucion_clinica | PRIMARY, id_cie, id_historia, id_medico |
| estado_cita, estado_paciente, especialidad, cie, ubigeo | solo PRIMARY |

### M4 — EXPLAIN
| Consulta | type / key / rows / Extra |
|---|---|
| Paciente WHERE dni | const / dni / 1 |
| medico WHERE dni | const / dni / 1 |
| Administrador WHERE dni | const / dni / 1 |
| Cita WHERE id_medico=1 AND fecha_cita=... (`findByMedicoIdAndFecha`) | ref / id_medico / 4 / filtered 10.00, Using where |
| Citas del médico por estado (`findCitasDeMedicoPorEstado`) | e: ALL / NULL / 5 / Using where; Using temporary; Using filesort · c: ref / id_medico / 4 · p: eq_ref / PRIMARY |
| COUNT Cita WHERE estado_cita=4 | ref / estado_cita / 17 / Using index |
| Estado_Cita WHERE nombre_estado | ALL / NULL / 5 |
| Cita WHERE id_paciente=1 | ref / id_paciente / 2 |
| disponibilidad_medico WHERE id_medico=1 | ref / id_medico / 5 |

### M5 — Peticiones a la API por pantalla (Playwright, login por formulario, `goto` a cada pantalla y 2,5 s de espera; corrida `dev2`, 17:28:36–17:29:22, peticiones externas bloqueadas). La corrida contra el build de producción (`prod4`, 17:29:50–17:30:35) dio **exactamente las mismas** peticiones.
| Rol | Pantalla | Peticiones | Detalle (repetidas en **negrita**) |
|---|---|---|---|
| paciente | /welcome | 0 | — |
| paciente | /paciente/mis-citas | 5 | /api/cita ×1, /api/medico/codigo/1 ×1, /api/medico/codigo/6 ×1, **/api/especialidad/1 ×2** |
| paciente | /paciente/historial-medico | 8 | /api/historia_clinica ×1, /api/evolucion_clinica ×1, /api/medico/codigo/6 ×1, **/api/medico/codigo/1 ×2**, **/api/cie/5 ×3** |
| paciente | /paciente/registrar-cita | 1 | /api/especialidad |
| médico | /medico-dashboard | 0 | — |
| médico | pacientes / citas-pendientes / citas-aprobadas / citas-canceladas | 1 cada una | /api/citas/medico/1/pacientes; ?estado=Pendiente / Confirmada / Cancelada |
| admin | /admin/inicio | 0 | — |
| admin | /admin/pacientes | 1 | /api/paciente |
| admin | /admin/medicos | 1 | /api/medico/conEspecialidad |
| admin | /admin/reportes | 2 (+2 cada 10 s) | /api/reportes/dashboard, /api/reportes/resumen |
| admin | /admin/cant-estado-cita | 3 | porEstado, porEspecialidad, ingresosMensuales |

En todas las pantallas se bloquearon 3 peticiones externas: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css`, `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css`, `https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js`.

### M6 — Bundle de producción (`npx ng build --configuration production --output-path <scratchpad>/dist --stats-json`, 17:20:36–17:20:48, EXIT=0)
| Chunk inicial | Raw | Transfer est. | Contenido (de stats.json) |
|---|---|---|---|
| styles-VRDYZCWE.css | 230,97 kB | 22,48 kB | bootstrap.min.css + styles.css |
| chunk-SJCGF4ID.js | 173,57 kB | 50,70 kB | @angular/core 120 KB, common 25 KB, rxjs 21 KB |
| scripts-HEYWMFVL.js | 169,18 kB | 49,94 kB | scripts globales: bootstrap.min.js + popper.min.js + jquery.min.js |
| chunk-CULDIQNJ.js | 91,30 kB | 23,03 kB | @angular/router 77 KB |
| chunk-MS2Q4662.js | 36,30 kB | 7,71 kB | @angular/forms 35 KB |
| polyfills / main / otros | 35,09 / 34,30 / ~37 kB | — | — |
| **Initial total** | **808,17 kB** | **183,14 kB** | |

| Chunk lazy | Raw | Transfer est. | Contenido |
|---|---|---|---|
| chunk-RLLNB3AE.js (cant-estado-cita) | **1,13 MB** | 304,12 kB | echarts 886 KB, zrender 213 KB, src 4 KB |
| chunk-LAETWH3W.js (main-medico, legacy) | 96,44 kB | 30,84 kB | **jquery 86 KB**, src 8 KB |
| el resto | ≤ 10,10 kB | — | — |

Avisos del build (copiados):
- `bundle initial exceeded maximum budget. Budget 500.00 kB was not met by 308.17 kB with a total of 808.17 kB.`
- `Module 'jquery' used by 'src/app/features/admin/legacy/detalle-medico/detalle-medico.ts' is not ESM`

Presupuestos en `angular.json`: initial con aviso en 500 kB y error en 1 MB; anyComponentStyle con aviso en 4 kB y error en 8 kB. Las rutas usan lazy loading (`loadComponent`) salvo los logins, `registro`, `welcome` y `medico-dashboard` (este último carga a sus hijos en lazy).

### M7 — Métricas de carga (Playwright, `performance.getEntries()`, FCP y LCP con PerformanceObserver; carga en frío de cada pantalla; ms)
| Pantalla | Dev (`ng serve`) FCP / DCL / JS decodificado | Prod (estático gzip) FCP / DCL / transferido / JS decodificado |
|---|---|---|
| /welcome | 136 / 122 / 3849 KB | 84 / 65 / 211 KB / 564 KB |
| /paciente/mis-citas | 124 / 100 / 3872 KB | 96 / 62 / 213 KB / 567 KB |
| /paciente/historial-medico | 116 (LCP 144) / 92 / 3877 KB | 96 / 63 / 213 KB / 568 KB |
| /paciente/registrar-cita | 120 / 93 / 3893 KB | 84 / 59 / 214 KB / 570 KB |
| /medico-dashboard | 108 / 90 / 3860 KB | 80 / 63 / 212 KB / 565 KB |
| /medico-dashboard/citas-pendientes | 140 / 94 / 3916 KB | 80 / 61 / 214 KB / 572 KB |
| /admin/inicio | 124 / 104 / 3878 KB | 96 / 80 / 214 KB / 569 KB |
| /admin/reportes | 148 / 96 / 3919 KB | 104 / 59 / 215 KB / 573 KB |
| **/admin/cant-estado-cita** | **244** / 89 / **6647 KB** | **188** / 58 / **580 KB** / **1672 KB** |

En todas las pantallas LCP = FCP, salvo historial en desarrollo (144 ms). Son tiempos en localhost sin limitar red ni CPU.

### M8 — Polling de "Informes" (Playwright sobre :4200, 17:32:26–17:33:12)
```
0.3s /login
1.8s /api/reportes/dashboard
1.8s /api/reportes/resumen
11.8s /api/reportes/dashboard
11.8s /api/reportes/resumen
21.8s /api/reportes/dashboard
21.8s /api/reportes/resumen
31.8s /api/reportes/dashboard
31.8s /api/reportes/resumen
--- navega a /admin/inicio via menu
SQL en el log durante la prueba (incluye trafico de otros): 23
```
23 = 3 (login de admin) + 4 ciclos × 5 SQL (4 de dashboard y 1 de resumen). Al salir de la pantalla la consulta periódica se detiene (en los 12 s siguientes no hubo más peticiones).

## Hallazgos

### AUD-REN-01 — `index.html` carga Bootstrap y Font Awesome desde CDN externos, además del Bootstrap del bundle
- Severidad: Media
- Relación con hallazgos existentes: Nuevo
- Evidencia: `frontend/src/index.html` líneas 10, 11 y 16:
  ```
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  ```
  `angular.json` ya incluye `node_modules/bootstrap/dist/css/bootstrap.min.css` en `styles` y `bootstrap.min.js` + `popper.min.js` en `scripts`. Por eso Bootstrap CSS va dos veces (CDN 5.3.0 y bundle ^5.3.8) y Bootstrap JS también va dos veces (CDN `bundle` con Popper, y bundle con Popper aparte). En M5, Playwright bloqueó estas 3 URL en **todas** las pantallas. El `<link>` del CDN es una hoja de estilos síncrona en `<head>`, así que bloquea el render. Font Awesome solo se usa en `welcome.component.html` (4 iconos `fas`).
- Impacto en el negocio: cada carga depende de dos CDN de terceros. Si la red de la posta no tiene Internet o el CDN falla, el render se demora hasta que vence el tiempo de espera y los iconos de la pantalla de bienvenida del paciente no aparecen. Hay dos versiones de Bootstrap que pueden chocar entre sí. Además, terceros reciben cada visita.
- Recomendación (con alternativas): (a) quitar los 3 tags del CDN y dejar solo el Bootstrap de `angular.json`; para los iconos, instalar `@fortawesome/fontawesome-free` y agregar su CSS en `styles` o (b) reemplazar los 4 iconos por SVG en línea. (c) Mínimo: quitar al menos el Bootstrap del CDN, que está duplicado. Hay que comprobar visualmente que no cambia nada, porque las versiones difieren (5.3.0 frente a 5.3.8).
- Esfuerzo estimado: 1–2 h
- Archivos involucrados: `frontend/src/index.html`, `frontend/angular.json`, `frontend/package.json` (si se instala Font Awesome)
- Apto para integrante: Sí

### AUD-REN-02 — Bundle inicial de 808 kB, por encima del presupuesto de 500 kB
- Severidad: Media
- Relación con hallazgos existentes: Nuevo. En relación con H-035 (rutas legacy) y H-034 (huérfanos).
- Evidencia: ver M6, aviso `Budget 500.00 kB was not met by 308.17 kB with a total of 808.17 kB`. `scripts-HEYWMFVL.js` (169 kB raw) se compone de `bootstrap.min.js`, `popper.min.js` y `jquery.min.js`, cargados como scripts globales desde `angular.json`. El Grep de `$(` y `jquery` en `frontend/src` solo encuentra `features/admin/legacy/detalle-medico/detalle-medico.ts` y `features/paciente/legacy/detalle-paciente/detalle-paciente.ts`, es decir, rutas legacy (H-035) y un componente huérfano (H-034). El único `data-bs-*` está en `welcome.component.html:6` (`navbar-toggler`). La hoja global de estilos pesa 231 kB porque es Bootstrap completo.
- Impacto en el negocio: cada usuario descarga unos 50 kB comprimidos de JS que las pantallas en uso no necesitan. En la máquina de prueba el efecto es poco (FCP de 80–104 ms en prod), pero crece con redes lentas y equipos modestos.
- Recomendación (con alternativas): (a) sacar `jquery.min.js` de `scripts`; detalle-medico ya lo importa como módulo. Para detalle-paciente habría que agregar el import, o (b) reescribir esos formularios legacy con bindings de Angular, o (c) eliminar las rutas legacy (decisión de H-035, que cambia el comportamiento y necesita RFC). (d) Quitar `bootstrap.min.js` y `popper.min.js` globales si el `navbar-toggler` se resuelve con `NgbCollapse` (ng-bootstrap ya está en el proyecto). (e) Si no se reduce, documentar y subir el presupuesto en lugar de convivir con el aviso.
- Esfuerzo estimado: (a) 1 h; (b)–(d) 0,5–1 día
- Archivos involucrados: `frontend/angular.json`, `features/paciente/legacy/detalle-paciente/detalle-paciente.ts`, `features/paciente/welcome/welcome.component.html`
- Apto para integrante: Sí para (a). No para (b)–(d), porque afectan varias pantallas y H-035.

### AUD-REN-03 — "Gráficos" importa ECharts completo
- Severidad: Media
- Relación con hallazgos existentes: Nuevo
- Evidencia: `features/admin/cant-estado-cita/cant-estado-cita.ts:4` tiene `import * as echarts from 'echarts';`. Su chunk lazy pesa 1,13 MB raw y 304 kB transferidos (echarts 886 KB + zrender 213 KB, según stats.json). En M7, en prod esa pantalla transfiere 580 KB frente a unos 215 KB del resto, decodifica 1672 KB de JS frente a unos 570 KB, y su FCP es de 188 ms frente a 80–104 ms. `ngx-echarts` aparece en `package.json` pero ningún `.ts` lo importa (Grep sin resultados).
- Impacto en el negocio: la pantalla de gráficos del administrador tarda el doble en pintar y descarga casi 3 veces más. Las demás pantallas no se ven afectadas, porque el chunk es lazy.
- Recomendación (con alternativas): (a) usar la importación modular `echarts/core` y registrar solo los charts, componentes y renderer que se usan (`use([BarChart, PieChart, LineChart, ...])`). Suele reducir el chunk a una fracción, pero **no se midió**. (b) Quitar `ngx-echarts` de `package.json` si de verdad no se usa (es limpieza, no rendimiento).
- Esfuerzo estimado: 1–2 h
- Archivos involucrados: `frontend/src/app/features/admin/cant-estado-cita/cant-estado-cita.ts`, `frontend/package.json`
- Apto para integrante: Sí

### AUD-REN-04 — "Historial Médico": peticiones por evolución y descarga completa de evoluciones
- Severidad: Media
- Relación con hallazgos existentes: amplía H-013 (descarga total, que hoy menciona `historia_clinica` pero no `evolucion_clinica`) y H-014 (N+1 del frontend, que hoy solo describe "Mis Citas"). También se relaciona con H-007, porque `/api/medico/codigo/{id}` devuelve la clave del médico y aquí se pide solo para mostrar su nombre.
- Evidencia: M5 dio 8 peticiones (`/api/cie/5` ×3, `/api/medico/codigo/1` ×2) para las 3 evoluciones del paciente 1 (`SELECT ... WHERE id_historia=1` → 3). `historial-medico.component.ts` líneas 46–58: `GET /api/evolucion_clinica` trae las 11 evoluciones de las 5 historias (1446 B) y filtra en el navegador. Después, `myEvos.forEach` lanza un `GET /api/medico/codigo/${evo.id_medico}` y un `GET /api/cie/${evo.id_cie}` por cada evolución, sin caché. Cada petición = 1 SQL (M1), así que hay 8 SQL por apertura de pantalla.
- Impacto en el negocio: las peticiones crecen a razón de 1 + 2×N con el número de evoluciones del paciente. Se exponen evoluciones clínicas de otros pacientes al navegador (H-013/H-016).
- Recomendación (con alternativas): (a) un endpoint `GET /api/historia_clinica/paciente/{id}/evoluciones` que devuelva un DTO con JOIN de Medico y CIE (1 petición, 1 SQL, sin clave). Igual que RFC-003 hizo con el módulo médico. (b) Paso intermedio solo en el frontend: deduplicar los ids con `forkJoin` sobre un conjunto único de `id_medico` e `id_cie`. No corrige H-013. Requiere RFC.
- Esfuerzo estimado: (a) 0,5–1 día con pruebas; (b) 2 h
- Archivos involucrados: `frontend/src/app/features/paciente/historial-medico/historial-medico.component.ts`; para (a), además `Evolucion_ClinicaRepository`, un DTO nuevo, el controlador y un servicio
- Apto para integrante: No (backend y frontend juntos, y cambia el contrato)

### AUD-REN-05 — "Mis Citas" sigue haciendo peticiones en cascada
- Severidad: Media
- Relación con hallazgos existentes: H-014 (se confirma en LB-9) y H-013
- Evidencia: M5 dio 5 peticiones para 2 citas (`/api/cita` ×1 con las 21 citas, `/api/medico/codigo/1`, `/api/medico/codigo/6`, `/api/especialidad/1` ×2). El patrón es el mismo en dev y en prod. `mis-citas.component.ts` líneas 34–44: filtra en el navegador, hace `forEach` → `medico/codigo` → `especialidad` anidado. Lo nuevo frente a H-014 son las cifras con la BD recargada (2 citas → 5 peticiones, 5 SQL).
- Impacto en el negocio: ver H-014.
- Recomendación (con alternativas): la misma de H-014/H-013, es decir, un endpoint de citas del paciente con JOIN, como `findCitasDeMedicoPorEstado`, que ya hace 1 SQL (M1).
- Esfuerzo estimado: 0,5–1 día
- Archivos involucrados: `features/paciente/mis-citas/mis-citas.component.ts`, `CitaRepository`, `CitaConsultaController` o similar
- Apto para integrante: No

### AUD-REN-06 — Consulta cada 10 s en "Informes"
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo
- Evidencia: `features/admin/reportes/admin-reportes.component.ts:28`: `interval(10000).pipe(startWith(0))`. M8 muestra 2 peticiones cada 10 s y 5 SQL por ciclo (`/dashboard` hace 4: `count()`, 2 × `countByEstadoCita` y `sumTotalIngresos`, según M1 y `ReporteController.java` líneas 33–39). Se detiene al salir de la pantalla (`ngOnDestroy`).
- Impacto en el negocio: con una pestaña abierta son 1800 SQL por hora y por administrador. Es poco con los datos actuales, pero no se adapta a que la pestaña esté oculta.
- Recomendación (con alternativas): (a) pausar cuando `document.visibilityState === 'hidden'`; (b) subir el intervalo o usar un botón de "Actualizar"; (c) en el backend, resolver `/dashboard` en 1 SQL con `SUM(CASE ...)`. (c) toca H-039 y H-023 y necesita RFC.
- Esfuerzo estimado: (a)/(b) 1 h; (c) 2–3 h
- Archivos involucrados: `admin-reportes.component.ts`; para (c), `ReporteController.java` y `CitaRepository.java`
- Apto para integrante: Sí para (a)/(b)

### AUD-REN-07 — `Cita` no tiene índice compuesto para médico + fecha (+ hora)
- Severidad: Baja con los datos actuales (21 citas); crecerá con el uso.
- Relación con hallazgos existentes: en relación con H-012 (doble reserva). Un `UNIQUE (id_medico, fecha_cita, hora_cita)` serviría de índice y además impediría la doble reserva en la BD.
- Evidencia: M3 (cita solo tiene índices de una columna) y M4: `findByMedicoIdAndFecha` usa `ref / id_medico / rows 4 / filtered 10.00 / Using where`, o sea, lee todas las citas del médico y descarta por fecha. `findCitasDeMedicoPorEstado` hace un ALL sobre `Estado_Cita` (5 filas, sin índice en `nombre_estado`) y además `Using temporary; Using filesort` por el `ORDER BY fecha_cita, hora_cita`. `Paciente.dni`, `Medico.dni` y `Administrador.dni` **sí** tienen índice UNIQUE y el login los usa (`const`).
- Impacto en el negocio: hoy no se nota (consultas de 4–10 ms en M1). Con miles de citas por médico, la búsqueda de horarios libres y las listas del médico recorrerían todas sus citas.
- Recomendación (con alternativas): (a) `CREATE INDEX idx_cita_medico_fecha_hora ON Cita(id_medico, fecha_cita, hora_cita)`, que cubre el filtro y el orden; (b) hacerlo `UNIQUE`, lo que corrige H-012 pero cambia el comportamiento (requiere RFC correctivo y decidir qué pasa con las citas canceladas, que también ocuparían el hueco). (c) `UNIQUE` en `Estado_Cita.nombre_estado` (tabla de catálogo; ganancia mínima).
- Esfuerzo estimado: (a) 30 min más recargar la BD; (b) 0,5 día
- Archivos involucrados: `database/BDPostaMedica.sql`
- Apto para integrante: Sí para (a). No para (b).

### AUD-REN-08 — jQuery entra dos veces en el build
- Severidad: Baja
- Relación con hallazgos existentes: en relación con H-035 (rutas legacy) y H-034
- Evidencia: M6 muestra jQuery en `scripts-HEYWMFVL.js` (global, inicial) y además 86 KB de `jquery` dentro de `chunk-LAETWH3W.js` (`main-medico`), por el `import $ from 'jquery'` de `detalle-medico.ts:7`. Aparece el aviso `Module 'jquery' ... is not ESM`.
- Impacto en el negocio: unos 30 kB comprimidos extra al abrir la ruta legacy `/medico`, que ningún menú enlaza.
- Recomendación (con alternativas): se resuelve con AUD-REN-02 (a) o (c).
- Esfuerzo estimado: incluido en AUD-REN-02
- Archivos involucrados: `angular.json`, `features/admin/legacy/detalle-medico/detalle-medico.ts`
- Apto para integrante: No (depende de la decisión de H-035)

### AUD-REN-09 — El login hace hasta 3 SELECT en serie
- Severidad: Informativa
- Relación con hallazgos existentes: en relación con H-019 (resuelto por la cadena de `AutenticadorRol`)
- Evidencia: M2 (paciente 1, médico 2, admin 3, DNI inexistente 3). Cada SELECT usa el índice UNIQUE de `dni` (`const`, M4). Tiempos de 6–10 ms.
- Impacto en el negocio: ninguno medible. Además, que el tiempo dependa de la cantidad de SELECT revela si un DNI es de paciente, de médico o de admin (posible enumeración por tiempos). **No verificado** como explotable, porque las diferencias medidas (6–10 ms) están dentro del ruido.
- Recomendación (con alternativas): no cambiar por rendimiento. Si se quiere, que cada login consulte solo su propio rol, en línea con H-028 y RFC-002.
- Esfuerzo estimado: —
- Archivos involucrados: `controller/AuthController.java`, `autenticacion/*.java`
- Apto para integrante: No (no se recomienda cambiarlo)

## Revisado sin hallazgos
- **N+1 de JPA en el backend:** ninguna entidad de `model/` tiene `@ManyToOne`, `@OneToMany`, `@OneToOne` ni `@ManyToMany` (grep sin resultados). Las claves foráneas son campos `Integer` simples, así que no hay carga perezosa ni N+1 de Hibernate. M1 lo confirma: todos los endpoints medidos ejecutan **1 SQL**, salvo `/api/reportes/dashboard` (4 SQL fijas, no N+1). Los endpoints del médico (`findCitasDeMedicoPorEstado`, `findPacientesDeMedico`) y `/api/reportes/resumen` resuelven todo con JOIN en 1 SQL.
- **Índices de login:** `Paciente.dni`, `Medico.dni` y `Administrador.dni` tienen UNIQUE y se usan (`type=const`).
- **Búsquedas por paciente, por estado y disponibilidad:** usan los índices de clave foránea (`id_paciente`, `estado_cita`, `id_medico`), según M4.
- **Módulo médico y pantallas de admin:** 1 petición por pantalla, sin repetidas (M5).
- **Lazy loading:** todas las pantallas de paciente, admin y médico (hijos) se cargan en lazy. Los chunks lazy de pantalla pesan ≤ 10 kB, salvo ECharts (AUD-REN-03) y legacy (AUD-REN-08).
- **Polling:** se cancela bien al salir de "Informes" (M8).
- **Tiempos del backend:** 4–40 ms por petición en localhost (M1). La primera petición de cada endpoint fue más lenta (hasta 87 ms en `/dashboard`), por calentamiento.
- Visto de paso, fuera del alcance de rendimiento: `PacienteRepository.findByApellidosContaining` y `findByNombresContaining` declaran que devuelven `ArrayList<Medico>` aunque el repositorio es de `Paciente`. No se probó; se registra para HALLAZGOS.

## Limitaciones
- **Lighthouse no está instalado.** FCP y LCP se midieron con Playwright (`performance.getEntriesByName('first-contentful-paint')` y un `PerformanceObserver` de `largest-contentful-paint`). No hay TBT, CLS ni puntaje Lighthouse. Fue en localhost, sin limitar red ni CPU, así que los valores absolutos son optimistas.
- **`ng serve` es modo desarrollo.** Sus tamaños (unos 3,9 MB de JS sin minificar) no representan producción. En la primera corrida dev (`dev1`) el JS decodificado fue de unos 2,8 MB y en la segunda (`dev2`) de unos 3,9 MB; no se investigó por qué (posiblemente recompilación o caché de `ng serve`). Para tamaños, vale la columna Prod de M7 y M6.
- **Contacto con servicios externos:** la **primera** corrida de Playwright contra :4200 (`dev1`, 17:02:57–17:03:42) se hizo **sin** bloquear peticiones externas. El navegador pudo haber descargado los 3 recursos de CDN de AUD-REN-01 (jsdelivr y cdnjs), porque los pide la propia página; no se registró si lo hizo. Desde que se detectó, todas las corridas (`dev2`, `prod2`–`prod4`, polling) abortan cualquier petición que no sea `http://localhost` y la listan. Las cifras de este informe salen de las corridas con bloqueo. Por lo mismo, las métricas no incluyen el costo real de esos CDN: en producción real, la página sería **más lenta** de lo medido.
- **Build de producción servido en otro origen (:4310):** el CORS del backend solo permite `http://localhost:4200` (`WebSecurityConfig.java:87`), así que el build servido en :4310 recibía 403. Para medirlo, Playwright intercepta las peticiones a :8080, las reenvía al backend real con `Origin: http://localhost:4200` y agrega `Access-Control-Allow-Origin: *` a la respuesta. Por eso los tiempos de la API en Prod incluyen ese reenvío. En la corrida `prod3` (antes de corregir el reenvío) el login falló y se inyectó la sesión en localStorage; esa corrida se descartó y las cifras de Prod son de `prod4`, donde el login por formulario funcionó.
- **Tráfico paralelo:** otros auditores generaban tráfico contra el mismo backend. Las cuentas de SQL por petición se repitieron 2–3 veces en ráfagas cortas y siempre dieron el mismo número (M1, M2), y la cuenta del polling (23) coincide exactamente con lo esperado. Aun así, no se puede descartar al 100 % que se haya colado alguna SQL ajena en una medición aislada.
- **Volumen de datos:** la BD tiene 21 citas, 15 pacientes y 15 médicos. Las conclusiones sobre índices (AUD-REN-07) se basan en el plan de `EXPLAIN`, no en tiempos medidos con volumen real. No se hicieron pruebas de carga ni de concurrencia.
- El ahorro de la importación modular de ECharts (AUD-REN-03) y de quitar los scripts globales (AUD-REN-02) **no se midió**, porque eso requeriría modificar el código.
- No se ejecutó `mvnw` ni se reinició ningún servicio. No se modificó ningún archivo del repositorio: los scripts (`recorrido*.js`, `server.js`, `polling.js`, `patch*.js`, `resumen.js`, `dbg*.js`), el build (`dist/`) y los resultados (`dev1.json`, `dev2.json`, `prod2.json`–`prod4.json`, `build.log`) están en `C:/Users/braya/AppData/Local/Temp/claude/85b186d9b1722304/0f4da1a6-6e30-4eb8-804c-f218b75ed1f0/scratchpad/aud-rendimiento/`.
- El servidor estático de :4310 se detuvo al terminar (TaskStop).
