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

## Resultados de LB-4 (RFC-004, reorganización de carpetas)

Ejecución del 2026-10-21, entre 11:11 y 11:20 (hora real: `date` antes y después), con la BD recargada a las 11:11:51 desde `database/BDPostaMedica.sql` (21 citas), backend corriendo desde `backend/` y frontend desde `frontend/`. Es mantenimiento preventivo: **todas las pruebas deben dar igual que en LB-3**.

| ID | Obtenido en LB-4 | ¿Igual a LB-3? |
|---|---|---|
| P01 | 200 en los 14; mismos tamaños (cie 291 B, cita 2811 B, disponibilidad_medico 8632 B, especialidad 554 B, estado_cita 458 B, estado_paciente 461 B, evolucion_clinica 1443 B, historia_clinica 746 B, medico 2003 B, medico/conEspecialidad 2492 B, medico/especialidad/1 407 B, paciente 2949 B, ubigeo 311 B, usuarios 99 B) | Igual |
| P02 | 200 en los 6; `porEstado` → `[{"estadoCita":"Pendiente","cantCita":2},{"estadoCita":"Confirmada","cantCita":1},{"estadoCita":"Cancelada","cantCita":1…`; `citas/medico/1/fecha/2023-07-01` → la cita 1 | Igual |
| P03 | 11/11 en 200; `/api/paciente/codigo/1` sigue devolviendo `"clave":"123456"` | Igual |
| P04 | `500 {"message":"Cannot instantiate query result type 'com.centro_valdiviezo.backend.dto.ResumenMedico'…` | Igual |
| P05 | `200 POST /login` → `/welcome`; localStorage `{"userId":"1","userName":"Juan Perez Gomez","userType":"paciente"}`; "Mis Citas" muestra `2023-07-01 - 09:00:00` y `2023-07-06 - 09:00:00` | Igual |
| P06 | `200 POST /login` → `/medico-dashboard`; localStorage `{"userId":"1","userName":"Jorge Santos Ruiz","userType":"medico"}` | Igual |
| P07 | `200 POST /login` → `/admin/inicio`; localStorage `{"userId":"1","userName":"Admin Principal","userType":"administrador"}` | Igual |
| P08 | Los 3 roles: `401 POST /login`, se quedan en su login, localStorage `{}`, "Credenciales inválidas" | Igual |
| P09 | 200 ×3 con los datos del rol (`tipo` paciente, medico con `cmp CMP12345`, administrador); `00000000`/`x` → `401 {"error":"Credenciales inválidas"}` | Igual |
| P10 | DNI `99999999`: `401 POST /login`, `/login-paciente`, localStorage `{}`, "Credenciales inválidas" | Igual |
| P11 | Backend encendido: la pantalla pide `200 GET /api/citas/medico/1?estado=Pendiente` y muestra "No hay citas pendientes." (la BD recién cargada tiene 0 pendientes del médico 1, comprobado con SELECT). Backend apagado (pid 26492, 11:19:58): "Citas Pendientes", "Citas Confirmadas", "Citas Canceladas" y "Pacientes" muestran "No se pudo conectar con el servidor. Intente nuevamente.", 0 filas y sin tabla | Igual |
| P12 | `200 POST /api/cita`, alerta "Cita registrada con éxito", URL `/welcome`; BD: `22 \| 1 \| 1 \| 2026-10-26 \| 10:00:00 \| Prueba LB-0: control general \| 1`; "Mis Citas" la muestra como Pendiente | Igual |
| P13 | Pestaña abierta antes de guardar: ofrece `10:00`. Pestaña nueva después: `10:00` no aparece. `POST /api/cita` duplicado → respuesta `{"idCita":23,…}` (el código HTTP no quedó en la salida porque recorté la línea; la respuesta trae la cita creada); `COUNT(*) = 2` para médico 1, 2026-10-26, 10:00 | Igual |
| P14 | `/api/cita`: total 23, paciente 1: 4, 13 pacientes distintos; BD `23 \| 4` | Igual |
| P15 | `/api/historia_clinica`: total 5, paciente 1: 1 | Igual |
| P16 | Navegador: respuesta de `/api/cita` con 23 registros, 4 del paciente 1; 4 tarjetas; 9 peticiones (`/api/cita` ×1, `/api/medico/codigo/1` ×3, `/api/medico/codigo/6` ×1, `/api/especialidad/1` ×4) | Igual |
| P17 | Los 3 roles: tras "Cerrar Sesión", localStorage `{}`; médico y admin en `/login-selection`; paciente: abrir `/paciente/mis-citas` redirige a `/login-paciente` | Igual |
| P18 | `FALLIDA POST http://localhost:8080/login net::ERR_CONNECTION_REFUSED`, `/login-paciente`, localStorage `{}`, "No se pudo conectar con el servidor. Intente nuevamente." | Igual |
| P19 | 6/6 combinaciones: `200 POST /login`, se quedan en el login usado, localStorage `{}`, mensaje "Este usuario no es un {paciente\|médico\|administrador}. Use el login que le corresponde." | Igual |
| P20 | `200 GET /api/citas/medico/1?estado=Pendiente`; pantalla `22 \| Juan Perez Gomez \| 12345678 \| 2026-10-26 \| 10:00:00 \| Prueba LB-0: control general` y `23 \| … \| Prueba LB-0: doble reserva (pestana B)`, iguales al SELECT | Igual |
| P21 | Modal "Aceptar Cita … Paciente: Juan Perez Gomez … Motivo: Prueba LB-0: control general"; `200 PUT /api/citas/medico/1/22/estado {"estado":"Confirmada"}`; pendientes: solo la 23. BD: `22 \| 1 \| 2 \| Confirmada`. "Citas Confirmadas" tras recargar: la 22 con "Confirmada" | Igual |
| P22 | Modal "Cancelar Cita … Motivo: Prueba LB-0: doble reserva (pestana B)"; `200 PUT /api/citas/medico/1/23/estado {"estado":"Cancelada"}`; pendientes: "No hay citas pendientes.". BD: `23 \| 1 \| 3 \| Cancelada`. "Citas Canceladas" tras recargar: la 23 con "Cancelada" | Igual |
| P23 | 20/20 iguales. Médico 1: Pendiente 0, Confirmada 1 (22), Cancelada 1 (23), Atendida 4 (1, 9, 14, 18). Pacientes del médico 1: API 7, 6, 1, 11; BD 1, 6, 7, 11 | Igual |
| P24 | Citas → `idCita, fecha, hora, motivo, estado, idPaciente, pacienteNombres, pacienteApellidos, pacienteDni`; pacientes → `idPaciente, nombres, apellidos, dni, fechaNacimiento, sexo, telefono, estadoPaciente, departamento, distrito`; "contiene clave: false", "texto 123456: false" | Igual |

**Otras validaciones de LB-4** (detalle en `docs/BITACORA.md`):
- `ng build --configuration development` (el comando de las líneas base anteriores): sin errores y **sin advertencias**; en LB-3 daba las 2 NG8113 (H-011). `ng build` de producción: 2 advertencias que ya estaban en LB-3 (presupuesto inicial 808.66 kB, mismo tamaño; `jquery` no es ESM en `detalle-medico.ts`), comprobado compilando LB-3 en un worktree temporal.
- Unitarias del frontend: `Executed 32 of 32 SUCCESS` · `TOTAL: 32 SUCCESS` (11:07:24–11:07:31).
- `./mvnw test` en `backend/`: `Tests run: 37, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS` (11:07:55–11:08:14).
- Playwright desde `e2e/`: **6/6 pasan** (11:08:54–11:09:05), igual que en LB-3.

**Evidencias LB-4:** `lb4-P11-medico-backend-apagado-error.png`, `lb4-P12-registrar-cita-formulario.png`, `lb4-P12-mis-citas-con-cita-nueva.png`, `lb4-P13-pestana-nueva-oculta-1000.png`, `lb4-P18-paciente-backend-apagado-mensaje-conexion.png`, `lb4-medico-citas-pendientes.png`, `lb4-medico-citas-confirmadas.png`, `lb4-medico-citas-canceladas.png` (todas en `docs/evidencias/`).

**Notas de método LB-4:**
- La parte de navegador se ejecutó con dos scripts de Playwright (`chromium` de `e2e/node_modules`) guardados en el scratchpad de la sesión, fuera del repositorio: un contexto de navegador nuevo por caso, escritura en el formulario y `element.click()` en "Cerrar Sesión", la hora de la cita, "Confirmar Cita", "Aceptar"/"Cancelar" y los botones de confirmación (igual que en LB-1 a LB-3). Las pruebas de API, con `curl` y `mysql`.
- P11 con el backend apagado: como no se puede iniciar sesión sin backend, se cargaron en localStorage las 3 claves que deja el login de médico (`userId` 1, `userName` "Jorge Santos Ruiz", `userType` medico, las mismas de P06) y se abrieron las 4 pantallas.
- La primera corrida del script se detuvo en P07 por un error del script (buscaba `#dni` y el login de admin usa `#usuario`); se corrigió el script y se repitieron P05–P13 desde el principio. Esos logins no modifican la base.
- Antes de la batería se corrieron las pruebas de Playwright (crean y borran citas, lo que mueve el autoincremento); por eso la BD se recargó de nuevo a las 11:11:51, justo antes de P01.

---

### P25 — CORS: preflight desde el frontend aceptado, desde un origen ajeno rechazado
- Tipo: Integración (API + base de datos)
- Creada en: LB-5 (RFC-005), y ejecutada **antes** del cambio sobre LB-4, para comparar.
- Qué se hace: `curl -X OPTIONS` (preflight) con `Origin` y `Access-Control-Request-Method` a `POST /login`, `GET /api/especialidad`, `POST /api/cita`, `PUT /api/citas/medico/1/1/estado`, `DELETE /api/paciente/999` y `GET /usuarios`, desde `http://localhost:4200` y desde `http://otro-origen.example`; además un `GET /api/especialidad` normal con cada `Origin`. Se registran el código HTTP, las cabeceras `Access-Control-*` y `Vary` y el cuerpo. (El script está en el scratchpad de la sesión, `p25.sh`; las salidas completas en `docs/evidencias/lb4-P25-cors.txt` y `lb5-P25-cors.txt`.)
- Esperado: desde `http://localhost:4200`, 200 con `Access-Control-Allow-Origin: http://localhost:4200`; desde un origen ajeno, rechazo.
- Obtenido (LB-4, 14:53, antes del cambio): `localhost:4200` → **200** en los 6 preflight y en el GET, con `Access-Control-Allow-Origin: http://localhost:4200`, `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`, `Access-Control-Allow-Headers: content-type`, `Access-Control-Allow-Credentials: true`; `otro-origen.example` → **403** `Invalid CORS request` en los 7, sin cabeceras `Access-Control-Allow-*`. Rechaza el origen ajeno **también en los controladores anotados con `@CrossOrigin(origins = "*")`** y en `/usuarios`, que no tiene anotación: manda la configuración global de `WebSecurityConfig`.
- Resultado (LB-4): **PASA**

## Resultados de LB-5 (RFC-005, R1 DRY)

Ejecución del 2026-10-21, entre 15:05 y 15:08 (hora real: `date` en cada script), con la BD recargada a las 15:05:35 desde `database/BDPostaMedica.sql` (21 citas), backend reiniciado con el cambio (15:00:13) y frontend con recarga automática de `ng serve`. Es una refactorización: **todas las pruebas deben dar igual que en LB-4**.

| ID | Obtenido en LB-5 | ¿Igual a LB-4? |
|---|---|---|
| P01 | 200 en los 14; mismos tamaños (cie 291 B, cita 2811 B, disponibilidad_medico 8632 B, especialidad 554 B, estado_cita 458 B, estado_paciente 461 B, evolucion_clinica 1443 B, historia_clinica 746 B, medico 2003 B, medico/conEspecialidad 2492 B, medico/especialidad/1 407 B, paciente 2949 B, ubigeo 311 B, usuarios 99 B) | Igual |
| P02 | 200 en los 6; `porEstado` → `[{"estadoCita":"Pendiente","cantCita":2},{"estadoCita":"Confirmada","cantCita":1},{"estadoCita":"Cancelada","cantCita":1…`; `citas/medico/1/fecha/2023-07-01` → la cita 1 | Igual |
| P03 | 11/11 en 200; `/api/paciente/codigo/1` sigue devolviendo `"clave":"123456"` | Igual |
| P04 | `500 {"message":"Cannot instantiate query result type 'com.centro_valdiviezo.backend.dto.ResumenMedico'…` | Igual |
| P05 | `200 POST /login` → `/welcome`; localStorage `{"userId":"1","userName":"Juan Perez Gomez","userType":"paciente"}`; "Mis Citas" muestra `2023-07-01 - 09:00:00` y `2023-07-06 - 09:00:00` | Igual |
| P06 | `200 POST /login` → `/medico-dashboard`; localStorage `{"userId":"1","userName":"Jorge Santos Ruiz","userType":"medico"}` | Igual |
| P07 | `200 POST /login` → `/admin/inicio`; localStorage `{"userId":"1","userName":"Admin Principal","userType":"administrador"}` | Igual |
| P08 | Los 3 roles: `401 POST /login`, se quedan en su login, localStorage `{}`, "Credenciales inválidas" | Igual |
| P09 | 200 ×3 con los datos del rol (`tipo` paciente, medico con `cmp CMP12345`, administrador con `rol ADMIN`); `00000000`/`x` → `401 {"error":"Credenciales inválidas"}` | Igual |
| P10 | DNI `99999999`: `401 POST /login`, `/login-paciente`, localStorage `{}`, "Credenciales inválidas" | Igual |
| P11 | Backend encendido: `200 GET /api/citas/medico/1?estado=Pendiente`, "No hay citas pendientes.". Backend apagado (pid 18328, 15:07:32): las 4 pantallas muestran "No se pudo conectar con el servidor. Intente nuevamente.", 0 filas y sin tabla | Igual |
| P12 | `200 POST /api/cita`, alerta "Cita registrada con éxito", URL `/welcome`; BD: `22 \| 1 \| 1 \| 2026-10-26 \| 10:00:00 \| Prueba LB-0: control general \| 1`; "Mis Citas" la muestra como Pendiente | Igual |
| P13 | Pestaña abierta antes de guardar: ofrece `10:00`. Pestaña nueva después: `10:00` no aparece. `POST /api/cita` duplicado → `HTTP 200` `{"idCita":23,…}`; `COUNT(*) = 2` para médico 1, 2026-10-26, 10:00 | Igual |
| P14 | `/api/cita`: total 23, paciente 1: 4, 13 pacientes distintos; BD `23 \| 4` | Igual |
| P15 | `/api/historia_clinica`: total 5, paciente 1: 1; BD `5 \| 1` | Igual |
| P16 | Respuesta de `/api/cita` con 23 registros, 4 del paciente 1; 4 tarjetas; 9 peticiones (`/api/cita` ×1, `/api/medico/codigo/1` ×3, `/api/medico/codigo/6` ×1, `/api/especialidad/1` ×4) | Igual |
| P17 | Los 3 roles: tras "Cerrar Sesión", localStorage `{}`; médico y admin en `/login-selection`; paciente: abrir `/paciente/mis-citas` redirige a `/login-paciente` | Igual |
| P18 | `FALLIDA POST http://localhost:8080/login net::ERR_CONNECTION_REFUSED`, `/login-paciente`, localStorage `{}`, "No se pudo conectar con el servidor. Intente nuevamente." | Igual |
| P19 | 6/6 combinaciones: `200 POST /login`, se quedan en el login usado, localStorage `{}`, "Este usuario no es un {paciente\|médico\|administrador}. Use el login que le corresponde." | Igual |
| P20 | `200 GET /api/citas/medico/1?estado=Pendiente`; pantalla con las citas 22 y 23, iguales al SELECT | Igual |
| P21 | Modal "Aceptar Cita … Motivo: Prueba LB-0: control general"; `200 PUT /api/citas/medico/1/22/estado {"estado":"Confirmada"}`; pendientes: solo la 23; "Citas Confirmadas" tras recargar: la 22 | Igual |
| P22 | Modal "Cancelar Cita … Motivo: Prueba LB-0: doble reserva (pestana B)"; `200 PUT /api/citas/medico/1/23/estado {"estado":"Cancelada"}`; pendientes: "No hay citas pendientes."; "Citas Canceladas" tras recargar: la 23 | Igual |
| P23 | 20/20 iguales. Médico 1: Pendiente 0, Confirmada 1 (22), Cancelada 1 (23), Atendida 4 (1, 9, 14, 18). Pacientes del médico 1: API 7, 6, 1, 11; BD 1, 6, 7, 11 | Igual |
| P24 | Citas → `idCita, fecha, hora, motivo, estado, idPaciente, pacienteNombres, pacienteApellidos, pacienteDni`; pacientes → `idPaciente, nombres, apellidos, dni, fechaNacimiento, sexo, telefono, estadoPaciente, departamento, distrito`; "contiene clave: false", "texto 123456: false" | Igual |
| P25 | Sin las 13 `@CrossOrigin` (15:00:19–15:00:24): las 14 líneas de salida son **idénticas byte a byte** a las de LB-4 (`diff` sin diferencias): 200 con las mismas cabeceras desde `localhost:4200`, 403 `Invalid CORS request` desde el origen ajeno | Igual (a la medición de LB-4 antes del cambio) |

**Otras validaciones de LB-5** (detalle en `docs/BITACORA.md`):
- `ng build --configuration development` (14:58): sin errores y **sin advertencias**, igual que LB-4. `ng build` de producción: las mismas 2 advertencias de LB-4 (presupuesto inicial: 808.17 kB, antes 808.66 kB —baja 0.49 kB por quitar el código repetido—; `jquery` no ESM en `detalle-medico.ts`).
- Unitarias del frontend, comando de LB-4 (solo caracterización): `Executed 32 of 32 SUCCESS` · `TOTAL: 32 SUCCESS` (14:58:42–14:58:49). Con las nuevas (`tsconfig.unitarias.json`): `Executed 41 of 41 SUCCESS` (32 + U63–U71).
- `./mvnw test` en `backend/` (14:59:35–14:59:55): `Tests run: 37, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS`.
- Playwright desde `e2e/` (15:00:50–15:00:57): **6 passed**, igual que en LB-4.
- Capturas antes/después de las 3 pantallas de login en 5 estados cada una (15 pares): idénticas; las únicas diferencias (7–18 píxeles en el borde de la caja de admin) también aparecen entre dos corridas del mismo código. Detalle: `docs/evidencias/lb5-capturas-comparacion.txt`.

**Evidencias LB-5:** `lb4-P25-cors.txt`, `lb5-P25-cors.txt`, `lb5-capturas-comparacion.txt`, `lb5-antes-login-*.png` y `lb5-despues-login-*.png` (15 + 15), `lb5-P11-medico-backend-apagado-error.png`, `lb5-P12-registrar-cita-formulario.png`, `lb5-P12-mis-citas-con-cita-nueva.png`, `lb5-P13-pestana-nueva-oculta-1000.png`, `lb5-P18-paciente-backend-apagado-mensaje-conexion.png`, `lb5-medico-citas-pendientes.png`, `lb5-medico-citas-confirmadas.png`, `lb5-medico-citas-canceladas.png` (todas en `docs/evidencias/`).

**Notas de método LB-5:** los scripts de navegador son los de LB-4 copiados al scratchpad de esta sesión (`bateria-nav.js`, `bateria-nav-parte2.js`); solo cambió el prefijo de las capturas. La parte de API se ejecutó con un script nuevo, `bateria-api.sh`, que corre los mismos `curl` y `SELECT` descritos en cada prueba. P11 con el backend apagado: igual que en LB-4, se cargaron en localStorage las 3 claves que deja el login de médico.

## Resultados de LB-6 (RFC-006, R2 Responsabilidad Única)

Ejecución del 2026-10-21, entre 15:21 y 15:24 (hora real: `date` en cada script), con la BD recargada a las 15:21:42 desde `database/BDPostaMedica.sql` (21 citas). El backend no cambió en esta RFC. Es una refactorización: **todas las pruebas deben dar igual que en LB-5**.

Se corrieron los mismos scripts que en LB-5 y se compararon sus salidas con `diff` (sin las líneas de hora): **P01–P10, P12–P17 y P19–P24 dieron una salida textualmente idéntica a la de LB-5**; P11 y P18 con el backend apagado (pid 22736, detenido a las 15:24:06), también idénticas; P25 (15:19:11–15:19:16), idéntica byte a byte a la de LB-5.

| ID | Obtenido en LB-6 | ¿Igual a LB-5? |
|---|---|---|
| P01–P04 | 200 en los 14 con los mismos tamaños; 200 en los 6; 11/11 en 200 con `"clave":"123456"`; P04 `500` | Igual |
| P05–P10 | Mismas URL, localStorage, mensajes y respuestas de `/login` que en LB-5 | Igual |
| P11 | Encendido: "No hay citas pendientes."; apagado: las 4 pantallas con el mensaje de conexión, sin tabla | Igual |
| P12 | `200 POST /api/cita`, cita 22 guardada, visible en "Mis Citas" | Igual |
| P13 | Pestaña vieja ofrece `10:00`; pestaña nueva no; POST duplicado `HTTP 200` `{"idCita":23,…}`; `COUNT(*) = 2` | Igual |
| P14–P16 | 23 / 4 / 13 pacientes; 5 / 1; 23 recibidas, 4 tarjetas, 9 peticiones | Igual |
| P17–P19 | Cierre de sesión deja localStorage `{}`; sin backend, mensaje de conexión; 6/6 roles cruzados rechazados | Igual |
| P20–P24 | Citas 22 y 23 pendientes; 22 → Confirmada; 23 → Cancelada; 20/20 iguales al SELECT; sin contraseña | Igual |
| P25 | 200 desde `localhost:4200`, 403 desde el origen ajeno, mismas cabeceras | Igual |

**Otras validaciones de LB-6** (detalle en `docs/BITACORA.md`):
- `ng build --configuration development` (15:17:41–15:17:47): sin errores ni advertencias. Producción: las mismas 2 advertencias (808.17 kB; `jquery`).
- Unitarias del frontend, comando de LB-4: `Executed 32 of 32 SUCCESS` (15:17:56–15:18:03). Todas: `Executed 49 of 49 SUCCESS` (32 + U63–U71 + U72–U79) (15:18:03–15:18:10).
- `./mvnw test` (15:18:20–15:18:33): `Tests run: 37, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS`.
- Playwright desde `e2e/`: la **primera** corrida (15:18:33–15:19:11) dio **5 passed, 1 failed** (`admin-reportes.spec.ts`, tiempo de espera de 30 s). Causa comprobada: el aviso de error de `ng serve` de un estado intermedio de mi edición (`TS2304: Cannot find name 'diaDeLaSemana'`) seguía sobre la página y tapaba el botón "Iniciar Sesión"; se reprodujo a propósito a las 15:20 y el `error-context.md` de Playwright muestra ese aviso. No es un cambio de la aplicación. Corridas siguientes con el código final: **6 passed** (15:19:34, 15:19:41, 15:21:25). Detalle en la bitácora y en H-038.
- Capturas antes/después de "Registrar Cita" en 4 casos (con horario, sin horario, con horario y una hora ocupada, sin horario y una hora ocupada): **idénticas píxel a píxel** (mismo sha256). Detalle: `docs/evidencias/lb6-capturas-comparacion.txt`.

**Evidencias LB-6:** `lb6-capturas-comparacion.txt`, `lb6-antes-registrar-cita-*.png` y `lb6-despues-registrar-cita-*.png` (4 + 4), `lb6-P11-medico-backend-apagado-error.png`, `lb6-P12-registrar-cita-formulario.png`, `lb6-P12-mis-citas-con-cita-nueva.png`, `lb6-P13-pestana-nueva-oculta-1000.png`, `lb6-P18-paciente-backend-apagado-mensaje-conexion.png`, `lb6-medico-citas-pendientes.png`, `lb6-medico-citas-confirmadas.png`, `lb6-medico-citas-canceladas.png` (todas en `docs/evidencias/`).

---

## Pruebas unitarias

**Qué son.** Son pruebas de **caracterización**: comprueban el comportamiento **actual** del código, aunque sea incorrecto. Su función es servir de red de seguridad para la reorganización y las refactorizaciones: si una refactorización cambia el comportamiento, una prueba falla. No dicen cómo *debería* funcionar el sistema (eso lo dicen el "Esperado" de P01–P24 y las RFC).

Cuando una prueba comprueba un comportamiento que es un error conocido, lo dice en su nombre o en un comentario con el ID del hallazgo, por ejemplo "sin horario ese día: ofrece 08:00 a 20:00 (comportamiento actual, H-022)". Esas pruebas **deben seguir pasando** en LB-4 a LB-8; solo un RFC correctivo puede hacerlas fallar a propósito.

**Dobles de prueba.** Frontend: las clases se crean con `new` y se les pasan objetos `jasmine.createSpyObj` en lugar de `HttpClient`, `Router` y `AuthService`; no se renderiza la plantilla ni se ejecuta `ngOnInit`. Backend: `@ExtendWith(MockitoExtension.class)` con `@Mock` de los repositorios. Ninguna prueba unitaria llama al backend real ni a la base de datos. (La prueba vieja `CentroValdiviezoApplicationTests.contextLoads` sí levanta el contexto de Spring y necesita MySQL: no es unitaria, pero `mvnw test` la ejecuta.)

**Datos.** Las pruebas usan DNIs, IDs y claves inventados (`11112222`, `clave-prueba`…), no los de la base, salvo `MedicoServiceCaracterizacionTest`, cuyo DNI de ejemplo se arma con `"1000000" + id`.

### Comandos exactos

Frontend (desde `frontend/`, en Git Bash; hasta LB-3 era `proyecto_valdiviezo/`). Usa el Chromium que ya está en la caché de Playwright, en modo headless, y solo los archivos `*.caracterizacion.spec.ts`:

```bash
cd frontend
export CHROME_BIN="$(cygpath -w ~/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe)"
npx ng test --watch=false --browsers=ChromeHeadless --ts-config=tsconfig.caracterizacion.json --include='src/app/**/*.caracterizacion.spec.ts'
```

`--ts-config=tsconfig.caracterizacion.json` es necesario: el `tsconfig.spec.json` del proyecto compila **todos** los `.spec.ts`, y 4 de los specs viejos no compilan (ver "Estado de los specs viejos"); con ellos la compilación falla y no se ejecuta ninguna prueba, aunque `--include` filtre. En PowerShell: `$env:CHROME_BIN = "$env:LOCALAPPDATA\ms-playwright\chromium-1217\chrome-win64\chrome.exe"` y el mismo `npx ng test …`.

Desde LB-5 hay además pruebas unitarias de las funciones extraídas en las refactorizaciones (`*.unitaria.spec.ts`, U63 en adelante; en LB-6, 17: U63–U79). El comando de arriba **no cambia** (sigue corriendo solo las 32 de caracterización, para comparar con las líneas base anteriores). Para correr todas juntas:

```bash
npx ng test --watch=false --browsers=ChromeHeadless --ts-config=tsconfig.unitarias.json --include='src/app/**/*.caracterizacion.spec.ts' --include='src/app/**/*.unitaria.spec.ts'
```

Backend (desde `backend/`; hasta LB-3 era `backend/backend/`; MySQL encendido por `contextLoads`):

```bash
cd backend
./mvnw test
```

Pruebas de Playwright (desde `e2e/`; hasta LB-3 se corrían desde la raíz con `npx playwright test tests/`). La primera vez, `npm install` en `e2e/`. Backend y frontend deben estar corriendo:

```bash
cd e2e
npx playwright test tests/ --workers=1
```

Script de la base de datos (desde LB-4): `database/BDPostaMedica.sql`.

### Lista

| ID | Archivo | Qué comprueba | Tipo | Hallazgo |
|---|---|---|---|---|
| U01 | `FE/features/auth/login-paciente/login-paciente.caracterizacion.spec.ts` | Login de paciente: guarda `userId`, `userName` ("nombres apellidos") y `userType`, navega a `/welcome` | Unitaria | — |
| U02 | ídem | Usuario de otro rol: no guarda nada, "Este usuario no es un paciente. Use el login que le corresponde." | Unitaria | — |
| U03 | ídem | Error 401: "Credenciales inválidas", no guarda nada | Unitaria | — |
| U04 | ídem | Error de conexión (status 0): "No se pudo conectar con el servidor. Intente nuevamente.", no guarda nada | Unitaria | — |
| U05 | ídem | Error 500: el mismo mensaje de conexión aunque el servidor respondió (comportamiento actual) | Unitaria | H-029 |
| U06 | ídem | DNI inválido (7 dígitos, 9, con letra, vacío): mensaje de DNI y no llama a `AuthService.login` | Unitaria | — |
| U07–U12 | `FE/features/auth/login-medico/login-medico.caracterizacion.spec.ts` | Los mismos 6 casos para el médico; navega a `/medico-dashboard`; mensaje "Este usuario no es un médico…". U11 = error 500 | Unitaria | U11: H-029 |
| U13–U18 | `FE/features/auth/login-admin/login-admin.caracterizacion.spec.ts` | Los mismos 6 casos para el administrador; navega a `/admin`; guarda exactamente 3 claves; mensaje "Este usuario no es un administrador…". U17 = error 500 | Unitaria | U17: H-029 |
| U19 | `FE/features/paciente/registrar-cita/registrar-cita.caracterizacion.spec.ts` | `generarSlots()` con horario del lunes 08:00–10:00: `08:00` a `09:40` cada 20 minutos | Unitaria | — |
| U20 | ídem | Descarta las horas ocupadas (`08:20:00`, `09:40:00`) | Unitaria | — |
| U21 | ídem | Sin horario ese día (sábado): 36 bloques de `08:00` a `19:40` (comportamiento actual) | Unitaria | H-022 |
| U22 | ídem | Sin horario: el horario por defecto también descarta las ocupadas (comportamiento actual) | Unitaria | H-022 |
| U23 | ídem | Con horario pero todo ocupado: cae al horario por defecto y ofrece `10:00` a `19:40` (comportamiento actual) | Unitaria | H-022 |
| U24 | `FE/features/paciente/welcome/cerrar-sesion.caracterizacion.spec.ts` | Welcome: "Cerrar sesión" llama a `AuthService.logout` y navega a `/login-selection` | Unitaria | — |
| U25 | ídem | Welcome: con el `AuthService` real, el localStorage queda vacío (también claves ajenas) | Unitaria | — |
| U26 | ídem | Admin-dashboard: llama a `AuthService.logout` y navega a `/login-selection` | Unitaria | — |
| U27 | ídem | Admin-dashboard: con el `AuthService` real, el localStorage queda vacío | Unitaria | — |
| U28 | `FE/features/medico/services/medico.service.caracterizacion.spec.ts` | `getCitasByStatus`: `GET http://localhost:8080/api/citas/medico/{userId}` con `params: { estado }` | Unitaria | — |
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
| U63 | `FE/features/auth/login-comun.unitaria.spec.ts` (LB-5, RFC-005) | `validarDniPeruano`: solo 8 dígitos (7, 9, con letra, vacío, con espacio → falso) | Unitaria | — |
| U64 | ídem | `validarFormularioLogin`: primero el DNI, después la contraseña; `''` si se puede enviar | Unitaria | — |
| U65 | ídem | `MENSAJES_LOGIN` y `mensajeRolEquivocado` tienen exactamente los textos que mostraban las 3 copias | Unitaria | — |
| U66 | ídem | `resolverRespuestaLogin`: rol correcto → `/welcome`, `/medico-dashboard`, `/admin` | Unitaria | — |
| U67 | ídem | `resolverRespuestaLogin`: las 6 combinaciones de rol equivocado → mensaje de rol | Unitaria | — |
| U68 | ídem | `resolverRespuestaLogin`: sin cuerpo o sin `success` → "Respuesta inesperada del servidor" en los 3 roles | Unitaria | H-030 (unificado) |
| U69 | ídem | `guardarSesion`: guarda `userId`, `userName` ("nombres apellidos") y `userType`, exactamente 3 claves | Unitaria | — |
| U70 | ídem | `guardarSesion` con `nombres` vacío: paciente y médico no guardan `userName`; admin guarda `" apellidos"` (comportamiento conservado) | Unitaria | H-036 |
| U71 | ídem | `mensajeErrorLogin`: 401 → "Credenciales inválidas"; 0, 400, 403, 404, 500, 503 → mensaje de conexión (comportamiento actual) | Unitaria | H-029 |
| U72 | `FE/features/paciente/registrar-cita/horarios-cita.unitaria.spec.ts` (LB-6, RFC-006) | `diaDeLaSemana`: nombre del día en hora local (domingo, lunes, miércoles, sábado) | Unitaria | — |
| U73 | ídem | `horaAMinutos` / `minutosAHora` (incluye `''` → 0); bloque de 20 minutos | Unitaria | — |
| U74 | ídem | Con horario 14:00–15:10: solo bloques completos (`14:00`, `14:20`, `14:40`), `porDefecto: false` | Unitaria | — |
| U75 | ídem | Con horario: descarta las horas ocupadas | Unitaria | — |
| U76 | ídem | Sin horario ese día: horario por defecto 08:00–20:00 menos las ocupadas (comportamiento actual) | Unitaria | H-022 |
| U77 | ídem | Con horario todo ocupado: cae al horario por defecto (comportamiento actual) | Unitaria | H-022 |
| U78 | ídem | Cita con `hora_cita` nula: con horario lanza `TypeError`; en el horario por defecto se ignora (comportamiento actual) | Unitaria | H-037 |
| U79 | ídem | En 2000 entradas generadas (fecha, disponibilidad y citas), `calcularHorariosDisponibles` da la misma lista que una copia literal del algoritmo de LB-5 | Unitaria | — |

(`BE/…` = `backend/src/test/java/com/centro_valdiviezo/backend/`; `FE/` = `frontend/src/app/`. Rutas actualizadas en LB-4; hasta LB-3 eran `backend/backend/…` y `proyecto_valdiviezo/src/app/` con las carpetas de la tabla de RFC-004.) `getResumenMedicoPorEspecialidad` (H-005) no se caracteriza aquí: con el repositorio simulado no se reproduce el error 500, que nace en la consulta; lo cubre P04.

### Resultados de la tarea 9 (2026-10-21, sobre LB-3, sin cambios en el código de la aplicación)

- Frontend (10:28:36–10:28:59): `Chrome Headless 147.0.0.0 (Windows 10): Executed 32 of 32 SUCCESS` · `TOTAL: 32 SUCCESS`. U01–U32 **pasan**.
- Backend (10:31:08–10:31:28), `./mvnw test`: `Tests run: 37, Failures: 0, Errors: 0, Skipped: 0` · `BUILD SUCCESS`. Por clase: `AuthControllerCaracterizacionTest` 9, `CitaConsultaControllerCaracterizacionTest` 8 (U42–U45 + 4 casos de U46), `PacienteServiceCaracterizacionTest` 7, `MedicoServiceCaracterizacionTest` 6, `CitaServiceCaracterizacionTest` 3 → **33 nuevas, todas pasan**. Pruebas viejas: `CentroValdiviezoApplicationTests` 1, `AuthControllerTest` 1, `EspecialidadTest` 2 → **4 pasan**. La salida muestra una traza `java.lang.RuntimeException: BD caida` en `AuthController.login`: es el `e.printStackTrace()` de `AuthController.java:100` que provoca U41 a propósito, no un fallo.

### Estado de los specs viejos del frontend (generados por Angular; no se modificaron)

> **Nota LB-4 (RFC-004):** las rutas de esta sección son las de LB-3. `login/login.spec.ts` y `features/usuario/components/components.spec.ts` se eliminaron con su componente; `services/auth.spec.ts` y `services/usuario.spec.ts` están ahora en `core/services/`; el resto se movió con su componente según la tabla de RFC-004. La lista vigente está en el hallazgo H-033.

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
| P01 | Endpoints GET de catálogos y listados | PASA (14/14 en 200) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P02 | Endpoints de reportes y consultas agregadas | PASA (6/6 en 200) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P03 | Endpoints por ID | PASA (11/11 en 200; expone `clave`, H-007) | PASA (igual; expone `clave`, H-007) | PASA (igual; expone `clave`, H-007) | PASA (igual; expone `clave`, H-007) | PASA (igual; expone `clave`, H-007) | PASA (igual; expone `clave`, H-007) | PASA (igual; expone `clave`, H-007) |  |  |
| P04 | `/api/medico/resumenMedico` | FALLA (500, H-005) | FALLA (igual, H-005) | FALLA (igual, H-005) | FALLA (igual, H-005) | FALLA (igual, H-005) | FALLA (igual, H-005) | FALLA (igual, H-005) |  |  |
| P05 | Login por formulario: paciente | PASA (`/welcome`; `userId`, `userName`, `userType`) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P06 | Login por formulario: médico | PASA (`/medico-dashboard`; `userId`, `userName`, `userType`) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P07 | Login por formulario: admin | FALLA (`/admin/inicio`; claves `userTipo`, `userNombre`… distintas, H-002) | **PASA** (cambió: claves iguales a los otros roles) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P08 | Login con contraseña incorrecta (3 roles) | PASA en seguridad (401, no entra); FALLA en mensaje distinto en admin (H-003) | **PASA** (cambió: mismo mensaje en los 3 roles) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P09 | Login directo a la API | PASA (200 ×3, 401 inválido) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P10 | Login paciente con DNI inexistente + `123456` | FALLA (entra como paciente 1, H-001) | **PASA** (cambió: no entra, localStorage vacío) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P11 | Módulo médico con backend apagado | FALLA (datos simulados, sin error, H-004) | FALLA (igual, H-004) | FALLA (igual, H-004) | **PASA** (cambió: datos de la base; sin backend, error y sin datos) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P12 | Registrar cita desde el formulario | PASA (cita 22 guardada, `estado_cita = 1`) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P13 | Doble reserva | FALLA (citas 22 y 23 a la misma hora, H-012) | FALLA (igual, H-012) | FALLA (igual, H-012) | FALLA (igual, H-012) | FALLA (igual, H-012) | FALLA (igual, H-012) | FALLA (igual, H-012) |  |  |
| P14 | Alcance de `/api/cita` | FALLA (23 devueltas / 4 del paciente 1, H-013) | FALLA (igual, 23 / 4, H-013) | FALLA (igual, 23 / 4, H-013) | FALLA (igual, 23 / 4, H-013) | FALLA (igual, 23 / 4, H-013) | FALLA (igual, 23 / 4, H-013) | FALLA (igual, 23 / 4, H-013) |  |  |
| P15 | Alcance de `/api/historia_clinica` | FALLA (5 devueltas / 1 del paciente 1, H-013) | FALLA (igual, 5 / 1, H-013) | FALLA (igual, 5 / 1, H-013) | FALLA (igual, 5 / 1, H-013) | FALLA (igual, 5 / 1, H-013) | FALLA (igual, 5 / 1, H-013) | FALLA (igual, 5 / 1, H-013) |  |  |
| P16 | Registros en "Mis Citas" (red) | FALLA (23 recibidas / 4 mostradas, H-013) | FALLA (igual, 23 recibidas / 4 mostradas, H-013) | FALLA (igual, 23 / 4, H-013) | FALLA (igual, 23 / 4, H-013) | FALLA (igual, 23 / 4, H-013) | FALLA (igual, 23 / 4, H-013) | FALLA (igual, 23 / 4, H-013) |  |  |
| P17 | Cerrar sesión como paciente | FALLA (localStorage queda intacto, H-002) | **PASA** (cambió: localStorage vacío en los 3 roles) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P18 | Login paciente con backend apagado + `123456` | No ejecutada (creada en LB-1) | **PASA** (nueva) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P19 | Matriz de roles cruzados (6 combinaciones) | No ejecutada (creada en LB-2) | No ejecutada (creada en LB-2) | **PASA** (nueva: 6/6 no entran, mensaje unificado) | PASA (igual) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P20 | El médico 1 ve exactamente sus citas pendientes | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | **PASA** (nueva: pantalla = SELECT) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P21 | Confirmar una cita (persiste) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | **PASA** (nueva: Confirmada en BD y tras recargar) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P22 | Cancelar una cita (persiste) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | **PASA** (nueva: Cancelada en BD y tras recargar) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P23 | Endpoint del médico: solo sus citas | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | **PASA** (nueva: 20/20 = SELECT) | PASA (igual, 20/20) | PASA (igual, 20/20) | PASA (igual, 20/20) |  |  |
| P24 | Endpoint del médico sin contraseña | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | No ejecutada (creada en LB-3) | **PASA** (nueva) | PASA (igual) | PASA (igual) | PASA (igual) |  |  |
| P25 | CORS: preflight de `localhost:4200` aceptado, de origen ajeno rechazado | No ejecutada (creada en LB-5) | No ejecutada (creada en LB-5) | No ejecutada (creada en LB-5) | No ejecutada (creada en LB-5) | **PASA** (medida sobre LB-4 antes de RFC-005: 200 / 403) | PASA (igual, salida idéntica byte a byte) | PASA (igual, salida idéntica byte a byte) |  |  |

**Resumen LB-0:** 7 PASA · 9 FALLA · 1 mixta (P08).

**Resumen LB-1:** 12 PASA · 6 FALLA. Cambiaron solo P07, P08, P10 y P17 (objetivo de RFC-001) y se agregó P18. Las otras 13 pruebas dieron lo mismo que en LB-0.

**Resumen LB-2:** 13 PASA · 6 FALLA. Se agregó P19 (objetivo de RFC-002), que pasa. Las 18 pruebas anteriores dieron lo mismo que en LB-1. Sin efectos no deseados.

**Resumen LB-3:** 19 PASA · 5 FALLA. Cambió solo P11 (FALLA → PASA, objetivo de RFC-003) y se agregaron P20–P24, que pasan. Las otras 18 pruebas dieron lo mismo que en LB-2. Sin efectos no deseados.

**Resumen LB-4:** 19 PASA · 5 FALLA (P04, P13, P14, P15, P16). **Las 24 pruebas dieron lo mismo que en LB-3**, incluidas las que fallan por hallazgos correctivos sin RFC. Unitarias 32/32 y 37/37, Playwright 6/6, igual que antes. Sin efectos no deseados.

**Resumen LB-5:** 20 PASA · 5 FALLA (P04, P13, P14, P15, P16). **Las 24 pruebas anteriores dieron lo mismo que en LB-4** y P25 (nueva, medida en LB-4 antes del cambio) dio una salida idéntica. Unitarias 32/32 (más 9 nuevas: 41/41) y 37/37, Playwright 6/6, capturas de login idénticas. Sin efectos no deseados.

**Resumen LB-6:** 20 PASA · 5 FALLA (P04, P13, P14, P15, P16). **Las 25 pruebas dieron lo mismo que en LB-5** (salidas de los scripts idénticas con `diff`). Unitarias 32/32 (49/49 con las 17 nuevas de LB-5 y LB-6) y 37/37, capturas de "Registrar Cita" idénticas píxel a píxel. Playwright: 6/6 con el código final; una primera corrida dio 5/6 por el aviso de error de `ng serve` que quedó de una edición intermedia (causa reproducida; ver "Resultados de LB-6" y H-038). Sin efectos no deseados.

> **Atención al repetir P12 y P13:** cada ejecución agrega citas a la BD. Antes de correr la batería en cada línea base nueva, recargar la base (`DROP DATABASE posta_medica_valdiviezo;` y volver a ejecutar `database/BDPostaMedica.sql`, porque el script usa `CREATE TABLE` sin `DROP`) o borrar las citas de prueba con `DELETE FROM Cita WHERE motivo LIKE 'Prueba LB-0%';` para partir del mismo estado.
