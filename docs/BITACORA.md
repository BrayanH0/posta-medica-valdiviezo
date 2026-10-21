# Bitácora del proyecto (informe de estado)

Registro cronológico de cada acción realizada sobre el sistema "Posta Médica Valdiviezo".
Horas en hora local de Perú (UTC-5). Las evidencias están en `docs/evidencias/` o se indican por hash de commit.

---

### [2026-10-20 19:10] Agregar exclusiones al .gitignore
- Qué se hizo: se agregaron al `.gitignore` existente las reglas `backend/backend/target/`, `node_modules/`, `dist/` y `*.log`.
- Por qué: el `.gitignore` original solo tenía rutas ancladas a la raíz (`/node_modules/`, `/dist/`) y no cubría las subcarpetas del backend ni del frontend.
- Resultado: `git diff --cached --name-only | grep -cE "target/|node_modules/|dist/|\.log$"` devolvió `0`. Ningún artefacto de compilación entró al repositorio.
- Evidencia: commit `17e2118`.

### [2026-10-20 19:12] Inicializar Git y commit inicial
- Qué se hizo: `git init` y commit con el estado del proyecto tal como se recibió. Como Git no tenía identidad configurada, se configuró nombre y correo solo para este repositorio (no global).
- Por qué: tener un punto de retorno antes de cualquier cambio.
- Resultado: commit creado con 236 archivos.
- Evidencia: commit `17e2118770581af7df4feda02b2b31299e7758f9` — "Commit inicial: estado actual del proyecto".

### [2026-10-20 19:13] Primer intento de conexión a MySQL
- Qué se hizo: conexión con usuario `root` y la contraseña `admin` que figuraba en `application.properties`.
- Por qué: crear la base de datos con el script `BDPostaMedica.sql`.
- Resultado: falló con `ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)`. Se detuvo el trabajo y se avisó al usuario sin cambiar nada.
- Evidencia: salida de consola citada arriba.

### [2026-10-20 19:13] Compilación de backend y frontend (sin base de datos)
- Qué se hizo: `mvnw -DskipTests compile` en el backend; `npm install` y `ng build --configuration development` en el frontend.
- Por qué: detectar errores de compilación mientras se resolvía el acceso a MySQL.
- Resultado: backend `MVN EXIT: 0`. Frontend: "Application bundle generation complete" con 2 advertencias `NG8113` (`RouterLink` y `RouterLinkActive` importados y no usados en `src/app/app.ts:8`). Ver H-011.
- Evidencia: salida de consola de la sesión.

### [2026-10-20 19:15] Ajuste de la contraseña en application.properties (usuario)
- Qué se hizo: el usuario cambió `spring.datasource.password` de `admin` a la contraseña real de su MySQL local.
- Por qué: la contraseña original no coincidía con la instalación local.
- Resultado: la conexión con la nueva contraseña funcionó.
- Evidencia: diff de `backend/backend/src/main/resources/application.properties` incluido en el commit LB-0. Ver H-006.

### [2026-10-20 19:16] Cambio de nombre de la base de datos a posta_medica_valdiviezo
- Qué se hizo: se reemplazó `sistema_citas_valdiviezo` por `posta_medica_valdiviezo` en `BDPostaMedica.sql` (líneas 2, 21, 22 y 326) y en la URL de `application.properties` (línea 1).
- Por qué: pedido del usuario, para que la base de datos lleve el nombre de la clínica que muestra el frontend ("Posta Médica Valdiviezo") y no el de una persona.
- Resultado: `grep -n posta_medica` confirmó los 5 reemplazos.
- Evidencia: commit LB-0.

### [2026-10-20 19:16] Creación de la base de datos
- Qué se hizo: ejecución completa de `BDPostaMedica.sql` con `mysql -uroot --default-character-set=utf8mb4`.
- Por qué: el backend necesita la base para arrancar.
- Resultado: sin errores. 12 tablas creadas: administrador 1, cie 5, cita 21, disponibilidad_medico 75, especialidad 5, estado_cita 5, estado_paciente 5, evolucion_clinica 11, historia_clinica 5, medico 15, paciente 15, ubigeo 5 filas.
- Evidencia: consulta a `information_schema.tables` en la sesión.

### [2026-10-20 19:17] Arranque del backend y del frontend
- Qué se hizo: `mvnw spring-boot:run` (backend) y `npm start` (frontend).
- Por qué: poner el sistema en marcha.
- Resultado: `Tomcat started on port 8080` y `Started CentroValdiviezoApplication in 4.733 seconds`. Frontend en `http://localhost:4200/`.
- Evidencia: log de arranque de la sesión.

### [2026-10-20 19:18] Prueba de endpoints con peticiones reales
- Qué se hizo: `curl` a todos los GET de los 14 controladores, más el login de los 3 roles y una petición CORS preflight.
- Por qué: saber qué endpoints responden con datos.
- Resultado: todos los endpoints responden `200` con datos, excepto `GET /api/medico/resumenMedico` → `500` (H-005). Login: 200 para paciente, médico y admin; 401 con credenciales inválidas. CORS permite `http://localhost:4200`.
- Evidencia: pruebas P01–P04 y P09 en `PRUEBAS.md`.

### [2026-10-20 19:19] Apertura de las 20 pantallas del frontend
- Qué se hizo: se abrieron con Playwright las 20 rutas de `app.routes.ts`. La sesión se simuló escribiendo directamente en localStorage (no por formulario).
- Por qué: comprobar qué pantallas cargan sin error.
- Resultado: las 20 rutas cargaron sin errores de consola ni peticiones fallidas. Limitación: no se probaron formularios ni acciones en esta ronda.
- Evidencia: salida de Playwright de la sesión.

### [2026-10-20 19:24] Completar el renombrado en la documentación
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

### [2026-10-20 19:28] Reinicio del backend
- Qué se hizo: se volvió a ejecutar `mvnw spring-boot:run`.
- Por qué: continuar con las pruebas.
- Resultado: `GET /api/cie` → `backend 200`.
- Evidencia: salida de consola de la sesión.

### [2026-10-20 20:00] Creación de la estructura de documentación
- Qué se hizo: se crearon `docs/BITACORA.md`, `docs/HALLAZGOS.md`, `docs/PRUEBAS.md`, `docs/ELEMENTOS_CONFIGURACION.md`, `docs/refactorizaciones/` y `docs/evidencias/`. La captura del paso 3b se movió desde la carpeta temporal a `docs/evidencias/`.
- Por qué: dejar documentada la línea base LB-0.
- Resultado: estructura creada.
- Evidencia: commit LB-0.

### [2026-10-20 20:00] Redacción de HALLAZGOS, PRUEBAS y ELEMENTOS_CONFIGURACION
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
