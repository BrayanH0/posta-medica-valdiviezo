# Batería oficial de pruebas (auditoría)

> **Regla:** Cada cambio se compara con la línea base anterior. En los cambios correctivos (RFC) los resultados pueden cambiar a propósito. En la reorganización y en las refactorizaciones (LB-4 a LB-8) el resultado debe ser IGUAL al de la línea base anterior.
>
> Una refactorización no cambia el comportamiento externo: si en LB-4 a LB-8 un resultado cambia, ese cambio introdujo un error. Esto incluye las pruebas que hoy FALLAN por hallazgos correctivos sin RFC (por ejemplo P13, doble reserva, H-012): deben seguir fallando igual.

> **Regresión:** correr la batería completa (todas las pruebas, P01 en adelante) en cada línea base nueva es la **prueba de regresión** del proyecto. Su objetivo es comprobar que un cambio no rompió nada de lo que ya funcionaba y que lo que fallaba sigue fallando igual, salvo lo que el cambio corrige a propósito.
>
> **Pruebas unitarias en la regresión (desde 2026-10-21, tarea 9):** cada línea base nueva corre también las pruebas unitarias del frontend (U01–U32) y del backend (U33–U62 más las 3 clases de prueba que ya tenía el proyecto), con los comandos de la sección "Pruebas unitarias". Deben dar el **mismo resultado** que en la línea base anterior. En la reorganización y en las refactorizaciones (LB-4 a LB-8) eso significa que todas siguen pasando sin modificarlas, incluidas las que caracterizan errores conocidos. Si un RFC correctivo corrige a propósito un error caracterizado (por ejemplo H-022, H-029, H-031 o H-032), la prueba de ese error fallará: el RFC debe nombrarla y el usuario decide cómo se cambia.

**Tipos de prueba** (línea "Tipo:" en cada prueba):
- **Integración (API + base de datos):** se llama al backend con `curl` y se comprueba la respuesta contra los datos de la BD, sin navegador.
- **Sistema/E2E (navegador de punta a punta):** se usa la aplicación en el navegador como un usuario (frontend → backend → BD).
- **Aceptación:** prueba de punta a punta que verifica un criterio del usuario o de una RFC (por ejemplo, "registrar una cita", "cerrar sesión borra la sesión").
- **Unitaria:** prueba de una clase aislada (componente, servicio o controlador) con dobles de prueba (mocks) en lugar de `HttpClient`, `Router`, `AuthService` o los repositorios. No usa el backend real ni la base de datos. Ver la sección "Pruebas unitarias".

**Orden de ejecución:** las pruebas se corren en el orden del documento. P14–P16 dependen de P12 y P13 (que agregan 2 citas): en LB-0 se midieron con 23 citas en la BD.

**Entorno de la línea base (LB-0):** backend en `http://localhost:8080`, frontend en `http://localhost:4200`, base `posta_medica_valdiviezo` recién cargada con `BDPostaMedica.sql`.
Las pruebas de navegador se hacen con Playwright, **una pestaña nueva por caso**, escribiendo en el formulario.

**Credenciales de prueba:** paciente `12345678` / `123456` · médico `10000001` / `123456` · admin `87654321` / `123456`.

**Nota sobre "esperado":** el resultado esperado describe el comportamiento correcto. Si en la línea base lo obtenido no coincide, la prueba queda como FALLA y se enlaza el hallazgo. En cada línea base se compara contra lo **obtenido** en la línea base anterior.

---

### P01 — Endpoints GET de catálogos y listados
- Tipo: Integración (API + base de datos)
- Qué se hace: `curl` a `/api/cie`, `/api/cita`, `/api/disponibilidad_medico`, `/api/especialidad`, `/api/estado_cita`, `/api/estado_paciente`, `/api/evolucion_clinica`, `/api/historia_clinica`, `/api/medico`, `/api/medico/conEspecialidad`, `/api/medico/especialidad/1`, `/api/paciente`, `/api/ubigeo`, `/usuarios`.
- Esperado: HTTP 200 con datos en todos.
- Obtenido: 200 en los 14. Tamaños: cie 291 B, cita 2811 B, disponibilidad_medico 8632 B, especialidad 554 B, estado_cita 458 B, estado_paciente 461 B, evolucion_clinica 1443 B, historia_clinica 746 B, medico 2003 B, medico/conEspecialidad 2492 B, medico/especialidad/1 407 B, paciente 2949 B, ubigeo 311 B, usuarios 99 B.
- Resultado: **PASA**

### P02 — Endpoints de reportes y consultas agregadas
- Tipo: Integración (API + base de datos)
- Qué se hace: `curl` a `/api/reportes/dashboard`, `/api/reportes/resumen`, `/api/reportes/ingresosMensuales`, `/api/cita/porEstado`, `/api/cita/porEspecialidad`, `/api/citas/medico/1/fecha/2023-07-01`.
- Esperado: HTTP 200 con datos.
- Obtenido: 200 en los 6. Ejemplos: `porEstado` → `[{"estadoCita":"Pendiente","cantCita":2},{"estadoCita":"Confirmada","cantCita":1},{"estadoCita":"Cancelada","cantCita":1},{"estadoCita":"Atendida","cantCita":17…`; `citas/medico/1/fecha/2023-07-01` → `[{"idCita":1,"id_paciente":1,"id_medico":1,"fecha_cita":"2023-07-01","hora_cita":"09:00:00","motivo":"Chequeo general","estado_cita":4}]`.
- Resultado: **PASA**

### P03 — Endpoints por ID
- Tipo: Integración (API + base de datos)
- Qué se hace: `curl` a `/api/cita/1`, `/api/medico/codigo/1`, `/api/paciente/codigo/1`, `/api/cie/1`, `/api/especialidad/1`, `/api/historia_clinica/1`, `/api/evolucion_clinica/1`, `/api/ubigeo/1`, `/api/estado_cita/1`, `/api/disponibilidad_medico/1`, `/api/disponibilidad_medico/medico/1`.
- Esperado: HTTP 200 con el registro pedido.
- Obtenido: 200 en los 11. Ejemplo: `/api/paciente/codigo/1` → `{"idPaciente":1,"nombres":"Juan","apellidos":"Perez Gomez","dni":"12345678","clave":"123456",…}`. La respuesta incluye la contraseña (ver H-007).
- Resultado: **PASA** (con hallazgo H-007)

### P04 — Endpoint resumen de médicos
- Tipo: Integración (API + base de datos)
- Qué se hace: `curl http://localhost:8080/api/medico/resumenMedico`
- Esperado: HTTP 200 con la cantidad de médicos por especialidad.
- Obtenido: `500 {"message":"Cannot instantiate query result type 'com.centro_valdiviezo.backend.dto.ResumenMedico' due to: Result class must have a single constructor with exac…`
- Resultado: **FALLA** → H-005

### P05 — Login por formulario: paciente
- Tipo: Sistema/E2E (navegador de punta a punta)
- Qué se hace: abrir `/login-paciente`, escribir `12345678` / `123456`, pulsar "Iniciar Sesión".
- Esperado: redirige a la pantalla del paciente y guarda la sesión.
- Obtenido: red `200 POST /login`; URL final `/welcome`; localStorage `{"userId":"1","userName":"Juan Perez Gomez","userType":"paciente"}`. "Mis Citas" muestra datos reales: `2023-07-01 - 09:00:00 Atendida Médico: Jorge Santos Ruiz … 2023-07-06 - 09:00:00 Pendiente Médico: Roberto Gomez Bolaños`.
- Resultado: **PASA**

### P06 — Login por formulario: médico
- Tipo: Sistema/E2E (navegador de punta a punta)
- Qué se hace: abrir `/login-medico`, escribir `10000001` / `123456`, pulsar "Iniciar Sesión".
- Esperado: redirige al panel médico y guarda la sesión con las mismas claves que los otros roles.
- Obtenido: red `200 POST /login`; URL final `/medico-dashboard`; localStorage `{"userId":"1","userName":"Jorge Santos Ruiz","userType":"medico"}`.
- Resultado: **PASA** (claves iguales a paciente; distintas de admin → H-002)

### P07 — Login por formulario: administrador
- Tipo: Sistema/E2E (navegador de punta a punta)
- Qué se hace: abrir `/login-admin`, escribir `87654321` / `123456`, pulsar "Iniciar Sesión".
- Esperado: redirige al panel admin y guarda la sesión con las mismas claves que los otros roles.
- Obtenido: red `200 POST /login`; URL final `/admin/inicio`; localStorage `{"userApellidos":"Principal","userDni":"87654321","userId":"1","userNombre":"Admin","userRol":"ADMIN","userTipo":"administrador"}`.
- Resultado: **FALLA** (claves distintas) → H-002

### P08 — Login con contraseña incorrecta (3 roles)
- Tipo: Sistema/E2E (navegador de punta a punta)
- Qué se hace: en cada login, DNI correcto y clave `malaclave`.
- Esperado: no entra, localStorage vacío, mismo mensaje de error en los 3 roles.
- Obtenido:
  - paciente: `401 POST /login`, se queda en `/login-paciente`, localStorage `{}`, mensaje "Credenciales inválidas".
  - médico: `401 POST /login`, se queda en `/login-medico`, localStorage `{}`, mensaje "Credenciales inválidas".
  - admin: `401 POST /login`, se queda en `/login-admin`, localStorage `{}`, mensaje "Error al iniciar sesión. Por favor intente nuevamente."
- Resultado: **PASA** en seguridad; **FALLA** en consistencia del mensaje → H-003

### P09 — Login directo a la API
- Tipo: Integración (API + base de datos)
- Qué se hace: `curl -X POST /login` con las credenciales de los 3 roles y con `00000000` / `x`.
- Esperado: 200 con los datos del rol; 401 con credenciales inválidas.
- Obtenido: paciente `200 {"tipo":"paciente","success":true,"id":1,…}`; médico `200 {"tipo":"medico","success":true,"cmp":"CMP12345","id":1,…}`; admin `200 {"tipo":"administrador","success":true,"rol":"ADMIN","id":1,…}`; inválido `401 {"error":"Credenciales inválidas"}`.
- Resultado: **PASA**

### P10 — Login de paciente con DNI inexistente y clave 123456
- Tipo: Sistema/E2E (navegador de punta a punta)
- Qué se hace: abrir `/login-paciente`, escribir `99999999` (no existe) / `123456`.
- Esperado: no entra; muestra "Credenciales inválidas".
- Obtenido: red `401 POST /login`; URL final `/welcome`; localStorage `{"userId":"1","userName":"Juan Perez (Mock)","userType":"paciente"}`. Entra como el paciente 1.
- Resultado: **FALLA** → H-001

### P11 — Módulo médico con el backend apagado
- Tipo: Sistema/E2E (navegador de punta a punta)
- Qué se hace: con sesión de médico, abrir Médico > Citas Pendientes con el backend corriendo; apagar el backend; recargar; comparar con `SELECT … FROM Cita WHERE estado_cita=1`.
- Esperado: con backend corriendo muestra las citas pendientes reales de la BD; con backend apagado muestra un error.
- Obtenido: en los dos casos muestra `101 Maria Lopez Quispe`, `102 Luis Torres Paz`, `103 Ana Diaz Ruiz`. No hace peticiones a `:8080`. Consola sin errores con el backend apagado. La BD tiene como pendientes `6 Juan Perez Gomez` y `8 Carlos Ruiz Diaz`; los IDs 101–103 no existen.
- Evidencia: `docs/evidencias/paso3b-medico-citas-pendientes-backend-apagado.png`
- Resultado: **FALLA** → H-004

### P12 — Registrar una cita nueva desde el formulario (paciente)
- Tipo: Aceptación
- Qué se hace: login por formulario `12345678` / `123456`; en "Registrar Cita" elegir Medicina General, Dr(a). Jorge Santos Ruiz, fecha `2026-10-26` (lunes), hora `10:00`, motivo "Prueba LB-0: control general"; pulsar "Confirmar Cita". Luego `SELECT * FROM Cita ORDER BY idCita DESC LIMIT 3;`
- Esperado: alerta de éxito, la cita queda guardada en la BD con estado Pendiente (1) y aparece en "Mis Citas".
- Obtenido: alerta "Cita registrada con éxito", redirige a `/welcome`. En la BD:
  ```
  | idCita | id_paciente | id_medico | fecha_cita | hora_cita | motivo                       | estado_cita |
  |     22 |           1 |         1 | 2026-10-26 | 10:00:00  | Prueba LB-0: control general |           1 |
  |     21 |          10 |         4 | 2023-12-24 | 11:00:00  | Alergia                      |           4 |
  |     20 |           9 |         3 | 2023-12-20 | 10:00:00  | Arritmia                     |           4 |
  ```
  `estado_cita = 1` (Pendiente). "Mis Citas" muestra `2026-10-26 - 10:00:00 Pendiente Médico: Jorge Santos Ruiz Especialidad: Medicina General Motivo: Prueba LB-0: control general`.
- Evidencia: `docs/evidencias/paso4a-registrar-cita-formulario-pestanaA.png`, `docs/evidencias/paso4-mis-citas-con-cita-nueva.png`
- Resultado: **PASA**
- Nota de método: en pestañas de Playwright que no están al frente, el clic en el botón de hora no actualiza el componente (`hora_cita` queda en `""`). Con la pestaña al frente funciona. Es una limitación de la herramienta de prueba, no de la aplicación.

### P13 — Doble reserva (mismo médico, fecha y hora)
- Tipo: Aceptación
- Qué se hace: con la cita 22 ya guardada, intentar otra cita con el mismo médico (1), fecha (`2026-10-26`) y hora (`10:00`).
  1. Pestaña B abierta **antes** de guardar la cita 22: la lista de horas sigue mostrando `10:00` como libre (`horariosDisponibles` = `["08:00",…,"09:40","10:00","10:20"]`).
  2. Pestaña nueva abierta **después**: la lista ya no incluye `10:00` (`contiene1000: false`).
  3. Se envía a la API el mismo POST que manda la pestaña B al confirmar (el cuerpo es el que arma `registrarCita()`): `POST /api/cita {"id_paciente":1,"id_medico":1,"fecha_cita":"2026-10-26","hora_cita":"10:00:00","motivo":"Prueba LB-0: doble reserva (pestana B)","estado_cita":1}`.
- Esperado: el sistema rechaza la segunda reserva.
- Obtenido: `HTTP 200` → `{"idCita":23,…}`. En la BD:
  ```
  | idCita | id_paciente | id_medico | fecha_cita | hora_cita | motivo                                 | estado_cita |
  |     23 |           1 |         1 | 2026-10-26 | 10:00:00  | Prueba LB-0: doble reserva (pestana B) |           1 |
  |     22 |           1 |         1 | 2026-10-26 | 10:00:00  | Prueba LB-0: control general           |           1 |

  | id_medico | fecha_cita | hora_cita | reservas |
  |         1 | 2026-10-26 | 10:00:00  |        2 |
  ```
- Evidencia: `docs/evidencias/paso4b-pestana-nueva-oculta-1000.png`, `docs/evidencias/paso4-mis-citas-con-cita-nueva.png` (muestra las dos citas a la misma hora)
- Resultado: **FALLA** → H-012
- Limitación: el paso 3 se hizo con `curl` porque la pestaña B dejó de responder a los clics (ver nota de P12). El cuerpo enviado es idéntico al que genera el formulario.

### P14 — Alcance de `/api/cita`
- Tipo: Integración (API + base de datos)
- Qué se hace: `curl http://localhost:8080/api/cita`; contar total y citas con `id_paciente = 1`. Comparar con `SELECT COUNT(*), SUM(id_paciente=1) FROM Cita`.
- Esperado: un paciente solo debería poder recibir sus propias citas.
- Obtenido: `total=23 paciente1=4 pacientes distintos=13`. BD: `total 23 | paciente1 4`. El endpoint no pide autenticación.
- Resultado: **FALLA** → H-013

### P15 — Alcance de `/api/historia_clinica`
- Tipo: Integración (API + base de datos)
- Qué se hace: `curl http://localhost:8080/api/historia_clinica`; contar total y historias con `id_paciente = 1`.
- Esperado: un paciente solo debería poder recibir su propia historia clínica.
- Obtenido: `total=5 paciente1=1`. Ejemplo de dato ajeno recibido: `{"idhistoria_Clinica":2,"id_paciente":2,"fecha_creacion":"2023-02-14","observaciones":"Control anual","tipo_sangre":"A+","alergias":"Penicilina"}`. BD: `total 5 | paciente1 1`.
- Resultado: **FALLA** → H-013

### P16 — Registros que recibe el navegador en "Mis Citas"
- Tipo: Sistema/E2E (navegador de punta a punta)
- Qué se hace: con sesión de paciente 1 (login por formulario), abrir "Mis Citas" y revisar la respuesta de `GET /api/cita` en el registro de red.
- Esperado: la respuesta trae solo las citas del paciente 1.
- Obtenido: la respuesta trae **23** registros, de los cuales **4** son del paciente 1 y 19 de otros pacientes. La pantalla muestra 4 porque filtra en el navegador (`mis-citas.component.ts:36`). Peticiones de la pantalla: `GET /api/cita` ×1, `/api/medico/codigo/1` ×3, `/api/medico/codigo/6` ×1, `/api/especialidad/1` ×4 (todas 200).
- Evidencia: `docs/evidencias/paso5b-red-mis-citas-respuesta-api-cita.json` (cuerpo de la respuesta), `docs/evidencias/paso5b-red-mis-citas-peticiones.txt` (lista de peticiones). No se adjunta captura de la pestaña de red de DevTools porque Playwright no puede capturar DevTools; se exportó el registro de red del navegador.
- Resultado: **FALLA** → H-013 (y H-014 por peticiones repetidas)

### P17 — Cerrar sesión como paciente
- Tipo: Aceptación
- Qué se hace: login por formulario `12345678` / `123456`; revisar localStorage; pulsar "Cerrar Sesión" en el menú; revisar localStorage; abrir `/paciente/mis-citas`.
- Esperado: cerrar sesión borra los datos de sesión del navegador y las pantallas del paciente ya no muestran sus datos.
- Obtenido:
  - Tras login: URL `/welcome`, localStorage `{"userId":"1","userName":"Juan Perez Gomez","userType":"paciente"}`.
  - Tras "Cerrar Sesión": URL `/login-selection`, localStorage `{"userId":"1","userName":"Juan Perez Gomez","userType":"paciente"}` (sin cambios).
  - Al abrir `/paciente/mis-citas`: muestra "Mis Citas 2023-07-01 - 09:00:00 Atendida Médico: Jorge Santos Ruiz …" con localStorage intacto.
- Evidencia: `docs/evidencias/h002-paciente-tras-cerrar-sesion.png`, `docs/evidencias/h002-mis-citas-accesible-tras-cerrar-sesion.png`
- Resultado: **FALLA** → H-002
- Nota de método: el clic simulado de Playwright sobre el enlace no lo activaba; se activó con `element.click()` sobre el mismo enlace, que es el evento que produce un clic real. El enlace navegó a `/login-selection` como indica su `routerLink`.

### P18 — Login de paciente con el backend apagado y clave 123456
- Tipo: Aceptación
- Qué se hace: apagar el backend; abrir `/login-paciente`, escribir `12345678` / `123456` y pulsar "Iniciar Sesión".
- Esperado: no entra, muestra "No se pudo conectar con el servidor. Intente nuevamente." y no guarda nada en localStorage.
- Creada en: LB-1 (RFC-001). En LB-0 no se ejecutó; por el código de LB-0 (atajo de H-001) habría entrado como "Juan Perez (Mock)".
- Obtenido (LB-1): red `FALLIDA POST http://localhost:8080/login net::ERR_CONNECTION_REFUSED`; URL final `/login-paciente`; localStorage `{}`; mensaje "No se pudo conectar con el servidor. Intente nuevamente."
- Evidencia: `docs/evidencias/lb1-P18-paciente-backend-apagado-mensaje-conexion.png`
- Resultado (LB-1): **PASA**

---

## Resultados de LB-1 (RFC-001)

Ejecución del 2026-10-20, entre 20:46 y 20:57 *(hora corregida; antes decía "de 20:53 a 21:05", ver BITACORA.md)*, con la BD recargada (`DROP DATABASE` + `BDPostaMedica.sql`, 21 citas) y el frontend con los cambios de RFC-001. Objetivo: P07, P08, P10 y P17 deben pasar a PASA; el resto debe dar lo mismo que en LB-0.

| ID | Obtenido en LB-1 | ¿Igual a LB-0? |
|---|---|---|
| P01 | 200 en los 14; mismos tamaños (cie 291 B, cita 2811 B, …, usuarios 99 B) | Igual |
| P02 | 200 en los 6 | Igual |
| P03 | 200 en los 11; `/api/paciente/codigo/1` sigue devolviendo `"clave":"123456"` | Igual |
| P04 | `500 Cannot instantiate query result type …ResumenMedico…` | Igual |
| P05 | `200 POST /login` → `/welcome`; localStorage `{"userId":"1","userName":"Juan Perez Gomez","userType":"paciente"}` | Igual |
| P06 | `200 POST /login` → `/medico-dashboard`; localStorage `{"userId":"1","userName":"Jorge Santos Ruiz","userType":"medico"}` | Igual |
| P07 | `200 POST /login` → `/admin/inicio`; localStorage `{"userId":"1","userName":"Admin Principal","userType":"administrador"}` (mismas claves que paciente y médico) | **Cambió: FALLA → PASA** (objetivo) |
| P08 | Los 3 roles: `401 POST /login`, se quedan en su login, localStorage `{}`, mensaje " Credenciales inválidas " | **Cambió: mixta → PASA** (objetivo) |
| P09 | 200 ×3 con los datos del rol; `401 {"error":"Credenciales inválidas"}` | Igual |
| P10 | DNI `99999999` / `123456`: `401 POST /login`, URL `/login-paciente`, localStorage `{}`, mensaje "Credenciales inválidas" | **Cambió: FALLA → PASA** (objetivo) |
| P11 | Backend encendido: 0 peticiones a `:8080`, tabla `101 Maria Lopez Quispe, 102 Luis Torres Paz, 103 Ana Diaz Ruiz`. Backend apagado (pid 22740): la misma tabla, 0 errores de consola | Igual |
| P12 | Cita `idCita = 22`, médico 1, `2026-10-26 10:00:00`, `estado_cita = 1`; "Mis Citas" la muestra | Igual |
| P13 | Pestaña nueva: `10:00` no aparece (`tiene1000: false`). `POST /api/cita` duplicado → `HTTP 200`, `idCita = 23`; `COUNT(*) = 2` para médico 1, 2026-10-26, 10:00 | Igual |
| P14 | `/api/cita`: total 23, paciente 1: 4, 13 pacientes distintos | Igual |
| P15 | `/api/historia_clinica`: total 5, paciente 1: 1 | Igual |
| P16 | Navegador: respuesta de `/api/cita` con 23 registros, 4 del paciente 1; 9 peticiones (`/api/cita` ×1, `/api/medico/codigo/1` ×3, `/api/medico/codigo/6` ×1, `/api/especialidad/1` ×4) | Igual |
| P17 | Paciente: tras "Cerrar Sesión", URL `/login-selection`, localStorage `{}`; abrir `/paciente/mis-citas` redirige al login. Se extendió a los 3 roles: médico y admin también quedan en `/login-selection` con localStorage `{}` | **Cambió: FALLA → PASA** (objetivo) |
| P18 | Ver P18: no entra, mensaje de conexión, localStorage `{}` | Nueva |

**Evidencias LB-1:** `lb1-P08-paciente-mensaje-error.png`, `lb1-P08-medico-mensaje-error.png`, `lb1-P08-admin-mensaje-error.png`, `lb1-P10-paciente-mensaje-error.png`, `lb1-P18-paciente-backend-apagado-mensaje-conexion.png`, `lb1-paciente-localstorage-vacio-tras-cerrar-sesion.png`, `lb1-medico-localstorage-vacio-tras-cerrar-sesion.png`, `lb1-admin-localstorage-vacio-tras-cerrar-sesion.png`, `lb1-P12-registrar-cita-formulario.png`, `lb1-P12-mis-citas-con-cita-nueva.png`, `lb1-P13-pestana-nueva-oculta-1000.png` (todas en `docs/evidencias/`).

**Notas de método LB-1:**
- En las capturas de cierre de sesión, la franja negra inferior la agregó la prueba para mostrar el contenido de localStorage en la imagen (las DevTools no aparecen en una captura). No es parte de la aplicación.
- Igual que en LB-0, el clic simulado de Playwright no activó los botones de "Cerrar Sesión" ni el de "Confirmar Cita" después de una navegación interna; se activaron con `element.click()` sobre el mismo elemento. Una primera corrida con el clic simulado dejó el localStorage sin cambios en los 3 roles (incluido el médico, que ya borraba todo en LB-0): se descartó por ser un problema de la herramienta.
- P13: no se volvió a observar la pestaña abierta antes de guardar (el script se interrumpió por una alerta). Se repitieron la pestaña nueva y el POST duplicado, que son los pasos que determinan el resultado.
- P14 se midió primero antes de P12 (21 citas / 2 del paciente 1); para respetar el orden del documento se repitió después de P12 y P13, con el resultado de la tabla.

---

### P19 — Matriz de roles cruzados
- Tipo: Sistema/E2E (navegador de punta a punta) y Aceptación
- Qué se hace: en cada uno de los 3 logins, entrar por formulario con las credenciales de los otros 2 roles (6 combinaciones): login de paciente con médico `10000001` y con admin `87654321`; login de médico con paciente `12345678` y con admin `87654321`; login de admin con paciente `12345678` y con médico `10000001` (clave `123456` en todos).
- Esperado: en los 6 casos no entra, no guarda nada en localStorage y muestra "Este usuario no es un {paciente|médico|administrador}. Use el login que le corresponde." según el login usado.
- Creada en: LB-2 (RFC-002). En LB-1 no se ejecutó; el login de paciente con credenciales de médico entraba (H-028), y médico y admin mostraban mensajes distintos ("Error: El usuario no es un médico.", "Este usuario es un paciente, no un administrador. Use el login de pacientes." y "Credenciales incorrectas").
- Obtenido (LB-2): en los 6 casos el backend responde `200 POST /login` (las credenciales son válidas), el navegador se queda en el login usado y localStorage queda `{}`:

  | Login usado | Credenciales | URL final | localStorage | Mensaje |
  |---|---|---|---|---|
  | paciente | médico `10000001` | `/login-paciente` | `{}` | Este usuario no es un paciente. Use el login que le corresponde. |
  | paciente | admin `87654321` | `/login-paciente` | `{}` | Este usuario no es un paciente. Use el login que le corresponde. |
  | médico | paciente `12345678` | `/login-medico` | `{}` | Este usuario no es un médico. Use el login que le corresponde. |
  | médico | admin `87654321` | `/login-medico` | `{}` | Este usuario no es un médico. Use el login que le corresponde. |
  | admin | paciente `12345678` | `/login-admin` | `{}` | Este usuario no es un administrador. Use el login que le corresponde. |
  | admin | médico `10000001` | `/login-admin` | `{}` | Este usuario no es un administrador. Use el login que le corresponde. |
- Evidencia: `docs/evidencias/lb2-P19-login-paciente-con-medico.png`, `lb2-P19-login-paciente-con-admin.png`, `lb2-P19-login-medico-con-paciente.png`, `lb2-P19-login-medico-con-admin.png`, `lb2-P19-login-admin-con-paciente.png`, `lb2-P19-login-admin-con-medico.png`
- Resultado (LB-2): **PASA**

---

## Resultados de LB-2 (RFC-002)

Ejecución del 2026-10-21, entre 09:30 y 09:37 (hora real: `date` antes y después), con la BD recargada (`DROP DATABASE` + `BDPostaMedica.sql`, 21 citas) y el frontend con los cambios de RFC-002. Objetivo: P19 debe pasar; todas las demás deben dar lo mismo que en LB-1.

| ID | Obtenido en LB-2 | ¿Igual a LB-1? |
|---|---|---|
| P01 | 200 en los 14; mismos tamaños (cie 291 B, cita 2811 B, …, usuarios 99 B) | Igual |
| P02 | 200 en los 6 | Igual |
| P03 | 11/11 en 200; `/api/paciente/codigo/1` sigue devolviendo `"clave":"123456"` | Igual |
| P04 | `500 Cannot instantiate query result type …ResumenMedico…` | Igual |
| P05 | `200 POST /login` → `/welcome`; localStorage `{"userId":"1","userName":"Juan Perez Gomez","userType":"paciente"}` | Igual |
| P06 | `200 POST /login` → `/medico-dashboard`; localStorage `{"userId":"1","userName":"Jorge Santos Ruiz","userType":"medico"}` | Igual |
| P07 | `200 POST /login` → `/admin/inicio`; localStorage `{"userId":"1","userName":"Admin Principal","userType":"administrador"}` | Igual |
| P08 | Los 3 roles: `401 POST /login`, se quedan en su login, localStorage `{}`, mensaje "Credenciales inválidas" | Igual |
| P09 | 200 ×3 con los datos del rol; `401 {"error":"Credenciales inválidas"}` | Igual |
| P10 | DNI `99999999` / `123456`: `401 POST /login`, URL `/login-paciente`, localStorage `{}`, mensaje "Credenciales inválidas" | Igual |
| P11 | Backend encendido: 0 peticiones a `:8080`, tabla `101 Maria Lopez Quispe, 102 Luis Torres Paz, 103 Ana Diaz Ruiz`. Backend apagado (pid 26728, 09:37:16): la misma tabla, 0 errores de consola | Igual |
| P12 | `POST /api/cita` 200; cita `idCita = 22`, médico 1, `2026-10-26 10:00:00`, `estado_cita = 1`; "Mis Citas" la muestra | Igual |
| P13 | Pestaña nueva: `10:00` no aparece (`tiene1000: false`). `POST /api/cita` duplicado → `HTTP 200`, `idCita = 23`; `COUNT(*) = 2` para médico 1, 2026-10-26, 10:00 | Igual |
| P14 | `/api/cita`: total 23, paciente 1: 4, 13 pacientes distintos | Igual |
| P15 | `/api/historia_clinica`: total 5, paciente 1: 1 | Igual |
| P16 | Navegador: respuesta de `/api/cita` con 23 registros, 4 del paciente 1; 9 peticiones (`/api/cita` ×1, `/api/medico/codigo/1` ×3, `/api/medico/codigo/6` ×1, `/api/especialidad/1` ×4) | Igual |
| P17 | Los 3 roles: tras "Cerrar Sesión", URL `/login-selection`, localStorage `{}`; paciente: `/paciente/mis-citas` redirige al login | Igual |
| P18 | `ERR_CONNECTION_REFUSED`, URL `/login-paciente`, localStorage `{}`, mensaje "No se pudo conectar con el servidor. Intente nuevamente." | Igual |
| P19 | Ver P19: 6/6 combinaciones no entran, localStorage `{}`, mensaje unificado | **Nueva: PASA** (objetivo) |

**Evidencias LB-2:** `lb2-P19-*.png` (6 capturas), `lb2-P12-registrar-cita-formulario.png`, `lb2-P12-mis-citas-con-cita-nueva.png`, `lb2-P13-pestana-nueva-oculta-1000.png`, `lb2-P18-paciente-backend-apagado-mensaje-conexion.png` (todas en `docs/evidencias/`).

**Notas de método LB-2:** mismas que en LB-1 (pestaña nueva por caso; `element.click()` para "Cerrar Sesión", la hora de la cita y "Confirmar Cita"; P13 con pestaña nueva y POST duplicado). Antes de la batería se reiniciaron backend y frontend porque estaban caídos desde la sesión anterior.

---

### P20 — El médico 1 ve exactamente sus citas pendientes
- Tipo: Sistema/E2E (navegador de punta a punta)
- Qué se hace: después de P12 y P13 (que dejan las citas 22 y 23 pendientes para el médico 1), login por formulario como médico `10000001`; abrir "Citas Pendientes"; comparar las filas con `SELECT c.idCita, paciente, dni, fecha, hora, motivo FROM Cita c JOIN Paciente p … JOIN Estado_Cita e … WHERE c.id_medico=1 AND e.nombre_estado='Pendiente'`.
- Esperado: la pantalla muestra las mismas citas que el SELECT, con nombre y DNI del paciente, obtenidas del servidor.
- Creada en: LB-3 (RFC-003).
- Obtenido (LB-3): red `200 GET /api/citas/medico/1?estado=Pendiente`. Pantalla y SELECT, lado a lado:

  | Pantalla | SELECT |
  |---|---|
  | `22 \| Juan Perez Gomez \| 12345678 \| 2026-10-26 \| 10:00:00 \| Prueba LB-0: control general` | `22 \| Juan Perez Gomez \| 12345678 \| 2026-10-26 \| 10:00:00 \| Prueba LB-0: control general` |
  | `23 \| Juan Perez Gomez \| 12345678 \| 2026-10-26 \| 10:00:00 \| Prueba LB-0: doble reserva (pestana B)` | `23 \| Juan Perez Gomez \| 12345678 \| 2026-10-26 \| 10:00:00 \| Prueba LB-0: doble reserva (pestana B)` |
- Evidencia: `docs/evidencias/lb3-medico-citas-pendientes.png`
- Resultado (LB-3): **PASA**

### P21 — Confirmar una cita
- Tipo: Sistema/E2E (navegador de punta a punta) y Aceptación
- Qué se hace: en "Citas Pendientes" del médico 1, pulsar "Aceptar" en la cita 22 y confirmar; `SELECT` de la cita; abrir "Citas Confirmadas" y recargar la página.
- Esperado: la cita deja la lista de pendientes, queda en la base con el estado "Confirmada" y sigue en "Citas Confirmadas" después de recargar.
- Creada en: LB-3 (RFC-003).
- Obtenido (LB-3): modal "Aceptar Cita … Paciente: Juan Perez Gomez … Motivo: Prueba LB-0: control general"; red `200 PUT /api/citas/medico/1/22/estado {"estado":"Confirmada"}`; pendientes tras confirmar: solo la 23. Base: `22 | 1 | 2 | Confirmada | Prueba LB-0: control general`. "Citas Confirmadas" tras recargar: `22 | Juan Perez Gomez | 12345678 | 2026-10-26 | 10:00:00 | Prueba LB-0: control general | Confirmada`.
- Evidencia: `docs/evidencias/lb3-medico-citas-confirmadas.png`
- Resultado (LB-3): **PASA**

### P22 — Cancelar una cita
- Tipo: Sistema/E2E (navegador de punta a punta) y Aceptación
- Qué se hace: en "Citas Pendientes" del médico 1, pulsar "Cancelar" en la cita 23 y confirmar; `SELECT` de la cita; abrir "Citas Canceladas" y recargar la página.
- Esperado: la cita deja la lista de pendientes, queda en la base con el estado "Cancelada" y sigue en "Citas Canceladas" después de recargar.
- Creada en: LB-3 (RFC-003).
- Obtenido (LB-3): modal "Cancelar Cita … Motivo: Prueba LB-0: doble reserva (pestana B)"; red `200 PUT /api/citas/medico/1/23/estado {"estado":"Cancelada"}`; pendientes: "No hay citas pendientes.". Base: `23 | 1 | 3 | Cancelada | Prueba LB-0: doble reserva (pestana B)`. "Citas Canceladas" tras recargar: `23 | Juan Perez Gomez | 12345678 | 2026-10-26 | 10:00:00 | Prueba LB-0: doble reserva (pestana B) | Cancelada`.
- Evidencia: `docs/evidencias/lb3-medico-citas-canceladas.png`
- Resultado (LB-3): **PASA**

### P23 — El endpoint de citas del médico devuelve solo citas de ese médico
- Tipo: Integración (API + base de datos)
- Qué se hace: para los médicos 1, 2, 3, 6 y 10 y los estados Pendiente, Confirmada, Cancelada y Atendida, comparar `GET /api/citas/medico/{id}?estado={nombre}` (cantidad e IDs) con `SELECT COUNT(*), GROUP_CONCAT(idCita) … WHERE id_medico={id} AND nombre_estado='{nombre}'`. También `GET /api/citas/medico/1/pacientes` contra los pacientes con citas del médico 1.
- Esperado: misma cantidad y mismos IDs en los 20 casos; los pacientes coinciden.
- Creada en: LB-3 (RFC-003).
- Obtenido (LB-3), después de P21 y P22: 20/20 iguales. Ejemplos: médico 1 Confirmada: API 1 (22), BD 1 (22); médico 1 Cancelada: API 1 (23), BD 1 (23); médico 1 Atendida: API 4 (1, 9, 14, 18), BD 4 (1, 9, 14, 18); médico 6 Pendiente: API 1 (6), BD 1 (6); médico 10 Pendiente: API 1 (8), BD 1 (8). Pacientes del médico 1: API 7, 6, 1, 11 (orden por apellido); BD 1, 6, 7, 11.
- Resultado (LB-3): **PASA**

### P24 — La respuesta del endpoint del médico no incluye la contraseña
- Tipo: Integración (API + base de datos)
- Qué se hace: listar los campos de `GET /api/citas/medico/1?estado=Atendida` y `GET /api/citas/medico/1/pacientes`; buscar campos `clave`/`password`/`contraseña` y el valor `"123456"`.
- Esperado: ningún campo de contraseña.
- Creada en: LB-3 (RFC-003).
- Obtenido (LB-3): citas → `idCita, fecha, hora, motivo, estado, idPaciente, pacienteNombres, pacienteApellidos, pacienteDni`; pacientes → `idPaciente, nombres, apellidos, dni, fechaNacimiento, sexo, telefono, estadoPaciente, departamento, distrito`. "contiene clave: false" y "texto 123456 en respuesta: false" en ambos.
- Resultado (LB-3): **PASA**

---

## Resultados de LB-3 (RFC-003)

Ejecución del 2026-10-21, entre 10:04 y 10:13 (hora real: `date` antes y después), con la BD recargada a las 10:04:37 (21 citas) y backend y frontend con los cambios de RFC-003. Objetivo: P11 pasa a PASA; P20–P24 (nuevas) pasan; el resto igual que en LB-2.

| ID | Obtenido en LB-3 | ¿Igual a LB-2? |
|---|---|---|
| P01 | 200 en los 14; mismos tamaños (cie 291 B, cita 2811 B, …, usuarios 99 B) | Igual |
| P02 | 200 en los 6 | Igual |
| P03 | 11/11 en 200; `/api/paciente/codigo/1` sigue devolviendo `"clave":"123456"` | Igual |
| P04 | `500 Cannot instantiate query result type …ResumenMedico…` | Igual |
| P05 | `/welcome`; localStorage `{"userId":"1","userName":"Juan Perez Gomez","userType":"paciente"}` | Igual |
| P06 | `/medico-dashboard`; localStorage `{"userId":"1","userName":"Jorge Santos Ruiz","userType":"medico"}` | Igual |
| P07 | `/admin/inicio`; localStorage `{"userId":"1","userName":"Admin Principal","userType":"administrador"}` | Igual |
| P08 | Los 3 roles: 401, se quedan en su login, localStorage `{}`, "Credenciales inválidas" | Igual |
| P09 | 200 ×3 con los datos del rol; `401 {"error":"Credenciales inválidas"}` | Igual |
| P10 | DNI `99999999`: 401, `/login-paciente`, localStorage `{}`, "Credenciales inválidas" | Igual |
| P11 | Backend encendido: la pantalla pide `GET /api/citas/medico/1?estado=Pendiente` y muestra los datos de la base. Backend apagado (pid 18516, 10:12:14): "Citas Pendientes", "Citas Confirmadas", "Citas Canceladas" y "Pacientes" muestran "No se pudo conectar con el servidor. Intente nuevamente." con 0 filas y sin tabla | **Cambió: FALLA → PASA** (objetivo) |
| P12 | `POST /api/cita` 200; cita `idCita = 22`, `estado_cita = 1`; "Mis Citas" la muestra | Igual |
| P13 | Pestaña nueva: `10:00` no aparece. `POST` duplicado → `HTTP 200`, `idCita = 23`; `COUNT(*) = 2` | Igual |
| P14 | `/api/cita`: total 23, paciente 1: 4, 13 pacientes distintos | Igual |
| P15 | `/api/historia_clinica`: total 5, paciente 1: 1 | Igual |
| P16 | Navegador: 23 registros recibidos, 4 del paciente 1; 9 peticiones | Igual |
| P17 | Los 3 roles: tras "Cerrar Sesión", `/login-selection`, localStorage `{}`; paciente: `/paciente/mis-citas` redirige a `/login-paciente` | Igual |
| P18 | Backend apagado: `/login-paciente`, localStorage `{}`, mensaje de conexión | Igual |
| P19 | 6/6 combinaciones no entran, localStorage `{}`, mensaje unificado | Igual |
| P20 | Ver P20: pantalla = SELECT (citas 22 y 23) | **Nueva: PASA** |
| P21 | Ver P21: cita 22 Confirmada en la base y en pantalla tras recargar | **Nueva: PASA** |
| P22 | Ver P22: cita 23 Cancelada en la base y en pantalla tras recargar | **Nueva: PASA** |
| P23 | Ver P23: 20/20 combinaciones médico/estado iguales a la base | **Nueva: PASA** |
| P24 | Ver P24: sin campos de contraseña | **Nueva: PASA** |

**Pruebas de Playwright de `tests/`** (`npx playwright test tests/ --workers=1`, `@playwright/test` 1.64.1): primera corrida a las 10:02 con 5/6 (fallo de `admin-reportes.spec.ts` por tiempo de espera: el servidor de desarrollo mostraba el cartel de un error de compilación intermedio de mis ediciones, ya corregido); tras reiniciar el frontend, corrida de 10:03:55 a 10:04:03: **6/6 pasan** (`admin-reportes`, `medico-citas-pendientes`, `medico-dashboard`, `medico-flow`, `medico-pacientes-formatting`, `medico-pacientes`). Las pruebas que confirman o cancelan crean sus propias citas por la API y las borran al terminar; después de la corrida quedaban 0 citas con motivo "Playwright…".

**Evidencias LB-3:** `lb3-medico-citas-pendientes.png`, `lb3-medico-citas-confirmadas.png`, `lb3-medico-citas-canceladas.png`, `lb3-medico-pacientes.png`, `lb3-medico-pacientes-resumen.png`, `lb3-P11-medico-backend-apagado-error.png`, `lb3-P12-mis-citas-con-cita-nueva.png` (todas en `docs/evidencias/`).

**Notas de método LB-3:** mismas que en LB-2. En P21 y P22 los botones "Aceptar"/"Cancelar" y los de confirmación se activaron con `element.click()`. En el script de P11 quedó por error una navegación previa a una ruta inexistente del módulo; no afecta el resultado.

---

## Pruebas unitarias

**Qué son.** Son pruebas de **caracterización**: comprueban el comportamiento **actual** del código, aunque sea incorrecto. Su función es servir de red de seguridad para la reorganización y las refactorizaciones: si una refactorización cambia el comportamiento, una prueba falla. No dicen cómo *debería* funcionar el sistema (eso lo dicen el "Esperado" de P01–P24 y las RFC).

Cuando una prueba comprueba un comportamiento que es un error conocido, lo dice en su nombre o en un comentario con el ID del hallazgo, por ejemplo "sin horario ese día: ofrece 08:00 a 20:00 (comportamiento actual, H-022)". Esas pruebas **deben seguir pasando** en LB-4 a LB-8; solo un RFC correctivo puede hacerlas fallar a propósito.

**Dobles de prueba.** Frontend: las clases se crean con `new` y se les pasan objetos `jasmine.createSpyObj` en lugar de `HttpClient`, `Router` y `AuthService`; no se renderiza la plantilla ni se ejecuta `ngOnInit`. Backend: `@ExtendWith(MockitoExtension.class)` con `@Mock` de los repositorios. Ninguna prueba unitaria llama al backend real ni a la base de datos. (La prueba vieja `CentroValdiviezoApplicationTests.contextLoads` sí levanta el contexto de Spring y necesita MySQL: no es unitaria, pero `mvnw test` la ejecuta.)

**Datos.** Las pruebas usan DNIs, IDs y claves inventados (`11112222`, `clave-prueba`…), no los de la base, salvo `MedicoServiceCaracterizacionTest`, cuyo DNI de ejemplo se arma con `"1000000" + id`.

### Comandos exactos

Frontend (desde `proyecto_valdiviezo/`, en Git Bash). Usa el Chromium que ya está en la caché de Playwright, en modo headless, y solo los archivos `*.caracterizacion.spec.ts`:

```bash
cd proyecto_valdiviezo
export CHROME_BIN="$(cygpath -w ~/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe)"
npx ng test --watch=false --browsers=ChromeHeadless --ts-config=tsconfig.caracterizacion.json --include='src/app/**/*.caracterizacion.spec.ts'
```

`--ts-config=tsconfig.caracterizacion.json` es necesario: el `tsconfig.spec.json` del proyecto compila **todos** los `.spec.ts`, y 4 de los specs viejos no compilan (ver "Estado de los specs viejos"); con ellos la compilación falla y no se ejecuta ninguna prueba, aunque `--include` filtre. En PowerShell: `$env:CHROME_BIN = "$env:LOCALAPPDATA\ms-playwright\chromium-1217\chrome-win64\chrome.exe"` y el mismo `npx ng test …`.

Backend (desde `backend/backend/`; MySQL encendido por `contextLoads`):

```bash
cd backend/backend
./mvnw test
```

### Lista

| ID | Archivo | Qué comprueba | Tipo | Hallazgo |
|---|---|---|---|---|
| U01 | `FE/login-paciente/login-paciente.caracterizacion.spec.ts` | Login de paciente: guarda `userId`, `userName` ("nombres apellidos") y `userType`, navega a `/welcome` | Unitaria | — |
| U02 | ídem | Usuario de otro rol: no guarda nada, "Este usuario no es un paciente. Use el login que le corresponde." | Unitaria | — |
| U03 | ídem | Error 401: "Credenciales inválidas", no guarda nada | Unitaria | — |
| U04 | ídem | Error de conexión (status 0): "No se pudo conectar con el servidor. Intente nuevamente.", no guarda nada | Unitaria | — |
| U05 | ídem | Error 500: el mismo mensaje de conexión aunque el servidor respondió (comportamiento actual) | Unitaria | H-029 |
| U06 | ídem | DNI inválido (7 dígitos, 9, con letra, vacío): mensaje de DNI y no llama a `AuthService.login` | Unitaria | — |
| U07–U12 | `FE/login-medico/login-medico.caracterizacion.spec.ts` | Los mismos 6 casos para el médico; navega a `/medico-dashboard`; mensaje "Este usuario no es un médico…". U11 = error 500 | Unitaria | U11: H-029 |
| U13–U18 | `FE/login-admin/login-admin.caracterizacion.spec.ts` | Los mismos 6 casos para el administrador; navega a `/admin`; guarda exactamente 3 claves; mensaje "Este usuario no es un administrador…". U17 = error 500 | Unitaria | U17: H-029 |
| U19 | `FE/paciente/registrar-cita/registrar-cita.caracterizacion.spec.ts` | `generarSlots()` con horario del lunes 08:00–10:00: `08:00` a `09:40` cada 20 minutos | Unitaria | — |
| U20 | ídem | Descarta las horas ocupadas (`08:20:00`, `09:40:00`) | Unitaria | — |
| U21 | ídem | Sin horario ese día (sábado): 36 bloques de `08:00` a `19:40` (comportamiento actual) | Unitaria | H-022 |
| U22 | ídem | Sin horario: el horario por defecto también descarta las ocupadas (comportamiento actual) | Unitaria | H-022 |
| U23 | ídem | Con horario pero todo ocupado: cae al horario por defecto y ofrece `10:00` a `19:40` (comportamiento actual) | Unitaria | H-022 |
| U24 | `FE/welcome/cerrar-sesion.caracterizacion.spec.ts` | Welcome: "Cerrar sesión" llama a `AuthService.logout` y navega a `/login-selection` | Unitaria | — |
| U25 | ídem | Welcome: con el `AuthService` real, el localStorage queda vacío (también claves ajenas) | Unitaria | — |
| U26 | ídem | Admin-dashboard: llama a `AuthService.logout` y navega a `/login-selection` | Unitaria | — |
| U27 | ídem | Admin-dashboard: con el `AuthService` real, el localStorage queda vacío | Unitaria | — |
| U28 | `FE/medico-dashboard/services/medico.service.caracterizacion.spec.ts` | `getCitasByStatus`: `GET http://localhost:8080/api/citas/medico/{userId}` con `params: { estado }` | Unitaria | — |
| U29 | ídem | `updateCitaStatus`: `PUT …/medico/{userId}/{idCita}/estado` con `{ estado }` | Unitaria | — |
| U30 | ídem | `getPacientes`: `GET …/medico/{userId}/pacientes` | Unitaria | — |
| U31 | ídem | Lee el `userId` de la sesión en cada llamada (no lo guarda al crearse) | Unitaria | — |
| U32 | ídem | Sin sesión: los 3 métodos fallan con "No hay sesión de médico." y no llaman a `HttpClient` | Unitaria | (la pantalla lo muestra como error de conexión: H-029) |
| U33 | `BE/…/controller/AuthControllerCaracterizacionTest.java` | Login de paciente correcto: 200, `tipo: paciente`, id, nombres, apellidos, dni, sin `clave`; no consulta médico ni admin | Unitaria | — |
| U34 | ídem | Login de médico correcto: 200, `tipo: medico`, `cmp`, sin `clave` | Unitaria | — |
| U35 | ídem | Login de administrador correcto: 200, `tipo: administrador`, `rol`, sin `clave` | Unitaria | — |
| U36 | ídem | Clave incorrecta: 401 `{"error":"Credenciales inválidas"}` | Unitaria | — |
| U37 | ídem | DNI inexistente: 401 | Unitaria | — |
| U38 | ídem | DNI faltante: 400 `{"error":"DNI y contraseña son requeridos"}`, no consulta repositorios | Unitaria | — |
| U39 | ídem | Clave faltante: 400, no consulta repositorios | Unitaria | — |
| U40 | ídem | Orden paciente → médico → admin: si la clave no es la del paciente con ese DNI, sigue y entra como médico | Unitaria | (estructura de H-019) |
| U41 | ídem | Excepción del repositorio: 500 `{"error":"Error interno: …"}` (comportamiento actual) | Unitaria | H-029 (origen del 500) |
| U42 | `BE/…/controller/CitaConsultaControllerCaracterizacionTest.java` | Cambio de estado de una cita de otro médico: 404, no guarda, no consulta estados | Unitaria | — |
| U43 | ídem | Cita inexistente: 404, no guarda | Unitaria | — |
| U44 | ídem | Estado inexistente ("Aprobada"): 400 `Estado de cita inexistente: Aprobada`, no guarda | Unitaria | — |
| U45 | ídem | Cambio válido Pendiente → Confirmada: guarda `estado_cita = 2`, 200 con el DTO de `findCitaMedicoPorId` | Unitaria | — |
| U46 | ídem (parametrizada, 4 casos) | Acepta cualquier cambio: Cancelada→Confirmada, Pendiente→Atendida, Atendida→Pendiente, Cancelada→Reprogramada (comportamiento actual) | Unitaria | **H-031** |
| U47 | `BE/…/services/PacienteServiceCaracterizacionTest.java` | `listarPacientes` devuelve lo de `findAll` | Unitaria | — |
| U48 | ídem | `listarPorId` devuelve el `Optional` del repositorio | Unitaria | — |
| U49 | ídem | `crearPaciente` guarda la clave tal como llega, sin cifrar (comportamiento actual) | Unitaria | H-007 |
| U50 | ídem | `eliminarPaciente` llama a `deleteById` y devuelve `true` siempre | Unitaria | — |
| U51 | ídem | `existePaciente` consulta `existsById` | Unitaria | — |
| U52 | ídem | `actualizarPaciente` copia nombres, apellidos, DNI, fecha, sexo, estado y ubigeo; **no** copia teléfono ni clave (comportamiento actual) | Unitaria | **H-032** |
| U53 | ídem | `actualizarPaciente` con ID inexistente lanza `NoSuchElementException` y no guarda | Unitaria | — |
| U54 | `BE/…/services/MedicoServiceCaracterizacionTest.java` | `listarMedicos` y `listarPorId` devuelven lo del repositorio | Unitaria | — |
| U55 | ídem | `crearMedico` guarda; `eliminarMedico` llama a `deleteById` y devuelve `true` | Unitaria | — |
| U56 | ídem | `actualizarMedico` copia nombres, apellidos, CMP y especialidad; no copia DNI ni clave | Unitaria | — |
| U57 | ídem | `actualizarMedico` con ID inexistente lanza `NoSuchElementException` | Unitaria | — |
| U58 | ídem | `buscaPorApellido`, `buscaporNombre`, `listarPorEspecialidad` delegan en el repositorio | Unitaria | — |
| U59 | ídem | `getMedicosConEspecialidad` convierte cada fila `Object[]` en `MedicoEspecialidadDTO` | Unitaria | — |
| U60 | `BE/…/services/CitaServiceCaracterizacionTest.java` | `obtenerCitasPorEstado` y `obtenerCitasPorEspecialidad` devuelven lo del repositorio | Unitaria | — |
| U61 | ídem | `obtenerIngresosMensuales` convierte filas `[mesAno, total]` en DTO (total `BigDecimal` o `Integer`) | Unitaria | — |
| U62 | ídem | `obtenerIngresosMensuales` sin filas devuelve lista vacía | Unitaria | — |

(`BE/…` = `backend/backend/src/test/java/com/centro_valdiviezo/backend/`; `FE/` = `proyecto_valdiviezo/src/app/`.) `getResumenMedicoPorEspecialidad` (H-005) no se caracteriza aquí: con el repositorio simulado no se reproduce el error 500, que nace en la consulta; lo cubre P04.

### Resultados de la tarea 9 (2026-10-21, sobre LB-3, sin cambios en el código de la aplicación)

- Frontend (10:28:36–10:28:59): `Chrome Headless 147.0.0.0 (Windows 10): Executed 32 of 32 SUCCESS` · `TOTAL: 32 SUCCESS`. U01–U32 **pasan**.
- Backend (10:31:08–10:31:28), `./mvnw test`: `Tests run: 37, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS`. Por clase: `AuthControllerCaracterizacionTest` 9, `CitaConsultaControllerCaracterizacionTest` 8 (U42–U45 + 4 casos de U46), `PacienteServiceCaracterizacionTest` 7, `MedicoServiceCaracterizacionTest` 6, `CitaServiceCaracterizacionTest` 3 → **33 nuevas, todas pasan**. Pruebas viejas: `CentroValdiviezoApplicationTests` 1, `AuthControllerTest` 1, `EspecialidadTest` 2 → **4 pasan**. La salida muestra una traza `java.lang.RuntimeException: BD caida` en `AuthController.login`: es el `e.printStackTrace()` de `AuthController.java:100` que provoca U41 a propósito, no un fallo.

### Estado de los specs viejos del frontend (generados por Angular; no se modificaron)

Con la configuración del proyecto (`ng test`, `tsconfig.spec.json`) **no se ejecuta ninguna prueba**: la compilación falla por 4 specs que importan nombres que no existen:

| Spec | Error |
|---|---|
| `FE/features/usuario/components/components.spec.ts` | `TS2305: Module './components' has no exported member 'Components'` (la clase es `UsuariosComponent`) |
| `FE/login/login.spec.ts` | `TS2305: … no exported member 'Login'` |
| `FE/services/auth.spec.ts` | `TS2305: … no exported member 'Auth'` (la clase es `AuthService`) |
| `FE/services/usuario.spec.ts` | `TS2305: … no exported member 'Usuario'` |

Los otros 11 archivos (12 pruebas) se ejecutaron aparte (10:32:38–10:32:47) con un tsconfig temporal fuera del repositorio que excluye esos 4: `TOTAL: 9 FAILED, 3 SUCCESS`.
- Fallan por `NG0201: No provider found for '_HttpClient'` (el TestBed no provee `HttpClient`): `CantEstadoCita should create`, `ServiceCita`, `ServiceMedico`, `ServicePaciente should be created`, `MainMedico should create`, `MainPaciente should create`.
- Fallan por `NG0201: No provider found for 'NgbActiveModal'`: `DetalleMedico should create`, `DetallePaciente should create`.
- Falla `App should render title`: `Expected undefined to contain 'Hello, proyecto_valdiviezo'` (la plantilla de `App` ya no tiene ese título).
- Pasan: las otras 3 (`App should create` y las de `features/cita/cita.spec.ts` y `main-cita.spec.ts`, deducidas por descarte de la lista de fallos).

Los specs viejos quedan fuera de la batería hasta que el usuario decida qué hacer con ellos (ver `docs/BITACORA.md`).

---

## Tabla de resultados

| ID | Prueba | LB-0 | LB-1 RFC-001 | LB-2 RFC-002 | LB-3 RFC-003 | LB-4 Reorg | LB-5 DRY | LB-6 SRP | LB-7 OCP | LB-8 IoC |
|---|---|---|---|---|---|---|---|---|---|---|
| P01 | Endpoints GET de catálogos y listados | PASA (14/14 en 200) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |  |  |  |
| P02 | Endpoints de reportes y consultas agregadas | PASA (6/6 en 200) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |  |  |  |
| P03 | Endpoints por ID | PASA (11/11 en 200; expone `clave`, H-007) | PASA (igual; expone `clave`, H-007) | PASA (igual; expone `clave`, H-007) | PASA (igual; expone `clave`, H-007) |  |  |  |  |  |
| P04 | `/api/medico/resumenMedico` | FALLA (500, H-005) | FALLA (igual, H-005) | FALLA (igual, H-005) | FALLA (igual, H-005) |  |  |  |  |  |
| P05 | Login por formulario: paciente | PASA (`/welcome`; `userId`, `userName`, `userType`) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |  |  |  |
| P06 | Login por formulario: médico | PASA (`/medico-dashboard`; `userId`, `userName`, `userType`) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |  |  |  |
| P07 | Login por formulario: admin | FALLA (`/admin/inicio`; claves `userTipo`, `userNombre`… distintas, H-002) | **PASA** (cambió: claves iguales a los otros roles) | PASA (igual) | PASA (igual) |  |  |  |  |  |
| P08 | Login con contraseña incorrecta (3 roles) | PASA en seguridad (401, no entra); FALLA en mensaje distinto en admin (H-003) | **PASA** (cambió: mismo mensaje en los 3 roles) | PASA (igual) | PASA (igual) |  |  |  |  |  |
| P09 | Login directo a la API | PASA (200 ×3, 401 inválido) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |  |  |  |
| P10 | Login paciente con DNI inexistente + `123456` | FALLA (entra como paciente 1, H-001) | **PASA** (cambió: no entra, localStorage vacío) | PASA (igual) | PASA (igual) |  |  |  |  |  |
| P11 | Módulo médico con backend apagado | FALLA (datos simulados, sin error, H-004) | FALLA (igual, H-004) | FALLA (igual, H-004) | **PASA** (cambió: datos de la base; sin backend, error y sin datos) |  |  |  |  |  |
| P12 | Registrar cita desde el formulario | PASA (cita 22 guardada, `estado_cita = 1`) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |  |  |  |
| P13 | Doble reserva | FALLA (citas 22 y 23 a la misma hora, H-012) | FALLA (igual, H-012) | FALLA (igual, H-012) | FALLA (igual, H-012) |  |  |  |  |  |
| P14 | Alcance de `/api/cita` | FALLA (23 devueltas / 4 del paciente 1, H-013) | FALLA (igual, 23 / 4, H-013) | FALLA (igual, 23 / 4, H-013) | FALLA (igual, 23 / 4, H-013) |  |  |  |  |  |
| P15 | Alcance de `/api/historia_clinica` | FALLA (5 devueltas / 1 del paciente 1, H-013) | FALLA (igual, 5 / 1, H-013) | FALLA (igual, 5 / 1, H-013) | FALLA (igual, 5 / 1, H-013) |  |  |  |  |  |
| P16 | Registros en "Mis Citas" (red) | FALLA (23 recibidas / 4 mostradas, H-013) | FALLA (igual, 23 recibidas / 4 mostradas, H-013) | FALLA (igual, 23 / 4, H-013) | FALLA (igual, 23 / 4, H-013) |  |  |  |  |  |
| P17 | Cerrar sesión como paciente | FALLA (localStorage queda intacto, H-002) | **PASA** (cambió: localStorage vacío en los 3 roles) | PASA (igual) | PASA (igual) |  |  |  |  |  |
| P18 | Login paciente con backend apagado + `123456` | No ejecutada (creada en LB-1) | **PASA** (nueva) | PASA (igual) | PASA (igual) |  |  |  |  |  |
| P19 | Matriz de roles cruzados (6 combinaciones) | No ejecutada (creada en LB-2) | No ejecutada (creada en LB-2) | **PASA** (nueva: 6/6 no entran, mensaje unificado) | PASA (igual) |  |  |  |  |  |
| P20 | El médico 1 ve exactamente sus citas pendientes | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | **PASA** (nueva: pantalla = SELECT) |  |  |  |  |  |
| P21 | Confirmar una cita (persiste) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | **PASA** (nueva: Confirmada en BD y tras recargar) |  |  |  |  |  |
| P22 | Cancelar una cita (persiste) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | **PASA** (nueva: Cancelada en BD y tras recargar) |  |  |  |  |  |
| P23 | Endpoint del médico: solo sus citas | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | **PASA** (nueva: 20/20 = SELECT) |  |  |  |  |  |
| P24 | Endpoint del médico sin contraseña | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | **PASA** (nueva) |  |  |  |  |  |

**Resumen LB-0:** 7 PASA · 9 FALLA · 1 mixta (P08).

**Resumen LB-1:** 12 PASA · 6 FALLA. Cambiaron solo P07, P08, P10 y P17 (objetivo de RFC-001) y se agregó P18. Las otras 13 pruebas dieron lo mismo que en LB-0.

**Resumen LB-2:** 13 PASA · 6 FALLA. Se agregó P19 (objetivo de RFC-002), que pasa. Las 18 pruebas anteriores dieron lo mismo que en LB-1. Sin efectos no deseados.

**Resumen LB-3:** 19 PASA · 5 FALLA. Cambió solo P11 (FALLA → PASA, objetivo de RFC-003) y se agregaron P20–P24, que pasan. Las otras 18 pruebas dieron lo mismo que en LB-2. Sin efectos no deseados.

> **Atención al repetir P12 y P13:** cada ejecución agrega citas a la BD. Antes de correr la batería en cada línea base nueva, recargar la base (`DROP DATABASE posta_medica_valdiviezo;` y volver a ejecutar `BDPostaMedica.sql`, porque el script usa `CREATE TABLE` sin `DROP`) o borrar las citas de prueba con `DELETE FROM Cita WHERE motivo LIKE 'Prueba LB-0%';` para partir del mismo estado.
