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
- Evidencia: commit `1a5df63c0963dfc50ec40c08d7d335bbde43f302` — "Linea base LB-0: entorno verificado y documentado". Tag anotado `LB-0` ("Linea base 0: estado inicial antes de refactorizar") apunta a ese commit. Esta entrada se agregó en un commit posterior porque un commit no puede contener su propio hash.

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
- Evidencia: commit `0659becb99be0f657a0c3abd090208979173aea7` — "RFC-001: corrige login, sesion y mensajes (H-001, H-002, H-003)". Esta entrada se agregó en un commit posterior porque un commit no puede contener su propio hash.

### [2026-10-21 entre 09:14 y 09:15] Corrección de horas
- Qué se hizo: se revisaron todas las horas de `docs/BITACORA.md`, `docs/rfc/RFC-001.md` y `docs/PRUEBAS.md` contra fuentes reales y se corrigieron las que no correspondían. Cada línea corregida quedó marcada con "*(hora corregida; ver entrada "Corrección de horas")*".
- Por qué: varias horas **se estimaron al escribir la documentación en vez de registrarse en el momento**. El caso más claro: la RFC-001 y la bitácora decían que la batería terminó a las 21:05, que la RFC se cerró a las 21:10 y que el commit de LB-1 fue a las 21:12, cuando `git log` registra el commit `0659bec` a las **20:57:32**. Eran horas posteriores al hecho que dicen documentar.
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
  | Hallazgos completos y trazabilidad | 20:35 | entre 20:12 y 20:37 | Entre el commit `7c266a9` (20:12:00) y el commit `06e3c11` (20:37:14) |
  | RFC-001: flujo de aprobación | 20:46–20:49 | entre 20:44 y 20:46 | Entre el `date` de registro (20:44) y `ng build` (20:46:36); la aprobación fue antes de tocar código |
  | RFC-001: implementación | 20:50 | entre 20:44 y 20:46 | La implementación terminó antes de `ng build` (20:46:36) |
  | RFC-001: compilación | 20:52 | 20:46 | `ng build`: `2026-10-21T01:46:36Z` |
  | RFC-001: batería de regresión | 20:53–21:05 | entre 20:46 y 20:57 | Evidencias LB-1 entre 20:49:35 y 20:53:52; la verificación de H-028 fue antes del commit (20:57:32) |
  | RFC-001 cerrada | 21:10 | entre 20:54 y 20:57 | Después de la última evidencia (20:53:52) y antes del commit (20:57:32) |
  | Commit y tag de LB-1 | 21:12 | 20:57 | Commit `0659bec`: 20:57:32 |

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
- Evidencia: commit `6588eaff865a467502a32443174d99cdd40b95d0` (2026-10-21 09:40:29) — "RFC-002: login de paciente comprueba el rol (H-028)". Esta entrada se agregó en un commit posterior porque un commit no puede contener su propio hash.

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
- Evidencia: commit `4fb12a6b1c54e21dd5a83876f5b8f32d0ac1ed69` (2026-10-21 10:16:04) — "RFC-003: modulo medico conectado a la base de datos (H-004)". Esta entrada se agregó en un commit posterior porque un commit no puede contener su propio hash.

### [2026-10-21 10:25] Tarea 9: inicio de sesión de trabajo y estado del entorno
- Qué se hizo: lectura de `CLAUDE.md`, de las últimas entradas de esta bitácora y de la columna "Cambio que lo atiende" de `HALLAZGOS.md`; `git log --oneline -5` (último commit `dd1f3a0`) y `git tag` (`LB-0` a `LB-3`).
- Estado del entorno (10:25:15): backend respondiendo en 8080 (`GET /` → 404, la ruta no existe; el servidor está arriba) y frontend en 4200 (`GET /` → 200). No hubo que levantarlos. Árbol de trabajo limpio.
- Parte A, puntos 1 y 2: **ya estaban hechos** desde las entradas de las 09:48 y 09:49 (la regla del reporte del chat está en `CLAUDE.md`, "Documentación"; `.playwright-mcp/` está en `.gitignore`) y entraron en el commit de LB-3. No se volvieron a editar.

### [2026-10-21 10:26] Tarea 9, Parte A: hallazgos H-031 y H-032; H-029 y H-015 ampliados
- Qué se hizo, verificado en el código:
  - **H-031 (nuevo, Media / Correctivo / Pendiente):** `CitaConsultaController.cambiarEstado` (`:56-74`) solo comprueba que la cita sea del médico y que el nombre del estado exista; luego hace `setEstado_cita` sin mirar el estado actual. No hay máquina de estados (Cancelada → Confirmada, Pendiente → Atendida, Atendida → Pendiente son aceptadas).
  - **H-029 ampliado:** las 4 pantallas del módulo médico ponen `MENSAJE_SIN_CONEXION` en cualquier `error:` del `subscribe` (`medico-citas-pendientes.component.ts:31-33,56-59`, `medico-citas-aprobadas…:22`, `medico-citas-canceladas…:21`, `medico-pacientes…:24`), incluido el error "No hay sesión de médico." que `MedicoService` lanza sin llamar al servidor (`medico.service.ts:48-50`) y el 404 por cita ajena.
  - **H-015:** en "Cambio que lo atiende" se agregó que R4 también debe incluir `CitaConsultaController`, que desde RFC-003 usa `CitaRepository` y `Estado_CitaRepository` directamente.
  - **H-032 (nuevo, 10:33, Baja / Correctivo / Pendiente):** al preparar las pruebas de `PacienteService` se vio que `actualizarPaciente` (`PacienteService.java:42-53`, usado por `PUT /api/paciente/{id}`) no copia el `telefono`: el cambio se pierde sin aviso. Se registró y no se tocó el código (fuera del alcance). No estoy seguro de que el frontend use hoy ese endpoint: un `grep` no encontró llamadas.
- Evidencia: `docs/HALLAZGOS.md`.

### [2026-10-21 entre 10:27 y 10:29] Tarea 9, Parte C: pruebas unitarias del frontend
- Qué se hizo: 6 archivos nuevos `*.caracterizacion.spec.ts` (32 pruebas, U01–U32; lista en `docs/PRUEBAS.md`, "Pruebas unitarias"): los 3 logins, `generarSlots()` de `registrar-cita`, el cierre de sesión de `welcome` y `admin-dashboard`, y `MedicoService`. Las clases se crean con `new` y reciben `jasmine.createSpyObj` en lugar de `HttpClient`, `Router` y `AuthService`; no se renderiza la plantilla ni se ejecuta `ngOnInit`, así que no se llama al backend. No se modificó código de la aplicación.
- Problema encontrado (10:28:03): la primera corrida (`ng test --include …`) no ejecutó nada: `Application bundle generation failed` con 4 errores `TS2305` en specs viejos. Causa: `tsconfig.spec.json` incluye `src/**/*.ts`, así que compila todos los `.spec.ts` aunque `--include` limite cuáles se ejecutan.
- Decisión: archivo nuevo `proyecto_valdiviezo/tsconfig.caracterizacion.json` (extiende `tsconfig.json` e incluye solo `src/**/*.caracterizacion.spec.ts`; el resto se compila por sus `import`) y `--ts-config=tsconfig.caracterizacion.json`. Alternativas descartadas: corregir o borrar los 4 specs viejos (lo prohíbe la tarea; decide el usuario); editar `tsconfig.spec.json` para excluirlos (cambia la configuración que usa `ng test` por defecto y esconde los specs rotos).
- Resultado (10:28:36–10:28:59, Chromium de la caché de Playwright `chromium-1217` vía `CHROME_BIN`, `ChromeHeadless`): `Executed 32 of 32 SUCCESS` · `TOTAL: 32 SUCCESS`.
- Caracterizan errores conocidos: U05, U11, U17 (H-029: error 500 mostrado como falta de conexión); U21, U22, U23 (H-022: horario por defecto 08:00–20:00). U32 comprueba el error "No hay sesión de médico." del servicio, que la pantalla convierte en el mensaje de H-029.
- Evidencia: salida citada en `docs/PRUEBAS.md`, "Resultados de la tarea 9".

### [2026-10-21 entre 10:29 y 10:31] Tarea 9, Parte D: pruebas unitarias del backend
- Qué se hizo: 5 clases nuevas (33 pruebas, U33–U62; U46 es parametrizada con 4 casos): `AuthControllerCaracterizacionTest` (login correcto de los 3 roles, 401 por clave o DNI, 400 por DNI o clave faltante, orden de búsqueda, 500 ante excepción), `CitaConsultaControllerCaracterizacionTest` (404 cita ajena o inexistente, 400 estado inexistente, cambio válido, y que acepta cualquier cambio de estado: H-031), `PacienteServiceCaracterizacionTest`, `MedicoServiceCaracterizacionTest` y `CitaServiceCaracterizacionTest`. Repositorios simulados con `@Mock` (Mockito); no usan la base. Ya existía `controller/AuthControllerTest.java` (prueba vieja); no se tocó y la nueva lleva otro nombre.
- Resultado (10:31:08–10:31:28, `./mvnw test`): `Tests run: 37, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS`. 33 nuevas pasan; las 3 clases viejas pasan (`CentroValdiviezoApplicationTests` 1, `AuthControllerTest` 1, `EspecialidadTest` 2 = 4 pruebas). `contextLoads` levanta Spring y necesita MySQL encendido (lo estaba). La traza `java.lang.RuntimeException: BD caida` de la salida la imprime `AuthController.java:100` (`e.printStackTrace()`) en U41, a propósito.
- Caracterizan errores conocidos: U46 (H-031), U49 (H-007, clave sin cifrar), U52 (H-032, no guarda teléfono), U41 (respuesta 500 que el frontend muestra como H-029).
- Evidencia: salida citada en `docs/PRUEBAS.md`, "Resultados de la tarea 9".

### [2026-10-21 entre 10:31 y 10:33] Tarea 9: estado de los specs viejos del frontend (para que el usuario decida)
- Qué se hizo: además de los 4 que no compilan, se corrieron los otros 11 specs viejos con un tsconfig temporal en el scratchpad de la sesión (fuera del repositorio) que excluye los 4 rotos. No se modificó ningún spec viejo.
- Resultado (10:32:38–10:32:47): `TOTAL: 9 FAILED, 3 SUCCESS` (12 pruebas). Fallan por falta de proveedores en el `TestBed`: `_HttpClient` (6: `CantEstadoCita`, `ServiceCita`, `ServiceMedico`, `ServicePaciente`, `MainMedico`, `MainPaciente`) y `NgbActiveModal` (2: `DetalleMedico`, `DetallePaciente`); y `App should render title` porque la plantilla ya no tiene "Hello, proyecto_valdiviezo". No compilan: `components.spec.ts`, `login/login.spec.ts`, `services/auth.spec.ts`, `services/usuario.spec.ts` (importan `Components`, `Login`, `Auth`, `Usuario`, que no existen). Detalle en `docs/PRUEBAS.md`, "Estado de los specs viejos".
- Por qué: son los specs que generó Angular al crear cada archivo y nunca se mantuvieron; en particular, con ellos `ng test` sin opciones no ejecuta ninguna prueba. **Decisión pendiente del usuario:** corregirlos, borrarlos o dejarlos fuera de la batería (como están ahora).
- Fallo propio: el primer tsconfig temporal (10:31:45) lo creé con `cat > … <<EOF` en la terminal, contra la regla de `CLAUDE.md` de crear archivos solo con Edit/Write. Estaba en el scratchpad, fuera del repositorio, y no se usó (la ruta absoluta no fue aceptada). Los siguientes se crearon con Write. El archivo `tsconfig.viejos.json` sigue en el scratchpad; no se borró porque borrarlo con la terminal también lo prohíbe la regla.
- Evidencia: salida citada en `docs/PRUEBAS.md`.

### [2026-10-21 10:35] Tarea 9, Partes B y E: documentación de la batería
- Qué se hizo: en `docs/PRUEBAS.md`, tipo de prueba "Unitaria"; regla de regresión ampliada (cada línea base corre también las unitarias del frontend y del backend y deben dar el mismo resultado); sección "Pruebas unitarias" con qué son las pruebas de caracterización, los dobles usados, los comandos exactos, la lista U01–U62 con su hallazgo, los resultados y el estado de los specs viejos. En `docs/ELEMENTOS_CONFIGURACION.md`, EC-18 "Pruebas unitarias de caracterización".
- Nota: el DNI de ejemplo de `MedicoServiceCaracterizacionTest` (`"1000000" + id`) coincide con el del médico 1 de la base para `id = 1`; no afecta (el repositorio está simulado) y el hook de datos de prueba solo revisa archivos que no son de pruebas.
- Evidencia: `docs/PRUEBAS.md`, `docs/ELEMENTOS_CONFIGURACION.md`.
- Estado del entorno: backend (8080) y frontend (4200) siguen corriendo; no se reiniciaron ni se tocó la base de datos (las pruebas unitarias no la usan).
- Batería P01–P24: **no se ejecutó** en esta tarea. Motivo: no cambió ningún archivo de la aplicación (`git status` solo muestra archivos de prueba nuevos, `tsconfig.caracterizacion.json` y `docs/`), así que no hay línea base nueva contra la que comparar; los resultados vigentes siguen siendo los de LB-3. Si el usuario considera que la regla de `CLAUDE.md` ("cada cambio se valida con la batería completa") se aplica también a esta tarea, queda pendiente correrla.

### [2026-10-21 10:35] Commit de la tarea 9 (sin tag)
- Qué se hizo: commit de las 11 pruebas nuevas (6 del frontend, 5 del backend), `tsconfig.caracterizacion.json` y la documentación. Sin tag: no cambia la aplicación, solo agrega pruebas.
- Evidencia: commit `cb8ee8da9b105e885380de98ef085a59081e2054` (2026-10-21 10:35:50) — "Pruebas unitarias de caracterizacion (frontend y backend)". Esta entrada se agregó en un commit posterior porque un commit no puede contener su propio hash.

### [2026-10-21 10:49] Tarea 10: inicio de sesión de trabajo y estado del entorno
- Qué se hizo: lectura de `CLAUDE.md`, de las últimas entradas de esta bitácora y de la columna "Cambio que lo atiende" de `HALLAZGOS.md`; `git log --oneline -5` (último commit `0512fef`) y `git tag` (`LB-0` a `LB-3`). `date` 10:49:28.
- Estado del entorno: backend en 8080 (`GET /` → 404: el servidor responde y la ruta no existe) y frontend en 4200 (`GET /` → 200), corriendo desde la sesión anterior (pids 18544 y 5456). Árbol de trabajo limpio.
- **Excepción a CLAUDE.md autorizada por el usuario solo para esta tarea:** mover y eliminar archivos con `git mv` y `git rm`.

### [2026-10-21 entre 10:49 y 10:53] RFC-004 registrada y aprobada (H-017, H-009, H-027, H-011, H-021, H-026)
- Qué se hizo: inventario de todos los archivos versionados, grafo de imports de `src/app` (imports relativos, `loadComponent`, `templateUrl`/`styleUrl` y selectores en plantillas) y búsqueda de referencias a rutas viejas. Con eso se escribió `docs/rfc/RFC-004.md` (10:52) con la tabla completa "ruta anterior → ruta nueva", la lista de eliminaciones con su motivo y la evidencia de búsqueda. A las 10:53 pasó por "¿Solicitud completa?", "Investigación preliminar", "¿Es correcta?", "Aprobado" (Comité de control de configuración, Brayan) y "Asignado".
- Por qué ocurre H-017 (causa, antes de mover): el frontend creció con tres convenciones a la vez —módulos generados con `ng generate module` en `features/` que quedaron vacíos, carpetas por rol creadas después y componentes sueltos en `src/app`— y nadie migró lo anterior; el backend se generó con Spring Initializr dentro de una carpeta `backend/` ya existente. H-009 y H-027: los logins se reescribieron como `*.component.ts` y los archivos viejos no se borraron. H-011: `app.html` dejó de usar enlaces, pero `app.ts` conservó los imports. H-021: `WebConfig` se creó en un paquete (`com.config`) fuera del que escanea `@SpringBootApplication`. H-026: una clase de prueba manual quedó en `src/main`.
- Decisiones de ubicación (detalle en RFC-004, "Criterio de ubicación"): `usuario.ts` a `core/services/` aunque queda sin uso; `main-paciente` y los componentes de `features/cita/` a `features/paciente/legacy/`; `main-medico` y `detalle-medico` a `features/admin/legacy/` porque son gestión de médicos, no el módulo del médico.
- Detectado en la investigación: los hooks `proteger-pruebas.js` y `datos-prueba.js` dejarían de reconocer `backend/src/test/` (su expresión exigía un nivel intermedio) y la excepción `BDPostaMedica.sql` dejaría de aplicarse. Se incluyó su ajuste en la RFC.
- Alternativas descartadas: ver la tabla "Alternativas evaluadas" de RFC-004 (en especial: mover `WebConfig` en lugar de eliminarlo, borrar las rutas `/medico` y `/gestion-pacientes-legacy`, eliminar huérfanos fuera de la lista aprobada, renombrar "aprobadas", crear `playwright.config.ts`).
- Evidencia: `docs/rfc/RFC-004.md`.

### [2026-10-21 entre 10:54 y 10:56] RFC-004: movimientos y eliminaciones
- Qué se hizo: se detuvieron backend y frontend (10:54:14) porque tenían abiertas las carpetas que se movían. Desde las 10:54:24: `git mv` de `BDPostaMedica.sql` → `database/`, `tests/` → `e2e/tests/`, `package.json` → `e2e/`, `error_cita.png` → `docs/evidencias/`; `git rm -r --cached test-results` (queda en disco, ignorado); aplanado del backend con una carpeta temporal (`git mv backend _backend_tmp`, `git mv _backend_tmp/backend backend`, `git mv _backend_tmp/.vscode backend/.vscode`); `git mv proyecto_valdiviezo frontend`. Luego, dentro de `frontend/src/app`, un `git mv` por archivo según la tabla de RFC-004 (228 renombrados en total).
- Directorios: para que `git mv` tuviera carpeta destino se crearon con `mkdir -p`, y las carpetas que quedaron vacías (incluida `_backend_tmp`) se quitaron con `rmdir` / `find -empty -exec rmdir`, que solo borran carpetas vacías. No son archivos; lo dejo registrado porque CLAUDE.md pide no crear ni borrar con la terminal.
- Problema encontrado: el primer `git rm` de los candidatos falló ("the following files have changes staged in the index") porque el renombrado de la carpeta los dejó como cambios en el índice; el script siguió y los bucles de `git mv` movieron 4 de ellos junto con su carpeta (`login-admin.ts`/`.html` y `login-paciente.ts`/`.html` a `features/auth/…`; `components.*` quedó en `features/usuario/`). Lo mismo pasó en el backend. Fallo propio: el script no se detenía ante el error. Se comprobó que los archivos tenían el contenido de HEAD y se eliminaron con `git rm -f` desde su ruta nueva (10:55:41). Resultado final: 12 archivos del frontend y 2 del backend como "D" de su ruta original.
- Los 2 specs eliminados (`login/login.spec.ts`, `components.spec.ts`) no pasaron por el hook de pruebas protegidas: `git rm` es un comando de terminal y el hook solo intercepta Edit/Write/MultiEdit. Su eliminación estaba aprobada en la regla 4 de la tarea.
- Evidencia: `git status` del commit de LB-4.

### [2026-10-21 entre 10:56 y 11:05] RFC-004: referencias actualizadas
- Qué se hizo, con Edit/Write: imports relativos de 20 archivos `.ts`; `app.routes.ts` (rutas de los `import` y `loadComponent`; las URL no cambian); `app.ts` (sin `RouterLink` ni `RouterLinkActive`, H-011); `cerrar-sesion.caracterizacion.spec.ts` (2 rutas de `import`; el hook devuelve "ask" para ese archivo y la edición se aplicó; no tengo constancia de si la confirmación fue manual o la resolvió el modo de permisos); `backend/.vscode/launch.json` (se quitó la configuración "prueba", cuya clase se eliminó); `.gitignore`; los 2 hooks; `CLAUDE.md` (descripción de los hooks).
- Hooks probados a las 11:05 con entradas JSON: `backend/src/test/java/…/AuthControllerTest.java` → "ask"; `e2e/tests/medico-flow.spec.ts` → "ask"; `frontend/src/app/core/services/auth.ts` → sin pregunta; hook de datos con `10000001` en `database/BDPostaMedica.sql` → sin pregunta (excepción), en `frontend/src/app/x.ts` → "ask", en `backend/src/test/java/X.java` → sin pregunta (archivo de pruebas).
- Angular (`angular.json`, `tsconfig*.json`) y `.vscode/launch.json` de la raíz no tenían rutas que cambiar (son relativas a su carpeta o no mencionan carpetas). No existe configuración de Playwright.

### [2026-10-21 entre 11:05 y 11:09] RFC-004: compilación, unitarias y Playwright
- `ng build` (11:05:49, producción por defecto): sin errores, 2 advertencias (presupuesto inicial 808.66 kB; `jquery` no ESM en `detalle-medico.ts`). Como las líneas base anteriores se midieron con `ng build --configuration development`, se repitió así (11:06:17): **sin errores y sin advertencias** (antes: 2 NG8113).
- Para saber si las 2 advertencias de producción eran nuevas, se compiló el tag `LB-3` en un worktree temporal en el scratchpad de la sesión (fuera del repositorio), con un enlace de unión (`mklink /J`) a `frontend/node_modules`: producción dio NG8113 ×2 + presupuesto (808.66 kB, mismo tamaño) + `jquery`; desarrollo, NG8113 ×2. Conclusión: ninguna advertencia nueva. Después se quitó el enlace con `rmdir` (solo el enlace; `frontend/node_modules` siguió con sus 374 entradas) y el worktree con `git worktree remove --force` (11:07:09).
- Unitarias del frontend (11:07:24–11:07:31): `Executed 32 of 32 SUCCESS` · `TOTAL: 32 SUCCESS`. La línea `ERROR: 'Error login', Object{status: 0}` de la salida es un `console.error` que imprime un componente de login en una de las pruebas con error de conexión simulado (`status: 0`); no identifiqué cuál. No es un fallo: las 32 pasan.
- BD recargada (11:07:47–11:07:48) desde `database/BDPostaMedica.sql`: 21 citas.
- `./mvnw test` en `backend/` (11:07:55–11:08:14): `Tests run: 37, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS`. En `target/` no quedaron `WebConfig*.class` ni `prueba*.class`.
- Backend (`./mvnw spring-boot:run` desde `backend/`, arrancó 11:08:44) y frontend (`npm start` desde `frontend/`) levantados desde las carpetas nuevas. `npm install` en `e2e/` (11:08:40): `@playwright/test` 1.64.1.
- Playwright desde `e2e/` (11:08:54–11:09:05): **6 passed**, igual que en LB-3.
- Evidencia: salidas citadas en `docs/PRUEBAS.md`, "Resultados de LB-4".

### [2026-10-21 entre 11:11 y 11:20] RFC-004: batería de regresión P01–P24 (LB-4)
- Qué se hizo: BD recargada otra vez a las 11:11:51 (la corrida de Playwright crea y borra citas y mueve el autoincremento; P12 espera la cita 22). Batería completa en el orden del documento: API con `curl` y `mysql`; navegador con dos scripts de Playwright en el scratchpad de la sesión (`bateria-lb4.js`, `bateria-lb4-parte2.js`, creados con Write, fuera del repositorio). Para P11 y P18 se apagó el backend (pid 26492, 11:19:58) y se volvió a encender después.
- Resultado: **las 24 pruebas dieron lo mismo que en LB-3** (19 PASA · 5 FALLA: P04, P13, P14, P15, P16). Sin efectos no deseados.
- Fallos propios y notas de método: (1) la primera corrida del script se detuvo en P07 porque buscaba `#dni` y el login de admin usa `#usuario`; se corrigió el script y se repitieron P05–P13 (los logins no modifican la base). (2) En P13 recorté la salida del `curl` y el código HTTP no quedó visible; la respuesta trae `{"idCita":23,…}` y la BD tiene 2 reservas, igual que en LB-3. (3) P11 con el backend apagado: se cargaron en localStorage las 3 claves que deja el login de médico (sin backend no se puede iniciar sesión).
- Evidencia: 8 capturas `docs/evidencias/lb4-*.png`; sección "Resultados de LB-4" y columna "LB-4 Reorg" de `docs/PRUEBAS.md`.

### [2026-10-21 entre 11:20 y 11:26] RFC-004: documentación y cierre
- Qué se hizo: `README.md`, `SETUP.md`, `docs/PRUEBAS.md` (comandos, rutas de U01–U62, resultados de LB-4) y `docs/ELEMENTOS_CONFIGURACION.md` (rutas y conteos: 69 archivos `.java`, 54 `.ts` sin specs) actualizados. En `HALLAZGOS.md`: nota inicial sobre las rutas anteriores a LB-4 (las ubicaciones históricas no se reescribieron); H-017, H-009, H-027, H-011, H-021 y H-026 → "Cerrado (RFC-004, LB-4)"; H-023 con nota de que "aprobadas" no se renombró (cambiaría la URL); hallazgos nuevos **H-033** (pruebas generadas por Angular que no compilan o fallan, Baja / Preventivo / Pendiente), **H-034** (huérfanos que no estaban en la lista de candidatos, incluido el archivo vacío `frontend/npm`) y **H-035** (rutas `/medico` y `/gestion-pacientes-legacy` aparentemente sobrantes). Evaluación post-implementación en RFC-004 (cerrada 11:26).
- Búsqueda final de rutas viejas (11:25): solo quedan en documentos históricos o como `e2e/tests/`; salida pegada en RFC-004.
- `app.routes.ts` figura en Git como borrado + agregado (similitud 41 %); su historia se sigue con `git log --follow -M30% -- frontend/src/app/app.routes.ts`.
- **Estado del entorno al cerrar:** backend (8080, desde `backend/`) y frontend (4200, desde `frontend/`) corriendo; la BD tiene las citas 22 (Confirmada) y 23 (Cancelada) de la batería. Restos en disco **ignorados por Git** que no borré porque CLAUDE.md no permite borrar archivos con la terminal: `node_modules/`, `package-lock.json` y `test-results/` en la raíz (de cuando Playwright vivía ahí; ya no se usan, el nuevo está en `e2e/`), y `.playwright-mcp/`. El usuario puede borrarlos a mano.
- Evidencia: `docs/rfc/RFC-004.md`, `docs/HALLAZGOS.md`, `docs/PRUEBAS.md`, `docs/ELEMENTOS_CONFIGURACION.md`.

### [2026-10-21 11:27] Commit y tag de la línea base LB-4
- Qué se hizo: commit de RFC-004 (228 renombrados, 16 eliminados —14 archivos de código, `test-results/.last-run.json` y la ruta vieja de `app.routes.ts`—, 11 modificados y 10 agregados: RFC-004, 8 evidencias y la ruta nueva de `app.routes.ts`) y tag anotado `LB-4` ("Linea base 4: estructura reorganizada").
- Por qué: congelar la estructura reorganizada; es la línea base contra la que se comparará la refactorización DRY (LB-5).
- Evidencia: commit `e7829cb916e1d9a97173225269150af7fcf9872a` (2026-10-21 11:27:58) — "RFC-004: reorganizacion de la estructura de carpetas". Esta entrada se agregó en un commit posterior porque un commit no puede contener su propio hash.

### [2026-10-21 14:44] Tarea 11: inicio de sesión de trabajo y estado del entorno
- Qué se hizo: lectura de `CLAUDE.md`, de las últimas entradas de esta bitácora y de la columna "Cambio que lo atiende" de `HALLAZGOS.md`; `git log --oneline -5` (último commit `f68ca7b`) y `git tag` (`LB-0` a `LB-4`). `date` 14:43:28 y 14:44:44.
- Estado del entorno: backend en 8080 (`GET /` → 404: responde y la ruta no existe; pid 26952) y frontend en 4200 (`GET /` → 200; pid 19224), corriendo desde antes de la sesión. Árbol de trabajo limpio.
- Tarea: R1 DRY (RFC-005: H-008, H-010, H-030) y después R2 SRP (RFC-006: H-018). Mantenimiento preventivo: no cambia el comportamiento.

### [2026-10-21 entre 14:44 y 14:55] RFC-005: investigación, capturas "antes", P25 sobre LB-4 y registro
- Por qué ocurre el problema (H-008, antes de tocar código): los 3 logins se escribieron copiando uno del otro, y las correcciones posteriores (RFC-001, RFC-002) se aplicaron en cada copia por separado. Cada regla (formato del DNI, textos, chequeo de rol, claves de sesión, lectura del 401) vive en 3 lugares y las copias ya divergieron en detalles. H-010: cada controlador se generó con su `@CrossOrigin` antes de que existiera la configuración global de `WebSecurityConfig`; al agregarla, nadie quitó las anotaciones.
- Comparación de las 3 copias (detalle en RFC-005, "Diferencias entre las copias"): 5 diferencias. **H-030 inalcanzable**: el frontend solo llama a `/login`; `grep -rn '"/login"\|setFilterProcessesUrl' backend/src/main` → `AuthController.java:35` y una línea comentada de `WebSecurityConfig.java:36`; las 3 respuestas 200 de `AuthController` llevan `success: true`. **Una diferencia alcanzable (D3)**: con `nombres` vacío, paciente y médico no guardan `userName` y admin guarda `" Apellidos"`; `POST /usuarios/nuevo`, `/api/paciente/crear` y `/api/medico/crear` aceptan ese dato sin autenticación. Se conserva (parámetro por rol) y se registra H-036.
- Capturas "antes" de las 3 pantallas de login en 5 estados (14:48:04–14:48:52). Al repetirlas sin cambios (control), 2 de 15 variaban por las transiciones CSS de 0.3 s. Fallo de método propio: el script no esperaba el fin de las transiciones. Se ajustó (sin foco, mouse fuera, `animations: 'disabled'`) y se volvieron a tomar las 15 "antes" más 2 corridas de control (14:50:10–14:52:38): queda un ruido de 7 píxeles en el borde de la caja de admin (`docs/evidencias/lb5-capturas-comparacion.txt`).
- P25 sobre LB-4 (14:53:15–14:53:19): preflight desde `localhost:4200` → 200 con las cabeceras CORS; desde `otro-origen.example` → 403 `Invalid CORS request`, **también en controladores con `origins = "*"`** y en `/usuarios`, que no tiene anotación. Evidencia: `docs/evidencias/lb4-P25-cors.txt`.
- RFC-005 registrada a las 14:55 y aprobada por el Comité (Brayan) según la solicitud de la tarea 11.
- Alternativas descartadas: clase base con herencia y servicio inyectable (cambian los constructores y romperían las pruebas de caracterización); un solo componente con el rol por ruta (cambia rutas); unificar D3 (cambia el comportamiento); mensaje "Credenciales incorrectas" para H-030 (falso); `WebMvcConfigurer` para el CORS (un segundo lugar). Detalle en RFC-005.

### [2026-10-21 entre 14:55 y 14:58] RFC-005: implementación
- Qué se hizo, con Write/Edit: `frontend/src/app/features/auth/login-comun.ts` (nuevo: `MENSAJES_LOGIN`, `ConfigLogin` y las 3 configuraciones, `validarDniPeruano`, `validarFormularioLogin`, `mensajeRolEquivocado`, `resolverRespuestaLogin`, `guardarSesion`, `mensajeErrorLogin`); los 3 `login-*.component.ts` reescritos para delegar (mismos campos, constructor y métodos públicos; los `console.log`/`console.error` de cada uno se conservaron); `login-comun.unitaria.spec.ts` (nuevo, U63–U71) y `frontend/tsconfig.unitarias.json` (nuevo). Backend: se quitó `@CrossOrigin` de los 13 controladores y el `import` de `CrossOrigin` en `AuthController` y `CitaConsultaController` (los otros 11 usan `annotation.*`).
- No se tocaron plantillas, CSS, rutas, `AuthService`, `WebSecurityConfig` ni ninguna prueba existente (`git diff --stat -- '*.caracterizacion.spec.ts'` vacío).
- Corrección propia en la RFC: había escrito que 3 controladores importaban `CrossOrigin` por nombre; son 2.

### [2026-10-21 entre 14:58 y 15:08] RFC-005: validación (6 pasos)
1. `ng build --configuration development` (14:58:08–14:58:15): sin errores ni advertencias (igual que LB-4). Producción (14:58:34): las 2 advertencias de LB-4 (presupuesto 808.17 kB, antes 808.66 kB; `jquery`).
2. Unitarias del frontend, comando de LB-4 (14:58:42–14:58:49): `Executed 32 of 32 SUCCESS` · `TOTAL: 32 SUCCESS`. Con las nuevas: `Executed 41 of 41 SUCCESS` (14:58:49–14:58:55).
3. Backend detenido (pid 26952, 14:59:23); BD recargada (14:59:34, 21 citas); `./mvnw test` (14:59:35–14:59:55): `Tests run: 37, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS`. Backend reiniciado (15:00:13, pid 18328). P25 (15:00:19–15:00:24): `diff` con LB-4 sin diferencias (`docs/evidencias/lb5-P25-cors.txt`).
4. Playwright desde `e2e/` (15:00:50–15:00:57): **6 passed**.
5. BD recargada (15:05:35); batería P01–P24 entre 15:05:36 y 15:07:48 (scripts del scratchpad: `bateria-api.sh` nuevo para la parte de API; los de navegador son copia de los de LB-4 con otro prefijo de capturas). Backend apagado para P11 y P18 (pid 18328, 15:07:32) y reiniciado (15:08:07, pid 22736). **Las 24 dieron lo mismo que en LB-4.** P13 muestra ahora el código `HTTP 200` del POST duplicado, que en LB-4 quedó recortado.
6. Capturas "después" (15:01:04–15:01:53) y 2 corridas de control a continuación (no registré la hora de fin; terminaron antes de la recarga de la BD de las 15:05:35): 12 de 15 idénticas píxel a píxel; las 3 de admin con diferencias de 7–18 píxeles en el borde de la caja, el mismo ruido que entre corridas del mismo código; para cada una hay un par LB-4/LB-5 idéntico.
- Evidencia: `docs/PRUEBAS.md`, "Resultados de LB-5"; `docs/evidencias/lb5-*`.

### [2026-10-21 entre 15:08 y 15:12] RFC-005: documentación y cierre
- `PRUEBAS.md`: P25, resultados de LB-5, U63–U71, comando de las unitarias completas, columna "LB-5 DRY". `HALLAZGOS.md`: H-008, H-010 (con la precisión de que las anotaciones no tenían efecto) y H-030 → "Cerrado (RFC-005, LB-5)"; **H-036** nuevo (sesión con `nombres` vacío, Baja / Correctivo / Pendiente). `ELEMENTOS_CONFIGURACION.md`: EC-01, EC-02 (55 `.ts`), EC-07 (`tsconfig.unitarias.json`) y EC-18. RFC-005 cerrada a las 15:11.

### [2026-10-21 15:12] Commit y tag de la línea base LB-5
- Qué se hizo: commit de RFC-005 (13 controladores y 3 componentes modificados; `login-comun.ts`, su spec, `tsconfig.unitarias.json`, RFC-005 y evidencias agregados; 4 documentos actualizados) y tag anotado `LB-5` ("Linea base 5: R1 DRY").
- Evidencia: commit `bc282c34b0a52a26eba9367e7bf324b34b600b6d` (2026-10-21 15:12:22) — "RFC-005: R1 DRY, logica de login y CORS en un solo lugar". Esta entrada va en un commit posterior porque un commit no puede contener su propio hash.

### [2026-10-21 entre 15:12 y 15:16] RFC-006: investigación, capturas "antes" y registro
- Por qué ocurre el problema (H-018, antes de tocar código): la regla de horarios se escribió directamente dentro del componente de la pantalla, en el mismo método que recibe la respuesta HTTP, porque no había otro lugar donde ponerla (no existe un servicio ni un módulo de reglas de citas). Así, la pantalla tiene dos razones para cambiar: el formulario y la regla.
- Revisión de `generarSlots()` y de U19–U23. Detalles que se conservan (RFC-006, sección 2): con horario, `c.hora_cita.substring(0,5)` sin comprobar nulo (y `Cita.hora_cita` admite NULL, `database/BDPostaMedica.sql:125`): **alcanzable**, se conserva y se registra H-037. Se analizó el estado de la lista cuando se lanza ese `TypeError`: la excepción ocurre siempre antes del primer `push` (para agregar un bloque, `find` debe recorrer todas las citas y llega a la nula), así que vaciar la lista antes de calcular reproduce el estado original.
- BD recargada (15:13:30). Capturas "antes" de "Registrar Cita": primero lunes y sábado (15:13:30–15:14:10); como el horario del médico 1 es 08:00–20:00, igual al de por defecto, esas dos no distinguían las ramas: se agregaron miércoles 2023-09-20 (con horario, 11:00 ocupada) y sábado 2023-07-01 (por defecto, 09:00 ocupada) y se repitieron las 4 con 2 corridas de control (15:14:38–15:15:55): idénticas.
- RFC-006 registrada y aprobada (Comité, Brayan) a las 15:16.
- Alternativas descartadas: servicio inyectable (cambia el constructor), mover la regla al backend (cambia la API), corregir H-022 o unificar el chequeo de nulos (cambian el comportamiento), repetir la condición del horario por defecto en el componente para el mensaje de consola (repite la regla). Detalle en RFC-006.

### [2026-10-21 entre 15:16 y 15:17] RFC-006: implementación
- Qué se hizo, con Write/Edit: `frontend/src/app/features/paciente/registrar-cita/horarios-cita.ts` (nuevo: `DIAS_SEMANA`, `MINUTOS_POR_BLOQUE`, `HORARIO_POR_DEFECTO` 08:00–20:00, `diaDeLaSemana`, `horaAMinutos`, `minutosAHora`, `calcularHorariosDisponibles` → `{ horarios, porDefecto }`); en `registrar-cita.component.ts`, `generarSlots()` delega (conserva los 2 `console.log`), `timeToMinutes()` y `minutesToTime()` delegan, y se agregó el `import`. `horarios-cita.unitaria.spec.ts` (nuevo, U72–U79; U79 compara con una copia literal del algoritmo de LB-5 en 2000 entradas generadas con una semilla fija).
- Fallo propio de método: edité el componente en dos pasos (cuerpo y después `import`), y el estado intermedio no compilaba. Ver la entrada siguiente.

### [2026-10-21 entre 15:17 y 15:24] RFC-006: validación (6 pasos)
1. `ng build --configuration development` (15:17:41–15:17:47): sin errores ni advertencias. Producción: las 2 de siempre (808.17 kB; `jquery`).
2. Unitarias (15:17:56–15:18:10): comando de LB-4 `Executed 32 of 32 SUCCESS`; todas `Executed 49 of 49 SUCCESS`.
3. BD recargada (15:18:19); `./mvnw test` (15:18:20–15:18:33): `Tests run: 37, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS`. P25 (15:19:11–15:19:16): idéntica a LB-5.
4. Playwright: **primera corrida 5 passed, 1 failed** (`admin-reportes.spec.ts`, timeout de 30 s; 15:18:33–15:19:11). Sola pasó (15:19:2x, hora exacta no registrada) y la suite completa dio 6/6 dos veces (15:19:34, 15:19:41). Para no quedarme con "pasó al repetir", probé la hipótesis del aviso de error de `ng serve`: a las 15:20:11 quité el `import` del componente con Edit, esperé 8 s, lo volví a poner (15:20:26) y corrí la suite (15:20:35): **falló igual** (`admin-reportes.spec.ts`), y su `error-context.md` muestra sobre el login de admin el aviso `TS2304: Cannot find name 'diaDeLaSemana'. src/app/features/paciente/registrar-cita/registrar-cita.component.ts:73:48`. Causa confirmada: el aviso del servidor de desarrollo tapa el botón en la primera carga; no es la aplicación. Corrida final con el código definitivo (15:21:25–15:21:32): **6 passed**. El archivo quedó igual que antes del experimento (`git diff`: el `import` en la misma línea). Registrado como H-038.
5. BD recargada (15:21:42); batería P01–P24 (15:22–15:24) con los mismos scripts de LB-5; `diff` de cada salida contra la de LB-5 sin las líneas de hora: **idénticas** (la única línea de más es el código 500 de P04, que en LB-5 consulté aparte con el mismo resultado). P11 y P18 con el backend apagado (pid 22736, 15:24:06): idénticas. Backend reiniciado (15:24:39, pid 12096).
6. Capturas "después" (15:21:43–15:22:09): las 4 con el mismo sha256 que "antes"; 0 píxeles distintos (`docs/evidencias/lb6-capturas-comparacion.txt`).

### [2026-10-21 entre 15:24 y 15:28] RFC-006: documentación y cierre
- `PRUEBAS.md`: resultados de LB-6, U72–U79, columna "LB-6 SRP", resumen. `HALLAZGOS.md`: H-018 → "Cerrado (RFC-006, LB-6)"; nota en H-022 (la regla se movió sin cambios, sigue abierto); **H-037** (cita con `hora_cita` nula, Baja / Correctivo) y **H-038** (Playwright y el aviso de error de `ng serve`, Baja / Preventivo) nuevos. `ELEMENTOS_CONFIGURACION.md`: EC-02 (56 `.ts`) y EC-18. RFC-006 cerrada a las 15:27.
- **Estado del entorno al cerrar:** backend (8080, pid 12096, desde `backend/`) y frontend (4200, pid 19224, el mismo de antes de la sesión) corriendo; la BD tiene las citas 22 (Confirmada) y 23 (Cancelada) de la batería. Archivos de trabajo en el scratchpad de la sesión (scripts de batería y capturas, corridas de control), fuera del repositorio.

### [2026-10-21 15:27] Commit y tag de la línea base LB-6
- Qué se hizo: commit de RFC-006 (`registrar-cita.component.ts` modificado; `horarios-cita.ts`, su spec, RFC-006 y evidencias agregados; 4 documentos actualizados) y tag anotado `LB-6` ("Linea base 6: R2 Responsabilidad Unica").
- Evidencia: commit `8d17c2814f714b3e851ac5fcdc5a7ae45643227e` (2026-10-21 15:27:59) — "RFC-006: R2 SRP, regla de horarios separada de la pantalla". Esta entrada va en un commit posterior porque un commit no puede contener su propio hash.
- Cumplimiento de CLAUDE.md en la tarea 11: archivos del repositorio creados y modificados solo con Write/Edit; ninguna prueba existente modificada; hooks sin preguntas (no se editó ningún archivo de pruebas existente). Excepciones a registrar: (1) los archivos de evidencia `.png` los generó Playwright desde scripts (como en las líneas base anteriores), no Write; (2) los scripts del scratchpad se copiaron con `sed` (fuera del repositorio); (3) en el experimento de H-038 modifiqué el código a propósito (quitar y volver a poner un `import`) para confirmar la causa, y lo dejé igual.

### [2026-10-21 15:44] Tarea 12: inicio de sesión de trabajo y estado del entorno
- Qué se hizo: lectura de `CLAUDE.md`, de las últimas entradas de esta bitácora y de la columna "Cambio que lo atiende" de `HALLAZGOS.md`; `git log --oneline -5` (último commit `4780beb`) y `git tag` (`LB-0` a `LB-6`). `date` 15:44:18.
- Estado del entorno: backend (8080) y frontend (4200) responden (`Test-NetConnection` → `True` en ambos), corriendo desde la sesión anterior; no hubo que levantarlos. Árbol de trabajo limpio.
- Tarea: R3 Abierto/Cerrado (RFC-007, H-019) y después R4 IoC (RFC-008, H-015, H-020). Condición de la tarea: si una refactorización obliga a cambiar cómo una prueba `*CaracterizacionTest.java` construye la clase, detenerse y consultar al usuario.

### [2026-10-21 15:44] Tarea 12 DETENIDA antes de modificar código: R3 y R4 obligan a cambiar cómo las pruebas de caracterización construyen las clases
- Qué se revisó: `AuthController.java`, `AuthControllerCaracterizacionTest.java`, `AuthControllerTest.java` (prueba vieja), `CitaConsultaControllerCaracterizacionTest.java` y las 3 `*ServiceCaracterizacionTest.java`.
- **R3 (RFC-007):** `AuthControllerCaracterizacionTest` (U33–U41) crea el controlador con `@InjectMocks private AuthController authController;` y le da 3 `@Mock` de repositorio (`PacienteRepository`, `MedicoRepository`, `UsuarioRepository`). La tarea pide que `AuthController` recorra una lista de autenticadores por rol, es decir, que su dependencia pase a ser `List<AutenticadorRol>` (y los repositorios pasen a las 3 implementaciones). Mockito no puede armar esa lista con los mocks de repositorio: con inyección por constructor pasa `null` en el parámetro que no resuelve, y U33–U41 fallarían con `NullPointerException` (que el `catch` del controlador convertiría en 500). La prueba vieja `AuthControllerTest` tiene el mismo `@InjectMocks` con los 3 repositorios. Para que `AuthController` no cambie al agregar un rol, no puede conocer los repositorios; por eso no hay forma de cumplir el pedido de la Parte A sin cambiar cómo la prueba construye la clase.
- Alternativas descartadas por contradecir CLAUDE.md o la tarea: (a) dejar en `AuthController` los 3 repositorios por campo y armar los autenticadores dentro → agregar un rol obliga a modificar `AuthController` (no es OCP); (b) mantener los repositorios en el controlador "solo para que la prueba compile" → código acomodado a la prueba; (c) un constructor extra o valores por defecto cuando la lista es `null` → condición especial para la prueba.
- **R4 (RFC-008), no iniciada** (la tarea manda no empezar R4 si R3 se detiene), pero se revisó para que el usuario decida ambas a la vez: `CitaConsultaControllerCaracterizacionTest` (U42–U46) construye `new CitaConsultaController(citaRepository, estadoCitaRepository)`. El punto 2 de R4 (el controlador depende de `ICitaService`, no de repositorios) cambia ese constructor y la prueba deja de compilar. Los puntos 1 y 3 en los servicios (`CitaService`, `MedicoService`, `PacienteService` con `@InjectMocks` y un `@Mock` de su repositorio) no deberían romper: Mockito usa el constructor y resuelve el repositorio por tipo; no se ejecutó, es una expectativa.
- Opciones para el usuario (detalle en el reporte del chat): (1) autorizar que se modifique la construcción en `AuthControllerCaracterizacionTest` (y `AuthControllerTest`): crear los 3 autenticadores con los mismos mocks y pasarlos en orden paciente → médico → administrador, sin tocar ninguna aserción; ídem en `CitaConsultaControllerCaracterizacionTest` para R4 (crear `CitaServiceImpl` con los 2 repositorios simulados y pasarlo al controlador); (2) dejar las pruebas como están y mover su caracterización a pruebas nuevas, con las viejas marcadas como obsoletas (la decisión de retirar pruebas es del usuario); (3) no hacer R3/R4 tal como están planteadas.
- Estado: ningún archivo de código ni de pruebas modificado; sin RFC-007/RFC-008 registradas; sin commit ni tag. Solo cambió esta bitácora.

### [2026-10-21 15:52] Decisión del usuario: opción 1 (cambiar solo la construcción en las pruebas)
- Decisión: en `AuthControllerCaracterizacionTest`, `AuthControllerTest` y `CitaConsultaControllerCaracterizacionTest` se modifican **solo** las líneas que construyen el objeto bajo prueba (`@InjectMocks`, `new` y la preparación de los autenticadores o del servicio a partir de los **mismos** mocks). Prohibido tocar aserciones, `verify`, `when/thenReturn`, datos de entrada o nombres de los tests. Si hiciera falta tocar una aserción, detenerse.
- Commit separado: el usuario pidió un commit aparte con las pruebas antes del de la refactorización, si las pruebas pueden pasar contra el código actual. **No es posible:** la construcción nueva usa clases que todavía no existen (`AutenticadorPaciente`… en R3; `CitaService(CitaRepository, Estado_CitaRepository)` como dependencia del controlador en R4), así que el commit de pruebas solo no compilaría. Según la condición 2 del usuario, el cambio va junto con cada RFC y cada RFC tiene una sección "Cambios en pruebas" con el diff línea por línea y su justificación.

### [2026-10-21 15:53] RFC-007 registrada y aprobada (H-019)
- Qué se hizo: `docs/rfc/RFC-007.md` con el diseño, los diagramas antes/después, "Principio aplicado" y la demostración del rol "recepcionista" (solo un archivo nuevo; `AuthController` no cambia). Aprobada por el Comité (Brayan) según la tarea 12.
- Por qué ocurre H-019 (antes de tocar código): `AuthController` se escribió con los tres roles que existían, cada uno como un bloque `if` copiado del anterior, y dependía directamente de los 3 repositorios. No hay una abstracción "autenticador de un rol", así que el controlador es el único lugar donde se puede agregar un rol.
- Alternativas descartadas: ver la tabla de RFC-007 (repositorios dentro del controlador, `Map` por tipo, lista en una clase de configuración, clase base abstracta, corregir H-007).

### [2026-10-21 entre 15:53 y 16:03] RFC-007: implementación
- Qué se hizo, con Write/Edit: paquete nuevo `backend/src/main/java/com/centro_valdiviezo/backend/autenticacion/` con `AutenticadorRol` (interfaz) y `AutenticadorPaciente` (`@Order(1)`), `AutenticadorMedico` (`@Order(2)`) y `AutenticadorAdministrador` (`@Order(3)`), cada uno con el bloque que antes estaba en el controlador, sin cambios de lógica; `AuthController` recibe `List<AutenticadorRol>` por constructor (atributo `final`) y la recorre. Pruebas nuevas U80 (`AutenticadorRolOrdenTest`) y U81 (`AuthControllerExtensionTest`).
- Pruebas existentes: la primera vez, el usuario rechazó las 3 ediciones de `AuthControllerCaracterizacionTest.java` porque el aviso del hook no mostraba la ruta completa. Se le mostraron la ruta y los cambios; confirmó y pidió que antes de cada edición de prueba se escriba la ruta relativa en el chat. Luego se aplicaron los cambios de construcción en `AuthControllerCaracterizacionTest.java` y `AuthControllerTest.java` (diff en RFC-007, "Cambios en pruebas": solo `@InjectMocks` → construcción explícita con los mismos mocks, e imports).
- Hora exacta de la implementación: sin registro (entre la RFC, 15:53:44, y la compilación, 16:03:32).

### [2026-10-21 entre 16:03 y 16:08] RFC-007: validación (5 pasos)
1. `./mvnw -q compile` (16:03:32–16:03:41): sin errores.
2. Backend detenido (pid 12096, 16:03:46; era el de la sesión anterior); BD recargada (16:03:53, 21 citas); `./mvnw test` (16:03:54–16:04:10): `Tests run: 39, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS`. La traza `java.lang.RuntimeException: BD caida` es la de U41 (ahora pasa por `AutenticadorPaciente.autenticar` antes de llegar al `catch` del controlador, que responde lo mismo). Unitarias del frontend (frontend sin cambios): `TOTAL: 32 SUCCESS` (16:08:03–16:08:09), `TOTAL: 49 SUCCESS` (16:08:09–16:08:16).
3. Backend arrancado (`Started CentroValdiviezoApplication` 16:04:26, pid 1348); P25 (16:04:28–16:04:33): `diff` con LB-6 vacío.
4. Playwright (16:04:38–16:04:48): 6 passed.
5. BD recargada (16:04:56); P01–P24 (16:04:57–16:06:32) y P11/P18 con el backend apagado (16:06:44–16:07:00): `diff` contra las salidas de LB-6 (sin líneas de hora) idéntico, salvo la línea `P04 codigo: 500` que en LB-6 se agregó a mano; se consultó igual y dio `500`. Backend reiniciado después.
- Método: los scripts de LB-6 se copiaron al scratchpad de esta sesión con `Copy-Item` (fuera del repositorio) y se les cambió con Edit la carpeta de capturas al scratchpad, para no agregar capturas a `docs/evidencias` (la tarea pide no tomar capturas en el backend).
- Evidencia: `docs/PRUEBAS.md`, "Resultados de LB-7"; `docs/rfc/RFC-007.md`.

### [2026-10-21 16:09] RFC-007 cerrada
- `PRUEBAS.md`: resultados de LB-7, U80–U81, columna "LB-7 OCP", resumen. `HALLAZGOS.md`: H-019 → "Cerrado (RFC-007, LB-7)". `ELEMENTOS_CONFIGURACION.md`: EC-01 y EC-18. Commit y tag en la entrada siguiente.

### [2026-10-21 16:10] Commit y tag de la línea base LB-7
- Qué se hizo: commit de RFC-007 (4 archivos nuevos en `autenticacion/`, `AuthController`, 2 pruebas con la construcción adaptada, 2 pruebas nuevas, RFC-007 y 4 documentos) y tag anotado `LB-7` ("Linea base 7: R3 Abierto/Cerrado").
- Evidencia: commit `df9748003106ab2152aba0aa6af4fb7ab0933e55` (2026-10-21 16:10:09) — "RFC-007: R3 Abierto/Cerrado, autenticacion extensible por rol".

### [2026-10-21 16:10] RFC-008 registrada y aprobada (H-015, H-020)
- Qué se hizo: `docs/rfc/RFC-008.md` con el diseño, los diagramas antes/después y "Principio aplicado" (IoC y DIP, con la relación con el ejemplo del curso). Aprobada por el Comité (Brayan) según la tarea 12.
- Por qué ocurren (antes de tocar código): H-020 — el código se escribió con el estilo de los tutoriales de Spring (`@Autowired` sobre el atributo), que no obliga a declarar las dependencias en el constructor; nunca se definieron interfaces porque cada servicio tenía una sola implementación. H-015 — `CitaController` y `CitaConsultaController` se escribieron directamente sobre el repositorio (el CRUD generado y, en RFC-003, los endpoints del médico) porque `CitaService` solo existía para los reportes; no había otro lugar para esa lógica.
- Decisión de nombres: interfaz `ICitaService` (como pide la tarea) y la implementación conserva el nombre `CitaService`. Renombrarla a `CitaServiceImpl` habría obligado a cambiar la construcción en 3 pruebas de caracterización más (`@InjectMocks private CitaService service;` sobre una interfaz no funciona).
- Alternativas descartadas: ver RFC-008 (renombrar a `…Impl`, servicio aparte para el médico, excepciones en el cambio de estado —`GlobalExceptionHandler` las convertiría en 500—, `ResponseEntity` en el servicio, mover también `ReporteController`/`EspecialidadController`, inyección por setter).

### [2026-10-21 entre 16:10 y 16:14] RFC-008: implementación
- Qué se hizo, con Write/Edit: `services/ICitaService.java`, `IMedicoService.java`, `IPacienteService.java`, `IUsuarioService.java` y `ResultadoCambioEstado.java` (nuevos); `CitaService` (constructor con `CitaRepository` y `Estado_CitaRepository`; métodos que vienen de los 2 controladores, con las mismas consultas en el mismo orden); `MedicoService`, `PacienteService`, `UsuarioService` y `UserDetailServiceImpl` por constructor con `final`; `CitaController` y `CitaConsultaController` reescritos sobre `ICitaService` (los códigos y mensajes HTTP se quedan en el controlador); `EspecialidadController` (quitado el `@Autowired` del campo, que ya tenía constructor), `MedicoController`, `PacienteController`, `ReporteController` y `UsuarioController` por constructor y sobre interfaces. Pruebas nuevas U82–U84.
- Prueba existente: antes de editarla se escribió en el chat la ruta `backend/src/test/java/com/centro_valdiviezo/backend/controller/CitaConsultaControllerCaracterizacionTest.java`; se cambió solo la línea `new CitaConsultaController(...)` y se agregó un `import` (diff en RFC-008).
- Hora exacta: sin registro (entre la RFC, 16:10:29, y la compilación, 16:14:54).
- Hallazgo nuevo **H-039** (Baja / Preventivo): `ReporteController`, `EspecialidadController` y 7 controladores de catálogos siguen usando repositorios; fuera del alcance de la tarea.

### [2026-10-21 entre 16:14 y 16:19] RFC-008: validación (5 pasos)
1. `./mvnw -q compile` (16:14:54–16:15:02): sin errores; `grep -rn "@Autowired" src/main` → sin resultados.
2. Backend detenido (pid 2624, 16:15:07); BD recargada (16:15:13); `./mvnw test` (16:15:14–16:15:30): `Tests run: 50, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS`. `CitaServiceCaracterizacionTest` (no modificada) 3/3; `contextLoads` 1/1 (Spring resuelve las 4 interfaces). Frontend (sin cambios): `TOTAL: 32 SUCCESS` (16:18:28–16:18:36) y `TOTAL: 49 SUCCESS` (hasta 16:18:42).
3. Backend arrancado (16:15:49, pid 17596); P25 (16:15:50–16:15:55): `diff` con LB-7 vacío.
4. Playwright (16:16:00–16:16:11): 6 passed.
5. BD recargada (16:16:18); P01–P24 (16:16:19–16:17:54); P11/P18 con el backend apagado (16:18:02–16:18:18): `diff` contra LB-7 sin diferencias en ninguna salida. Backend reiniciado (16:18:37, pid 22092).
- No cubierto por HTTP: `PUT`/`DELETE /api/cita/{id}` y `GET /api/cita/{id}` con ID inexistente (no están en la batería); los cubre U83.
- Evidencia: `docs/PRUEBAS.md`, "Resultados de LB-8"; `docs/rfc/RFC-008.md`.

### [2026-10-21 16:21] RFC-008 cerrada
- `PRUEBAS.md`: resultados de LB-8, U82–U84, columna "LB-8 IoC", resumen. `HALLAZGOS.md`: H-015 y H-020 → "Cerrado (RFC-008, LB-8)"; H-039 nuevo. `ELEMENTOS_CONFIGURACION.md`: EC-01 y EC-18.
- **Estado del entorno al cerrar:** backend (8080, pid 22092, desde `backend/`, iniciado en esta sesión) y frontend (4200, el mismo de antes de la sesión) corriendo; la BD tiene las citas 22 (Confirmada) y 23 (Cancelada) de la batería. Salidas de la batería y logs del backend en el scratchpad de esta sesión, fuera del repositorio.
- Cumplimiento de CLAUDE.md en la tarea 12: archivos del repositorio creados y modificados solo con Write/Edit; pruebas existentes modificadas solo en su construcción, con autorización del usuario y sin tocar aserciones (diffs en RFC-007 y RFC-008); cada cambio validado con la batería completa. Excepciones a registrar: (1) los scripts y salidas de LB-6 se copiaron al scratchpad con `Copy-Item` (fuera del repositorio); (2) en RFC-007 escribí al principio dos horas sin medirlas (15:54–15:55 y 16:08) y las corregí antes del commit por "sin registro" y por la hora real de `date` (16:07); (3) el pedido de commit separado para las pruebas no se pudo cumplir (no compilan sin las clases nuevas) y se aplicó la alternativa que dio el usuario.

### [2026-10-21 16:21] Commit y tag de la línea base LB-8
- Qué se hizo: commit de RFC-008 (9 clases modificadas y 5 nuevas en el backend, 1 prueba con la construcción adaptada, 3 pruebas nuevas, RFC-008 y 4 documentos) y tag anotado `LB-8` ("Linea base 8: R4 Inversion de Control").
- Evidencia: commit `679ba053a6e5fc52d3584f9d9ef56ce11229ec41` (2026-10-21 16:21:20) — "RFC-008: R4 IoC, inyeccion por constructor e interfaces de servicio". Esta entrada va en un commit posterior porque un commit no puede contener su propio hash.

### [2026-10-21 16:35] Tarea 13: inicio de sesión de trabajo y estado del entorno
- Qué se hizo: lectura de `CLAUDE.md` y de las últimas entradas de esta bitácora; `git log --oneline -5` (último commit `faddfef`) y `git tag` (`LB-0` a `LB-8`). `date` 16:35:05.
- Estado del entorno: backend (8080) responde (`curl` → 404 en la raíz, que no tiene ruta; el servidor está arriba) y frontend (4200) → 200. Ambos corriendo desde la sesión anterior. Árbol de trabajo limpio.
- Tarea: paquete de documentación para el grupo en `docs/entrega/`. Sin cambios en el código de la aplicación.

### [2026-10-21 entre 16:35 y 16:44] Tarea 13: paquete de documentación (docs/entrega/)
- Qué se hizo, con Write/Edit: `docs/entrega/INGENIERIA_INVERSA.md` (5 pasos del curso, análisis estático y dinámico, diagrama ER de las 12 tablas del SQL de LB-0, diagrama de clases por capas de LB-0 y mapa de pantallas por rol con sus endpoints), `RESULTADOS.md` (pruebas por línea base, hallazgos por gravedad y tipo, pruebas unitarias al inicio y al final, métricas LB-0/LB-8 con sus comandos y gitGraph), `PANTALLAS.md` (18 capturas) y `GUIA_PRESENTACION.md` (12 puntos y 10 preguntas probables).
- Fuentes de los datos: diagramas sacados con `git show LB-0:...` (SQL, controladores) y `grep` de las llamadas HTTP del frontend; conteos de hallazgos con `awk` sobre la tabla de `HALLAZGOS.md`; métricas con `git grep`/`git show`/`wc -l` sobre los tags (16:36); resultados de pruebas tomados de `PRUEBAS.md` (no se volvieron a ejecutar: no hubo cambios de código).
- Métricas medidas (comandos pegados en `RESULTADOS.md`): líneas de los 3 logins 220 → 161 + 60 de `login-comun.ts`; `@Autowired` 15 → 0; `@CrossOrigin` 13 → 0; clases con nombre repetido en el frontend 5 → 3; archivos de `src/` del frontend 135 → 133.
- Hallazgos (conteo): 39 en total; 18 cerrados, 20 abiertos y 1 parcial (H-023). Crítica 7 (3 cerrados), Alta 5 (1), Media 8 (5), Baja 19 (9). Correctivo 16 (4 cerrados), Preventivo 23 (14 cerrados). Pendientes críticos: H-007, H-012, H-013, H-016.
- **Observación 1 (documentación, no se modificó):** la fila de H-027 en `HALLAZGOS.md` tiene un `|` sin escapar dentro de la evidencia (`"UsuariosComponent|components/components"`), lo que desplaza las columnas en `awk` (y en la vista de Markdown). Se contó a mano como Cerrado. Registrado como H-040.
- **Observación 2 (documentación, no se modificó):** H-015 dice que `CitaController` "recibe `CitaService` por inyección pero no lo usa". En LB-0 sí lo usa en `obtenerCitasPorEstado` y `obtenerCitasPorEspecialidad` (`git show LB-0:backend/backend/src/main/java/com/centro_valdiviezo/backend/controller/CitaController.java`, líneas 64-73); el CRUD va directo a `CitaRepository`. El diagrama de clases de `INGENIERIA_INVERSA.md` muestra el uso real. Registrado como H-041.
- **Dato que no se pudo obtener:** la lista oficial de los 12 puntos de la presentación no está en el repositorio. Solo se conocen el 3, el 8 y el 12 (por el pedido de la tarea). En `GUIA_PRESENTACION.md` los otros 9 títulos dicen "Sin registro" y su contenido está marcado como propuesta para que el grupo lo confirme.
- Alternativas descartadas: corregir H-015 y H-027 en `HALLAZGOS.md` (fuera del alcance: la tarea solo crea `docs/entrega/`; se registran como hallazgos nuevos); inventar los títulos de los puntos que faltan.

### [2026-10-21 16:37 – 16:41] Tarea 13: recarga de la BD y capturas de pantalla
- Recarga: `DROP DATABASE posta_medica_valdiviezo` + `database/BDPostaMedica.sql` (contraseña tomada de `application.properties` por la variable `MYSQL_PWD`, sin escribirla en la consola), terminada a las 16:37:02: 12 tablas, 21 citas. El primer intento (16:36:53) falló con `ERROR 1045 ... (using password: NO)` porque no se pasó la contraseña.
- Capturas: Playwright (`browser_run_code`), ventana 1280×800, página completa, guardadas en `docs/entrega/pantallas/` (01 a 18). Pantallas de acceso y del paciente a las 16:37; médico y admin a las 16:39; las 3 listas de citas del médico se reemplazaron a las 16:41.
- Problema encontrado: en el primer intento los logins de médico y admin no se enviaron (sin `Intentando login` en la consola; la página quedó en `/login-medico`). Es el mismo problema de pestaña reutilizada de la bitácora del 2026-10-20 (19:26 y 20:07). Se repitió en una pestaña nueva al frente, escribiendo tecla por tecla: OK (`localStorage` con `userId`, `userName`, `userType`).
- Decisión: el médico 1 solo tiene citas Atendidas en el script, así que sus listas de pendientes, confirmadas y canceladas salían vacías. Para mostrar datos reales se usaron los médicos 6, 2 y 4, los únicos con citas en esos estados (`SELECT ... WHERE estado_cita IN (1,2,3)`); su login se comprobó antes con `curl` (200).
- No se registró ninguna cita: la BD queda como la deja el script (21 citas).
- Evidencia: `docs/entrega/pantallas/*.png`; registro de consola en `.playwright-mcp/` (fuera de Git).

### [2026-10-21 16:45] Commit y tag ENTREGA-T2
- Qué se hizo: commit de `docs/entrega/` (4 documentos y 18 capturas), `BITACORA.md` y `HALLAZGOS.md` (H-040, H-041), y tag anotado `ENTREGA-T2` ("Version entregada para la evaluacion T2").
- Evidencia: commit `da6654d3d88c9995900058b20814c7ce717f8ab3` (2026-10-21 16:45:25) — "Entrega: paquete de documentacion para el grupo". Esta entrada va en un commit posterior porque un commit no puede contener su propio hash; por eso queda fuera del tag.
- Nota: la fila nueva de H-040 tiene pipes escapados (`\|`) en su evidencia; en Markdown se ven bien, pero un `awk -F'|'` sin más la cuenta con 12 columnas. Para contar hallazgos con `awk`, revisar a mano las filas H-027 y H-040.
- Cumplimiento de CLAUDE.md en la tarea 13: sin cambios en el código de la aplicación ni en pruebas; documentos creados y modificados solo con Write/Edit; las capturas (binarios) las escribió la herramienta de Playwright, como las evidencias de tareas anteriores; horas tomadas de `date`, `ls -la` y `git log`; donde no hubo dato (títulos de 9 puntos de la presentación, resultado de las pruebas en LB-0 de la carpeta `tests/`) se escribió "Sin registro". No se corrió la batería de `PRUEBAS.md` porque no hubo cambio de código.

### [2026-10-21 entre 17:28 y 17:31] Tarea 13, segunda parte: guía con los 12 puntos oficiales y corrección de H-040 y H-041
- Qué se hizo, con Write/Edit, sin tocar código:
  - `docs/entrega/GUIA_PRESENTACION.md` reescrita con la lista oficial de los 12 puntos que dio el usuario (reemplaza los "Sin registro" y las propuestas). Por cada punto: archivo, lámina y frases clave. Los puntos 4 a 7 usan los diagramas antes/después de RFC-005 a RFC-008. Se agregaron: las condiciones del profesor (una lámina por punto, el 12 con varias, exponen todos, 8 minutos); un reparto de tiempo (480 s entre 12 láminas); una tabla RFC-001 (emergencia) frente a RFC-002 (normal) para el punto 10; para el punto 11, un diagrama Mermaid del flujo del curso (Solicitante → ¿solicitud completa? → investigación preliminar → ¿es correcta? (comité) → asignar ingeniero → planificar, diseñar, probar, finalizar → informar al solicitante) con los estados y horas del historial de RFC-001. Dos preguntas probables se cambiaron por otras sobre elementos de configuración y back-out, para cubrir los puntos 9 y 10.
  - `docs/HALLAZGOS.md`: H-027 con el `|` escapado (`\|`); descripción de H-015 corregida según el código de LB-0 (usa `CitaService` en `/porEstado` y `/porEspecialidad`; el CRUD va a `CitaRepository`), con una nota que remite a H-041. H-040 y H-041 → "Cerrado (corrección de documentación)".
  - `docs/entrega/RESULTADOS.md`: las notas sobre H-027 y sobre H-040/H-041 se actualizaron a su estado cerrado; las tablas siguen contando los 39 hallazgos de LB-8.
- Verificación: un script de Node en el scratchpad (`columnas.js`, fuera del repositorio) cuenta las columnas de la tabla tratando `\|` como texto, igual que Markdown. Resultado: `filas 41`, todas con 10 columnas; 20 cerrados y 21 abiertos (los pendientes no cambian). Se usó un script porque los comandos `sed`/`perl`/`node -e` escritos en la línea de Git Bash daban resultados sin sentido con el carácter `|`.
- Datos que siguen sin registro: la cantidad de integrantes del grupo (la guía pide ajustar los bloques de expositores).
- Observación: el historial de RFC-001 no tiene un estado llamado "Informar al solicitante"; en la guía ese paso se asocia al estado "Cerrado" (evaluación post-implementación y reporte), y se dice así.

### [2026-10-21 17:30] Commit y tag ENTREGA-T2 movido
- Commit `652f5675dacd88fef843fc52fcb83b560251656b` (2026-10-21 17:30:40), "Entrega: guia con los 12 puntos oficiales y correccion de hallazgos".
- `git tag -a -f ENTREGA-T2 -m "Version entregada para la evaluacion T2"`: el hook no lo bloqueó; Git respondió `Updated tag 'ENTREGA-T2' (was 0a407e7)` (`0a407e7` era el objeto del tag anterior, que apuntaba al commit `da6654d`). `git rev-parse ENTREGA-T2^{commit}` → `652f567…`.
- Esta entrada va en un commit posterior porque un commit no puede contener su propio hash; por eso queda fuera del tag.

### [2026-10-21 19:57] Tarea 15: inicio de sesión de trabajo y estado del entorno
- Qué se hizo: lectura de `CLAUDE.md`; `git log --oneline -3` (último `df05e56`), `git tag` (LB-0 a LB-8, ENTREGA-T2), `git remote -v` → `origin https://github.com/BrayanH0/posta-medica-valdiviezo.git`. `date` 19:57:20. Árbol de trabajo limpio.
- Contexto dado por el usuario: el repositorio estuvo público en GitHub con la contraseña de MySQL en el historial; el usuario ya lo pasó a privado y cambió la contraseña de MySQL.
- Comprobación sin mostrar la clave: la clave de `application.properties` ya no abre MySQL (`ERROR 1045`). El backend en marcha respondía porque arrancó antes del cambio.

### [2026-10-21 19:57–19:58] Tarea 15, Parte A: respaldo (plan de back-out)
- Qué se hizo: `cp -a Proyecto Proyecto_respaldo_antes_RFC009` (19:57:42–19:58:43), carpeta hermana fuera del repositorio.
- Verificación: en las dos carpetas, la lista de tags con sus objetos da el mismo `md5sum`; `HEAD` = `df05e56e245896add98c8484afab703287f03865` en ambas; `git fsck` igual (solo un blob suelto que ya existía); `application.properties` idéntico (`cmp`).
- Excepción a CLAUDE.md: la copia se hizo con un comando de terminal, no con Edit/Write, porque la tarea la pide así y es una copia completa (binarios y `.git`) fuera del repositorio; no crea ni modifica archivos del repositorio.

### [2026-10-21 19:59–20:09] Tarea 15, Parte B: RFC-009 (H-006) y validación
- Por qué ocurre H-006 (antes de tocar el archivo): la configuración se escribió con valores fijos; las credenciales, que cambian en cada equipo, quedaron en un archivo versionado y por eso en todo el historial.
- Qué se hizo, con Write/Edit: `docs/rfc/RFC-009.md`; `application.properties` líneas 2 y 3 → `${DB_USER:root}` y `${DB_PASSWORD}` (para no ver la clave, se leyeron solo las líneas 4 a 7 y se reescribió el archivo completo); `SETUP.md` y `README.md` con los comandos de PowerShell para la sesión y permanente.
- Comprobación previa a la Parte C: la clave vieja (leída del respaldo, sin mostrarla) aparece solo en `application.properties`, en sus 2 ubicaciones (`backend/backend/…` 12 commits, `backend/…` 13 commits), y en ningún otro archivo del historial ni del árbol de trabajo. El reemplazo no afecta otro texto.
- Cambio respecto del pedido: el punto 4 decía definir la variable leyendo la clave del archivo. No era posible (clave vieja, ya no válida). El usuario definió `DB_PASSWORD` con la clave nueva como variable de usuario de Windows con `Read-Host -AsSecureString` en su terminal; la clave no pasó por el chat. Cada comando la leyó con `[Environment]::GetEnvironmentVariable('DB_PASSWORD','User')` sin mostrarla. Conexión comprobada a las 20:03:32.
- Sin la variable (20:03:50): el backend no arranca. El mensaje real es `Access denied … (using password: YES)` (Spring usa el texto `${DB_PASSWORD}` sin reemplazar), no `Could not resolve placeholder` como se había escrito en `SETUP.md`; se corrigió.
- Validación (detalle en `docs/PRUEBAS.md`, "Resultados de LB-9"): compilación sin errores; backend 50/50; frontend 32/32 y 49/49; P25 igual; Playwright 6 passed; P01–P24 y P11/P18 iguales a LB-8 con `diff` (salvo la línea `P04 codigo: 500`, consultada aparte como en LB-7 y LB-8).
- Documentación: `HALLAZGOS.md` (H-006 → Cerrado (RFC-009, LB-9)); `ELEMENTOS_CONFIGURACION.md` (EC-04); `PRUEBAS.md` (columna LB-9, resultados y resumen).
- Observación: H-006 está clasificado como Preventivo en la tabla, pero la tarea 15 define RFC-009 como Correctivo. No se cambió la columna; queda anotado en la fila. Decide el usuario.
- Scripts de la batería: los de LB-8 se copiaron con `cp` al scratchpad de esta sesión (fuera del repositorio; misma excepción que en tareas anteriores) y se ajustaron con Edit (clave desde `DB_PASSWORD`, carpeta de salida).
- Alternativas descartadas: ver RFC-009 (valor por defecto en `${DB_PASSWORD:…}`, archivo local ignorado, no reescribir el historial, `filter-branch`/BFG).

### [2026-10-21 20:10] Commit y tag de la línea base LB-9
- Commit "RFC-009: credenciales de MySQL en variables de entorno (H-006)" a las 20:10:31 y tag anotado `LB-9` ("Linea base 9: RFC-009 credenciales fuera del codigo"). Tras reescribir el historial (entrada siguiente) ese commit es `bf107d3`.

### [2026-10-21 20:11–20:15] Tarea 15, Parte C: herramienta no disponible; decisión del usuario
- `pip install git-filter-repo` no se pudo ejecutar: el equipo no tenía Python (solo el alias de Microsoft Store, que no funciona). Se detuvo el trabajo antes de instalar software y se ofrecieron 3 opciones. El usuario autorizó la opción 1: instalar Python con winget en modo usuario.
- `winget install -e --id Python.Python.3.12 --scope user` (20:15:22–20:16:02) → Python 3.12.10 en `C:\Users\braya\AppData\Local\Programs\Python\Python312`; `python.exe -m pip install git-filter-repo` → `git-filter-repo.exe` en `Scripts\` (versión `a40bce548d2c`). Como la terminal de esta sesión no ve el PATH nuevo, se usaron las rutas completas.

### [2026-10-21 20:16–20:17] Tarea 15, Parte C: contraseña borrada del historial
- Antes: los 11 tags y sus commits se guardaron en el scratchpad (`tags-antes.txt`); 27 commits; la clave vieja (leída del respaldo, sin mostrarla) aparecía 2 veces en `git log -p --all` (alta en LB-0 y baja en LB-9) y estaba en el contenido de 25 de los 27 commits.
- Archivo de reemplazo en el scratchpad, fuera del repositorio, con una línea `<clave>==>***REMOVED***`, escrito con `printf` desde una variable (la clave no apareció en ningún comando ni salida) y con permisos solo para el usuario.
- `git filter-repo --replace-text <archivo> --force` (20:16:38–20:16:41): `Parsed 27 commits`, `HEAD is now at bf107d3`, `Completely finished after 2.20 seconds`. La herramienta quitó el remoto `origin` (`https://github.com/BrayanH0/posta-medica-valdiviezo.git`) para evitar que se suba por error.
- Verificación (solo conteos): `git log -p --all | grep -cF` → **0**; `git grep -F -l` en los 27 commits → **0**; búsqueda en todos los objetos guardados en `.git` (`git cat-file --batch-all-objects --batch`) → **0**; el comando de la tarea en PowerShell, `git log -p --all | Select-String -SimpleMatch $k` con `$k` leída del respaldo → **0 resultados**. En su lugar quedó `spring.datasource.password=***REMOVED***` en el historial de `application.properties`.
- Tags: los **11** tags (LB-0 a LB-9 y ENTREGA-T2; la tarea decía 10, pero son 11) siguen existiendo y cada uno apunta al commit que `.git/filter-repo/commit-map` asigna a su commit anterior, con el mismo mensaje: LB-0 `1a5df63`, LB-1 `0659bec`, LB-2 `6588eaf`, LB-3 `4fb12a6`, LB-4 `e7829cb`, LB-5 `bc282c3`, LB-6 `8d17c28`, LB-7 `df97480`, LB-8 `679ba05`, LB-9 `bf107d3`, ENTREGA-T2 `652f567`.
- El archivo de reemplazo se borró con `rm` (20:17:22). Excepción a CLAUDE.md: es un archivo del scratchpad, fuera del repositorio, y Write no puede borrar archivos.
- Por qué cambiaron los hashes: el hash de un commit depende de su contenido y del hash de su padre. Al cambiar el texto de `application.properties`, cambió el contenido de 25 commits y, en cadena, el de todos sus descendientes. El commit inicial `17e2118` no cambió porque todavía no tenía la clave real (se puso en LB-0).

### [2026-10-21 20:17–20:20] Tarea 15, Parte D: hashes actualizados en docs/
- Un script de solo lectura en el scratchpad (`hashes.js`) buscó en `docs/` todos los textos hexadecimales de 7 a 40 caracteres que fueran prefijo de un commit viejo de `commit-map`: **63 referencias** en 13 archivos (`BITACORA.md` 25, `entrega/RESULTADOS.md` 21, las RFC 15, `GUIA_PRESENTACION.md` 1, `PANTALLAS.md` 1).
- Se reemplazaron con Edit (primero los hashes largos y después los cortos, para no pisar parte de un hash largo), con la misma longitud que tenían. El gitGraph de `RESULTADOS.md` se rehízo con los hashes nuevos y se le agregaron los commits posteriores a LB-8 hasta LB-9.
- Verificación: el mismo script sobre `docs/`, `README.md`, `SETUP.md` y `CLAUDE.md` → `total 0`.
- Aviso: en estas entradas las referencias históricas a hashes (por ejemplo "HEAD del respaldo") ya muestran el hash nuevo equivalente. La carpeta `Proyecto_respaldo_antes_RFC009` conserva el historial viejo con los hashes viejos, **y con la clave vieja**; la equivalencia está en `.git/filter-repo/commit-map` del repositorio.
- ENTREGA-T2 se mueve al commit de esta entrada (siguiente).

### [2026-10-21 20:20] Tarea 15, Parte E: remoto
- El remoto `origin` ya no existe en el repositorio local (lo quitó `git filter-repo`). En GitHub sigue el repositorio viejo, privado, con la clave vieja en su historial.
- Según lo indicado por el usuario: **no se hace force push**. El usuario va a borrar el repositorio de GitHub y crear uno nuevo y vacío, porque GitHub puede conservar commits viejos (por ejemplo, referencias de pull requests o cachés) aunque se reescriba la rama. Pasos para subir al repositorio nuevo, que ejecuta el usuario (el hook bloquea `git push` para Claude Code):
  1. En GitHub: Settings → Danger Zone → Delete this repository (el viejo).
  2. Crear un repositorio nuevo **vacío** (sin README, sin .gitignore, sin licencia).
  3. En la carpeta del proyecto: `git remote add origin https://github.com/<usuario>/<repo-nuevo>.git`
  4. `git push -u origin master`
  5. `git push origin --tags`
  6. Comprobar en GitHub que `application.properties` dice `${DB_PASSWORD}` y que los 11 tags están.
- Recomendaciones: no subir nunca la carpeta `Proyecto_respaldo_antes_RFC009` (tiene la clave vieja en su historial); borrarla cuando el repositorio nuevo esté comprobado. La clave vieja ya no sirve para MySQL porque el usuario la cambió.
- Cumplimiento de CLAUDE.md en la tarea 15: la clave no se escribió en el chat, en `docs/` ni en ningún comando (siempre se leyó de un archivo o variable); archivos del repositorio modificados solo con Write/Edit; batería completa en LB-9 igual a LB-8. Excepciones registradas: la copia del respaldo con `cp -a`, la copia de los scripts al scratchpad con `cp`, el archivo de reemplazo creado con `printf` y borrado con `rm` (todo fuera del repositorio), y la instalación de Python y git-filter-repo (autorizada por el usuario).

### [2026-10-21 20:20] Commit final de la tarea 15 y tag ENTREGA-T2 movido
- Commit `606d3de1d15d658116349f970874b854afa9528b` (2026-10-21 20:20:55), "Tarea 15: historial sin contrasena y hashes actualizados en docs".
- `git tag -a -f ENTREGA-T2 -m "Version entregada para la evaluacion T2"` → `Updated tag 'ENTREGA-T2' (was d261999)`; `git rev-parse --short ENTREGA-T2^{commit}` → `606d3de`. El hook no lo bloqueó.
- Verificación después del commit: la clave vieja aparece **0** veces en `git log -p --all`; 11 tags; backend (8080) respondiendo con `DB_PASSWORD`.
- Esta entrada va en un commit posterior porque un commit no puede contener su propio hash; por eso queda fuera del tag.

### [2026-10-21 20:38] Tarea 16: verificación inicial
- `git log --oneline -3` → `865eed9`, `606d3de`, `bf107d3`. `git tag` → 11 tags (ENTREGA-T2, LB-0 a LB-9). `git remote -v` → `origin https://github.com/BrayanH0/posta-medica-valdiviezo.git`. `gh auth status` → sesión iniciada como `BrayanH0` (scopes `repo`, `workflow`, `gist`, `read:org`). El repositorio no tenía issues; ya existía la etiqueta `bug` (de GitHub por defecto). Sin cambios de código en esta tarea.

### [2026-10-21 20:39] Tarea 16, paso 0: H-006 pasa a Correctivo
- Qué: en `docs/HALLAZGOS.md`, el tipo de H-006 cambia de Preventivo a Correctivo y su columna "Cambio que lo atiende" lo explica. Estado comprobado: "Cerrado (RFC-009, LB-9)".
- Por qué: la contraseña de MySQL llegó a publicarse en GitHub (tarea 15), así que el problema ocurrió; ya no es solo un riesgo de mantenibilidad. Consecuencia: el issue #6 lleva la etiqueta `bug`.
- Descartado: dejar la clasificación original con una nota (era lo que había); el usuario pidió el cambio.

### [2026-10-21 20:40–20:42] Tarea 16, pasos 1–3: etiquetas y 41 issues
- Script de un solo uso en el scratchpad (`issues.js`, fuera del repositorio): lee las 41 filas de la tabla de `HALLAZGOS.md` (separando por `|` no escapado), arma el cuerpo de cada issue con descripción, ubicación, gravedad, tipo, estado, evidencia y cambio que lo atiende, y llama a `gh`. Se detiene si una fila no tiene 8 columnas, si el orden se rompe o si el número de issue no coincide con el del hallazgo. Primero se ejecutó en modo de prueba (sin llamar a GitHub) y se revisó la lista de títulos, etiquetas y cierres.
- Etiquetas creadas con `gh label create --force`: `refactor`, `mejora`, `critica`, `alta`, `media`, `baja` (`bug` ya existía y se reutilizó).
- Clasificación: `bug` = tipo Correctivo; `refactor` = H-008, H-010, H-015, H-018, H-019, H-020, H-030; `mejora` = el resto de los Preventivos. Los títulos cortos ("H-0XX: resumen") se escribieron a mano en el script, sin tildes.
- Cierre de los "Cerrado" con `gh issue close --comment "Resuelto en RFC-00X, commit <hash>, línea base LB-X"`. Hashes actuales (posteriores a la tarea 15) = commit de cada RFC, que es el mismo al que apunta su tag: RFC-001 `0659bec` LB-1, RFC-002 `6588eaf` LB-2, RFC-003 `4fb12a6` LB-3, RFC-004 `e7829cb` LB-4, RFC-005 `bc282c3` LB-5, RFC-006 `8d17c28` LB-6, RFC-007 `df97480` LB-7, RFC-008 `679ba05` LB-8, RFC-009 `bf107d3` LB-9.
- **Desvío del texto pedido:** H-040 y H-041 están "Cerrado (corrección de documentación)", sin RFC ni línea base propia, así que la plantilla no se aplica. Su comentario dice: "Resuelto en la corrección de documentación de la tarea 13 (sin RFC), commit da6654d, sin línea base propia (es posterior a LB-8 y anterior a LB-9)". `da6654d` es el commit que agregó H-040 (`git log -S"H-040" -- docs/HALLAZGOS.md`); su posición se comprobó con `git merge-base --is-ancestor`.
- Ejecución: 20:40:08–20:42:02, sin errores; cada hallazgo quedó con su mismo número (H-001 → #1 … H-041 → #41).

### [2026-10-21 20:42] Tarea 16, paso 4: verificación
- `gh issue list --state all --limit 100` → **41** issues; **OPEN 20, CLOSED 21**.
- `HALLAZGOS.md`: 21 filas "Cerrado" y 20 "Abierto" (incluye H-023, "Abierto (parcial…)", que quedó abierto). Los 21 cerrados en GitHub son exactamente los 21 "Cerrado" de la tabla y cada uno tiene 1 comentario con su RFC, commit y línea base.
- Fallo propio: en el resumen del modo de prueba conté a ojo "23 cerrados"; el conteo con `grep` dio 21, igual a GitHub. No afectó a los issues.
- Un primer intento de comparar estados con un script de una línea falló por un error de sintaxis mío en la expresión regular; la comparación se hizo con la lista de cerrados de `gh` contra la tabla.

### [2026-10-21 20:42–20:43] Tarea 16, paso 5: capturas
- Con Playwright (sin iniciar sesión: el repositorio es público), página completa a 1400 px de ancho, en `docs/entrega/github/`: `issues-abiertos.png` (Open 20 / Closed 21), `issues-cerrados.png` y `issue-H-001.png` (detalle con el comentario de cierre). Se revisó `issues-abiertos.png`: muestra los 20 abiertos con sus etiquetas.

### [2026-10-21 20:43] Tarea 16, paso 6: números de issue en HALLAZGOS
- Se agregó al final de `docs/HALLAZGOS.md` la sección "Issues de GitHub" con una tabla hallazgo → issue (enlace), estado y etiquetas, generada desde `gh issue list`.
- Descartado: agregar una columna a la tabla principal; cambiaría las 41 filas y el conteo de 10 columnas que cita la evidencia de H-040.
- Aviso: los issues son una copia del estado de hoy; si un hallazgo cambia de estado, hay que actualizar su issue a mano.
- El commit lo hace Claude Code; el `git push` lo ejecuta el usuario (el hook lo bloquea).

### [2026-11-09 16:53] Tarea 17, parte 0: estado de Git (solo informe, sin cambios)
- `git fetch origin` sin novedades. Ramas: solo `master` local y `origin/master` (más `origin/HEAD`), ambas en `3200a4d`.
- `git log origin/master..master` → vacío (nada local sin subir). `git log master..origin/master` → vacío (nada remoto sin bajar).
- `git branch -a --no-merged master` → vacío. `git status --short` → limpio. `git stash list` → vacío.
- Tags: los 11 locales (ENTREGA-T2, LB-0…LB-9) existen en el remoto y apuntan al **mismo objeto** (comparación `git rev-parse <tag>` contra `git ls-remote --tags origin`: 11 "OK").
- Conclusión: no hay nada que subir ni unir a master. No se ejecutó ningún merge, push ni cambio.

### [2026-11-09 16:54–16:57] Tarea 17: preparación del entorno
- Al empezar, backend (8080) y frontend (4200) **no estaban corriendo** (`curl` → `000`); MySQL sí (`netstat` → 3306 LISTENING, pid 7744).
- Se arrancaron en segundo plano: backend con `./mvnw spring-boot:run` desde `backend/` (la variable `DB_PASSWORD` se leyó de las variables de usuario de Windows, sin mostrarla) y frontend con `npx ng serve` desde `frontend/`. Logs en el scratchpad de la sesión (fuera del repositorio). 16:57:32: `backend 200 frontend 200`.
- 16:57:41–16:57:43: BD recargada (`DROP DATABASE IF EXISTS posta_medica_valdiviezo` + `database/BDPostaMedica.sql`): `Cita` 21 filas, `Paciente` 15. Se recargó **antes** para partir de un estado conocido.

### [2026-11-09, entre 16:53:36 y 16:57:32] Tarea 17, parte A: 9 agentes auditores en `.claude/agents/`
- Hora exacta de creación: sin registro (no se tomó `date` en ese momento; las marcas son el informe de Git y la comprobación de que backend y frontend respondían).
- Creados con Write: `auditor-negocio`, `auditor-seguridad`, `auditor-privacidad`, `auditor-logica`, `auditor-robustez` (effort `high`), `auditor-carga`, `auditor-rendimiento`, `auditor-diseno`, `auditor-despliegue` (effort `medium`). Todos: `model: opus`, `tools: Read, Grep, Glob, Bash`, `disallowedTools: Edit, Write, NotebookEdit`, con la regla común (no modifican el proyecto; Bash solo para leer, pruebas y peticiones a localhost; cada hallazgo reproducido o "no verificado"; referenciar H-0XX existentes; prefijo `AUD-` en datos creados).
- **Contradicción del pedido y cómo se resolvió:** la tarea pide agentes sin Edit/Write y a la vez que "cada uno escriba `docs/auditoria/AUD-<area>.md`". Se decidió que cada agente **devuelve su informe completo como respuesta final** y el orquestador (Claude Code, sesión principal) lo guarda con Write sin cambiar el contenido. Así los agentes siguen siendo de solo lectura y los archivos se crean con las herramientas de edición (regla de CLAUDE.md). Descartado: darles Write (rompe "solo lectura") o que escriban con Bash (prohibido por CLAUDE.md).
- **Excepciones explícitas en las definiciones:** `npm audit` (auditor-despliegue) consulta el registro de npm, un servicio externo; se permite porque el usuario lo pidió por nombre. Los auditores pueden crear scripts temporales y capturas en el scratchpad de la sesión (fuera del repositorio) con Bash. auditor-carga no instala nada (k6/autocannon solo si ya están).
- **Orden de ejecución:** auditor-carga (inunda la BD de citas) y auditor-robustez (apaga el backend para probar "backend caído") alteran el entorno; correrlos junto a los demás contaminaría la evidencia ajena. Se ejecutan en una **segunda ola**, después de los otros 7.

### [2026-11-09 16:58] Tarea 17, parte B: los agentes nuevos no se pudieron invocar por su tipo
- Llamada con `subagent_type: auditor-negocio` → error `Agent type 'auditor-negocio' not found` (las definiciones de `.claude/agents/` se cargan al iniciar la sesión, y se crearon dentro de esta).
- Alternativa aplicada: agentes `general-purpose` con `model: opus` y el `effort` de cada definición, cuyo prompt les ordena leer y seguir su archivo `.claude/agents/auditor-*.md` y les prohíbe Edit/Write/NotebookEdit. **Diferencia con lo pedido:** en esta ejecución la restricción de herramientas es por instrucción, no impuesta por el sistema. En una sesión nueva los 9 agentes ya se pueden invocar por su nombre con la restricción real. Se comprobará al final con `git status` que ningún agente modificó archivos del repositorio.
- 16:58–16:59: lanzada la primera ola (negocio, seguridad, privacidad, lógica, rendimiento, diseño, despliegue) en paralelo. A todos se les indicó no detener backend/frontend/MySQL y no ejecutar `mvnw package/compile/test` (el backend corre desde `backend/target`).

### [2026-11-09 ~17:03–17:16] Tarea 17: los 7 agentes se cortaron por límite de gasto de la API
- Los 7 terminaron con `API error: You've hit your monthly spend limit … (error type rate_limit, HTTP 429)` a media tarea. Según el informe de negocio, su último paso fue a las 17:03:11. La hora exacta de cada corte: sin registro.
- 17:15:37: comprobado que backend (200) y frontend (200) seguían corriendo y que `git status --short` solo mostraba `docs/BITACORA.md` y `.claude/agents/` (ningún agente había tocado archivos del repositorio).
- El usuario pidió continuar. Se retomó **primero un solo agente** (negocio) para comprobar si el límite ya aceptaba peticiones; terminó a las 17:17:20. Luego se retomaron los otros 6 desde donde quedaron (sin empezar de cero, mismo contexto).
- 17:22: guardado `docs/auditoria/AUD-negocio.md` con Write, con el contenido exacto que devolvió el agente (14 hallazgos: 5 Alta, 7 Media, 2 Baja).
- El usuario avisó (mensaje durante la tarea) que su antivirus a veces bloquea comandos y pidió relanzar cualquier agente afectado. Revisión: los 7 cortes de esta tarea **no** fueron del antivirus, sino el error `HTTP 429 … monthly spend limit` de la API, que figura en cada notificación. Ningún comando quedó bloqueado. Cada agente se retomó con su contexto completo y su informe registra el corte (rangos 17:02–17:03 → 17:16–17:20) y que no repitió ni perdió pruebas (diseño volvió a correr sus scripts completos). Decisión: **no relanzarlos**. Si al consolidar aparece un hueco, se relanza ese agente.

### [2026-11-09 17:22–17:38] Tarea 17, parte B: primera ola terminada y guardada
- Guardados con Write, con el contenido exacto de cada respuesta: `AUD-negocio.md`, `AUD-despliegue.md`, `AUD-seguridad.md`, `AUD-privacidad.md`, `AUD-diseno.md`, `AUD-logica.md` (la respuesta del agente de lógica superó el tamaño del mensaje y quedó en un archivo de resultados de la sesión; se leyó completo con Read y se copió con Write) y `AUD-rendimiento.md`.
- Conteo por severidad (columna Severidad de la tabla Resumen de cada informe, 17:38): negocio 5 Alta / 7 Media / 2 Baja; seguridad 5 Crítica / 2 Alta / 2 Media; privacidad 3 Crítica / 4 Alta / 3 Media / 1 Baja; lógica 7 Alta / 9 Media / 2 Baja; rendimiento 5 Media / 3 Baja / 1 Informativa; diseño 2 Alta / 6 Media / 6 Baja; despliegue 1 Crítica / 5 Alta / 5 Media / 4 Baja.
- `git status --short` a las 17:38: solo `M docs/BITACORA.md`, `?? .claude/agents/`, `?? docs/auditoria/`. Ningún agente modificó archivos del repositorio.
- **Contacto con servicios externos (a saber):** (1) `npm audit` (despliegue) consultó el registro de npm, autorizado por el usuario. (2) Las páginas del frontend piden Bootstrap y Font Awesome a `cdn.jsdelivr.net` y `cdnjs.cloudflare.com` (`index.html`). El auditor de rendimiento informa que su primera corrida de Playwright (17:02:57–17:03:42) no bloqueaba esas peticiones, así que el navegador pudo descargarlas. Desde entonces las bloqueó. Privacidad y diseño abrieron la app con Playwright y no informan si las bloquearon: sin registro. Son descargas de recursos públicos que hace la propia aplicación, no envío de datos.
- Archivo con datos sensibles en el scratchpad: el auditor de despliegue dejó `aud-despliegue/pac.json` (respuesta de `/api/paciente`, datos semilla con claves de prueba). Está fuera del repositorio. Se informa al usuario; no se borró.
- Visto de paso por rendimiento, para HALLAZGOS: `PacienteRepository.findByApellidosContaining`/`findByNombresContaining` declaran devolver `ArrayList<Medico>` (no probado).
- Lanzamiento de la segunda ola: entre 17:33:57 (fin de rendimiento) y 17:38:02 (siguiente `date`); hora exacta sin registro. Empezó **robustez sola**, autorizada a detener el backend una vez y a reiniciarlo con el mismo comando (log nuevo `backend2.log` en el scratchpad). Carga va después.

### [2026-11-09 17:38–17:53] Tarea 17, parte B: robustez
- Ejecución del agente: 17:38:08–17:50:09. Detuvo el backend original (PID 12964) a las 17:44:45, por eso la tarea de fondo que lo había arrancado terminó con código 1 (esperado). Lo reinició a las 17:46:20 (PID 29304, log `backend2.log`).
- 17:53:22, comprobación propia: `backend 200`, `frontend 200`, `:8080 LISTENING 29304`. La afirmación del agente de que `GlobalExceptionHandler.java` tiene 21 líneas se comprobó con `wc -l` → `21`. La línea `:161-167` que cita AUD-SEG-07 es incorrecta (el contenido del hallazgo sí es correcto): queda anotado en el informe consolidado, sin editar AUD-seguridad.md, que se conserva tal como lo entregó su agente.
- Guardado `docs/auditoria/AUD-robustez.md` (7 hallazgos: 1 Crítica, 1 Alta, 4 Media, 1 Baja).
- 17:53: `which k6 autocannon` → ninguno instalado. No se instaló nada (la tarea pide preguntar antes). Carga mide con un script de Node que solo usa módulos integrados. Lanzado el agente de carga, solo en el entorno.

### [2026-11-09 17:54–18:06] Tarea 17: carga, recarga de la BD y consolidación
- Carga: 17:54:06–18:02:09. No hubo errores en ningún escalón (login aguantó hasta 2000 concurrentes). Con 4015 citas, `GET /api/cita` cayó a unas 90 pet/s. Se aceptaron 3900 reservas anónimas en unos 3 s. Guardado `AUD-carga.md` (4 hallazgos: 2 Alta, 1 Media, 1 Informativa).
- 18:04:31–18:04:33: BD recargada con el procedimiento de `docs/PRUEBAS.md` (`DROP DATABASE posta_medica_valdiviezo` + `database/BDPostaMedica.sql`). Antes había `Cita` = 4015. Después: citas 21, pacientes 15, médicos 15, admins 1, especialidades 5. `GET /api/cita` → 200 con 21 elementos.
- Escrito `docs/auditoria/INFORME_AUDITORIA.md`. Contiene los totales por área y severidad (101 hallazgos: 10 Crítica, 28 Alta, 42 Media, 19 Baja, 2 Informativa), el top 10 de riesgos agrupados por causa, los 5 paquetes P1–P5 sin archivos compartidos, el hotfix candidato (no devolver `clave` en el JSON) y las observaciones para HALLAZGOS.
- **HALLAZGOS.md no se editó.** Las 4 observaciones (corrección de la evidencia de H-032, línea mal citada en AUD-SEG-07, tipo de retorno de `PacienteRepository`, datos semilla con personas reales) quedaron en el informe para que el usuario decida. Motivo: el pedido limita el commit a `docs/auditoria` y `.claude/agents`.
- Batería de `docs/PRUEBAS.md`: no se ejecutó como regresión, porque esta tarea no cambia código de la aplicación. Las pruebas unitarias del frontend sí se corrieron dentro de la auditoría de lógica (`TOTAL: 49 SUCCESS`, 17:26).
- Fallos propios: (1) en la entrada de la parte A anoté al principio una hora estimada ("16:55–16:59") y la corregí con las marcas reales. (2) La hora de lanzamiento de la segunda ola se había escrito como "~17:36"; se reemplazó por el rango real entre dos `date`.
- Commit: solo `docs/auditoria/` y `.claude/agents/`, como pide la tarea. **Esta bitácora queda modificada sin commit**, porque el pedido no la incluye en el commit; queda para el usuario.
- Cumplimiento de CLAUDE.md: los archivos se crearon o modificaron solo con Write/Edit; no se tocó código de la aplicación; las fechas se tomaron de `date`; donde no hay dato se escribió "sin registro"; no se modificó ninguna prueba; no hubo push ni comandos destructivos de Git. Excepción registrada: los agentes escribieron scripts temporales con Bash en el scratchpad, fuera del repositorio.

### [2026-11-10 15:25–16:00] Tarea 18: GitFlow, RFC-010..018, hallazgos H-042+, issues y fichas (sin tocar código)
**Lectura previa:** CLAUDE.md, `docs/auditoria/INFORME_AUDITORIA.md`, `docs/HALLAZGOS.md` y los apartados de los 9 informes AUD citados por cada paquete.

**Parte A — rama.** 15:25:50: `git branch develop master` + `git switch develop` (los dos en `08b4d99`). Sin push. GitHub a las 15:25:40: 41 issues (#1–#41) y 0 PR, por eso H-042…H-047 deberían quedar como #42…#47 si se crean en orden antes de cualquier PR.

**Parte B — hallazgos.**
- Se actualizaron, sin duplicarlos, los 4 hallazgos con la misma causa: H-007 (→ RFC-010), H-012 (→ RFC-012), H-013 y H-016 (→ RFC-011), con sus AUD-xxx.
- Nuevos: H-042 (datos semilla, RFC-017), H-043 (P1, RFC-014), H-044 (P3, RFC-015), H-045 (P4, RFC-013), H-046 (P5, RFC-016) y H-047 (P2, RFC-018).
- **Decisión:** un hallazgo por paquete y no uno por cada AUD. El paquete es la unidad de trabajo (una RFC, un issue, un PR con "Closes #N"); cada fila nombra todos sus AUD.
- **Alternativa descartada:** un hallazgo por AUD. Hubiera dado 13 issues para 4 PR y varios "Closes" por PR.
- H-032: evidencia corregida según AUD-LOG-12. La ruta real es `PUT /api/paciente/actualizar/{id}`, usada desde "Gestión de Pacientes" del admin; el texto anterior quedó tachado.
- Comprobado con un script: las 47 filas tienen las mismas columnas que antes (9 barras sin escapar en la tabla principal y 5 en la de issues).

**Parte C — RFC.** `docs/rfc/RFC-010.md` a `RFC-018.md`, todas en estado "Registrado" (15:54). Cada una incluye la causa, las alternativas, el impacto en las pruebas existentes y el plan de vuelta atrás. Decisiones y avisos que quedan escritos en ellas:
- **RFC-010:** las pruebas U33–U41, `AuthControllerTest` y U81 **no compilarán**, porque construyen los autenticadores sin `PasswordEncoder`. Hay que cambiarlas y lo decide el usuario. La migración de las claves usa un `ApplicationRunner` activado por propiedad, porque MySQL no tiene BCrypt.
- **RFC-011:** las E2E `medico-citas-pendientes` y `medico-flow` crean citas con `request.post` sin token y van a fallar con 401. Hay que modificarlas, con autorización del usuario.
- **RFC-012:** queda pendiente una decisión del usuario sobre las citas canceladas. Con la UNIQUE simple (opción A, la pedida) una cita Cancelada ocupa el horario; la opción B es una columna generada. RFC-012 depende de la versión de `GlobalExceptionHandler` que deje P1.
- **RFC-016:** `SHOW_SQL` queda en `true` por defecto para no alterar el entorno de desarrollo (decisión que el usuario puede cambiar).
- Las pruebas unitarias nuevas tienen numeración propuesta (U85 P1, U86 P3, U87 P5). `docs/PRUEBAS.md` no se modificó, porque esas pruebas todavía no están en el repositorio.

**Parte D.** `docs/entrega/ISSUES_T3.md`: 6 issues (título, cuerpo y etiquetas; las 4 etiquetas usadas existen, comprobado con `gh label list` a las 15:59) y los comentarios para los issues existentes #7, #12, #13 y #16. **No se creó ningún issue en GitHub.**

**Parte E — fichas y verificación** (evidencia completa en `docs/evidencias/t18-verificacion-fichas.txt`):
- 15:29:41: 5 copias de `develop` en el scratchpad con `git archive` (base, p1, p3, p4, p5) y enlaces a los `node_modules` del repo. Los cambios se aplicaron en las copias con Edit; las pruebas nuevas se crearon con Write.
- 15:33–15:35: `ng build` sin errores en las 4 copias, con las mismas 2 advertencias que base. `mvnw test`: base 50, p1 51, p5 52. Unitarias del frontend: base 32/49, p1 32/49, p3 32/54, p4 32/49.
- 15:36–15:44: backend y `ng serve` levantados desde cada copia; Playwright 6/6 en las 5 copias.
  - BASE reprodujo los hallazgos: clave y DNI en la consola, 2 PUT con doble clic, desborde a 360 px.
  - P1: la consola queda limpia y aparecen 3 líneas de error en el log, con los mismos cuerpos 500.
  - P3: 1 PUT y el mensaje "Cita 35 confirmada.".
  - P4: a 360 px, sin desborde y la tabla pasa de 10 a 290 px; a 1280 px, capturas idénticas byte a byte.
  - P5: sin variables, P25 idéntico; con variables, puerto 8081, Vercel 200, origen ajeno 403 y 0 líneas `Hibernate:`.
- 15:49:47: `docs/entrega/fichas/verificar-ficha.cjs` sobre las 4 fichas → **0 fallos**. Cada ANTES aparece exactamente 1 vez en `develop` o es igual al archivo completo, y "develop + DESPUÉS" es igual a la copia compilada y probada. Además, `diff -rq` muestra que cada copia difiere de base solo en los archivos de su ficha.
- 15:50:13: copias descartadas. Primero se quitaron los enlaces (solo el enlace; el `node_modules` real sigue con 375 carpetas) y luego se borraron las carpetas de las copias con `Remove-Item` en el scratchpad. **Excepción a CLAUDE.md:** ese borrado se hizo por terminal porque Edit/Write no pueden borrar carpetas y la tarea pedía descartar las copias. Los archivos estaban fuera del repositorio, donde no aplican los hooks. Los logs de la verificación quedan en el scratchpad.
- **Decisión de forma:** en los archivos con varios cambios o cortos (GlobalExceptionHandler, los 2 de P3, `application.properties` y `WebSecurityConfig`) la ficha pide reemplazar el **archivo completo** (Ctrl+A y pegar). Para alguien sin experiencia es menos propenso a errores que 3 o 4 bloques sueltos. El ANTES completo queda plegado para que se pueda comprobar el archivo.

**Cosas que el usuario debe saber:**
- Después de las 15:35:16 (fin de las unitarias; la hora exacta de la denegación no tiene registro) **se denegó** la recarga de la BD (`DROP DATABASE` + `BDPostaMedica.sql`), por el permiso de acciones destructivas. No se intentó por otra vía. La verificación se hizo sobre la BD tal como estaba (recargada el 2026-11-09 a las 18:04). Foto antes y después: 21 citas, estados `424341414444444444444`, 15 pacientes, 15 médicos, **igual al terminar** (15:44:36). Las citas temporales de las E2E y de los scripts se crearon y se borraron por la API.
- Batería P01–P24 de `docs/PRUEBAS.md`: **no se ejecutó**, porque esta tarea no cambia código del repositorio (solo `docs/`). Sí se corrieron las pruebas relacionadas con cada paquete (arriba) y P25.
- Entorno al terminar: backend y frontend **detenidos**, igual que al empezar (a las 15:25 solo escuchaba MySQL en 3306). Las notificaciones de "fallo" de las tareas de fondo corresponden a esas detenciones intencionales.
- Observación sin número (anotada en HALLAZGOS, decide el usuario): las especialidades se ven como "Pediatr├¡a" en `/admin/reportes`. Viene de los datos de la BD; causa no verificada.
- Antes de pasar las fichas: los integrantes necesitan permiso de escritura en el repo, `develop` tiene que estar publicada en GitHub y los issues #42–#46 creados. "Closes #N" cierra el issue solo cuando el cambio llega a `master`.

**Fallos propios:**
1. `mklink` desde Git Bash falló por las comillas (15:29); los enlaces se crearon con PowerShell.
2. La primera corrida del verificador marcó 4 falsos fallos en P1, porque las copias de `git archive` tienen CRLF (`core.autocrlf=true`) y `develop` tiene LF. Se normalizó solo el fin de línea al comparar.
3. El texto del log en P1 tenía una tilde ("petición") y se cambió a "Error no controlado en la API" para evitar caracteres dañados en la consola de Windows. Se hizo antes de compilar, así que lo probado es lo que está en la ficha.
4. Al redactar las RFC escribí 2 afirmaciones que no había comprobado: en RFC-014, que el builder no permite quitar `console`; en RFC-016, el recorte de espacios en `CORS_ORIGINS`. Se cambiaron a "no verificado" o se citó el código de Spring.
5. En H-032 escribí al principio "Se probó: el admin ve…", pero la auditoría lo probó por API; se corrigió a "en pantalla no se probó".

**Commit:** en `develop`, solo `docs/`, con el mensaje "T3: RFC-010..018, hallazgos H-042+, issues y fichas". Sin push. El hash se agrega al final de esta entrada después del commit.
- 16:00:50: commit `def78c0` en `develop` (padre `08b4d99`; 18 archivos, todos en `docs/`). `master` sigue en `08b4d99`. Esta línea con el hash queda **sin commit** (un commit no puede contener su propio hash); queda para el usuario.

---

## Tarea 19 — Hotfix RFC-010: claves con BCrypt y sin exponer en la API (cambio de emergencia)

> Esta entrada se escribe en la rama `hotfix/rfc-010-claves-seguras`, creada desde `master` (LB-9). Las entradas de la tarea 18 (registro de RFC-010) están en `develop`; se unen al hacer el merge del hotfix a `develop`.

### [2026-11-10 19:44–19:54] Paso 1: batería base en `master` (LB-9)
- `master` = `08b4d99`. `git diff --stat LB-9 master -- backend frontend database e2e` → vacío, y lo mismo entre `master` y `develop`: el código de `master` es el de LB-9.
- **Los scripts de la batería de LB-8/LB-9 ya no existen** (estaban en el scratchpad de esas sesiones; los scratchpads anteriores están vacíos). Se reescribió la batería completa en un solo script de Node + Playwright (`bateria.cjs`, scratchpad de esta sesión, fuera del repositorio) que sigue P01–P25 en el orden del documento y lee las credenciales de prueba de `docs/PRUEBAS.md` (no las tiene escritas). Para que la comparación sea válida, **el mismo script** se corre en `master` (paso 1) y en el hotfix (paso 4). No imprime el valor de ninguna clave: en P01/P03 registra si la respuesta tiene el campo `clave` y la lista de campos.
- 19:48:47–19:48:48: BD recargada (`DROP DATABASE` + `database/BDPostaMedica.sql`, 21 citas).
- 19:48:58–19:49:16, `./mvnw test`: `Tests run: 50, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS`.
- Frontend: `TOTAL: 32 SUCCESS` (19:49:26–19:49:39) y `TOTAL: 49 SUCCESS` (hasta 19:49:46).
- Backend arrancado (`Started CentroValdiviezoApplication` 19:50:09, pid 30496) y `ng serve`. Playwright (19:50:17–19:50:36): **6 passed**.
- Primera corrida de la batería (19:50:45–19:51:02): se cortó en P12 por un error del script (esperaba que las `<option>` fueran "visibles"; se cambió a `state: 'attached'`). En esa corrida también se cambió la medición de tamaño a bytes crudos de la respuesta. Se recargó la BD y se repitió todo.
- 19:52:05 BD recargada; batería P01–P25 19:52:06–19:53:27; backend detenido (pid 30496, 19:53:54); P11 apagado y P18 19:54:00–19:54:19. Resultado: **igual a LB-9 en todo lo registrado** (P04 500; P13–P16 fallan igual; P05–P10, P17, P19–P23 y P25 como en LB-9; P03 trae `clave` en `/api/medico/codigo/1` y `/api/paciente/codigo/1`; P01 trae `clave` en `/api/medico`, `/api/medico/especialidad/1`, `/api/paciente` y `/usuarios`).
- Notas de método de la batería reescrita:
  - **P24:** la primera versión buscaba el texto `123456` sin comillas y lo encontró dentro del DNI `12345678` (`texto-clave-prueba:true`), un falso positivo. LB-9 buscaba el valor de clave. Se corrigió el script para buscar `"123456"` entre comillas y se comprobó sobre el mismo backend de `master` con `curl … | grep -c '"123456"'` → `0` en los 2 endpoints, igual que LB-9.
  - **P01, tamaños:** con bytes crudos, varios tamaños difieren de los anotados desde LB-0 (cie 306 B vs 291 B, cita 2818 vs 2811, especialidad 584 vs 554, disponibilidad 8677 vs 8632…), aunque `database/BDPostaMedica.sql` no cambió desde LB-9. No se investigó la causa (sospecha no comprobada: la codificación con que el cliente `mysql` cargó los acentos). Sin efecto en esta comparación: base y hotfix se miden con el mismo método.
  - La sesión de médico de P11 con el backend apagado se carga en localStorage, igual que en LB-4 a LB-9.
- Salidas: `base/` en el scratchpad (`bateria.txt`, `bateria-apagado.txt`, `mvn-test.txt`, `fe-32.txt`, `fe-49.txt`, `playwright.txt`, `p24-recheck.txt`).

### [2026-11-10 19:54] Paso 2: rama `hotfix/rfc-010-claves-seguras` desde `master`
- `git checkout -b hotfix/rfc-010-claves-seguras master` → `08b4d99`.
- RFC-010 solo existe en `develop` (tarea 18). Se trajo a la rama con `git checkout develop -- docs/rfc/RFC-010.md` para actualizarlo aquí. **Fallo propio:** ese comando crea el archivo desde la terminal, y CLAUDE.md pide crear archivos solo con Edit/Write. El contenido es idéntico al de `develop` (comprobable con `git diff develop -- docs/rfc/RFC-010.md` antes de editarlo). No se deshizo porque borrarlo también requeriría la terminal.

### [2026-11-10 19:54] Decisión del usuario sobre las pruebas (antes de implementar)
- Aprobadas en el pedido: U33–U41, `AuthControllerTest`, U81 y "P03/U52".
- Al leer las pruebas se vio que el diseño pedido rompe además **U49, U55 y U80**, y que **U52 no se rompe** (`actualizarPaciente` no usa el encoder; el RFC la nombró en lugar de U49). Se le preguntó al usuario antes de tocar código:
  - U49 afirma que `crearPaciente` guarda la clave en texto plano (caracteriza H-007): falla sí o sí.
  - U55 usa `@InjectMocks` sin un `PasswordEncoder` simulado: el encoder llega `null` y `crearMedico` lanzaría `NullPointerException`.
  - U80 arma un contexto de Spring mínimo sin bean `PasswordEncoder`: no arranca si los autenticadores lo reciben por constructor.
- Respuesta del usuario: **"Aprobar U49, U55 y U80"** como corrección esperada. Se descartó el diseño alternativo (que cada clase cree su propio `BCryptPasswordEncoder` para no tocar U55/U80) porque contradice "PasswordEncoder como bean" y sería acomodar el código a las pruebas.

### Por qué ocurre el problema (causa, antes de cambiar código)
1. **Se guarda en texto plano:** `PacienteService.crearPaciente` y `UsuarioService.crear` tienen el `encode` comentado, y `MedicoService.crearMedico` guarda tal cual. La semilla `BDPostaMedica.sql` inserta `'123456'` literal en las 31 filas.
2. **Se compara en texto plano:** los 3 `Autenticador*` usan `getClave().equals(clave)`. El único `PasswordEncoder` del contexto es `NoOpPasswordEncoder` (`WebSecurityConfig.java:49-53`), que además alimenta el `AuthenticationManager` (no usado por `/login`: el filtro JWT está comentado).
3. **Se devuelve en el JSON:** los controladores devuelven las entidades JPA sin DTO, y `clave` no tiene ninguna anotación que la saque de la serialización. Por eso `GET /api/paciente`, `/api/medico` y `/usuarios` la incluyen.

### Restricciones del pedido que cambian el diseño del RFC
- **No se toca `WebSecurityConfig.java` ni `application.properties`** (los modifica el paquete P5 de otro integrante). Por eso:
  - El bean nuevo va en `config/PasswordConfig.java`. Como `WebSecurityConfig` ya define un bean llamado `passwordEncoder` (NoOp) y Spring Boot no permite sobrescribir beans con el mismo nombre, el nuevo se llama `bcryptPasswordEncoder` y lleva `@Primary`: cualquier `PasswordEncoder` inyectado por tipo recibe BCrypt.
  - El bean NoOp **sigue existiendo** y el `AuthenticationManager` de `WebSecurityConfig` lo sigue usando (llama a `passwordEncoder()` directamente). Hoy ese camino no se usa (`/login` lo atiende `AuthController`), pero queda registrado como hallazgo para P5.
  - El RFC proponía activar la migración con `app.migrar-claves=true` en `application.properties`. Como no se puede tocar, y el pedido dice "migración al arrancar … una sola vez … idempotente", el componente corre en cada arranque y solo cambia las claves que no son BCrypt; si ya están en hash no hace nada.

### [2026-11-10 19:55–20:10] Paso 3: implementación
- **Qué se cambió** (detalle por archivo en RFC-010, "Diferencias entre el diseño registrado y lo implementado"):
  - Nuevos: `config/PasswordConfig.java` (bean `bcryptPasswordEncoder`, `@Primary`) y `config/MigracionClaves.java`.
  - Los 3 `Autenticador*` reciben `PasswordEncoder` por constructor y usan `matches(claveIngresada, hashGuardado)`.
  - `PacienteService`, `MedicoService` y `UsuarioService` aplican `encode` al crear.
  - `clave` lleva `@JsonProperty(access = WRITE_ONLY)` en `Paciente`, `Medico` y `UsuarioModel`.
  - `database/BDPostaMedica.sql`: 31 hashes.
- **`MigracionClaves`:**
  - Se escribió primero como `ApplicationRunner`, siguiendo el RFC. Se cambió a `SmartInitializingSingleton` antes de probarlo: un `ApplicationRunner` corre después de que Tomcat acepta peticiones, y en el primer arranque con claves en texto plano un login en ese instante daría 401. Comprobado después en el log: migración 20:11:50.900, Tomcat 20:11:50.924.
  - Se considera BCrypt el formato completo (`^\$2[aby]\$\d{2}\$[./0-9A-Za-z]{53}$`), no solo "empieza con `$2`". Así, una clave en texto plano que empiece con `$2` también se migra.
  - El log solo informa cuántas filas cambió por tabla.
- **Semilla:**
  - 31 hashes generados con el mismo `BCryptPasswordEncoder` (un programa Java de una sola línea de uso, en el scratchpad). Cada hash se verificó con `matches` al generarlo, y la clave se leyó de `docs/PRUEBAS.md`, no se escribió en el comando.
  - Se reemplazaron con Edit. `grep` + `diff` (ignorando `\r`) contra la lista generada → idénticos. `grep -c "'123456'"` en el SQL → 0.
- `./mvnw -q compile` (19:58:25): sin errores.
- **Pruebas:**
  - Antes de escribir las pruebas aprobadas, el usuario rechazó las primeras 4 ediciones preguntando "¿cuál es la ruta?". Se le dio la ruta y el detalle de cada cambio, y respondió "sí, sigue".
  - Se adaptaron U33–U41, `AuthControllerTest`, U80, U81, U49 y U55 (antes/después en RFC-010). Se escribieron U85–U89 (16 casos).
- **Alternativas descartadas:**
  - Modificar `WebSecurityConfig` (prohibido).
  - DTOs de salida (demasiado grande para una emergencia, ya descartado en el RFC).
  - Que cada clase cree su propio `BCryptPasswordEncoder` para no tocar U55/U80 (acomodar el código a las pruebas).
  - `ObjectProvider<PasswordEncoder>` en los autenticadores para que U80 no necesite el bean (mismo motivo).
  - Migrar con SQL (MySQL no tiene BCrypt).

### [2026-11-10 20:10–20:16] Paso 4: verificación (regresión contra el paso 1)
- 20:10:06 BD recargada con la semilla nueva. `./mvnw test` (20:10:07–20:10:29): `Tests run: 66, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS` (50 + 16 nuevas). En ese log, la migración informa 0/0/0 en los 2 contextos de Spring (la semilla ya está en hash) y 1/1/1 y luego 0/0/0 en U87. 0 hashes y 0 claves en la salida.
- Frontend (sin cambios): `TOTAL: 32 SUCCESS` (20:10:56–20:11:04) y `TOTAL: 49 SUCCESS` (hasta 20:11:11).
- **Migración con una BD en texto plano** (pedido explícito):
  - 20:11:21: se cargó la semilla de LB-9 con `git show LB-9:database/BDPostaMedica.sql | mysql` → 15/15/1 filas en texto plano, 0 con hash.
  - Primer arranque del backend del hotfix (pid 20160): `Migración de claves a BCrypt: 15 paciente(s), 15 médico(s), 1 administrador(es) convertidos`, antes de `Tomcat started`.
  - 20:12:03: las 31 claves con formato BCrypt; login de los 3 roles 200, y 401 con una clave mala; en el log, 0 apariciones de la clave y 0 de `$2a$`.
  - Segundo arranque (pid 28716, 20:12:37): `0 … 0 … 0 convertidos`, y el MD5 de todas las claves de Paciente es igual antes y después.
- **H-032** (Playwright sobre la pantalla real `/admin/pacientes`, 20:13:09–20:13:18): `GET /api/paciente` sin `clave`; el administrador edita el paciente 2 → `200 PUT /api/paciente/actualizar/2`, cuerpo sin `clave`; MD5 de la clave guardada idéntico; el paciente 2 sigue entrando (200).
- 20:13:26 BD recargada. Playwright (20:13:27–20:13:36): **6 passed**.
- 20:13:43 BD recargada. Batería P01–P25 (20:13:44–20:15:07). Backend detenido (pid 28716, 20:15:19). P11/P18 (20:15:23–20:15:42).
- **`diff` contra el paso 1 (sin las líneas de hora):**
  - P01: `/api/medico` 2007→1752 B, `/api/medico/especialidad/1` 411→360 B, `/api/paciente` 2949→2694 B y `/usuarios` 99→82 B, y `clave:true→false`.
  - P03: los 2 `/codigo/1` sin el campo `clave`.
  - P24: la línea del script corregido (`texto-clave-prueba` true→false). En `master`, el rechequeo con comillas también dio 0, así que P24 es igual.
  - **Nada más cambió**: P02, P04–P23 y P25 idénticas; P11/P18 idénticas.
- **P01 no estaba en la lista de pruebas aprobadas.** Su resultado no cambia (PASA, 14/14 en 200), y el RFC ya preveía este "cambio esperado (menor)". Solo bajan los tamaños registrados de los 4 listados que devolvían la clave. No se modificó su definición en PRUEBAS.md, y se le informa al usuario.

### [2026-11-10 20:15–20:19] Paso 5: evidencia y documentación
- 20:15:54 BD recargada. Backend del hotfix arrancado (pid 9644, 20:16:08; migración 0/0/0).
- `curl` sobre `/api/paciente`, `/api/medico`, `/usuarios` y los 2 `/codigo/1`: 200 y 0 apariciones de `"clave"` y de `$2a$`.
- BD: las 31 claves con prefijo `$2a$`, 60 caracteres y formato BCrypt completo. Login de los 3 roles 200, y 401 con una clave mala (20:16:26).
- 20 logins secuenciales: mediana 0,079 s (costo de BCrypt). AUD-CAR-04 (carga concurrente): no se repitió, sin registro.
- Todo está en `docs/evidencias/t19-hotfix.txt`, sin claves ni hashes completos (solo prefijos, largos y MD5 de hashes).
- Actualizados: RFC-010 (estatus, historial, diferencias de diseño, pruebas cambiadas antes/después/por qué, evaluación post-implementación), H-007, H-048 (nuevo), PRUEBAS.md ("Resultados del hotfix RFC-010", U49, U85–U89, resumen) y ELEMENTOS_CONFIGURACION (EC-01, EC-03, EC-18).
- **H-048** (nuevo, numerado así porque `develop` ya usa hasta H-047): el bean `NoOpPasswordEncoder` sigue en `WebSecurityConfig` y alimenta un `AuthenticationManager` que hoy no se usa. Si se activa el filtro JWT, ningún login funcionaría. Queda para el paquete P5.
- 20:19:57: `git diff --stat master` de `WebSecurityConfig.java` y `application.properties` → vacío (no se tocaron).

### Pendientes, fallos propios y estado del entorno (tarea 19)
- **No se hizo el respaldo `mysqldump`** que pide el paso 1 del plan de implementación del RFC. La BD local es de prueba y se recrea con el SQL de LB-9 (`git show LB-9:database/BDPostaMedica.sql`), que es el back-out de datos. En una BD con datos reales, el respaldo es obligatorio antes de arrancar el backend nuevo, porque la migración no se puede revertir.
- Fallo propio: RFC-010 se trajo de `develop` con `git checkout develop -- …` (comando de terminal; ver el paso 2).
- **Merge a `develop`:** `docs/BITACORA.md`, `docs/HALLAZGOS.md` (fila de H-007) y `docs/rfc/RFC-010.md` cambiaron en las dos ramas. Se esperan conflictos solo en `docs/`. Resolución: conservar las entradas de la tarea 18 de `develop` **y** las de esta tarea. El código no cambió en `develop` desde LB-9, así que no debería tener conflictos.
- Estado del entorno al terminar: backend del hotfix corriendo (pid 9644) y `ng serve` corriendo; BD cargada con la semilla nueva (en hash). Para volver a probar `master` hay que recargar la BD con su SQL: con la semilla nueva, el login de LB-9 (`equals`) ya no funciona.
- Push, PR, merges y tag LB-10: no se ejecutaron (los hace el usuario).
- Cumplimiento de CLAUDE.md:
  - La causa quedó escrita antes del código.
  - Ninguna prueba se cambió sin aprobación: las 4 aprobadas en el pedido más U49, U55 y U80, aprobadas antes de tocar código.
  - Sin valores a mano ni condiciones para los datos de prueba: el código no menciona DNIs ni claves; la semilla tiene hashes de la clave documentada.
  - Ningún error se atrapa en silencio.
  - Archivos creados y modificados con Edit/Write, salvo la excepción registrada de RFC-010.
  - Horas tomadas de `date` y de los logs.
  - Sin push ni comandos destructivos de Git.

### [2026-11-10 20:20–20:21] Commit del hotfix y simulación del merge
- 20:20:51: commit `9b250fc` en `hotfix/rfc-010-claves-seguras`, "Hotfix RFC-010: claves con BCrypt y sin exponer en la API (Closes #7)". Esta anotación del hash va en un segundo commit de solo bitácora (como en la tarea 18), para que el árbol quede limpio antes de los merges del usuario.
- `git merge-tree --write-tree --name-only develop hotfix/rfc-010-claves-seguras` (no modifica ninguna rama): conflictos **solo** en `docs/BITACORA.md`, `docs/HALLAZGOS.md` y `docs/rfc/RFC-010.md` (add/add). Se resuelven conservando lo de `develop` (tarea 18) y lo del hotfix (tarea 19). En RFC-010, la versión del hotfix ya contiene la de `develop` más las secciones nuevas.
- `git merge-base --is-ancestor master hotfix/…` → sí: el merge a `master` puede hacerse sin conflictos.

---

## Tarea 20 — Merge del hotfix RFC-010 a `develop` y H-048 asignado a RFC-011

### [2026-11-10 20:25–20:29] Rama, merge y resolución de conflictos
- Estado al empezar (20:25:35): rama actual `master` = `0af31db` ("Merge pull request #48 from BrayanH0/hotfix/rfc-010-claves-seguras", 20:24:41, padres `08b4d99` y `e5ad0a4`); `develop` = `origin/develop` = `5a212cc`; `hotfix/rfc-010-claves-seguras` = `origin/…` = `e5ad0a4`; base común `08b4d99`. El tag `LB-10` ya existe (lo creó el usuario).
- 20:25:42: `git switch -c merge/hotfix-rfc-010-a-develop develop` y `git merge --no-ff hotfix/rfc-010-claves-seguras`. Conflictos **solo** en los 3 archivos previstos en la tarea 19: `docs/BITACORA.md`, `docs/HALLAZGOS.md` y `docs/rfc/RFC-010.md` (add/add). Los 25 archivos de código, pruebas, SQL y el resto de `docs/` se unieron sin conflicto.
- **Por qué hubo conflicto:** las dos ramas agregaron texto en los mismos lugares desde `08b4d99`. La tarea 18 (`develop`) y la 19 (hotfix) escribieron cada una su entrada al final de la bitácora, cada una reescribió la fila de H-007 y agregó filas al final de la tabla de hallazgos, y cada una creó su propio RFC-010 (la 19 partió de una copia del de la 18).
- **Resolución** (con Edit, sin `git checkout --ours/--theirs`, para que los hooks controlen los archivos):
  - `BITACORA.md`: las dos entradas completas, primero la de la tarea 18 y después la de la tarea 19 (orden cronológico: 15:25–16:00 y 19:44–20:21), separadas por `---`.
  - `RFC-010.md`: la versión del hotfix, como pidió el usuario. Ya contenía todo lo de `develop` más el estatus, el historial, las diferencias de diseño, las pruebas cambiadas y la evaluación post-implementación. Comprobado: `git show hotfix/rfc-010-claves-seguras:docs/rfc/RFC-010.md | diff --strip-trailing-cr - docs/rfc/RFC-010.md` → `IDENTICO`.
  - `HALLAZGOS.md`, fila H-007: se combinaron las dos. La descripción, las ubicaciones y la evidencia completas de la tarea 18 (la versión del hotfix solo tenía un resumen que remitía a "texto completo en `develop`"), más la corrección de la tarea 19 con su estado y su columna "Cambio" ("Corregido en la rama hotfix…", RFC-010). La remisión "(texto completo en `develop`)" se quitó porque ya no aplica, y la línea de `WebSecurityConfig` quedó como `:49-53` (la de la tarea 19, más precisa que `:52`).
  - `HALLAZGOS.md`, final de la tabla: se conservan H-042…H-047 (tarea 18) y después H-048 (tarea 19).
  - **Alternativa descartada:** tomar la fila H-007 de una sola rama. La de `develop` perdía la corrección y la del hotfix perdía el detalle de la auditoría. El pedido es conservar lo de las dos tareas.
- **Comprobaciones de la resolución (20:27):**
  - 0 marcadores de conflicto en los 3 archivos.
  - Líneas de cada rama que no están en el resultado: BITACORA 0 y 0. HALLAZGOS: de `develop`, 2 (la fila H-007 combinada y la fila #7 de la tabla de issues, que el hotfix había actualizado y git unió solo); del hotfix, 5 (la H-007 combinada y las filas H-012, H-013, H-016 y H-032, que en `develop` tienen la versión ampliada de la tarea 18 y git tomó automáticamente porque el hotfix no las tocó).
  - Columnas: 48 filas H-0xx en la tabla principal. Las filas con un número de columnas distinto de 10 (H-027, H-035, H-040, H-043, contando `|` dentro de código) son las mismas que ya tenía `develop`: no las causó el merge. Con el método de la tarea 18 (que no cuenta las barras dentro de código) no se volvió a comprobar: sin registro.
- **Código del merge = código del hotfix:** `git diff --cached --stat hotfix/rfc-010-claves-seguras -- . ':!docs'` → vacío, y el diff `develop`→merge fuera de `docs/` es igual al diff `08b4d99`→hotfix (`IGUAL`).

### [2026-11-10 20:28–20:29] Compilación y pruebas unitarias sobre el merge (antes de cerrarlo)
- `./mvnw test` (20:28:11–20:28:40): `Tests run: 66, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS` (igual que el hotfix en la tarea 19; incluye U89 y `contextLoads` contra MySQL). 0 apariciones de `$2a$` en la salida.
- `ng build --configuration development` (hasta 20:28:23): `exit=0`, 0 advertencias. `ng build` (producción, 20:28:24–20:28:35): `exit=0`, las mismas 2 advertencias de siempre (presupuesto 808.17 kB; `jquery` no ESM).
- Unitarias del frontend con los comandos de `docs/PRUEBAS.md`: `TOTAL: 32 SUCCESS` (20:28:45–20:28:53) y `TOTAL: 49 SUCCESS` (20:28:53–20:29:00).
- Salidas completas en el scratchpad de la sesión (`t20/mvn-test.txt`, `ng-build-dev.txt`, `ng-build-prod.txt`, `fe-32.txt`, `fe-49.txt`), fuera del repositorio.
- **No se ejecutó** la batería P01–P25 ni Playwright: el pedido fue compilar y correr las unitarias, y el código del merge es idéntico byte a byte al del hotfix, que pasó la batería completa en la tarea 19 (20:13–20:15). Si el usuario quiere la regresión completa sobre `develop`, queda pendiente.
- 20:29:23: commit de merge `29a28ea` en `merge/hotfix-rfc-010-a-develop` (padres `5a212cc` = `develop` y `e5ad0a4` = hotfix).

### [2026-11-10 20:29–20:31] H-048 asignado a RFC-011 (pedido del usuario)
- `docs/rfc/RFC-011.md`: H-048 en "Error conocido asociado", sección nueva "Debe corregir también H-048" (qué pasa, por qué le toca a RFC-011, qué hacer, orden con P5, prueba y criterio nuevos) y una fila en el historial (20:29, "Registrado (ampliado)"). El estatus sigue en "Registrado".
- **Por qué RFC-011:** es la RFC que activa los filtros JWT. Mientras estén comentados, el bean NoOp no tiene efecto; si se activan sin corregirlo, ningún login funcionaría.
- `docs/HALLAZGOS.md`, H-048, columna "Cambio que lo atiende": de "Pendiente (paquete P5…)" a "RFC-011 (asignado en la tarea 20…)". Se cambió para que HALLAZGOS y RFC-011 digan lo mismo.
- Comprobado en `docs/entrega/fichas/FICHA_P5.md`: el DESPUÉS de `WebSecurityConfig.java` (archivo completo, desde la línea 211) conserva `NoOpPasswordEncoder` (línea 266). Por eso RFC-011 dice que la corrección va sobre el `WebSecurityConfig` que deje P5, y no en la ficha.
- **No se cambió** la frase de RFC-010 "el bean `NoOpPasswordEncoder` … (H-048) lo debe quitar el paquete P5" (Evaluación post-implementación, "Riesgo residual"): el usuario pidió quedarse con la versión del hotfix. Ahora la asignación vigente es la de HALLAZGOS y RFC-011. Si el usuario quiere, se corrige esa frase en RFC-010.

### Cosas que el usuario debe saber (tarea 20)
- **Numeración de issues:** el número #48 de GitHub ya lo usa el PR del hotfix (`0af31db`, "Merge pull request #48"). La regla "H-0XX = issue #XX" de HALLAZGOS ya no se puede cumplir para H-048, y los issues H-042…H-047 tampoco quedarán con su número si se crean después de otro PR (la tarea 18 lo advirtió). No se creó ningún issue.
- Issue #7: no se consultó en GitHub si se cerró con el merge a `master`: sin registro.
- Entorno al terminar: siguen corriendo el backend del hotfix (pid 9644) y `ng serve` (pid 22608), los dos desde la tarea 19, sin tocar. La BD tiene la semilla con hashes.
- Sin push ni PR (los hace el usuario). La rama `merge/hotfix-rfc-010-a-develop` solo existe en local.
- Fallos propios: ninguno registrado.
- Cumplimiento de CLAUDE.md: los conflictos se resolvieron con Edit; ningún archivo de prueba ni de código se editó; horas tomadas de `date` y `git log`; sin comandos destructivos de Git.
- Commit de documentación: después del merge, en la misma rama, con RFC-011, HALLAZGOS (H-048) y esta entrada. Su hash no puede ir dentro de él mismo: queda en `git log`.

---

## Tarea 24 — RFC-017 (datos semilla) y RFC-012 (doble reserva)

> Nota: las entradas de las tareas 21 a 23 están en la rama `docs/t22-revision-prs`, que todavía no está en `develop`. Esta entrada parte de `develop`.

### [2026-11-11 18:44–18:53] Preparación y batería base sobre `develop`
- `git checkout develop` y `git pull` (fast-forward `463ca1d..d981f3b`, incluye P1, P4 y P5). `develop` = `d981f3b`.
- Los scripts de batería de las tareas 19–23 siguen en el scratchpad de esas sesiones. Se copió `bateria.cjs` (tarea 19) al scratchpad de esta sesión (`t24/bateria.cjs`, fuera del repositorio) y se le agregó, con Edit:
  - un resguardo en P21/P22: si la cita a aceptar o cancelar no está en "Citas Pendientes", registra "NO EJECUTABLE" y sigue (antes el script se cortaba). En la base no cambia nada;
  - las pruebas nuevas P26 (10 reservas simultáneas) y P27 (cancelar libera el horario), que se agregan a `docs/PRUEBAS.md` con RFC-012, y unas líneas "X" de observación para RFC-017 (nombres, conteos, bytes de `Especialidad`). Se corren también en la base, como "antes".
- Runner nuevo `t24/correr24.cjs` (misma secuencia que `correr23.cjs` sin la parte de variables de P5): `ng build`, unitarias 32 y todas, BD + `mvnw test`, BD + backend y `ng serve`, Playwright, BD + batería, backend apagado + P11/P18, BD recargada.
- **Base (`develop` `d981f3b`), 18:49:58–18:53:25:** `ng build` exit 0; frontend `TOTAL: 32 SUCCESS` y `TOTAL: 49 SUCCESS`; `mvnw test` `Tests run: 69, Failures: 0, Errors: 0` · `BUILD SUCCESS`; Playwright `6 passed`; P01–P25 con los mismos resultados que en las tareas anteriores (P13: duplicado `200`, 2 reservas). P26: `{"200":10}`, 10 filas (la doble reserva ocurre). P27: tras cancelar, la pantalla **no** ofrece 11:40 y la API acepta el duplicado antes de cancelar. Salidas en `t24/base/` del scratchpad; resumen en `docs/evidencias/t24-base.txt`.
- 18:52:13: issue de H-048 creado con `gh issue create` → **#54** (etiquetas `bug`, `media`). Ver HALLAZGOS.

### [2026-11-11 18:53] Tarea 24A — RFC-017: causa (antes de cambiar el código)
- 18:53:51: rama `feature/rfc-017-datos-semilla` desde `develop` (`d981f3b`). El RFC proponía `feature/rfc-017-semilla-ficticia`; se usa el nombre que pide la tarea.
- **Nombres reales — causa:** los datos de prueba se escribieron a mano con nombres conocidos. Revisión de las 3 tablas con personas (`Paciente`, `Medico`, `Administrador`): no solo los pacientes 6–15 (expresidentes y políticos peruanos); **los médicos 6–15 también son personas públicas reales** (actores y cantantes: Gómez Bolaños, Legarreta, Vergara, Derbez, Sodi, Luis Miguel, Shakira, Juanes, Hayek, Cruz). RFC-017 pedía revisar `Medico` antes de cerrar; se incluyen. Pacientes 1–5, médicos 1–5 y el administrador tienen nombres genéricos y no se tocan.
- **Tildes (`Pediatr├¡a`) — causa, medida:** el archivo `BDPostaMedica.sql` está bien (`file`: UTF-8; `Pediatría` = `C3 AD`). El servidor y la base usan `utf8mb4`. Pero el cliente `mysql` de Windows abre la sesión con `character_set_client = cp850` (`SELECT @@character_set_client` → `cp850`), y el script no declara su codificación. Al cargarlo, cada byte UTF-8 se lee como un carácter cp850 y se guarda convertido: `HEX(nombre_especialidad)` de Pediatría = `50656469617472` **`E2949C` `C2A1`** `61` ("├" y "¡"), es decir, texto doblemente codificado en la BD. La API lo devuelve tal cual (`Pediatr├¡a`). Afecta a todo texto con tilde o eñe del script (especialidades, estados, CIE, motivos, `Miércoles`, `Bolaños`).
- **Consecuencia funcional encontrada:** `Disponibilidad_Medico.dia_semana` guarda `Miércoles` mal codificado, y el frontend compara con `'Miércoles'` (`horarios-cita.ts`): los miércoles nunca coinciden con el horario del médico y se ofrece el horario por defecto 08:00–20:00. Se corrige con la misma causa. *(Precisión agregada a las 19:01: con los datos semilla todos los horarios son 08:00–20:00, igual que el de defecto, así que no había diferencia visible.)*
- **Decisión:** corregir en el archivo, que es la causa común a cualquier forma de cargarlo: `SET NAMES utf8mb4;` al principio y `CHARACTER SET utf8mb4` en `CREATE DATABASE`. Alternativas descartadas: (1) pedir `mysql --default-character-set=utf8mb4` en la carga: depende de que cada integrante recuerde el parámetro, y el script seguiría fallando con la carga habitual; (2) cambiar la URL JDBC (`characterEncoding`): la conexión del backend no es la causa (se comprueba después de la recarga) y `application.properties` es de P5; (3) reescribir el SQL sin tildes: pierde datos.

### [2026-11-11 18:54–19:02] Tarea 24A — cambios, batería y documentación
- `BDPostaMedica.sql` (Edit): `SET NAMES utf8mb4;`, `CHARACTER SET utf8mb4` en `CREATE DATABASE`, y 20 filas con nombres ficticios (pacientes 6–15, médicos 6–15; se conserva el sexo). Lista en RFC-017, "Cambios respecto del registro", **para revisión del usuario** (el RFC pedía aprobarla antes; la tarea ordenó aplicarla). No se verificó en fuentes externas que ningún nombre coincida con alguien público.
- Comprobación del diff con un script de Node: "filas cambiadas 20 20 resto identico: true" (todo lo que sigue al nombre es igual). `grep` de los apellidos reales en `database/` → 0.
- **Pruebas que dependen de los nombres (punto 3 de la tarea):** ninguna prueba automática (`e2e/tests`, `frontend/src`, `backend/src`) contiene esos nombres. En `docs/PRUEBAS.md` solo el "Obtenido" histórico de P05 (LB-0) menciona al médico 6 por su nombre real: es un registro de lo que se vio, no una aserción, y no se modificó.
- Batería completa 18:55:47–18:58:54 (con los cambios aún sin commit; el runner registra "cambios sin commit: 2"). Igual a la base salvo P01 (tamaños: vuelven a los de LB-0) y el orden de P23 (ordena por apellidos). Backend 69/69, frontend 32/32 y 49/49, Playwright 6/6, backend apagado idéntico.
- 18:59–19:00:02: backend arrancado a mano para medir la conexión: `performance_schema` muestra `character_set_client/connection = utf8mb4` en las conexiones JDBC → la conexión no era la causa. API: `Pediatría` con bytes UTF-8 correctos. Backend detenido (19:00:02).
- RFC-010, "Riesgo residual": corregido (H-048 lo atiende RFC-011, no P5), con la nota de la corrección.
- HALLAZGOS: H-042 corregido en la rama; tabla de issues: #42–#47 existen (ya no "por crear"), H-048 = **#54**, y la nota de que desde H-048 el número del issue no coincide con el del hallazgo; la observación de codificación de la tarea 18 queda con su causa verificada.
- PRUEBAS.md: sección "Resultados de RFC-017". Evidencias: `docs/evidencias/t24-base.txt`, `docs/evidencias/t24-a-rfc017.txt`.
- Pendiente para quien tenga la BD cargada: recargarla con el SQL nuevo (la codificación dañada no se arregla con `UPDATE` simples).

### [2026-11-11 19:13–19:16] Tarea 24 — cierre: commits, simulación del merge y estado
*(Esta entrada se agregó igual en las dos ramas, en un segundo commit de solo bitácora.)*
- Commits: 24A `888ec64` (19:02:07) "RFC-017: datos semilla ficticios y codificación UTF-8 (Closes #42)" en `feature/rfc-017-datos-semilla`; 24B `8a038e8` (19:13:45) "RFC-012: impedir doble reserva con restricción en la BD (Closes #12)" en `feature/rfc-012-doble-reserva`. Las dos parten de `develop` `d981f3b` (`git merge-base` = `d981f3b…`).
- **Simulación del merge de las dos ramas juntas sobre `develop`** (19:13:53, `git merge-tree --write-tree feature/rfc-017-datos-semilla feature/rfc-012-doble-reserva`, no modifica ninguna rama):
  - `database/BDPostaMedica.sql`: **sin conflicto** (Auto-merging). Las dos tocan el SQL en partes distintas (24A: cabecera y `INSERT` de médicos y pacientes; 24B: `CREATE TABLE Cita`). El SQL combinado se cargó en MySQL: `carga=0`, Pediatría `…C3AD61`, paciente 6 "Teodoro Quispe Ancco", índice `uq_cita_medico_fecha_hora` presente (4 columnas), 21 citas.
  - `docs/evidencias/t24-base.txt`: sin conflicto (mismo blob `0a86ccb` en las dos).
  - **Conflictos solo en `docs/`**: `BITACORA.md` (las dos agregan su entrada al final), `HALLAZGOS.md` (las dos agregan una nota de la tarea 24 después de la tabla de issues) y `PRUEBAS.md` (las dos agregan su sección de resultados después del hotfix RFC-010). Resolución: conservar las dos partes, primero 24A y después 24B. En HALLAZGOS, las filas H-012 y H-042 no chocan (son líneas distintas).
  - Recomendación: hacer el merge de 24A primero (fast-forward desde `develop`) y después el de 24B, resolviendo los 3 archivos de `docs/`.
- **No se ejecutó la batería sobre la combinación** de las dos ramas (cada una se probó por separado contra la misma base). Sin registro de una corrida combinada.
- **Fallos propios y notas de método:**
  - Un `grep` del principio sin `-a` no buscó en `PRUEBAS.md` (lo trató como binario) y dio "sin resultados"; se repitió con `-a` y apareció el "Obtenido" histórico de P05.
  - El plan de back-out de RFC-012 (solo `DROP INDEX`) estaba mal; se detectó al probarlo (ver 24B).
  - Las baterías de 24A y 24B se corrieron con los cambios todavía sin commit (el runner lo registra); los commits contienen exactamente esos archivos más la documentación.
- **Estado del entorno al terminar:** backend y frontend detenidos (los arrancó y detuvo el runner; el backend que arranqué a mano para medir la conexión se detuvo a las 19:00:02). La BD local quedó cargada con el **SQL combinado** de la simulación (24A + 24B). Rama actual al cerrar: `feature/rfc-017-datos-semilla`. Issue #54 creado en GitHub. Sin push ni PR.
- **Decisiones pendientes del usuario:** (1) P22 (RFC-012); (2) revisar la lista de nombres ficticios (RFC-017); (3) si se baja el nivel del log de Hibernate ante un 409.
- Cumplimiento de CLAUDE.md: causa escrita antes del código en las dos tareas; sin valores a mano ni condiciones para los datos de prueba en el código (el frontend usa el id de estado 3, que es el de la BD); ningún error atrapado en silencio (el 409 deja `WARN`, el resto sigue con `log.error`); ninguna prueba existente modificada (P22 se informa, no se cambia); archivos del repositorio creados y modificados con Write/Edit; horas tomadas de `date`, de los logs del runner y de `git log`; sin comandos destructivos de Git. Excepciones: los scripts y salidas del scratchpad se copiaron o crearon con `cp`/`mkdir` y Node, fuera del repositorio.
- Comandos para el usuario (cmd de Windows, una línea cada uno):
  - `git push -u origin feature/rfc-017-datos-semilla`
  - `git push -u origin feature/rfc-012-doble-reserva`
  - `gh pr create --base develop --head feature/rfc-017-datos-semilla --title "RFC-017: datos semilla ficticios y codificación UTF-8 (Closes #42)" --body "…"`
  - `gh pr create --base develop --head feature/rfc-012-doble-reserva --title "RFC-012: impedir doble reserva con restricción en la BD (Closes #12)" --body "…"`

## Tarea 24B — RFC-012 (doble reserva, opción B)

> Rama `feature/rfc-012-doble-reserva` desde `develop` (`d981f3b`), **no** desde 24A, como pide la tarea. La preparación y la batería base de la tarea 24 (18:44–18:53, `docs/evidencias/t24-base.txt`) están registradas en la entrada "Tarea 24" de la rama de 24A; se repite aquí lo necesario.

### [2026-11-11 19:02] Causa (antes de cambiar el código)
- 19:02:16: rama creada. Base de comparación: la batería de `develop` de las 18:49–18:53 (backend 69/69, frontend 32/32 y 49/49, Playwright 6/6; P13 duplicado `200` con 2 reservas; P26 nueva `{"200":10}` con 10 filas; P27 nueva: tras cancelar, la pantalla no ofrece el horario).
- **Por qué ocurre:** la tabla `Cita` no tiene ninguna restricción sobre `(id_medico, fecha_cita, hora_cita)`; `CitaService.crearCita` hace `save` sin validar; el frontend solo oculta las horas al cargar la lista. Una validación "consultar y luego insertar" no es atómica (P26: 10 de 10 simultáneas se guardan). La garantía tiene que estar en la BD.
- **Por qué un horario cancelado no se libera hoy:** `calcularHorariosDisponibles` (`horarios-cita.ts`) trata como ocupada toda cita del día que devuelve `/api/citas/medico/{id}/fecha/{fecha}`, sin mirar `estado_cita`.
- **Decisión del usuario: opción B** (RFC-012, "Decisión pendiente"): columna generada `slot_activo = IF(estado_cita = 3, NULL, 1)` y `UNIQUE (id_medico, fecha_cita, hora_cita, slot_activo)`. MySQL admite varios `NULL` en un índice UNIQUE, así que las canceladas no ocupan el horario.
- **El estado 3 es "Cancelada" (confirmado en el código):** orden de los `INSERT INTO Estado_Cita` de `BDPostaMedica.sql` (Pendiente, Confirmada, **Cancelada**, Atendida, Reprogramada → id 3); `mis-citas.component.ts:75` (`case 3: return 'Cancelada'`); `ReporteController.java:36` (`countByEstadoCita(3)` para las canceladas).
- Semilla: `SELECT … WHERE estado_cita IS NULL OR estado_cita<>3 GROUP BY id_medico, fecha_cita, hora_cita HAVING COUNT(*)>1` → sin filas (19:02): la restricción se puede crear.

### [2026-11-11 19:02–19:12] Cambios, pruebas y documentación
- **BD:** `BDPostaMedica.sql` (columna generada `slot_activo` + `uq_cita_medico_fecha_hora`); migración `database/migraciones/RFC-012-slot-activo.sql` (lista duplicados y crea la restricción) y su back-out `RFC-012-slot-activo-revertir.sql`.
- **Prueba de la migración** (19:03, script `t24/migracion.cjs` del scratchpad): BD de `develop` + migración → `SHOW CREATE TABLE` igual a la BD nueva y datos iguales (MD5); con duplicados activos → los lista, falla con `ERROR 1062` y la tabla no cambia; con una cancelada y una activa en la misma hora no los cuenta como duplicado.
- **Fallo encontrado en el back-out del RFC** (19:03:20): `DROP INDEX uq_cita_medico_fecha_hora` falla con `ERROR 1553 … needed in a foreign key constraint`, porque InnoDB usa el índice UNIQUE (empieza por `id_medico`) para la FK de `id_medico`. Se corrigió el script de reversión para recrear antes el índice `id_medico`; repetido a las 19:03:37: la tabla queda igual a la de `develop`. Corregido también el "Plan de back-out" de RFC-012.
- **Backend:** `GlobalExceptionHandler` con un handler nuevo para `DataIntegrityViolationException`. Si la causa nombra la restricción → 409 con mensaje propio y `WARN`. Si no → llama a `handleRuntimeException` (la respuesta 500 y el `log.error` de P1 no cambian; `GlobalExceptionHandlerTest` pasa sin cambios). Alternativa descartada: capturar en `CitaService` (habría que repetirlo en los 3 caminos que guardan citas).
- **Frontend:** `horarios-cita.ts` ignora las citas con `estado_cita === 3` al calcular las horas; `registrar-cita.component.ts` ante un 409 muestra el `message`, borra la hora elegida y recarga las horas. Ninguna prueba existente usa `estado_cita` (U19–U23, U75–U79 pasan sin cambios).
- **Pruebas nuevas:** U90 (4), U91 (2, servidor + BD reales con 10 hilos), U92 (7), E01 (Playwright, dos pestañas). Primera corrida aislada 19:05: backend 7/7 de las clases tocadas; frontend `TOTAL: 56 SUCCESS`.
- **Batería completa 19:07:07–19:09:55** (cambios sin commit): backend 75/75, frontend 32/32 y 56/56, Playwright 7/7. Diferencias con la base solo por la corrección: P13 FALLA→PASA (409, 1 reserva); P14 y P16 una cita menos; P20, P21 y P23 sin la cita 23; P26 `{"200":1,"409":9}` y 1 fila; P27 el horario cancelado vuelve a ofrecerse. Backend apagado: idéntico.
- **P22 queda no ejecutable** (cancelaba la cita 23 de la doble reserva). **No se modificó**: decide el usuario; opciones en RFC-012.
- Observación: cada 409 deja además una línea `ERROR … SqlExceptionHelper : Duplicate entry …` de Hibernate en el log (12 en la corrida, igual que los `WARN` propios). No se cambió la configuración de logs; anotado en HALLAZGOS.
- Documentación: RFC-012 (decisión B, diseño, antes/después, P22, evaluación), HALLAZGOS (H-012 corregido en la rama, observaciones), PRUEBAS.md (P26, P27, U90–U92, E01, resultados). Evidencia: `docs/evidencias/t24-b-rfc012.txt`.

### [2026-11-11 19:13–19:17] Tarea 24 — cierre: commits, simulación del merge y estado
*(La misma entrada está en la rama de 24A, commit `3dd49a9`, escrita antes de volver a esta rama; la única diferencia es la rama actual al cerrar.)*
- Commits: 24A `888ec64` (19:02:07) "RFC-017: datos semilla ficticios y codificación UTF-8 (Closes #42)" y `3dd49a9` (cierre) en `feature/rfc-017-datos-semilla`; 24B `8a038e8` (19:13:45) "RFC-012: impedir doble reserva con restricción en la BD (Closes #12)" en `feature/rfc-012-doble-reserva`. Las dos parten de `develop` `d981f3b`.
- **Simulación del merge de las dos ramas juntas sobre `develop`** (19:13:53, `git merge-tree --write-tree feature/rfc-017-datos-semilla feature/rfc-012-doble-reserva`, no modifica ninguna rama):
  - `database/BDPostaMedica.sql`: **sin conflicto** (Auto-merging). Las dos tocan el SQL en partes distintas (24A: cabecera y `INSERT` de médicos y pacientes; 24B: `CREATE TABLE Cita`). El SQL combinado se cargó en MySQL: `carga=0`, Pediatría `…C3AD61`, paciente 6 "Teodoro Quispe Ancco", índice `uq_cita_medico_fecha_hora` presente (4 columnas), 21 citas.
  - `docs/evidencias/t24-base.txt`: sin conflicto (mismo blob `0a86ccb` en las dos).
  - **Conflictos solo en `docs/`**: `BITACORA.md` (las dos agregan su entrada al final), `HALLAZGOS.md` (las dos agregan una nota de la tarea 24 después de la tabla de issues) y `PRUEBAS.md` (las dos agregan su sección de resultados después del hotfix RFC-010). Resolución: conservar las dos partes, primero 24A y después 24B. En HALLAZGOS, las filas H-012 y H-042 no chocan.
  - Recomendación: merge de 24A primero (fast-forward desde `develop`) y después 24B, resolviendo los 3 archivos de `docs/`.
- **No se ejecutó la batería sobre la combinación** de las dos ramas (cada una se probó por separado contra la misma base). Sin registro de una corrida combinada.
- **Fallos propios y notas de método:** un `grep` del principio sin `-a` trató `PRUEBAS.md` como binario y dio "sin resultados"; repetido con `-a`, apareció el "Obtenido" histórico de P05. El plan de back-out de RFC-012 estaba mal (detectado al probarlo). Las baterías se corrieron con los cambios aún sin commit (el runner lo registra).
- **Estado del entorno al terminar:** backend y frontend detenidos. La BD local quedó cargada con el **SQL combinado** de la simulación (24A + 24B). Rama actual al cerrar: `feature/rfc-012-doble-reserva`. Issue #54 creado en GitHub. Sin push ni PR.
- **Decisiones pendientes del usuario:** (1) P22; (2) revisar la lista de nombres ficticios (RFC-017); (3) si se baja el nivel del log de Hibernate ante un 409.
- Cumplimiento de CLAUDE.md: causa escrita antes del código; sin valores a mano ni condiciones para los datos de prueba; ningún error atrapado en silencio; ninguna prueba existente modificada; archivos del repositorio con Write/Edit; horas de `date`, logs y `git log`; sin comandos destructivos de Git. Excepción: scripts y salidas del scratchpad creados o copiados con `cp`/`mkdir`/Node, fuera del repositorio.
- Comandos para el usuario (cmd de Windows, una línea cada uno): `git push -u origin feature/rfc-017-datos-semilla`; `git push -u origin feature/rfc-012-doble-reserva`; y un `gh pr create --base develop --head <rama> …` por rama (texto completo en el reporte de la tarea).
