# Batería oficial de pruebas (auditoría)

> **Regla:** En las columnas R1 a R4 el resultado esperado es IGUAL al de la línea base, porque una refactorización no cambia el comportamiento externo. Si un resultado cambia, la refactorización introdujo un error.

**Entorno de la línea base (LB-0):** backend en `http://localhost:8080`, frontend en `http://localhost:4200`, base `posta_medica_valdiviezo` recién cargada con `BDPostaMedica.sql`.
Las pruebas de navegador se hacen con Playwright, **una pestaña nueva por caso**, escribiendo en el formulario.

**Credenciales de prueba:** paciente `12345678` / `123456` · médico `10000001` / `123456` · admin `87654321` / `123456`.

**Nota sobre "esperado":** el resultado esperado describe el comportamiento correcto. Si en la línea base lo obtenido no coincide, la prueba queda como FALLA y se enlaza el hallazgo. En R1–R4 se compara contra lo **obtenido** en LB-0.

---

### P01 — Endpoints GET de catálogos y listados
- Qué se hace: `curl` a `/api/cie`, `/api/cita`, `/api/disponibilidad_medico`, `/api/especialidad`, `/api/estado_cita`, `/api/estado_paciente`, `/api/evolucion_clinica`, `/api/historia_clinica`, `/api/medico`, `/api/medico/conEspecialidad`, `/api/medico/especialidad/1`, `/api/paciente`, `/api/ubigeo`, `/usuarios`.
- Esperado: HTTP 200 con datos en todos.
- Obtenido: 200 en los 14. Tamaños: cie 291 B, cita 2811 B, disponibilidad_medico 8632 B, especialidad 554 B, estado_cita 458 B, estado_paciente 461 B, evolucion_clinica 1443 B, historia_clinica 746 B, medico 2003 B, medico/conEspecialidad 2492 B, medico/especialidad/1 407 B, paciente 2949 B, ubigeo 311 B, usuarios 99 B.
- Resultado: **PASA**

### P02 — Endpoints de reportes y consultas agregadas
- Qué se hace: `curl` a `/api/reportes/dashboard`, `/api/reportes/resumen`, `/api/reportes/ingresosMensuales`, `/api/cita/porEstado`, `/api/cita/porEspecialidad`, `/api/citas/medico/1/fecha/2023-07-01`.
- Esperado: HTTP 200 con datos.
- Obtenido: 200 en los 6. Ejemplos: `porEstado` → `[{"estadoCita":"Pendiente","cantCita":2},{"estadoCita":"Confirmada","cantCita":1},{"estadoCita":"Cancelada","cantCita":1},{"estadoCita":"Atendida","cantCita":17…`; `citas/medico/1/fecha/2023-07-01` → `[{"idCita":1,"id_paciente":1,"id_medico":1,"fecha_cita":"2023-07-01","hora_cita":"09:00:00","motivo":"Chequeo general","estado_cita":4}]`.
- Resultado: **PASA**

### P03 — Endpoints por ID
- Qué se hace: `curl` a `/api/cita/1`, `/api/medico/codigo/1`, `/api/paciente/codigo/1`, `/api/cie/1`, `/api/especialidad/1`, `/api/historia_clinica/1`, `/api/evolucion_clinica/1`, `/api/ubigeo/1`, `/api/estado_cita/1`, `/api/disponibilidad_medico/1`, `/api/disponibilidad_medico/medico/1`.
- Esperado: HTTP 200 con el registro pedido.
- Obtenido: 200 en los 11. Ejemplo: `/api/paciente/codigo/1` → `{"idPaciente":1,"nombres":"Juan","apellidos":"Perez Gomez","dni":"12345678","clave":"123456",…}`. La respuesta incluye la contraseña (ver H-007).
- Resultado: **PASA** (con hallazgo H-007)

### P04 — Endpoint resumen de médicos
- Qué se hace: `curl http://localhost:8080/api/medico/resumenMedico`
- Esperado: HTTP 200 con la cantidad de médicos por especialidad.
- Obtenido: `500 {"message":"Cannot instantiate query result type 'com.centro_valdiviezo.backend.dto.ResumenMedico' due to: Result class must have a single constructor with exac…`
- Resultado: **FALLA** → H-005

### P05 — Login por formulario: paciente
- Qué se hace: abrir `/login-paciente`, escribir `12345678` / `123456`, pulsar "Iniciar Sesión".
- Esperado: redirige a la pantalla del paciente y guarda la sesión.
- Obtenido: red `200 POST /login`; URL final `/welcome`; localStorage `{"userId":"1","userName":"Juan Perez Gomez","userType":"paciente"}`. "Mis Citas" muestra datos reales: `2023-07-01 - 09:00:00 Atendida Médico: Jorge Santos Ruiz … 2023-07-06 - 09:00:00 Pendiente Médico: Roberto Gomez Bolaños`.
- Resultado: **PASA**

### P06 — Login por formulario: médico
- Qué se hace: abrir `/login-medico`, escribir `10000001` / `123456`, pulsar "Iniciar Sesión".
- Esperado: redirige al panel médico y guarda la sesión con las mismas claves que los otros roles.
- Obtenido: red `200 POST /login`; URL final `/medico-dashboard`; localStorage `{"userId":"1","userName":"Jorge Santos Ruiz","userType":"medico"}`.
- Resultado: **PASA** (claves iguales a paciente; distintas de admin → H-002)

### P07 — Login por formulario: administrador
- Qué se hace: abrir `/login-admin`, escribir `87654321` / `123456`, pulsar "Iniciar Sesión".
- Esperado: redirige al panel admin y guarda la sesión con las mismas claves que los otros roles.
- Obtenido: red `200 POST /login`; URL final `/admin/inicio`; localStorage `{"userApellidos":"Principal","userDni":"87654321","userId":"1","userNombre":"Admin","userRol":"ADMIN","userTipo":"administrador"}`.
- Resultado: **FALLA** (claves distintas) → H-002

### P08 — Login con contraseña incorrecta (3 roles)
- Qué se hace: en cada login, DNI correcto y clave `malaclave`.
- Esperado: no entra, localStorage vacío, mismo mensaje de error en los 3 roles.
- Obtenido:
  - paciente: `401 POST /login`, se queda en `/login-paciente`, localStorage `{}`, mensaje "Credenciales inválidas".
  - médico: `401 POST /login`, se queda en `/login-medico`, localStorage `{}`, mensaje "Credenciales inválidas".
  - admin: `401 POST /login`, se queda en `/login-admin`, localStorage `{}`, mensaje "Error al iniciar sesión. Por favor intente nuevamente."
- Resultado: **PASA** en seguridad; **FALLA** en consistencia del mensaje → H-003

### P09 — Login directo a la API
- Qué se hace: `curl -X POST /login` con las credenciales de los 3 roles y con `00000000` / `x`.
- Esperado: 200 con los datos del rol; 401 con credenciales inválidas.
- Obtenido: paciente `200 {"tipo":"paciente","success":true,"id":1,…}`; médico `200 {"tipo":"medico","success":true,"cmp":"CMP12345","id":1,…}`; admin `200 {"tipo":"administrador","success":true,"rol":"ADMIN","id":1,…}`; inválido `401 {"error":"Credenciales inválidas"}`.
- Resultado: **PASA**

### P10 — Login de paciente con DNI inexistente y clave 123456
- Qué se hace: abrir `/login-paciente`, escribir `99999999` (no existe) / `123456`.
- Esperado: no entra; muestra "Credenciales inválidas".
- Obtenido: red `401 POST /login`; URL final `/welcome`; localStorage `{"userId":"1","userName":"Juan Perez (Mock)","userType":"paciente"}`. Entra como el paciente 1.
- Resultado: **FALLA** → H-001

### P11 — Módulo médico con el backend apagado
- Qué se hace: con sesión de médico, abrir Médico > Citas Pendientes con el backend corriendo; apagar el backend; recargar; comparar con `SELECT … FROM Cita WHERE estado_cita=1`.
- Esperado: con backend corriendo muestra las citas pendientes reales de la BD; con backend apagado muestra un error.
- Obtenido: en los dos casos muestra `101 Maria Lopez Quispe`, `102 Luis Torres Paz`, `103 Ana Diaz Ruiz`. No hace peticiones a `:8080`. Consola sin errores con el backend apagado. La BD tiene como pendientes `6 Juan Perez Gomez` y `8 Carlos Ruiz Diaz`; los IDs 101–103 no existen.
- Evidencia: `docs/evidencias/paso3b-medico-citas-pendientes-backend-apagado.png`
- Resultado: **FALLA** → H-004

### P12 — Registrar una cita nueva desde el formulario (paciente)
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
- Qué se hace: `curl http://localhost:8080/api/cita`; contar total y citas con `id_paciente = 1`. Comparar con `SELECT COUNT(*), SUM(id_paciente=1) FROM Cita`.
- Esperado: un paciente solo debería poder recibir sus propias citas.
- Obtenido: `total=23 paciente1=4 pacientes distintos=13`. BD: `total 23 | paciente1 4`. El endpoint no pide autenticación.
- Resultado: **FALLA** → H-013

### P15 — Alcance de `/api/historia_clinica`
- Qué se hace: `curl http://localhost:8080/api/historia_clinica`; contar total y historias con `id_paciente = 1`.
- Esperado: un paciente solo debería poder recibir su propia historia clínica.
- Obtenido: `total=5 paciente1=1`. Ejemplo de dato ajeno recibido: `{"idhistoria_Clinica":2,"id_paciente":2,"fecha_creacion":"2023-02-14","observaciones":"Control anual","tipo_sangre":"A+","alergias":"Penicilina"}`. BD: `total 5 | paciente1 1`.
- Resultado: **FALLA** → H-013

### P16 — Registros que recibe el navegador en "Mis Citas"
- Qué se hace: con sesión de paciente 1 (login por formulario), abrir "Mis Citas" y revisar la respuesta de `GET /api/cita` en el registro de red.
- Esperado: la respuesta trae solo las citas del paciente 1.
- Obtenido: la respuesta trae **23** registros, de los cuales **4** son del paciente 1 y 19 de otros pacientes. La pantalla muestra 4 porque filtra en el navegador (`mis-citas.component.ts:36`). Peticiones de la pantalla: `GET /api/cita` ×1, `/api/medico/codigo/1` ×3, `/api/medico/codigo/6` ×1, `/api/especialidad/1` ×4 (todas 200).
- Evidencia: `docs/evidencias/paso5b-red-mis-citas-respuesta-api-cita.json` (cuerpo de la respuesta), `docs/evidencias/paso5b-red-mis-citas-peticiones.txt` (lista de peticiones). No se adjunta captura de la pestaña de red de DevTools porque Playwright no puede capturar DevTools; se exportó el registro de red del navegador.
- Resultado: **FALLA** → H-013 (y H-014 por peticiones repetidas)

---

## Tabla de resultados

| ID | Prueba | Antes (LB-0) | R1 DRY | R2 SRP | R3 OCP | R4 IoC |
|---|---|---|---|---|---|---|
| P01 | Endpoints GET de catálogos y listados | PASA (14/14 en 200) | | | | |
| P02 | Endpoints de reportes y consultas agregadas | PASA (6/6 en 200) | | | | |
| P03 | Endpoints por ID | PASA (11/11 en 200; expone `clave`, H-007) | | | | |
| P04 | `/api/medico/resumenMedico` | FALLA (500, H-005) | | | | |
| P05 | Login por formulario: paciente | PASA (`/welcome`; `userId`, `userName`, `userType`) | | | | |
| P06 | Login por formulario: médico | PASA (`/medico-dashboard`; `userId`, `userName`, `userType`) | | | | |
| P07 | Login por formulario: admin | FALLA (`/admin/inicio`; claves `userTipo`, `userNombre`… distintas, H-002) | | | | |
| P08 | Login con contraseña incorrecta (3 roles) | PASA en seguridad (401, no entra); FALLA en mensaje distinto en admin (H-003) | | | | |
| P09 | Login directo a la API | PASA (200 ×3, 401 inválido) | | | | |
| P10 | Login paciente con DNI inexistente + `123456` | FALLA (entra como paciente 1, H-001) | | | | |
| P11 | Módulo médico con backend apagado | FALLA (datos simulados, sin error, H-004) | | | | |
| P12 | Registrar cita desde el formulario | PASA (cita 22 guardada, `estado_cita = 1`) | | | | |
| P13 | Doble reserva | FALLA (citas 22 y 23 a la misma hora, H-012) | | | | |
| P14 | Alcance de `/api/cita` | FALLA (23 devueltas / 4 del paciente 1, H-013) | | | | |
| P15 | Alcance de `/api/historia_clinica` | FALLA (5 devueltas / 1 del paciente 1, H-013) | | | | |
| P16 | Registros en "Mis Citas" (red) | FALLA (23 recibidas / 4 mostradas, H-013) | | | | |

**Resumen LB-0:** 7 PASA · 8 FALLA · 1 mixta (P08).

> **Atención al repetir P12 y P13:** cada ejecución agrega citas a la BD. Antes de correr la batería en R1–R4, recargar la base (`DROP DATABASE posta_medica_valdiviezo;` y volver a ejecutar `BDPostaMedica.sql`, porque el script usa `CREATE TABLE` sin `DROP`) o borrar las citas de prueba con `DELETE FROM Cita WHERE motivo LIKE 'Prueba LB-0%';` para partir del mismo estado.
