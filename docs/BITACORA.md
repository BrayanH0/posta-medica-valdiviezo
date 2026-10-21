# Bitácora del proyecto (informe de estado)

Registro cronológico de cada acción realizada sobre el sistema "Posta Médica Valdiviezo".
Horas en hora local de Perú (UTC-5). Las evidencias están en `docs/evidencias/` o se indican por hash de commit.

---

### [Sin registro; antes de 2026-10-20 19:12:08] Agregar exclusiones al .gitignore *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: se agregaron al `.gitignore` existente las reglas `backend/backend/target/`, `node_modules/`, `dist/` y `*.log`.
- Por qué: el `.gitignore` original solo tenía rutas ancladas a la raíz (`/node_modules/`, `/dist/`) y no cubría las subcarpetas del backend ni del frontend.
- Resultado: `git diff --cached --name-only | grep -cE "target/|node_modules/|dist/|\.log$"` devolvió `0`. Ningún artefacto de compilación entró al repositorio.
- Evidencia: commit `17e2118`.

### [2026-10-20 19:12] Inicializar Git y commit inicial
- Qué se hizo: `git init` y commit con el estado del proyecto tal como se recibió. Como Git no tenía identidad configurada, se configuró nombre y correo solo para este repositorio (no global).
- Por qué: tener un punto de retorno antes de cualquier cambio.
- Resultado: commit creado con 236 archivos.
- Evidencia: commit `17e2118770581af7df4feda02b2b31299e7758f9` — "Commit inicial: estado actual del proyecto".

### [2026-10-20 entre 19:12 y 19:13] Primer intento de conexión a MySQL *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: conexión con usuario `root` y la contraseña `admin` que figuraba en `application.properties`.
- Por qué: crear la base de datos con el script `BDPostaMedica.sql`.
- Resultado: falló con `ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)`. Se detuvo el trabajo y se avisó al usuario sin cambiar nada.
- Evidencia: salida de consola citada arriba.

### [2026-10-20 19:13] Compilación de backend y frontend (sin base de datos)
- Qué se hizo: `mvnw -DskipTests compile` en el backend; `npm install` y `ng build --configuration development` en el frontend.
- Por qué: detectar errores de compilación mientras se resolvía el acceso a MySQL.
- Resultado: backend `MVN EXIT: 0`. Frontend: "Application bundle generation complete" con 2 advertencias `NG8113` (`RouterLink` y `RouterLinkActive` importados y no usados en `src/app/app.ts:8`). Ver H-011.
- Evidencia: salida de consola de la sesión.

### [2026-10-20 entre 19:13 y 19:17] Ajuste de la contraseña en application.properties (usuario) *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: el usuario cambió `spring.datasource.password` de `admin` a la contraseña real de su MySQL local.
- Por qué: la contraseña original no coincidía con la instalación local.
- Resultado: la conexión con la nueva contraseña funcionó.
- Evidencia: diff de `backend/backend/src/main/resources/application.properties` incluido en el commit LB-0. Ver H-006.

### [2026-10-20 entre 19:13 y 19:17] Cambio de nombre de la base de datos a posta_medica_valdiviezo *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: se reemplazó `sistema_citas_valdiviezo` por `posta_medica_valdiviezo` en `BDPostaMedica.sql` (líneas 2, 21, 22 y 326) y en la URL de `application.properties` (línea 1).
- Por qué: pedido del usuario, para que la base de datos lleve el nombre de la clínica que muestra el frontend ("Posta Médica Valdiviezo") y no el de una persona.
- Resultado: `grep -n posta_medica` confirmó los 5 reemplazos.
- Evidencia: commit LB-0.

### [2026-10-20 entre 19:13 y 19:17] Creación de la base de datos *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: ejecución completa de `BDPostaMedica.sql` con `mysql -uroot --default-character-set=utf8mb4`.
- Por qué: el backend necesita la base para arrancar.
- Resultado: sin errores. 12 tablas creadas: administrador 1, cie 5, cita 21, disponibilidad_medico 75, especialidad 5, estado_cita 5, estado_paciente 5, evolucion_clinica 11, historia_clinica 5, medico 15, paciente 15, ubigeo 5 filas.
- Evidencia: consulta a `information_schema.tables` en la sesión.

### [2026-10-20 19:17] Arranque del backend y del frontend
- Qué se hizo: `mvnw spring-boot:run` (backend) y `npm start` (frontend).
- Por qué: poner el sistema en marcha.
- Resultado: `Tomcat started on port 8080` y `Started CentroValdiviezoApplication in 4.733 seconds`. Frontend en `http://localhost:4200/`.
- Evidencia: log de arranque de la sesión.

### [2026-10-20 19:17] Prueba de endpoints con peticiones reales *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: `curl` a todos los GET de los 14 controladores, más el login de los 3 roles y una petición CORS preflight.
- Por qué: saber qué endpoints responden con datos.
- Resultado: todos los endpoints responden `200` con datos, excepto `GET /api/medico/resumenMedico` → `500` (H-005). Login: 200 para paciente, médico y admin; 401 con credenciales inválidas. CORS permite `http://localhost:4200`.
- Evidencia: pruebas P01–P04 y P09 en `PRUEBAS.md`.

### [2026-10-20 19:19] Apertura de las 20 pantallas del frontend
- Qué se hizo: se abrieron con Playwright las 20 rutas de `app.routes.ts`. La sesión se simuló escribiendo directamente en localStorage (no por formulario).
- Por qué: comprobar qué pantallas cargan sin error.
- Resultado: las 20 rutas cargaron sin errores de consola ni peticiones fallidas. Limitación: no se probaron formularios ni acciones en esta ronda.
- Evidencia: salida de Playwright de la sesión.

### [2026-10-20 entre 19:19 y 19:26] Completar el renombrado en la documentación *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: se reemplazó el nombre viejo en `README.md:61`, `SETUP.md:35` y `SETUP.md:43`.
- Por qué: quedaban referencias al nombre anterior.
- Resultado: `grep -rn "sistema_citas_valdiviezo" . --exclude-dir=target --exclude-dir=node_modules` → salida vacía, exit 1.
- Evidencia: commit LB-0.

### [2026-10-20 19:26] Login real por formulario (3 roles + claves incorrectas)
- Qué se hizo: login escribiendo en el formulario, una pestaña nueva por caso.
- Por qué: verificar redirección, claves de localStorage y rechazo de credenciales inválidas.
- Resultado: los 3 roles redirigen. Las claves de localStorage difieren entre roles (H-002). Los mensajes de error difieren (H-003). Un DNI inexistente con clave `123456` entra como paciente 1 (H-001).
- Evidencia: P05–P08 y P10 en `PRUEBAS.md`.
- Nota de método: los primeros intentos automatizados fallaron porque se reutilizaba la misma pestaña y porque el tecleo simulado chocaba con el filtro `(keypress)` del DNI. Con una pestaña nueva por caso, los resultados fueron consistentes.

### [2026-10-20 19:27] Prueba de desacople del módulo médico
- Qué se hizo: se abrió Médico > Citas Pendientes con el backend corriendo; se apagó el backend (proceso java 24436) y se recargó la pantalla; se comparó con la tabla `Cita`.
- Por qué: verificar si el módulo médico consume datos reales.
- Resultado: la pantalla no hizo ninguna petición al backend y mostró los mismos 3 registros (IDs 101–103) con el backend apagado, sin errores. Esos IDs no existen en la base. Ver H-004.
- Evidencia: `docs/evidencias/paso3b-medico-citas-pendientes-backend-apagado.png`; P11 en `PRUEBAS.md`.

### [2026-10-20 entre 19:27 y 19:29] Reinicio del backend *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: se volvió a ejecutar `mvnw spring-boot:run`.
- Por qué: continuar con las pruebas.
- Resultado: `GET /api/cie` → `backend 200`.
- Evidencia: salida de consola de la sesión.

### [2026-10-20 20:00] Creación de la estructura de documentación
- Qué se hizo: se crearon `docs/BITACORA.md`, `docs/HALLAZGOS.md`, `docs/PRUEBAS.md`, `docs/ELEMENTOS_CONFIGURACION.md`, `docs/refactorizaciones/` y `docs/evidencias/`. La captura del paso 3b se movió desde la carpeta temporal a `docs/evidencias/`.
- Por qué: dejar documentada la línea base LB-0.
- Resultado: estructura creada.
- Evidencia: commit LB-0.

### [2026-10-20 entre 20:00 y 20:07] Redacción de HALLAZGOS, PRUEBAS y ELEMENTOS_CONFIGURACION *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: se registraron los hallazgos H-001 a H-011, las pruebas P01 a P11 con sus resultados, y el inventario de elementos de configuración EC-01 a EC-17 con las versiones verificadas en el equipo.
- Por qué: documentar el diagnóstico y la identificación de la línea base.
- Resultado: documentos creados; los resultados de la Parte C se agregaron a medida que se obtenían.
- Evidencia: commit LB-0.

### [2026-10-20 20:07] Registro de una cita nueva desde el formulario (P12)
- Qué se hizo: login por formulario como paciente 12345678; cita con Medicina General, Dr(a). Jorge Santos Ruiz, 2026-10-26, 10:00, motivo "Prueba LB-0: control general".
- Por qué: verificar una escritura real en la base de datos.
- Resultado: alerta "Cita registrada con éxito"; en la BD quedó la cita `idCita = 22` con `estado_cita = 1` (Pendiente).
- Evidencia: `docs/evidencias/paso4a-registrar-cita-formulario-pestanaA.png`; P12 en `PRUEBAS.md`.
- Nota de método: los primeros intentos automatizados no pudieron seleccionar la hora porque las pestañas estaban en segundo plano; esas capturas fallidas se descartaron. Con la pestaña al frente funcionó.

### [2026-10-20 20:08] Prueba de doble reserva (P13)
- Qué se hizo: segunda cita con el mismo médico, fecha y hora que la cita 22.
- Por qué: verificar si el sistema impide reservar un horario ya ocupado.
- Resultado: una pestaña abierta antes sigue ofreciendo 10:00; una pestaña nueva la oculta. El POST equivalente a confirmar desde la pestaña antigua devolvió `HTTP 200` y creó la cita `idCita = 23`. Hay 2 reservas para médico 1, 2026-10-26, 10:00. Hallazgo H-012.
- Evidencia: `docs/evidencias/paso4b-pestana-nueva-oculta-1000.png`, `docs/evidencias/paso4-mis-citas-con-cita-nueva.png`; P13 en `PRUEBAS.md`.

### [2026-10-20 20:09] Verificación del alcance de los datos que recibe el paciente (P14–P16)
- Qué se hizo: `curl` a `/api/cita` y `/api/historia_clinica`; en el navegador, con sesión de paciente, se exportó la respuesta de `/api/cita` de la pantalla "Mis Citas".
- Por qué: verificar si un paciente recibe datos de otros pacientes.
- Resultado: `/api/cita` devuelve 23 citas, 4 del paciente 1. `/api/historia_clinica` devuelve 5 historias, 1 del paciente 1. El navegador recibe las 23 citas y filtra 4. Hallazgos H-013 y H-014. Además se registró H-015 (controlador de citas sin capa de servicio).
- Evidencia: `docs/evidencias/paso5b-red-mis-citas-respuesta-api-cita.json`, `docs/evidencias/paso5b-red-mis-citas-peticiones.txt`; P14–P16 en `PRUEBAS.md`.
- Limitación: no hay captura de la pestaña de red de DevTools (Playwright no puede capturarla); se exportó el registro de red.

### [2026-10-20 20:11] Commit y tag de la línea base LB-0
- Qué se hizo: commit de todos los archivos modificados (incluido `application.properties`, porque el repositorio es local y no se publica) y tag anotado `LB-0`.
- Por qué: congelar el estado inicial documentado contra el que se van a comparar las refactorizaciones R1–R4.
- Resultado: 16 archivos en el commit: `BDPostaMedica.sql`, `README.md`, `SETUP.md`, `application.properties`, `package-lock.json`, los 4 documentos de `docs/`, 6 evidencias y `docs/refactorizaciones/.gitkeep`.
- Evidencia: commit `744c84b7219efe0d4444d2549bd62e2c88ffa4aa` — "Linea base LB-0: entorno verificado y documentado". Tag anotado `LB-0` ("Linea base 0: estado inicial antes de refactorizar") apunta a ese commit. Esta entrada se agregó en un commit posterior porque un commit no puede contener su propio hash.

### [2026-10-20 entre 20:12 y 20:37] Hallazgos completos y matriz de trazabilidad *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: (1) H-002 pasó a Correctivo tras verificar que cerrar sesión como paciente deja los datos en el navegador (nueva prueba P17). (2) H-013 quedó limitado a "el frontend descarga los datos de todos los pacientes y filtra en el navegador"; la falta de autenticación de la API pasó a H-016. (3) Se corrigió la relación de H-012 con las refactorizaciones: es Correctivo y ninguna refactorización lo corrige; P13 debe seguir fallando igual que en LB-0. (4) Se registraron 11 hallazgos nuevos, H-016 a H-026, cada uno verificado en el código con su archivo:línea. (5) Se agregó a `HALLAZGOS.md` la columna "Cambio que lo atiende". (6) La tabla de `PRUEBAS.md` pasó a las columnas LB-0 a LB-6, con la regla de comparación contra la línea base anterior.
- Por qué: completar el diagnóstico y dejar la trazabilidad entre hallazgos, cambios planificados y pruebas.
- Resultado: 26 hallazgos (H-001 a H-026) y 17 pruebas (P01 a P17). Se confirmaron los 11 hallazgos propuestos; ninguno se descartó. H-022 se verificó en código y BD, no en pantalla.
- Evidencia: `docs/evidencias/h002-paciente-tras-cerrar-sesion.png`, `docs/evidencias/h002-mis-citas-accesible-tras-cerrar-sesion.png`; commit "Docs: hallazgos completos y matriz de trazabilidad".

### [2026-10-20 20:44] RFC-001 registrada
- Qué se hizo: se creó `docs/rfc/RFC-001.md` (paquete correctivo del login: H-001, H-002, H-003) antes de tocar código, con análisis de impacto, plan de implementación y plan de back-out. Para el análisis se buscaron con grep todas las lecturas y escrituras de localStorage.
- Por qué: todo cambio de código pasa primero por una solicitud de cambio registrada (flujo de aprobación del curso).
- Resultado: RFC en estado "Registrado".
- Evidencia: `docs/rfc/RFC-001.md`.

### [2026-10-20 entre 20:44 y 20:46] RFC-001: flujo de aprobación *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: la RFC pasó por "¿Solicitud completa?" (sí), "Investigación preliminar", "¿Es correcta?" (sí), "Aprobado" (Brayan, gestor del cambio, por ser un cambio de emergencia) y "Asignado" (Claude Code).
- Por qué: el código no se modifica hasta que la RFC está aprobada y asignada.
- Resultado: RFC en estado "Asignado".
- Evidencia: sección "Historial de estados" de `docs/rfc/RFC-001.md`.

### [2026-10-20 entre 20:44 y 20:46] RFC-001: implementación *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: se modificaron 6 archivos del frontend: `login-paciente.component.ts` (se eliminó el atajo de la clave `123456`), `login-medico.component.ts` (la sesión se guarda solo si el usuario es médico), `login-admin.component.ts` (mismo esquema `userId`, `userName`, `userType`), `admin-dashboard.component.ts` (cierre de sesión con `AuthService.logout()`), `welcome.component.ts` y `welcome.component.html` (el "Cerrar Sesión" del paciente pasa de enlace a acción que borra la sesión). En los 3 logins: 401 → "Credenciales inválidas"; cualquier otro error → "No se pudo conectar con el servidor. Intente nuevamente."
- Por qué: corregir H-001, H-002 y H-003.
- Resultado: **el mismo cambio (manejo de error 401 / sin conexión) se tuvo que repetir en 3 archivos**, uno por componente de login, porque la lógica de login está copiada (H-008). No se unificaron: eso es la refactorización R1 DRY. No se tocaron los componentes huérfanos de H-009. El grep posterior solo encuentra claves viejas (`token`, `role`) en componentes huérfanos (H-009 y el nuevo H-027).
- Evidencia: diff del commit de LB-1.

### [2026-10-20 20:46] RFC-001: compilación *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: `ng build --configuration development`.
- Por qué: confirmar que el cambio no introduce errores de compilación.
- Resultado: "Application bundle generation complete" con las mismas 2 advertencias NG8113 de LB-0 (H-011). Sin errores nuevos.
- Evidencia: salida de consola de la sesión.

### [2026-10-20 entre 20:46 y 20:57] RFC-001: batería de regresión P01–P18 (LB-1) *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: se recargó la BD (`DROP DATABASE` + `BDPostaMedica.sql`, 21 citas) y se corrió la batería completa. Se creó la prueba P18 (backend apagado + clave `123456`). Se apagó y volvió a encender el backend para P11 y P18. A pedido del usuario, se agregó a cada prueba la línea "Tipo:" y la nota de que la batería completa es la prueba de regresión.
- Por qué: comprobar que el cambio cumple su objetivo y no altera nada más.
- Resultado: P07, P08, P10 y P17 pasaron de FALLA (o mixta) a PASA; P18 PASA; las otras 13 pruebas dieron lo mismo que en LB-0. Durante las pruebas se registraron H-027 (más componentes huérfanos con claves viejas) y H-028 (el login de paciente acepta credenciales de médico; existía en LB-0).
- Evidencia: 11 capturas `docs/evidencias/lb1-*.png`; sección "Resultados de LB-1" de `docs/PRUEBAS.md`.

### [2026-10-20 entre 20:54 y 20:57] RFC-001 cerrada *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: evaluación post-implementación en la RFC; H-001, H-002 y H-003 pasaron a "Cerrado (RFC-001, LB-1)"; la gravedad de H-002 subió a Alta; EC-02 se marcó como modificado en LB-1.
- Por qué: cerrar formalmente el cambio.
- Resultado: RFC-001 en estado "Cerrado". No se usó el plan de back-out.
- Evidencia: `docs/rfc/RFC-001.md`, `docs/HALLAZGOS.md`.

### [2026-10-20 20:57] Commit y tag de la línea base LB-1 *(hora corregida; ver entrada "Corrección de horas")*
- Qué se hizo: commit de RFC-001 (6 archivos de código, documentación y 11 evidencias) y tag anotado `LB-1`.
- Por qué: congelar el estado tras el primer cambio correctivo; es la línea base contra la que se comparará la reorganización (LB-2).
- Resultado: tag `LB-1` ("Linea base 1: RFC-001 aplicado") apunta al commit.
- Evidencia: commit `ff04e3911447c1373ea1be6cac124af869010cc0` — "RFC-001: corrige login, sesion y mensajes (H-001, H-002, H-003)". Esta entrada se agregó en un commit posterior porque un commit no puede contener su propio hash.

### [2026-10-21 entre 09:14 y 09:15] Corrección de horas
- Qué se hizo: se revisaron todas las horas de `docs/BITACORA.md`, `docs/rfc/RFC-001.md` y `docs/PRUEBAS.md` contra fuentes reales y se corrigieron las que no correspondían. Cada línea corregida quedó marcada con "*(hora corregida; ver entrada "Corrección de horas")*".
- Por qué: varias horas **se estimaron al escribir la documentación en vez de registrarse en el momento**. El caso más claro: la RFC-001 y la bitácora decían que la batería terminó a las 21:05, que la RFC se cerró a las 21:10 y que el commit de LB-1 fue a las 21:12, cuando `git log` registra el commit `ff04e39` a las **20:57:32**. Eran horas posteriores al hecho que dicen documentar.
- Fuentes usadas para la hora real: `git log --format='%h %ad %s' --date=iso`; la fecha de modificación de cada archivo de `docs/evidencias/`; la marca de tiempo que imprime `ng build` (en UTC: `00:13:27Z` = 19:13:27 y `01:46:36Z` = 20:46:36, hora de Perú UTC-5); las marcas UTC de las respuestas de error del backend (`00:17:42Z`–`00:17:57Z` = 19:17:42–19:17:57); los nombres de los archivos de registro de Playwright (UTC); el log de arranque del backend (`19:17:32`); y los `date` ejecutados en la sesión (20:00 y 20:44).
- Correcciones en `BITACORA.md`:

  | Entrada | Decía | Ahora dice | Fuente |
  |---|---|---|---|
  | .gitignore | 19:10 | Sin registro; antes de 19:12:08 | No hay registro; solo se sabe que fue antes del commit inicial (19:12:08) |
  | Primer intento de conexión a MySQL | 19:13 | entre 19:12 y 19:13 | Entre el commit inicial (19:12:08) y `ng build` (19:13:27) |
  | Ajuste de la contraseña (usuario) | 19:15 | entre 19:13 y 19:17 | Entre `ng build` (19:13:27) y el arranque del backend (19:17:32) |
  | Cambio de nombre de la BD | 19:16 | entre 19:13 y 19:17 | Ídem |
  | Creación de la BD | 19:16 | entre 19:13 y 19:17 | Ídem |
  | Prueba de endpoints | 19:18 | 19:17 | Respuestas del backend con marca `00:17:42Z`–`00:17:57Z` |
  | Completar el renombrado en la documentación | 19:24 | entre 19:19 y 19:26 | Entre el registro de Playwright `00-19-31Z` y el `00-26-11Z` |
  | Reinicio del backend | 19:28 | entre 19:27 y 19:29 | Entre la captura del paso 3b (19:27:31) y el registro `00-29-12Z` |
  | Redacción de HALLAZGOS, PRUEBAS y EC | 20:00 | entre 20:00 y 20:07 | Entre el `date` (20:00) y la primera evidencia de P12 (20:07:28) |
  | Hallazgos completos y trazabilidad | 20:35 | entre 20:12 y 20:37 | Entre el commit `000eacb` (20:12:00) y el commit `6b3b6bc` (20:37:14) |
  | RFC-001: flujo de aprobación | 20:46–20:49 | entre 20:44 y 20:46 | Entre el `date` de registro (20:44) y `ng build` (20:46:36); la aprobación fue antes de tocar código |
  | RFC-001: implementación | 20:50 | entre 20:44 y 20:46 | La implementación terminó antes de `ng build` (20:46:36) |
  | RFC-001: compilación | 20:52 | 20:46 | `ng build`: `2026-10-21T01:46:36Z` |
  | RFC-001: batería de regresión | 20:53–21:05 | entre 20:46 y 20:57 | Evidencias LB-1 entre 20:49:35 y 20:53:52; la verificación de H-028 fue antes del commit (20:57:32) |
  | RFC-001 cerrada | 21:10 | entre 20:54 y 20:57 | Después de la última evidencia (20:53:52) y antes del commit (20:57:32) |
  | Commit y tag de LB-1 | 21:12 | 20:57 | Commit `ff04e39`: 20:57:32 |

- Correcciones en `RFC-001.md` (historial de estados): "¿Solicitud completa?" 20:46, "Investigación preliminar" 20:47, "¿Es correcta?" 20:48, "Aprobado" 20:49, "Asignado" 20:49 y "En implementación" 20:50 → **entre 20:44 y 20:46**; "En pruebas" 20:52 → **20:46**; "En pruebas → resultados" 21:05 → **entre 20:53 y 20:57**; "Cerrado" 21:10 → **entre 20:54 y 20:57**. "Fecha de recepción" y "Registrado" (20:44) no cambian: salen de un `date`.
- Corrección en `PRUEBAS.md`: "Ejecución del 2026-10-20, de 20:53 a 21:05" → **entre 20:46 y 20:57**.
- Sin cambios (la hora coincide con una fuente real): commit inicial 19:12, compilación 19:13, arranque 19:17, pantallas 19:19, login por formulario 19:26, desacople 19:27, estructura de docs 20:00, P12 20:07, P13 20:08, P14–P16 20:09, commit LB-0 20:11, RFC registrada 20:44.
- Alternativas descartadas: borrar las horas equivocadas sin dejar rastro (en gestión de configuración las correcciones también se registran) y reemplazarlas por otras horas estimadas "más probables" (seguirían siendo inventadas; donde no hay fuente se usó un rango cierto o "Sin registro").
- Evidencia: `git log` citado; diff de este commit.

### [2026-10-21 entre 09:15 y 09:16] Hallazgo H-029
- Qué se hizo: se registró H-029 en `docs/HALLAZGOS.md`: los 3 logins muestran "No se pudo conectar con el servidor" ante cualquier error que no sea 401, incluido un 500, cuando el servidor sí respondió.
- Por qué: RFC-001 solo distinguió 401 del resto. Se verificó en el código: `status === 401` en `login-paciente.component.ts:63`, `login-medico.component.ts:67` y `login-admin.component.ts:64`; el resto cae en el mensaje de conexión. El backend sí puede responder 500 desde el `catch` de `AuthController.java:99-102`.
- Resultado: H-029, Baja / Correctivo / Pendiente. No se corrigió (fuera del alcance de esta tarea).
- Evidencia: líneas de código citadas.

### [2026-10-21 entre 09:15 y 09:18] CLAUDE.md con reglas permanentes
- Qué se hizo: se creó `CLAUDE.md` en la raíz con las reglas del proyecto (calidad de los cambios, documentación, pruebas y proceso del curso), con el contenido indicado por el usuario, más una sección "Hooks activos".
- Por qué: dejar reglas permanentes que se apliquen a todas las tareas siguientes.
- Alternativas descartadas: escribir los DNI y la clave de prueba literalmente en la sección de hooks (el propio hook 2 pediría confirmación al editar CLAUDE.md); se remite a la lista `DATOS_DE_PRUEBA` del script.
- Evidencia: `CLAUDE.md` en este commit.

### [2026-10-21 entre 09:15 y 09:18] Hooks de control de Claude Code
- Qué se hizo: se crearon 3 hooks PreToolUse a nivel de proyecto (`.claude/settings.json`, scripts en `.claude/hooks/`, en Node.js): (1) `proteger-pruebas.js` pide confirmación al modificar una prueba existente; (2) `datos-prueba.js` pide confirmación si el texto nuevo de un archivo que no es de pruebas contiene DNIs o la clave de prueba (excepto `BDPostaMedica.sql`, `docs/`, `.claude/`); (3) `git-destructivo.js` bloquea push, reset --hard, borrado de tags, checkout -- . y clean.
- Por qué: impedir que se debiliten pruebas, que se acomode el código a los datos de prueba y que se borren líneas base.
- Pruebas: cada hook se probó enviándole entradas JSON como las de Claude Code (10 casos para los hooks 1 y 2, 11 comandos para el hook 3). Para el hook 1 se usó una prueba temporal `zz-hook-temporal.spec.ts` creada y borrada en el momento. Todos los casos dieron el resultado esperado.
- Problema encontrado y corregido durante las pruebas: la primera versión de los hooks 1 y 2 interpretaba mal las rutas de estilo Git Bash (`/c/Users/...`) y calculaba una ruta relativa errónea; se agregó una normalización a `C:/...`. Las rutas de Windows, que son las que envía Claude Code, ya funcionaban.
- El hook 3 se activó en vivo en esta misma sesión, sin reiniciar: bloqueó dos comandos míos porque su texto mencionaba los comandos de Git prohibidos (uno era la prueba del propio hook y el otro un heredoc que documentaba el hook). Es un falso positivo aceptado y quedó documentado en CLAUDE.md.
- Evidencia: salida de las pruebas citada en el reporte de la tarea; scripts en este commit.

### [2026-10-21 09:28] Regla nueva en CLAUDE.md
- Qué se hizo: se agregó en "Calidad de los cambios" la regla de crear, modificar y borrar archivos solo con las herramientas de edición (Edit/Write), nunca con comandos de terminal.
- Por qué: los hooks de control (`proteger-pruebas.js`, `datos-prueba.js`) solo ven las herramientas Edit/Write/MultiEdit; un `sed` o un `echo >` los esquivaría.
- Alternativas descartadas: ampliar los hooks para analizar comandos de terminal (detectar escrituras dentro de un comando es poco fiable).
- Evidencia: `CLAUDE.md`. Desde esta entrada, la bitácora y los demás documentos se editan solo con Edit/Write.

### [2026-10-21 09:28] RFC-002 registrada (H-028)
- Qué se hizo: se creó `docs/rfc/RFC-002.md` antes de tocar código, con alternativas evaluadas, análisis de impacto y plan de back-out. A las 09:29 pasó por "¿Solicitud completa?", "Investigación preliminar", "¿Es correcta?", "Aprobado" (Comité de control de configuración, Brayan en representación del grupo) y "Asignado" (Claude Code).
- Por qué: todo cambio de código pasa primero por una solicitud de cambio registrada y aprobada.
- Resultado: RFC-002 en estado "Asignado".
- Evidencia: `docs/rfc/RFC-002.md`.

### [2026-10-21 09:29] RFC-002: causa del problema (antes de modificar código)
- Por qué ocurre H-028: el backend (`AuthController`) busca el DNI en pacientes, médicos y administradores y responde 200 con el `tipo` que encuentre; no sabe desde qué pantalla se intentó entrar. Por eso cada login del frontend tiene que comprobar que `tipo` sea el de su rol. Los logins de médico (`login-medico.component.ts:53`) y admin (`login-admin.component.ts:49`) lo hacen; el de paciente (`login-paciente.component.ts:51-55`) guarda la sesión y navega con cualquier `success`, sin mirar `tipo`. Con un médico, guarda `userType = medico` y `userId` del médico, y las pantallas del paciente usan ese `userId` como si fuera un ID de paciente.
- Mensajes actuales ante un rol equivocado (se unifican en esta RFC): médico → "Error: El usuario no es un médico."; admin con paciente → "Este usuario es un paciente, no un administrador. Use el login de pacientes."; admin con médico → "Credenciales incorrectas" (cae en la rama genérica `else`); paciente → no comprueba.
- Alternativa elegida y descartada: ver "Alternativas evaluadas" en RFC-002 (se descarta validar el rol en el backend porque toca `AuthController`, objetivo de R3 OCP, y depende de H-016).

### [2026-10-21 09:29] RFC-002: implementación
- Qué se cambió: 3 archivos, cada uno por separado. `login-paciente.component.ts`: guarda la sesión y entra solo si `res.tipo === 'paciente'`; si no, muestra "Este usuario no es un paciente. Use el login que le corresponde.". `login-medico.component.ts`: el mensaje de rol equivocado pasa de "Error: El usuario no es un médico." a "Este usuario no es un médico. Use el login que le corresponde.". `login-admin.component.ts`: cualquier usuario válido que no sea administrador (antes solo se distinguía al paciente; el médico caía en "Credenciales incorrectas") muestra "Este usuario no es un administrador. Use el login que le corresponde.".
- Por qué: corregir la causa de H-028 (falta la comprobación de `tipo` en el login de paciente) y dejar los 3 logins con el mismo comportamiento ante un rol equivocado, para que la unificación DRY no tenga diferencias que resolver.
- Alternativas descartadas: validar el rol en el backend (ver RFC-002); unificar los 3 logins ahora (es la refactorización DRY y se hace aparte).
- **El mismo cambio (mensaje de rol equivocado) se repitió en 3 archivos**, como en RFC-001 (H-008).
- Evidencia: diff del commit de LB-2.

### [2026-10-21 09:30] RFC-002: compilación y reinicio del entorno
- Qué se hizo: `ng build --configuration development` (09:30:12, `2026-10-21T14:30:12Z`). Backend y frontend estaban caídos desde la sesión anterior: se reiniciaron (`mvnw spring-boot:run`, `npm start`) y se recargó la BD (`DROP DATABASE` + `BDPostaMedica.sql`, 21 citas) a las 09:30:52.
- Resultado: compilación sin errores nuevos (las mismas 2 advertencias NG8113, H-011).
- Evidencia: salida de consola de la sesión.

### [2026-10-21 entre 09:30 y 09:37] RFC-002: batería de regresión P01–P19 (LB-2)
- Qué se hizo: batería completa en el orden del documento; se creó P19 (matriz de roles cruzados, 6 combinaciones). Para P11 y P18 se apagó el backend a las 09:37:16 (pid 26728) y se volvió a encender después.
- Resultado: P19 PASA en las 6 combinaciones; P01–P18 dieron lo mismo que en LB-1. Sin efectos no deseados. Se registró H-030 (mensajes distintos ante una respuesta 200 sin `success`; fuera del alcance).
- Evidencia: 10 capturas `docs/evidencias/lb2-*.png`; sección "Resultados de LB-2" de `docs/PRUEBAS.md`.

### [2026-10-21 09:39] RFC-002 cerrada
- Qué se hizo: evaluación post-implementación en RFC-002; H-028 pasó a "Cerrado (RFC-002, LB-2)"; la tabla de PRUEBAS.md recibió la columna "LB-2 RFC-002" y las siguientes se renumeraron (Reorganización → LB-3, DRY → LB-4, SRP → LB-5, OCP → LB-6, IoC → LB-7), igual que la regla del encabezado (LB-3 a LB-7). HALLAZGOS.md nombra los cambios por su nombre (R1 DRY, Reorganización…), no por número de línea base, así que no requirió renumeración; RFC-001 tampoco menciona esos números. La entrada de LB-1 de esta bitácora que dice "reorganización (LB-2)" se deja como estaba, porque registra lo planificado en ese momento.
- Errores de registro corregidos en el momento: en el historial de RFC-002 se escribieron dos horas por adelantado ("En implementación" 09:30, cuando `date` dio 09:29:48; "Cerrado" 09:41, cuando `date` dio 09:39:36). Ambas se reemplazaron por la hora real antes del commit, aplicando la regla de CLAUDE.md.
- Evidencia: `docs/rfc/RFC-002.md`, `docs/HALLAZGOS.md`, `docs/PRUEBAS.md`.

### [2026-10-21 09:40] Commit y tag de la línea base LB-2
- Qué se hizo: commit de RFC-002 (3 archivos de código, CLAUDE.md, documentación y 10 evidencias) y tag anotado `LB-2`.
- Por qué: congelar el estado tras el segundo cambio correctivo; es la línea base contra la que se comparará la reorganización (LB-3).
- Resultado: tag `LB-2` ("Linea base 2: RFC-002 aplicado") apunta al commit. La carpeta `.playwright-mcp/` (registros que genera la herramienta de pruebas) quedó fuera del commit; no se borró porque CLAUDE.md no permite borrar archivos con comandos de terminal.
- Evidencia: commit `697447ffee775e3973e839faac4f7bb5cce60e36` (2026-10-21 09:40:29) — "RFC-002: login de paciente comprueba el rol (H-028)". Esta entrada se agregó en un commit posterior porque un commit no puede contener su propio hash.

### [2026-10-21 09:48] Regla nueva en CLAUDE.md: el reporte del chat resume lo que ya está en docs/
- Qué se hizo: se agregó en la sección "Documentación" de `CLAUDE.md` la regla de que todo lo que se incluya en el reporte final del chat (problemas, decisiones, fallos propios, estado del entorno) debe estar también escrito en `docs/`.
- Por qué: pedido del usuario. El grupo redacta el informe a partir del repositorio, no del chat; lo que solo queda en el chat se pierde.
- Evidencia: `CLAUDE.md`.

### [2026-10-21 09:49] .playwright-mcp/ agregado al .gitignore
- Qué se hizo: se agregó `.playwright-mcp/` al `.gitignore` con la herramienta de edición.
- Por qué: pedido del usuario. Es la carpeta de registros que genera la herramienta de pruebas en cada sesión; no es parte del proyecto y no debe versionarse. CLAUDE.md no permite borrarla con comandos de terminal, así que se ignora en lugar de borrarla.
- Estado del entorno en este momento: backend (puerto 8080) y frontend (puerto 4200) corriendo, iniciados en esta sesión; la BD tiene las citas de prueba 22 y 23 que agregó la batería de LB-2. Cambios sin commit: `CLAUDE.md`, `.gitignore` y esta bitácora.
- Evidencia: `.gitignore`.
- Nota posterior (09:51): estos dos cambios no se commitearon por separado; entran en el commit de RFC-003 (LB-3).

### [2026-10-21 09:50] RFC-003 registrada y aprobada (H-004, parte de H-023)
- Qué se hizo: se revisó el código del módulo médico, del backend y de las pruebas de Playwright, y se registró `docs/rfc/RFC-003.md` con el diseño completo (endpoints, estados, campos de pacientes, manejo de error) y las alternativas evaluadas. A las 09:51 pasó por "¿Solicitud completa?", "Investigación preliminar", "¿Es correcta?", "Aprobado" (Comité de control de configuración) y "Asignado" (Claude Code).
- Por qué: todo cambio de código pasa primero por una RFC aprobada.
- Evidencia: `docs/rfc/RFC-003.md`.

### [2026-10-21 09:51] RFC-003: causa del problema (antes de modificar código)
- Por qué ocurre H-004: el módulo médico se construyó como maqueta. `medico-dashboard/services/medico.service.ts:19-65` guarda 5 citas fijas en un `BehaviorSubject` y no importa `HttpClient`; "Aceptar"/"Cancelar" (`updateCitaStatus`) solo reemplazan el arreglo en memoria. `medico-pacientes.component.ts:30-108` tiene 5 pacientes fijos con campos que no están en la tabla `Paciente` (`direccion`, `email`, `historial`). Además, en el backend no existe ningún endpoint que devuelva las citas de un médico con los datos del paciente sin la contraseña, ni uno que cambie solo el estado de una cita: los existentes devuelven todo (`/api/cita`), exigen una fecha (`/api/citas/medico/{id}/fecha/{f}`) o exponen la contraseña (`/api/paciente`).
- Por qué ocurre la parte de H-023: el arreglo fijo usa el estado "Aprobada", inventado; la tabla `Estado_Cita` tiene Pendiente, Confirmada, Cancelada, Atendida y Reprogramada.
- Pruebas de Playwright afectadas (estado ANTES de modificarlas): las 5 simulan la respuesta del login con `page.route` (médico ficticio `id: 123`, DNI `87654321` que en la base es del administrador) y comprueban los datos inventados:
  - `tests/medico-citas-pendientes.spec.ts`: encabezados "Paciente" y "Motivo"; la fila "Maria Lopez Quispe" / "Dolor de cabeza persistente" (cita 101 inventada); aceptarla abre el modal "Aceptar Cita" y la quita de la tabla; cancelar "Luis Torres Paz" (cita 102 inventada) la quita de la tabla. No comprueba nada en la base.
  - `tests/medico-dashboard.spec.ts`: tras el login simulado llega a `/medico-dashboard`; ve "Panel Médico"; el menú tiene "Inicio", "Pacientes", "Citas Pendientes", "Citas Aprobadas", "Citas Canceladas"; el botón "Cerrar Sesión" lleva a `/login-selection`. Guarda una captura `medico_dashboard_preview.png` en la raíz del repo.
  - `tests/medico-flow.spec.ts`: acepta "Maria Lopez Quispe" y la encuentra en "Citas Aprobadas" con el distintivo "Aprobada"; cancela "Luis Torres Paz" y la encuentra en "Citas Canceladas" con "Cancelada". Todo en memoria.
  - `tests/medico-pacientes-formatting.spec.ts`: en "Pacientes" ve la fecha "10/05/1990", "Masculino" en la fila de Juan, "Femenino" en la de Maria y los ubigeos "Lima - San Juan de Lurigancho" y "Cusco - Cusco" (del arreglo fijo).
  - `tests/medico-pacientes.spec.ts`: encabezados "Nombres", "DNI", "Acciones"; fila de Juan Perez Gomez; el modal "Resumen del Paciente" muestra "Juan Perez Gomez", la dirección inventada "Av. Siempre Viva 123" y el historial inventado "Cita General". Guarda `medico_pacientes_modal.png` en la raíz.
- Por qué se modificarán: el comportamiento cambia a propósito (correctivo) y estas pruebas validan datos que dejan de existir. El usuario confirma cada modificación cuando lo pregunta el hook. No se modifica ninguna otra prueba.

### [2026-10-21 entre 09:52 y 09:56] RFC-003: implementación
- Backend (09:52–09:53): DTOs nuevos `CitaMedicoDTO` y `PacienteMedicoDTO` (sin campo de contraseña); en `CitaRepository`, consultas JPQL `findCitasDeMedicoPorEstado`, `findCitaMedicoPorId` y `findPacientesDeMedico` (filtran por médico en la base, con JOIN a `Paciente`, `Estado_Cita`, `Estado_Paciente` y `Ubigeo`); en `Estado_CitaRepository`, `findByNombreEstado`; en `CitaConsultaController`, 3 endpoints: `GET /api/citas/medico/{id}?estado=`, `GET /api/citas/medico/{id}/pacientes` y `PUT /api/citas/medico/{id}/{idCita}/estado`. El PUT traduce el nombre del estado a su ID consultando `Estado_Cita` (sin números fijos), responde 400 si el estado no existe y 404 si la cita no es de ese médico. `mvnw compile` sin errores; backend reiniciado a las 09:53:28 (pid 15080 detenido; arrancó a las 09:53:40 sin errores en las consultas nuevas).
- Verificación rápida (09:54): `GET …/medico/1?estado=Pendiente` devolvió las citas 22 y 23 con nombre y DNI del paciente y sin `clave`; `PUT` con estado "Aprobada" → 400; `PUT` sobre la cita 6 (del médico 6) usando el médico 1 → 404; la base no cambió en ninguno de los dos casos.
- Frontend (09:54–09:56): `medico.service.ts` reescrito: se eliminaron las 5 citas fijas; usa `HttpClient` y el `userId` de la sesión. `medico-pacientes.component.ts`: se eliminaron los 5 pacientes fijos; usa el servicio. Las 4 pantallas muestran "No se pudo conectar con el servidor. Intente nuevamente." y ocultan la tabla si la petición falla. "Aceptar"/"Cancelar" guardan en la base y vuelven a pedir la lista. Texto "Aprobadas" → "Confirmadas" en el menú, el título y la página de inicio del módulo.
- Campos quitados de la pantalla de pacientes por no existir en la base: `direccion` ("Dirección"), `email` ("Email") y el bloque "Historial Reciente (Mock)" (`historial`). Se agregó "Teléfono", que sí existe y antes salía del arreglo fijo. "Estado" ahora muestra el nombre de `Estado_Paciente` (antes un número fijo) y "Ubigeo" sale de la tabla `Ubigeo`.
- Decisión: la ruta `/medico-dashboard/citas-aprobadas`, los archivos `medico-citas-aprobadas.*` y la clase `MedicoCitasAprobadasComponent` conservan el nombre "aprobadas": renombrarlos es reorganización (H-017) y queda pendiente. Se descartó también mover la lógica a `CitaService` (es R2/R4).
- `ng build` (09:55:57) sin errores nuevos (las mismas 2 advertencias NG8113). Un grep de `Aprobada`, `Maria Lopez`, `Siempre Viva`, `initialCitas`, `Mock`, `@email`, `101` y `23456789` en `medico-dashboard/` solo encuentra el nombre de la clase `MedicoCitasAprobadasComponent`.
- Evidencia: diff del commit de LB-3.

### [2026-10-21 entre 09:56 y 10:04] RFC-003: pruebas de Playwright actualizadas y ejecutadas
- Qué se hizo: se reescribieron las 5 pruebas `tests/medico-*.spec.ts` (el usuario confirmó cada una cuando lo preguntó el hook de pruebas protegidas). Ahora hacen login real por formulario con el médico `10000001` (sin `page.route`) y comparan la pantalla con la API real:
  - `medico-dashboard.spec.ts`: login real; "Panel Médico"; menú con "Citas Confirmadas" (y sin "Citas Aprobadas"); "Cerrar Sesión" lleva a `/login-selection` y deja el localStorage vacío. Se quitó la captura `medico_dashboard_preview.png` que se guardaba en la raíz del repo.
  - `medico-citas-pendientes.spec.ts`: crea 2 citas pendientes por la API; la tabla tiene tantas filas como pendientes devuelve el servidor; la cita creada muestra "Juan Perez Gomez" y su DNI; "Aceptar" la quita y en la base queda con el ID de "Confirmada"; "Cancelar" la otra y queda con el ID de "Cancelada". Borra sus citas al terminar.
  - `medico-flow.spec.ts`: crea 2 citas; confirma una y la encuentra en "Citas Confirmadas" con el distintivo "Confirmada", también después de recargar; cancela la otra y la encuentra en "Citas Canceladas" con "Cancelada", también después de recargar. Borra sus citas.
  - `medico-pacientes-formatting.spec.ts`: la tabla tiene exactamente los pacientes que devuelve `/api/citas/medico/1/pacientes`; cada uno con la fecha en dd/MM/yyyy, el sexo en palabras, "departamento - distrito" y el estado.
  - `medico-pacientes.spec.ts`: encabezados; exactamente los pacientes del servidor; el modal "Resumen del Paciente" del primero muestra nombre, DNI y teléfono reales y **no** contiene "Dirección", "Email" ni "Historial". Se quitó la captura `medico_pacientes_modal.png` que se guardaba en la raíz.
- Entorno: `npm install` en la raíz a las 10:02 instaló `@playwright/test` 1.64.1 (el `package.json` raíz declara `^1.57.0`); los navegadores ya estaban en la caché de Playwright.
- Resultado: primera corrida (10:02:16–10:03:14) 5/6: `admin-reportes.spec.ts` (no modificada) falló por tiempo de espera. Causa: el servidor de desarrollo (`ng serve`) mostraba el cartel de un error de compilación intermedio de mis ediciones (`TS2339: Property 'id' does not exist on type 'PacienteMedico'`, de cuando el `.ts` nuevo convivía con el `.html` viejo); las compilaciones siguientes terminaron bien, pero el cartel quedó en la página. Se reinició el frontend (10:03:48) y la segunda corrida (10:03:55–10:04:03) dio **6/6**. Después quedaban 0 citas con motivo "Playwright…" en la base.
- Alternativas descartadas: que las pruebas dependan de las citas 22/23 de la batería (fallarían si la base se recarga o si la batería cambia esas citas); simular el backend con `page.route` como antes (no comprobaría la base).
- Evidencia: salida de `npx playwright test tests/ --workers=1` citada en `docs/PRUEBAS.md` ("Resultados de LB-3").

### [2026-10-21 entre 10:04 y 10:13] RFC-003: batería de regresión P01–P24 (LB-3)
- Qué se hizo: BD recargada a las 10:04:37 (21 citas); batería completa en el orden del documento; se crearon P20–P24. Para P11 y P18 se apagó el backend a las 10:12:14 (pid 18516) y se volvió a encender (10:13:02, `backend 200`).
- Resultado: P11 pasó de FALLA a PASA; P20–P24 PASA; las otras 18 pruebas dieron lo mismo que en LB-2. Sin efectos no deseados.
- Evidencia: 7 capturas `docs/evidencias/lb3-*.png`; sección "Resultados de LB-3" de `docs/PRUEBAS.md`.

### [2026-10-21 10:15] RFC-003 cerrada
- Qué se hizo: evaluación post-implementación en RFC-003; H-004 → "Cerrado (RFC-003, LB-3)"; H-023 → resuelto en el módulo médico y pendiente en `registrar-cita`, `mis-citas`, `CitaRepository` y en el nombre "aprobadas" de ruta, archivos y clase; EC-01, EC-02 y EC-08 actualizados. La tabla de PRUEBAS.md recibió la columna "LB-3 RFC-003" y las siguientes se renumeraron (Reorganización → LB-4, DRY → LB-5, SRP → LB-6, OCP → LB-7, IoC → LB-8), igual que la regla del encabezado (LB-4 a LB-8). HALLAZGOS.md y las RFC anteriores no usan esos números. La entrada de LB-2 que dice "reorganización (LB-3)" se deja como registro de lo planificado en ese momento.
- Estado del entorno: backend (8080) y frontend (4200) corriendo, iniciados en esta sesión; la BD quedó con las citas 22 (Confirmada) y 23 (Cancelada) de la batería; `node_modules/` de Playwright instalado en la raíz (ignorado por Git).
- Evidencia: `docs/rfc/RFC-003.md`, `docs/HALLAZGOS.md`, `docs/PRUEBAS.md`, `docs/ELEMENTOS_CONFIGURACION.md`.

### [2026-10-21 10:16] Commit y tag de la línea base LB-3
- Qué se hizo: commit de RFC-003 (39 archivos: backend, frontend del módulo médico, 5 pruebas de Playwright, documentación, 7 evidencias; incluye también `CLAUDE.md` y `.gitignore` de las entradas de las 09:48 y 09:49) y tag anotado `LB-3`.
- Por qué: congelar el estado tras el tercer cambio correctivo; es la línea base contra la que se comparará la reorganización (LB-4).
- Resultado: tag `LB-3` ("Linea base 3: RFC-003 aplicado") apunta al commit.
- Evidencia: commit `335f0cf44964723312871c14cce70d70819aae86` (2026-10-21 10:16:04) — "RFC-003: modulo medico conectado a la base de datos (H-004)". Esta entrada se agregó en un commit posterior porque un commit no puede contener su propio hash.
