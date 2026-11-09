# AUD-LOG — Auditoría de lógica y validaciones
Ejecución: 2026-11-09 16:59:12 – 17:27:29 (-0500, hora de `date`). La ejecución se cortó por un error de límite de la API después de la prueba D9 (17:03) y se retomó a las 17:20 con las mismas reglas.
Entorno: rama master en `3200a4d` (LB-9; `git describe` → `ENTREGA-T2-2-g3200a4d`). Backend en http://localhost:8080 (corre desde target/; no lo recompilé ni lo reinicié). Frontend `ng serve` en http://localhost:4200. MySQL 8.0.46, `sql_mode` = `ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION`. Node v24.18.0, zona horaria America/Lima.
Al empezar, la BD tenía 21 citas y 15 pacientes. En paralelo corrían otros auditores (registros AUD-NEG y otros); esos registros los ignoré, pero cambian los totales globales de los reportes (ver Limitaciones).
Evidencia completa (salidas reales) en `C:/Users/braya/AppData/Local/Temp/claude/85b186d9b1722304/0f4da1a6-6e30-4eb8-804c-f218b75ed1f0/scratchpad/aud-logica/` (archivos `01-dni.log` … `17-datos-creados.log`).

## Resumen
| ID | Título | Severidad | Relación | Apto integrante |
|---|---|---|---|---|
| AUD-LOG-01 | El backend no valida ningún input: el único freno son las restricciones de la BD | Alta | Nuevo (contexto de H-016, H-036) | No |
| AUD-LOG-02 | Se aceptan citas en fechas y horas imposibles (pasado, año 0001/9999, 25:00, -01:00, 03:00, 10:07, sábado, sin fecha ni hora, sin paciente ni médico) | Alta | H-012, H-022, H-037 (aporta casos nuevos) | No |
| AUD-LOG-03 | Doble reserva desde la pantalla sin necesidad de dos pestañas: la hora elegida se conserva al cambiar fecha o médico | Alta | H-012 (otra causa) | Sí |
| AUD-LOG-04 | La regla de solapamiento está incompleta: el mismo paciente puede tener 2 citas a la misma hora, y una cita a las 10:07 no bloquea el bloque que pisa | Media | H-012 (amplía) | No |
| AUD-LOG-05 | Los errores de validación responden 500 con el texto SQL, y el registro depende de ese texto para avisar "DNI ya registrado" | Media | Nuevo (relacionado con H-029) | No |
| AUD-LOG-06 | Los endpoints "crear" sobrescriben un registro existente si el cuerpo trae su id | Alta | Nuevo | Sí |
| AUD-LOG-07 | El DNI es único solo dentro de cada tabla: si un paciente se registra con el DNI y la clave de un médico, el médico ya no puede entrar | Alta | Nuevo (relacionado con H-019, H-028) | No |
| AUD-LOG-08 | Estados de cita: no hay máquina de estados (H-031) y además el nombre del estado se compara sin distinguir mayúsculas ni tildes, sin mirar la fecha y aceptando estado nulo | Media | H-031 (aporta lo nuevo) | No |
| AUD-LOG-09 | `PUT /api/cita/{id}` se salta la ruta de estados, borra los campos que no se envían, y los id inexistentes responden 200 vacío o 500 según el recurso | Alta | Nuevo (relacionado con H-031) | No |
| AUD-LOG-10 | Los ingresos y conteos del reporte se pueden manipular y no cuadran | Alta | H-024, H-023 (aporta lo nuevo) | No |
| AUD-LOG-11 | El paciente borra físicamente cualquier cita, incluso Atendida, y así bajan los ingresos | Media | Nuevo | Sí (solo la parte del frontend) |
| AUD-LOG-12 | H-032 sí tiene un camino en pantalla ("Gestión de Pacientes"); la edición tampoco valida, y otras actualizaciones no copian campos | Media | H-032 (corrige su evidencia) | Sí |
| AUD-LOG-13 | `Disponibilidad_Medico` acepta días inexistentes, rangos invertidos y horarios sin médico; varios de esos datos activan el horario por defecto | Media | H-022 (casos nuevos que lo activan) | No |
| AUD-LOG-14 | Registrar Cita (frontend): la fecha mínima se calcula en UTC, una fecha pasada escrita a mano no se bloquea, hoy ofrece horas ya pasadas, y el motivo acepta solo espacios y no tiene tope de largo | Media | Nuevo (complementa AUD-LOG-02) | Sí |
| AUD-LOG-15 | Especialidad: crear sin id da 500, se aceptan nombres duplicados o vacíos y precios negativos, y el PUT no cambia el precio | Media | Nuevo (relacionado con H-024, H-039) | No |
| AUD-LOG-16 | El estado del paciente no se usa: un paciente "Fallecido" se da de alta, inicia sesión y recibe citas | Media | Nuevo | No |
| AUD-LOG-17 | El campo `rol` del administrador es texto libre sin efecto: cualquier fila de Administrador entra como admin | Baja | Nuevo | No |
| AUD-LOG-18 | La API devuelve lo que se envió, no lo que quedó guardado (`sexo` "m" → "M", "13:07" → "13:07:00", "-01:00:00" → "-1:00:00") | Baja | Nuevo | Sí |

## Matriz de validación por input (input | frontend | backend | BD | resultado de la prueba)
| Input | Frontend | Backend | BD | Resultado (API directa) |
|---|---|---|---|---|
| DNI paciente (alta) | `registro.component.ts` exige `/^\d{8}$/` | Nada | `CHAR(8) UNIQUE NOT NULL` | `AB12CD34`, `7100003` (7 dígitos), `""` y `" 7100009"` → **200**. 9 dígitos → 500 "Data too long". Nulo → 500 "cannot be null". Duplicado → 500 "Duplicate entry" (D1–D9) |
| DNI paciente usado como médico o admin | Nada | Nada | UNIQUE solo por tabla | DNI de médico 15 como paciente → 200 (D8). DNI de admin como médico → 200 (M9). DNI de paciente como admin → 200 (U2) |
| DNI login | `login-comun.ts` exige 8 dígitos | Solo exige que no sea nulo | — | `"7100003"` y `""` inician sesión (LG2, LG3) |
| DNI paciente (edición admin) | Solo `required`, y `ngSubmit` no lo comprueba | Nada | UNIQUE | `"zz"` → 200 (UP2). Duplicado → 500 (UP4) |
| Nombres/apellidos | Registro: `!nombres` (los espacios pasan); sin tope de 45 | Nada | `VARCHAR(45) NOT NULL` | `""` y `"   "` → 200 (N1, N2; también médico M7). 46 caracteres → 500 (N3) |
| Fecha de nacimiento | Registro: rango 1900 → ayer | Nada | `DATE` | 2030-01-01 y 1800-01-01 → **200** (F1, F2); 2099-01-01 al editar → 200 (UP2). 2026-02-30 → 500 (F3) |
| Sexo | `select` M/F | Nada | `ENUM('M','F')` | "X" → 500 (S1). "m" → 200; se guarda "M" pero la respuesta dice "m" (S2) |
| Clave | Registro: mínimo 6, mayúscula, minúscula, número y especial | Nada | `VARCHAR(255) NOT NULL` | `"a"` → 200 (K1) |
| Teléfono | Registro: `type=tel`, sin patrón | Nada; en la actualización no se copia (H-032) | `VARCHAR(20)` | `"no-tengo"` → 200 (T1). Cambio vía PUT se pierde (UP1) |
| Estado / ubigeo del paciente | Registro fija 1/1; la edición admin usa `type=number` libre | Nada | FK | 999 → 500 FK (E1). 5 = Fallecido → 200 (E2). Texto `"abc"` → 500 "JSON parse error" (TY1) |
| Fecha de cita | `[min]=minDate` en UTC, sin validador de Angular (se puede escribir una fecha pasada) | Nada | `DATE` | 2020-01-06, hoy, 0001-01-01 y 9999-12-31 → **200**. 2026-13-01 → 500. Nula → 200 (C2–C6, C19) |
| Hora de cita | Botones de bloques de 20 min dentro de la disponibilidad (o 08–20 por defecto) | Nada | `TIME` (admite -838:59:59…838:59:59) | 03:00, 10:07, 25:00:00, -01:00:00, "13:07" y nula → **200** (C7–C10, C19, C23) |
| Día de la cita (fin de semana) | Horario por defecto 08–20 (H-022) | Nada | — | Sábado 2026-11-14 → 200 (C11) |
| Médico / paciente de la cita | `select`; `id_paciente` sale de localStorage | Nada | FK, admite NULL | Inexistentes → 500 FK (C12, C13). Ambos nulos → **200** (C14, cita huérfana 82) |
| `estado_cita` al crear | Fijo en 1 | Nada | FK, admite NULL | 4 (Atendida) → 200 (R1). Nulo → 200 (C16). 99 → 500 FK (C15) |
| Motivo | `required` (los espacios pasan), sin maxlength | Nada | `VARCHAR(255)` | `""` → 200 (C18). 5000 caracteres → 500 "Data too long" (C17). Solo espacios en pantalla → botón habilitado (UI) |
| Duplicidad de citas | Oculta las horas ocupadas, pero conserva la hora elegida (AUD-LOG-03) | Nada | Sin UNIQUE | Mismo médico, fecha y hora → 200 (C20, y por UI en `13-ui-hora-obsoleta.log`). Mismo paciente con 2 médicos a la misma hora → 200 (C21) |
| Cambio de estado (ruta del médico) | Solo "Confirmada" y "Cancelada" sobre pendientes | Valida que la cita sea del médico y que el nombre exista | FK | Todas las transiciones → 200. `atendida`/`PENDIENTE` → 200. `Aprobada` → 400. `{}` → 400. Médico ajeno → 404 (ST1–ST11) |
| `PUT /api/cita/{id}` | No se usa | Copia todo el cuerpo | FK | Estado 5 y cambio de médico → 200. Cuerpo parcial → deja nulos los demás campos. id inexistente → 200 vacío (ST12–ST16) |
| Médico (alta) | La pantalla de admin solo lista | Nada | `cmp`/`dni` UNIQUE, FK de especialidad | CMP duplicado → 500. Especialidad 999 → 500. Nombres `""`, DNI `"MEDXX"`, sin especialidad → 200 (M5–M7). PUT de id inexistente → 500 "No value present" (M8) |
| Especialidad | No hay pantalla de alta | Nada; `@Id` sin `@GeneratedValue` | `AUTO_INCREMENT`, `precio NOT NULL` | Sin id → 500. Nombre duplicado "Pediatría", precio -75 y nombre `""` → 200. id existente → sobrescribe. PUT ignora el precio (ES1–ES7) |
| Disponibilidad del médico | No hay pantalla | Nada | FK, admite NULL | "Funday", 18:00→08:00, "Miercoles" sin tilde, sin médico, inicio 10:07 → 200. Médico 9999 → 500 (DI1–DI5) |
| Administrador | No hay pantalla en rutas | Nada | `rol VARCHAR(20)` | `rol` "RECEPCION" → 200 y entra como administrador. Rol de más de 20 caracteres → 500 (U1–U5) |

## Hallazgos

### AUD-LOG-01 — El backend no valida ningún input: el único freno son las restricciones de la BD
- Severidad: Alta
- Relación con hallazgos existentes: Nuevo como hallazgo transversal. Da la causa común de H-012, H-022 (lado servidor), H-036 y H-037, y de AUD-LOG-02 a 18. Que la API acepte llamadas sin sesión es H-016.
- Evidencia:
  ```
  $ grep -rn -E "@Valid|@NotNull|@NotBlank|@Size|@Pattern|@Past|@Future|jakarta.validation|javax.validation" backend/src/main || echo "SIN anotaciones de validacion"
  SIN anotaciones de validacion
  ```
  `pom.xml` no incluye `spring-boot-starter-validation`. Los servicios guardan sin comprobar nada: `CitaService.crearCita` → `citaRepository.save(cita)`, `PacienteService.crearPaciente`, `MedicoService.crearMedico`, `UsuarioService.crear`, y `EspecialidadController` y `Disponibilidad_MedicoController` llaman a `save` directo.
  Aceptados con 200 (`01-dni.log`, `02-paciente-campos.log`):
  ```
  ## D2 DNI con letras → {"idPaciente":23,...,"dni":"AB12CD34",...} <<< HTTP 200
  ## D5 DNI vacio      → {"idPaciente":25,...,"dni":"",...} <<< HTTP 200
  ## F1 fecha nacimiento futura → {"idPaciente":31,...,"fecha_nacimiento":"2030-01-01",...} <<< HTTP 200
  ## K1 clave debil de 1 caracter → {"idPaciente":34,...,"clave":"a",...} <<< HTTP 200
  ```
- Impacto en el negocio: las reglas que el frontend sí aplica (DNI de 8 dígitos, clave fuerte, fecha de nacimiento válida) se saltan con cualquier cliente HTTP, y entran a la BD datos que luego rompen el login, los reportes y los horarios.
- Recomendación (con alternativas):
  - (a) Agregar `spring-boot-starter-validation`, anotar los modelos o DTOs de entrada (`@Pattern("\\d{8}")`, `@NotBlank`, `@Size(max=45)`, `@PastOrPresent`…) y poner `@Valid` en los controladores, con un `@ExceptionHandler(MethodArgumentNotValidException)` que responda 400.
  - (b) Validar a mano en una capa de servicio, por ejemplo una clase `ValidadorCita`.
  - (c) Agregar `CHECK` en la BD como segunda barrera (MySQL 8 los aplica).
  - Lo mejor es (a)+(c). Necesita un RFC porque cambia el comportamiento externo.
- Esfuerzo estimado: 2–3 días (6 entidades, DTOs de entrada y pruebas).
- Archivos involucrados: `backend/pom.xml`; `backend/src/main/java/com/centro_valdiviezo/backend/model/*.java`; `controller/*.java`; `services/*.java`; `exception/GlobalExceptionHandler.java`
- Apto para integrante: No (toca muchos archivos y cambia respuestas que el frontend interpreta)

### AUD-LOG-02 — Se aceptan citas en fechas y horas imposibles
- Severidad: Alta
- Relación con hallazgos existentes: H-012 (el backend guarda sin validar), H-022 (fin de semana) y H-037 (hora nula). Lo nuevo son los casos de fecha y hora que no estaban registrados.
- Evidencia (`06-cita.log`, `07-cita-bd.log`). Respuestas `POST /api/cita`:
  ```
  C2 fecha pasada 2020-01-06            → idCita 71 HTTP 200
  C3 hoy 2026-11-09 08:00 (a las 17:22) → idCita 72 HTTP 200
  C4 9999-12-31 / C5 0001-01-01         → idCita 73 / 74 HTTP 200
  C7 03:00 / C8 10:07 (medico 1)        → idCita 75 / 76 HTTP 200
  C9 25:00:00 / C10 -01:00:00           → idCita 77 / 78 HTTP 200
  C11 sábado 2026-11-14 (medico 1)      → idCita 79 HTTP 200
  C14 sin paciente ni médico            → {"idCita":82,"id_paciente":null,"id_medico":null,...} HTTP 200
  C19 sin fecha ni hora                 → {"idCita":86,...,"fecha_cita":null,"hora_cita":null,...} HTTP 200
  ```
  Lo que quedó en la BD:
  ```
  77	24	16	2026-11-16	25:00:00	AUD-LOG C9	1
  78	24	16	2026-11-16	-01:00:00	AUD-LOG C10	1
  82	NULL	NULL	2026-11-16	11:00:00	AUD-LOG C14	1
  86	24	16	NULL	NULL	AUD-LOG C19	1
  ```
  La columna `TIME` de MySQL admite -838:59:59…838:59:59, así que 25:00 y -01:00 no fallan en la BD. Las fechas inexistentes sí fallan, pero con 500 (C6 `2026-13-01`).
- Impacto en el negocio: aparecen citas en el pasado, de madrugada, fuera del horario del médico, desalineadas con los bloques de 20 minutos o sin dueño. La cita 82 no la ve ningún paciente ni ningún médico, pero cuenta en el total del reporte. Una cita sin hora en un día con horario rompe "Registrar Cita" (H-037).
- Recomendación (con alternativas):
  - (a) Validar en `CitaService.crearCita`: campos obligatorios; fecha mayor o igual a hoy (y si es hoy, hora mayor que ahora); hora dentro de una fila de `Disponibilidad_Medico` del día de la semana; hora alineada al bloque de 20 minutos; responder 400 con el motivo.
  - (b) Además, en la BD: `NOT NULL` en `id_paciente`, `id_medico`, `fecha_cita`, `hora_cita` y `estado_cita`, y `CHECK (hora_cita BETWEEN '00:00:00' AND '23:59:59')`.
  - Va junto con el RFC de H-012.
- Esfuerzo estimado: 1–2 días con pruebas unitarias.
- Archivos involucrados: `backend/.../services/CitaService.java`, `backend/.../model/Cita.java`, `database/BDPostaMedica.sql`
- Apto para integrante: No (regla de negocio central; necesita un RFC con H-012)

### AUD-LOG-03 — Doble reserva desde la pantalla sin necesidad de dos pestañas
- Severidad: Alta
- Relación con hallazgos existentes: H-012. H-012 describe la doble reserva con una pestaña abierta antes. Esta es otra causa en el frontend: la hora elegida queda guardada al cambiar fecha o médico.
- Evidencia: script de Playwright en el scratchpad (`ui-hora-obsoleta.cjs`; sesión de paciente 35 puesta en localStorage) contra `localhost:4200`. Salida real (`13-ui-hora-obsoleta.log`):
  ```
  Paso 1: fecha 2026-11-23, hora elegida 10:00. Activa:  10:00
  Paso 2: fecha cambiada a 2026-11-16. ¿10:00 en la lista? false | primeras horas: 08:00,08:20,08:40,09:00,09:20,09:40
  Paso 3: boton Confirmar habilitado: true
  DIALOGO: Cita registrada con éxito
  Paso 4: POST /api/cita cuerpo enviado: {"id_paciente":35,"id_medico":"16","fecha_cita":"2026-11-16","hora_cita":"10:00:00",...} | HTTP 200 | {"idCita":95,...}
  ```
  El 2026-11-16 a las 10:00 con el médico 16 ya había 2 citas (70 y 87). Esta fue la tercera, creada desde la pantalla y sin carreras.
  Causa en el código: `registrar-cita.component.ts`. `cargarHorarios()` (líneas 60-70) y `cargarMedicos()` (50-58) rehacen la lista sin limpiar `cita.hora_cita`, e `isValid()` (93-95) no comprueba que la hora esté en `horariosDisponibles`.
- Impacto en el negocio: un paciente reserva sin querer una hora que ya está tomada, o que está fuera del horario del médico nuevo, con solo cambiar la fecha o el médico después de elegir la hora.
- Recomendación (con alternativas):
  - (a) Poner `this.cita.hora_cita = ''` en `cargarHorarios()` y `cargarMedicos()`.
  - (b) Que `isValid()` exija `horariosDisponibles.includes(cita.hora_cita)`.
  - Hacer (a)+(b). No reemplaza la validación del backend (H-012).
- Esfuerzo estimado: 1–2 horas más una prueba unitaria.
- Archivos involucrados: `frontend/src/app/features/paciente/registrar-cita/registrar-cita.component.ts`
- Apto para integrante: Sí (1 archivo más su spec)

### AUD-LOG-04 — Regla de solapamiento incompleta
- Severidad: Media
- Relación con hallazgos existentes: H-012 (amplía la regla de duplicidad).
- Evidencia:
  ```
  C21 mismo paciente 24 misma fecha/hora que C1 con otro medico (19)
  → {"idCita":88,"id_paciente":24,"id_medico":19,"fecha_cita":"2026-11-16","hora_cita":"10:00:00",...} <<< HTTP 200
  ```
  Con la función real `calcularHorariosDisponibles` ejecutada en Node (`10-horarios.log`):
  ```
  H6 cita existente 09:07: {"porDefecto":false,"n":3,"primeros":["09:00","09:20","09:40"],...}
  ```
  La cita de 09:07 a 09:27 pisa los bloques de 09:00 y 09:20, y ambos se siguen ofreciendo, porque la comparación es por texto exacto (`substring(0,5) === hora`).
- Impacto en el negocio: un paciente queda en dos consultorios a la vez. Las citas desalineadas que acepta la API (AUD-LOG-02) no bloquean los bloques que pisan.
- Recomendación (con alternativas): definir la regla de negocio: un paciente no puede tener 2 citas activas que se crucen, y la comparación se hace por intervalos de 20 minutos, no por texto. Se implementa en el backend junto con H-012. Alternativa parcial: rechazar horas no alineadas (AUD-LOG-02), con lo que la comparación por texto alcanza.
- Esfuerzo estimado: 0,5–1 día.
- Archivos involucrados: `backend/.../services/CitaService.java`, `backend/.../repository/CitaRepository.java`, `frontend/.../registrar-cita/horarios-cita.ts`
- Apto para integrante: No (depende del RFC de H-012)

### AUD-LOG-05 — Los errores de validación responden 500 con el texto SQL
- Severidad: Media
- Relación con hallazgos existentes: Nuevo. Se relaciona con H-029: el frontend trata casi todo error como falta de conexión.
- Evidencia: `GlobalExceptionHandler` convierte toda `RuntimeException` en 500 con `ex.getMessage()`. Ejemplos reales:
  ```
  D7 DNI duplicado → {"message":"could not execute statement [Duplicate entry '71000001' for key 'paciente.dni'] [insert into Paciente (apellidos,clave,dni,...","status":"error"} HTTP 500
  N3 nombres de 46 → {"message":"could not execute statement [Data truncation: Data too long for column 'nombres' at row 1] ..."} HTTP 500
  TY1 id_ubigeo "abc" → {"message":"JSON parse error: Cannot deserialize value of type `java.lang.Integer` from String \"abc\"...","status":"error"} HTTP 500
  TY2 JSON mal formado → {"message":"JSON parse error: Unexpected end-of-input within/between Object entries","status":"error"} HTTP 500
  UP3 PUT /api/paciente/actualizar/999999 → {"message":"No value present","status":"error"} HTTP 500
  ```
  `registro.component.ts:118` decide el mensaje "El DNI ya está registrado" con `error.status === 500 && error.error?.message?.includes('Duplicate entry')`, es decir, depende del texto interno de MySQL.
- Impacto en el negocio: un error del usuario (dato inválido, 400) no se distingue de una falla del servidor (500). El frontend no puede dar mensajes útiles, y si alguien corrige la fuga del texto SQL deja de funcionar el aviso de DNI duplicado. Además, el texto expone nombres de tablas, columnas y consultas; eso es un tema de seguridad que se deja al auditor de seguridad.
- Recomendación (con alternativas):
  - (a) Agregar handlers específicos: `DataIntegrityViolationException` → 409; `HttpMessageNotReadableException` y validación → 400; `NoSuchElementException` → 404. Responder con mensajes propios, sin el texto SQL.
  - (b) Comprobar antes de guardar (`existsByDni`) y responder 409.
  - En los dos casos hay que ajustar `registro.component.ts` para que mire el código 409, en un mismo RFC.
- Esfuerzo estimado: 1 día.
- Archivos involucrados: `backend/.../exception/GlobalExceptionHandler.java`, `backend/.../services/PacienteService.java`, `frontend/src/app/features/auth/registro/registro.component.ts`
- Apto para integrante: No (cambia el contrato que el frontend interpreta)

### AUD-LOG-06 — Los endpoints "crear" sobrescriben un registro existente si el cuerpo trae su id
- Severidad: Alta
- Relación con hallazgos existentes: Nuevo. Lo agrava H-016: cualquiera puede llamar a la API sin sesión.
- Evidencia: probado solo sobre registros propios (`03-paciente-update-login.log`, `05b-especialidad.log`).
  ```
  ## OV1 POST /crear con idPaciente=22 existente (registro propio AUD-LOG D1)
  {"idPaciente":22,"nombres":"AUD-LOG D1 SOBRESCRITO","apellidos":"Otro","dni":"71000099","clave":"Otra#1",...,"telefono":null,...} HTTP 200
  idPaciente	nombres	apellidos	dni	sexo
  22	AUD-LOG D1 SOBRESCRITO	Otro	71000099	F
  ## ES3b POST otra vez id 9001 con otro nombre/precio (sobrescritura)
  {"id_especialidad":9001,"nombre_especialidad":"AUD-LOG ES3b","descripcion":"AUD-LOG ES3b","precio":-75.0} HTTP 200
  ```
  El paciente 22 tenía DNI 71000001 y teléfono 999000000; después del "crear" tiene otro DNI, otra clave y el teléfono en nulo. Causa: `save()` de Spring Data hace `merge` cuando la entidad trae id. En `Cita`, `Medico`, `UsuarioModel` y `Disponibilidad_Medico` el mecanismo es el mismo según el código (`save(item)` con el `@RequestBody` tal cual), pero en esos no lo verifiqué.
- Impacto en el negocio: con un `POST /api/paciente/crear` se puede cambiar el DNI y la clave de cualquier paciente (y con eso tomar su cuenta) o borrar sus datos. Un "alta" que modifica es una regla rota en sí misma.
- Recomendación (con alternativas):
  - (a) En cada `crear`, poner el id en `null` antes de `save`, o rechazar con 400 si viene id.
  - (b) Usar DTOs de entrada sin id.
  - (a) es mínimo y no rompe el frontend, que no envía id al crear.
- Esfuerzo estimado: 2–4 horas por los 6 recursos, con pruebas.
- Archivos involucrados: `backend/.../services/PacienteService.java`, `MedicoService.java`, `UsuarioService.java`, `CitaService.java`; `controller/EspecialidadController.java`, `controller/Disponibilidad_MedicoController.java`
- Apto para integrante: Sí, si se reparte por recurso (1 a 3 archivos cada parte, sin riesgo para el frontend)

### AUD-LOG-07 — El DNI es único solo dentro de cada tabla; el login devuelve el primer rol que coincide
- Severidad: Alta
- Relación con hallazgos existentes: Nuevo. H-028 trató el rol equivocado en el frontend y H-019/RFC-007 el orden paciente → médico → administrador; ninguno trata un mismo DNI en dos tablas.
- Evidencia (`04-medico.log`, `12-admin.log`):
  ```
  ## M1 medico propio → {"id_medico":16,...,"dni":"72000001",...} HTTP 200
  ## M2 login como medico → {...,"tipo":"medico","success":true,"id":16,...} HTTP 200
  ## M3 paciente con el mismo DNI y clave → {"idPaciente":39,...,"dni":"72000001",...} HTTP 200
  ## M4 login del medico despues → {"apellidos":"Gemelo","tipo":"paciente","success":true,"id":39,...} HTTP 200
  ## M9 DNI del administrador como medico → {"id_medico":20,...,"dni":"87654321",...} HTTP 200
  ## U6 login del admin U2 (DNI de paciente 24, clave distinta) → {"tipo":"administrador",...,"id":3,...} HTTP 200
  ```
  Después de M4, el login de médico rechaza al médico 16 ("Este usuario no es un médico", RFC-002), porque el backend responde con el paciente. La BD declara `dni UNIQUE` en `Paciente`, `Medico` y `Administrador` por separado.
- Impacto en el negocio: basta registrarse como paciente (pantalla `/registro`, pública) con el DNI de un médico y su misma clave para dejarlo sin acceso. Una misma persona real queda con identidades distintas según la tabla.
- Recomendación (con alternativas):
  - (a) Al crear en cualquiera de las 3 tablas, rechazar un DNI que ya exista en otra.
  - (b) Que `/login` reciba el rol esperado y busque solo en esa tabla, con lo que el DNI repetido deja de bloquear.
  - (c) Una tabla única de usuarios con un rol (rediseño).
  - (b) quita el bloqueo; (a) evita el dato inconsistente. Se recomiendan ambas en un RFC.
- Esfuerzo estimado: (a) 0,5 día; (b) 1 día, porque toca `AuthController`, `AutenticadorRol` y `login-comun.ts`.
- Archivos involucrados: `backend/.../autenticacion/*.java`, `controller/AuthController.java`, `services/PacienteService.java`, `MedicoService.java`, `UsuarioService.java`, `frontend/src/app/features/auth/login-comun.ts`
- Apto para integrante: No

### AUD-LOG-08 — Estados de cita: sin máquina de estados, y el nombre se compara sin distinguir mayúsculas ni tildes
- Severidad: Media
- Relación con hallazgos existentes: H-031, que la API confirma. Lo nuevo es lo que sigue.
- Evidencia (`08-estados.log`, cita propia 70, médico 16):
  ```
  ST1 Pendiente -> Atendida  → "estado":"Atendida" HTTP 200
  ST2 Atendida -> Pendiente  → "estado":"Pendiente" HTTP 200
  ST4 Cancelada -> Confirmada → "estado":"Confirmada" HTTP 200
  ST5 {"estado":"atendida"}  → "estado":"Atendida" HTTP 200
  ST6 {"estado":"PENDIENTE"} → "estado":"Pendiente" HTTP 200
  ST10 cita del 2020-01-06 -> Confirmada → HTTP 200
  ST11 cita del 9999-12-31 -> Atendida → HTTP 200
  ST7 "Aprobada" → {"error":"Estado de cita inexistente: Aprobada"} HTTP 400
  ST9 medico 1 sobre cita del 16 → HTTP 404
  ```
  Además, `POST /api/cita` sin `estado_cita` guarda `NULL` (C16, cita 84). Esa cita no sale en las listas del médico (filtran por nombre de estado con JOIN) ni en `/porEstado`, pero sí en el total (ver AUD-LOG-10).
  Lo nuevo: (1) la comparación del nombre usa la intercalación `utf8mb4_0900_ai_ci`, que no distingue mayúsculas ni tildes; (2) no se mira la fecha: se "atiende" una cita del año 9999 y se confirma una del 2020; (3) se acepta estado nulo al crear.
- Impacto en el negocio: se marcan como atendidas citas futuras, que suman ingresos (AUD-LOG-10), y quedan citas sin estado, invisibles para el médico.
- Recomendación (con alternativas): en el RFC de H-031, definir las transiciones permitidas (Pendiente → Confirmada/Cancelada/Reprogramada; Confirmada → Atendida/Cancelada…), agregar la condición de fecha (Atendida solo si fecha y hora ya pasaron), y hacer `estado_cita` `NOT NULL DEFAULT 1`. Para el nombre: (a) comparar en Java con `equals` exacto; (b) recibir el id del estado en lugar del nombre.
- Esfuerzo estimado: 1 día (junto con H-031).
- Archivos involucrados: `backend/.../services/CitaService.java`, `repository/Estado_CitaRepository.java`, `database/BDPostaMedica.sql`
- Apto para integrante: No

### AUD-LOG-09 — `PUT /api/cita/{id}` se salta la ruta de estados y borra los campos no enviados; respuestas inconsistentes para id inexistentes
- Severidad: Alta
- Relación con hallazgos existentes: Nuevo. Relacionado con H-031: este camino evita incluso la poca validación de la ruta del médico.
- Evidencia (`08-estados.log`):
  ```
  ST12 PUT /api/cita/72 {"id_medico":19,...,"estado_cita":5} → {"idCita":72,...,"id_medico":19,...,"estado_cita":5} HTTP 200
  ST16 PUT /api/cita/72 {"motivo":"AUD-LOG parcial"} → {"idCita":72,"id_paciente":null,"id_medico":null,"fecha_cita":null,"hora_cita":null,"motivo":"AUD-LOG parcial","estado_cita":null} HTTP 200
  ST13 PUT /api/cita/999999 → (cuerpo vacío) HTTP 200
  ST14 GET /api/cita/999999 → (cuerpo vacío) HTTP 200
  ST15 DELETE /api/cita/999999 → HTTP 200
  ES7 GET /api/especialidad/123456789 → (cuerpo vacío) HTTP 200
  UP3 PUT /api/paciente/actualizar/999999 → {"message":"No value present"} HTTP 500
  M8 PUT /api/medico/actualizar/999999 → {"message":"No value present"} HTTP 500
  ```
  `CitaService.actualizarCita` (líneas 46-57) copia los 6 campos del cuerpo, también los nulos. El frontend actual no usa este endpoint (`grep` de `.put(` → solo `medico.service.ts`, `service-medico.ts` y `service-paciente.ts`).
- Impacto en el negocio: cambiar el médico o el estado de cualquier cita sin pasar por ninguna regla. Un cuerpo incompleto deja la cita huérfana sin aviso. Un cliente no puede distinguir "no existe" de "se hizo", porque recibe 200 vacío en un recurso y 500 en otro.
- Recomendación (con alternativas):
  - (a) Quitar el PUT genérico de citas, ya que nadie lo usa, o limitarlo a fecha, hora y motivo con validación.
  - (b) Si se mantiene, aplicar la misma validación de AUD-LOG-02 y la máquina de estados.
  - Unificar 404 para id inexistente en GET, PUT y DELETE de todos los recursos.
- Esfuerzo estimado: 0,5–1 día.
- Archivos involucrados: `backend/.../controller/CitaController.java`, `services/CitaService.java`, `controller/EspecialidadController.java`, `controller/Disponibilidad_MedicoController.java`, `services/PacienteService.java`, `services/MedicoService.java`
- Apto para integrante: No (quitar un endpoint cambia el comportamiento externo; necesita un RFC)

### AUD-LOG-10 — Los ingresos y conteos del reporte se pueden manipular y no cuadran
- Severidad: Alta
- Relación con hallazgos existentes: H-024 (precio actual en lugar del cobrado) y H-023 (números fijos 3 y 4). Lo nuevo es lo que sigue.
- Evidencia (`09-reportes.log`, `09b-reportes.log`, `16-delete-atendida.log`):
  ```
  R0 dashboard antes   {"totalCitas":85,"citasAtendidas":20,"citasCanceladas":2,"totalIngresos":1295.0}
  R1 POST /api/cita {...,"estado_cita":4} (médico 16, S/50) → idCita 93 HTTP 200
  R3 POST /api/cita {...,"estado_cita":4} (médico 21, especialidad 9001 precio -75) → idCita 94 HTTP 200
  R4 aporte AUD-LOG: 73 9999-12-31 50.00 | 93 2026-12-01 50.00 | 94 2026-12-02 -75.00
  R5 API {"totalCitas":87,"citasAtendidas":22,"citasCanceladas":2,"totalIngresos":1270.0}
     SQL total 87 | atendidas 22 | canceladas 2 | sin_estado 3 | ingresos 1270.00
  R6 /porEstado: Pendiente 56 + Confirmada 4 + Cancelada 2 + Atendida 22 = 84 (≠ totalCitas 87)
  R7 /ingresosMensuales: ...,{"mesAno":"2026-12","total":-25.0},{"mesAno":"2027-03","total":50.0},{"mesAno":"2099-12","total":60.0},{"mesAno":"9999-12","total":50.0}
  ```
  Entre R0 y R5 la variación fue -25 (+50 de la cita 93 y -75 de la 94), y coincide con la consulta SQL hecha en el mismo instante. El "Resumen" (`/api/reportes/resumen`) también pone primero la cita del 9999-12-31.
  Además, **no hay forma en la pantalla de llegar a "Atendida"**: `grep -rn -i "atendid"` en `frontend/src/app` solo encuentra el reporte y la etiqueta de `mis-citas`. El médico solo puede "Confirmada" o "Cancelada" (`medico-citas-pendientes.component.ts:50`). Por eso, con el uso normal, los ingresos solo crecen con los datos semilla o con llamadas directas a la API.
- Impacto en el negocio: el reporte financiero se infla, o se vuelve negativo, con citas creadas directamente como Atendidas, con fechas futuras o con precios negativos. El total de citas no cuadra con el desglose por estado. Los ingresos reales de la operación nunca se registran.
- Recomendación (con alternativas):
  - Ingresos solo de citas Atendidas con fecha ≤ hoy.
  - Prohibir crear citas con estado distinto de Pendiente (AUD-LOG-08).
  - `precio >= 0` (AUD-LOG-15).
  - `estado_cita NOT NULL`, o contar "sin estado" aparte.
  - Agregar la acción "Marcar atendida" al módulo médico (perfectivo).
  - Para H-024: (a) guardar `precio_cobrado` en `Cita` al atenderla; (b) una tabla histórica de precios.
- Esfuerzo estimado: 1–2 días (sin la acción "Marcar atendida").
- Archivos involucrados: `backend/.../repository/CitaRepository.java`, `controller/ReporteController.java`, `services/CitaService.java`, `database/BDPostaMedica.sql`, `frontend/src/app/features/medico/medico-citas-aprobadas/*`
- Apto para integrante: No

### AUD-LOG-11 — El paciente borra físicamente cualquier cita, incluso Atendida, y así bajan los ingresos
- Severidad: Media
- Relación con hallazgos existentes: Nuevo.
- Evidencia: `mis-citas.component.html:23` muestra "Eliminar cita" en todas las tarjetas, sin condición de estado, y `mis-citas.component.ts:55` hace `DELETE /api/cita/{id}`. Prueba sobre la cita propia 93 (Atendida, S/50):
  ```
  DEL1 dashboard antes   {"totalCitas":88,"citasAtendidas":22,"citasCanceladas":2,"totalIngresos":1270.0}
  >>> DELETE /api/cita/93 → HTTP 200
  DEL2 dashboard despues {"totalCitas":87,"citasAtendidas":21,"citasCanceladas":2,"totalIngresos":1220.0}
  existe_93 = 0
  ```
  Además, `mis-citas.component.ts:71-78` muestra "Desconocido" para el estado 5 (Reprogramada), que es una variante de H-023.
- Impacto en el negocio: se pierde la historia de citas atendidas y los ingresos ya registrados. El paciente no "cancela" (estado 3): borra, así que el médico no se entera.
- Recomendación (con alternativas):
  - (a) Frontend: mostrar "Cancelar cita" solo en Pendiente o Confirmada, cambiando el estado en lugar de borrar.
  - (b) Backend: un endpoint de cancelación del paciente y quitar o restringir el `DELETE` (borrado lógico).
  - (a) es rápido pero no cierra la API; (b) es la corrección de fondo.
- Esfuerzo estimado: (a) 2–3 horas; (b) 1 día.
- Archivos involucrados: `frontend/src/app/features/paciente/mis-citas/mis-citas.component.ts` y `.html`; `backend/.../controller/CitaController.java`, `services/CitaService.java`
- Apto para integrante: Sí solo (a) (2 archivos del frontend); (b) No

### AUD-LOG-12 — H-032 sí tiene un camino en pantalla; la edición tampoco valida, y otras actualizaciones no copian campos
- Severidad: Media
- Relación con hallazgos existentes: H-032. Corrige su evidencia: H-032 dice "`PUT /api/paciente/{id}` … Un `grep` no encontró llamadas a este endpoint desde el frontend actual". La ruta real es `PUT /api/paciente/actualizar/{id}`, y la llama `ServicePaciente.actualizarPaciente` (`core/services/service-paciente.ts:27-28`) desde `features/admin/pacientes/admin-pacientes.component.ts:41-57`. Su formulario tiene el campo "Teléfono" (`admin-pacientes.component.html:37-38`).
- Evidencia (paciente propio 22):
  ```
  UP1 PUT /api/paciente/actualizar/22 {...,"telefono":"111222333",...} → {...,"telefono":null,...} HTTP 200
  UP2 PUT /api/paciente/actualizar/22 {"nombres":"","dni":"zz","fecha_nacimiento":"2099-01-01",...} → {"nombres":"","dni":"zz","fecha_nacimiento":"2099-01-01",...} HTTP 200
  ES4 PUT /api/especialidad/9001 {...,"precio":100} → {...,"precio":-50.0} HTTP 200
  ```
  - El formulario de edición del admin usa `(ngSubmit)="guardarCambios()"`, y `guardarCambios()` no comprueba la validez del formulario, así que `required` no impide enviar. DNI, estado y ubigeo son campos libres (`type="text"` y `type="number"`).
  - `MedicoService.actualizarMedico` (40-48) no copia `dni` (puede ser intencional; no verificado en pantalla).
  - `EspecialidadController.actualizar` (35-44) no copia `precio`: el precio solo cambia con el "crear" que sobrescribe (AUD-LOG-06).
- Impacto en el negocio: el admin cree que cambió el teléfono (sale "Paciente actualizado correctamente") y el cambio se pierde. Desde la misma pantalla se pueden guardar un DNI inválido, una fecha de nacimiento futura o un nombre vacío. El precio de una especialidad no se puede actualizar por la vía normal.
- Recomendación (con alternativas):
  - Copiar `telefono` en `actualizarPaciente` (RFC de H-032).
  - En el componente, validar con las mismas funciones del registro (DNI de 8 dígitos, rango de fecha) antes de enviar.
  - Decidir si `precio` debe poder cambiarse por PUT. Si sí, tener en cuenta H-024 antes de habilitarlo.
- Esfuerzo estimado: 0,5 día.
- Archivos involucrados: `backend/.../services/PacienteService.java`, `frontend/src/app/features/admin/pacientes/admin-pacientes.component.ts` y `.html`, `backend/.../controller/EspecialidadController.java`
- Apto para integrante: Sí (H-032 y la validación del componente: 1–3 archivos)

### AUD-LOG-13 — `Disponibilidad_Medico` acepta días inexistentes, rangos invertidos y horarios sin médico
- Severidad: Media
- Relación con hallazgos existentes: H-022. El caso "horario todo ocupado → horario por defecto" ya está caracterizado en U77. Lo nuevo son otras causas que activan el horario por defecto o generan bloques desalineados.
- Evidencia (`11-disponibilidad-admin.log`):
  ```
  DI1 {"id_medico":16,"dia_semana":"Funday","hora_inicio":"18:00:00","hora_fin":"08:00:00"} → idDisponibilidad_Medico 76 HTTP 200
  DI2 {"dia_semana":"Miercoles",...} (sin tilde) → 77 HTTP 200
  DI4 sin id_medico → {"idDisponibilidad_Medico":79,"id_medico":null,...} HTTP 200
  DI5 hora_inicio 10:07:00 → 80 HTTP 200
  ```
  Efecto en la regla de pantalla (función real ejecutada en Node, `10-horarios.log`):
  ```
  H3 horario invertido 18-08: {"porDefecto":true,"n":36,"primeros":["08:00",...]}
  H4 "Miercoles" sin tilde, 09-10: {"porDefecto":true,"n":36,...}
  H2 horario 09-10 todo ocupado: {"porDefecto":true,"n":33,"primeros":["08:00","08:20","08:40","10:00","10:20","10:40"],...}
  H7 dos reglas Lunes (09-10 y 15-16): {"porDefecto":false,"n":3,"primeros":["09:00","09:20","09:40"],...}  ← la segunda regla se ignora
  ```
- Impacto en el negocio: un error de tipeo en un horario ("Miercoles") o un rango invertido hace que se ofrezca todo el día de 08:00 a 20:00 para ese médico. Un horario partido (mañana y tarde) pierde la tarde.
- Recomendación (con alternativas):
  - Validar en el backend: `dia_semana` dentro de la lista exacta de `DIAS_SEMANA` (o un `ENUM` en la BD), `hora_inicio < hora_fin`, `id_medico` obligatorio, horas alineadas a 20 minutos.
  - En la pantalla: usar todas las reglas del día (`filter` en vez de `find`).
  - La corrección de H-022 (quitar el horario por defecto) elimina la consecuencia más grave.
- Esfuerzo estimado: 0,5–1 día.
- Archivos involucrados: `backend/.../controller/Disponibilidad_MedicoController.java`, `database/BDPostaMedica.sql`, `frontend/.../registrar-cita/horarios-cita.ts`
- Apto para integrante: No (la parte de la pantalla depende de la decisión sobre H-022)

### AUD-LOG-14 — Registrar Cita (frontend): fecha mínima en UTC, fecha pasada escrita a mano, horas pasadas de hoy, motivo vacío o largo
- Severidad: Media
- Relación con hallazgos existentes: Nuevo (es la parte del frontend de AUD-LOG-02).
- Evidencia:
  - `registrar-cita.component.ts:18`: `minDate = new Date().toISOString().split('T')[0]` usa la fecha UTC. En Node (`10-horarios.log`): `H8 a las 19:30 hora de Lima, toISOString().split(T)[0] = 2026-11-10 | dia local = Lunes`. De 19:00 a 23:59 en Lima no se puede elegir el día de hoy.
  - Playwright (`14-ui-fecha-pasada.log`):
    ```
    min del input fecha: 2026-11-09
    fecha 2020-01-06: valor en input=2020-01-06 | validity.rangeUnderflow=true | horas ofrecidas=36 | primeras=08:00,08:20,08:40,09:00
    fecha 2026-11-09: valor en input=2026-11-09 | validity.rangeUnderflow=false | horas ofrecidas=36 | primeras=08:00,08:20,08:40,09:00
    Hoy 08:00 (ya pasó) con motivo de 3 espacios -> boton Confirmar habilitado: true | hora local: 17:26:11
    ```
  - `isValid()` (93-95) solo comprueba que los campos sean "truthy". `min` es un atributo HTML: en formularios basados en plantilla, Angular no lo valida en `input[type=date]`, e `isValid()` no lo consulta.
  - El `textarea` no tiene `maxlength`, y la API rechaza más de 255 caracteres con 500 (C17), que la pantalla muestra como "Error al registrar cita".
- Impacto en el negocio: se reservan citas en el pasado o en horas que ya pasaron. Por la noche no se puede reservar para el mismo día. Un motivo largo falla sin explicación.
- Recomendación (con alternativas):
  - `minDate` con la fecha local (año, mes y día de `new Date()`).
  - En `isValid()`: `fecha >= minDate`, `motivo.trim()` no vacío y largo ≤ 255.
  - En `horarios-cita.ts`, si la fecha es hoy, descartar bloques anteriores a la hora actual (función pura con "ahora" como parámetro, fácil de probar).
  - Nada de esto reemplaza AUD-LOG-02.
- Esfuerzo estimado: 0,5 día con pruebas unitarias.
- Archivos involucrados: `frontend/src/app/features/paciente/registrar-cita/registrar-cita.component.ts`, `.html`, `horarios-cita.ts`
- Apto para integrante: Sí (3 archivos del mismo componente)

### AUD-LOG-15 — Especialidad: crear sin id da 500, nombres duplicados o vacíos, precios negativos
- Severidad: Media
- Relación con hallazgos existentes: Nuevo. Relacionado con H-024 (precio) y H-039 (el controlador usa el repositorio directamente).
- Evidencia (`05-especialidad.log`, `05b-especialidad.log`):
  ```
  ES1 sin id → {"message":"Identifier of entity 'com.centro_valdiviezo.backend.model.Especialidad' must be manually assigned before calling 'persist()'"} HTTP 500
  ES2b id 9004 "Pediatr\u00eda" (duplicado) → {"id_especialidad":9004,"nombre_especialidad":"Pediatría",...} HTTP 200
  ES3 precio -50 → HTTP 200 ; ES6 nombre "" → HTTP 200
  ES5 precio null → 500 "Column 'precio' cannot be null"
  ```
  La BD declara `id_especialidad INT AUTO_INCREMENT`, pero `Especialidad.java` tiene `@Id` sin `@GeneratedValue`. "Pediatría" queda dos veces en el selector de "Registrar Cita".
- Impacto en el negocio: no se puede dar de alta una especialidad sin inventar el id; si el id ya existe, se sobrescribe (AUD-LOG-06). Duplicar nombres confunde al paciente al elegir. Un precio negativo vuelve negativos los ingresos (AUD-LOG-10).
- Recomendación (con alternativas): agregar `@GeneratedValue(strategy = IDENTITY)`; `nombre_especialidad` `UNIQUE` y no vacío; `CHECK (precio >= 0)` y validación en el backend.
- Esfuerzo estimado: 2–4 horas.
- Archivos involucrados: `backend/.../model/Especialidad.java`, `controller/EspecialidadController.java`, `database/BDPostaMedica.sql`
- Apto para integrante: No (cambiar la generación del id afecta los datos semilla y necesita revisar el SQL; riesgo bajo pero no nulo)

### AUD-LOG-16 — El estado del paciente no se usa: un paciente "Fallecido" se da de alta, inicia sesión y recibe citas
- Severidad: Media
- Relación con hallazgos existentes: Nuevo.
- Evidencia (`02-paciente-campos.log`, `03-paciente-update-login.log`, `06-cita.log`):
  ```
  E2 alta con id_estado_paciente 5 (Fallecido) → idPaciente 37 HTTP 200
  LG1 login 71000062 → {"tipo":"paciente","success":true,"id":37,...} HTTP 200
  C24 cita a paciente 37 → idCita 90 HTTP 200
  ```
  `AutenticadorPaciente.autenticar` solo compara la clave. Ningún servicio consulta `id_estado_paciente`.
- Impacto en el negocio: el estado del paciente (Activo, Inactivo, En tratamiento, Alta médica, Fallecido) es solo decorativo. Se agendan consultas a pacientes fallecidos y pueden entrar cuentas que deberían estar inactivas.
- Recomendación (con alternativas): que el negocio defina qué estados pueden iniciar sesión y reservar (como mínimo, bloquear "Fallecido"). Alta siempre como Activo (1) en el backend. Aplicar la regla en `AutenticadorPaciente` y en `CitaService.crearCita`.
- Esfuerzo estimado: 0,5 día.
- Archivos involucrados: `backend/.../autenticacion/AutenticadorPaciente.java`, `services/CitaService.java`, `services/PacienteService.java`
- Apto para integrante: No (necesita que el usuario decida la regla de negocio)

### AUD-LOG-17 — El campo `rol` del administrador es texto libre sin efecto
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo. Se relaciona con H-016 y lo atiende el auditor de seguridad.
- Evidencia (`11-disponibilidad-admin.log`, `12-admin.log`):
  ```
  U4 POST /usuarios/nuevo {"rol":"RECEPCION",...} → {"id":4,...,"rol":"RECEPCION",...} HTTP 200
  U5 login 73000004 → {"tipo":"administrador","success":true,"id":4,"rol":"RECEPCION",...} HTTP 200
  U1 rol de 21 caracteres → 500 "Data too long for column 'rol'"
  ```
  `AutenticadorAdministrador` devuelve `tipo: "administrador"` para cualquier fila de `Administrador`, sea cual sea su `rol`.
- Impacto en el negocio: el modelo sugiere roles (recepción, etc.) que no existen en la práctica. Cualquier alta en `/usuarios/nuevo` (sin autenticación, H-016) da acceso total de administrador.
- Recomendación (con alternativas): (a) restringir `rol` a una lista (`ENUM`) y comprobarlo en el login; (b) quitar la columna si no se va a usar. Proteger `/usuarios/nuevo` va en el RFC de H-016.
- Esfuerzo estimado: 2–4 horas.
- Archivos involucrados: `backend/.../autenticacion/AutenticadorAdministrador.java`, `model/UsuarioModel.java`, `database/BDPostaMedica.sql`
- Apto para integrante: No (depende de H-016)

### AUD-LOG-18 — La API devuelve lo que se envió, no lo que quedó guardado
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo.
- Evidencia:
  ```
  S2 POST sexo "m" → respuesta "sexo":"m" ; BD: 33 AUD-LOG S2 M es_minuscula 0
  C23 POST hora "13:07" → respuesta "hora_cita":"13:07" ; BD 13:07:00
  C10 POST hora "-01:00:00" → BD -01:00:00 ; GET /api/cita/78 → "hora_cita":"-1:00:00"
  ```
  Los `crear` devuelven el objeto que entró, y los campos de fecha y hora son `String` en las entidades.
- Impacto en el negocio: el cliente muestra datos que no son los guardados. Con `String` en fecha y hora, cualquier formato llega a la BD, que lo convierte o lo rechaza con 500.
- Recomendación (con alternativas): (a) volver a leer la entidad después de `save`; (b) usar `LocalDate` y `LocalTime` en las entidades, que además valida el formato al deserializar (con 400, si se corrige AUD-LOG-05).
- Esfuerzo estimado: (a) 1–2 horas; (b) 1 día, porque afecta las consultas JPQL que comparan `fecha_cita` como texto.
- Archivos involucrados: `backend/.../services/PacienteService.java`, `services/CitaService.java` (opción a)
- Apto para integrante: Sí, la opción (a) (1–2 archivos)

## Revisado sin hallazgos
- **Las restricciones de la BD frenan lo que deben:** UNIQUE de `dni` dentro de cada tabla (D7, UP4), UNIQUE de `cmp` (M5), las FK de médico, paciente, estado de cita, estado de paciente, especialidad y médico de la disponibilidad (C12, C13, C15, E1, M6, DI3), el ENUM de `sexo` (S1), los `NOT NULL` de `dni`, `precio` y `nombres` (D6, ES5), las longitudes (D4, N3, C17, U1) y las fechas inexistentes (F3, C6). Siempre responden con 500 (ver AUD-LOG-05), pero el dato no entra.
- **Ruta de estados del médico, en lo que sí controla:** nombre inexistente → 400 (ST7), cuerpo sin estado → 400 (ST8), cita de otro médico → 404 (ST9). El frontend solo envía "Confirmada" o "Cancelada".
- **Validación del login en el frontend** (`login-comun.ts`): DNI de 8 dígitos y clave no vacía, igual en los 3 roles. El backend responde 401 con credenciales inválidas (U3).
- **Validación del registro de paciente en el frontend** (`registro.component.ts`): DNI de 8 dígitos, clave fuerte, fecha de nacimiento entre 1900-01-01 y ayer, sexo obligatorio. Es correcta en lo que cubre (le faltan el tope de largo y los nombres con solo espacios; ver la matriz).
- **Cálculo de bloques con un horario válido:** solo bloques completos de 20 minutos y descarte de los ocupados (U74, U75 en verde). La consulta `sumTotalIngresos` coincide con el SQL equivalente en el mismo instante (R5: 1270.0 = 1270.00).
- **Pruebas unitarias del frontend**, con el comando de `docs/PRUEBAS.md` ("Comandos exactos", caracterización + unitarias), 17:26:24–17:26:36: `Executed 49 of 49 SUCCESS` / `TOTAL: 49 SUCCESS` (`15-ng-test.log`). Confirman que el comportamiento actual que caracterizan U46 (H-031), U52 (H-032), U70 (H-036), U76/U77 (H-022) y U78 (H-037) sigue igual. No las modifiqué.

## Datos creados en la BD
Todos con el prefijo `AUD-LOG` en `nombres`, `apellidos`, `motivo` o `descripcion` (salvo los indicados). La BD se recarga al final. Listado real (`17-datos-creados.log`, 17:27:22):
- **Paciente:** 22, 23, 24, 25, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 39.
  - El 22 lo sobrescribí yo mismo (OV1) y quedó con `nombres` vacío y `apellidos` "AUD-LOG UP2".
  - El 29 y el 30 tienen el prefijo en `apellidos`.
  - El 27 usa el DNI del médico 15 (10000015, clave distinta).
  - El 39 usa el DNI y la clave de mi médico 16.
- **Médico:** 16, 19, 20, 21. El 19 tiene `nombres` vacío y el prefijo en `apellidos`. El 20 usa el DNI del administrador 87654321 con clave distinta; comprobé que el login de admin sigue respondiendo `"tipo":"administrador"` (LGA).
- **Administrador:** 3 (DNI del paciente 24) y 4 (rol "RECEPCION").
- **Especialidad:** 9001 (precio -75), 9003 (nombre vacío), 9004 (nombre "Pediatría" duplicado).
- **Disponibilidad_Medico:** 76, 77 y 80 (médico 16), y 79 (sin médico).
- **Cita:** 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 82, 84, 85, 86, 87, 88, 89, 90, 94, 95.
  - Las citas 75, 76 y 79 son del **médico 1**: los otros auditores las verán en sus listados de ese médico.
  - La 85 tiene `motivo` vacío.
  - La 82 no tiene paciente ni médico.
  - La 72 quedó con todos sus campos en nulo salvo `motivo` (ST16).
  - La 95 la creé desde la pantalla con Playwright.
  - La 93 la creé y la borré (DEL1–DEL2).
- Los alta que fallaron consumieron valores de `AUTO_INCREMENT`, por eso hay saltos en los ids.
- No modifiqué registros que existían antes de la auditoría.

## Limitaciones
- **Pruebas del backend no ejecutadas:** por instrucción no corrí `./mvnw test` ni recompilé. Las conclusiones del backend salen de llamadas a la API y de leer el código.
- **Totales con datos de otros auditores:** por los otros auditores en paralelo, los totales globales de `/api/reportes/*` incluyen registros ajenos (AUD-NEG y otros). Por eso comparé la API con el SQL en el mismo instante y medí variaciones sobre mis propias citas. Las variaciones (-25 y -50) se pueden atribuir a mis registros, pero no puedo descartar del todo que otro auditor haya escrito en esos mismos segundos.
- **Sobrescritura por "crear" (AUD-LOG-06):** verificada solo en `Paciente` y `Especialidad`, sobre registros propios. En `Cita`, `Medico`, `Administrador` y `Disponibilidad_Medico` se deduce del código (mismo `save(@RequestBody)`): **no verificado**.
- **Pruebas de pantalla (AUD-LOG-03 y 14):** se hicieron con un script de Playwright en el scratchpad que pone la sesión en localStorage (no usé el formulario de login) y con Chromium headless. No probé otros navegadores ni la entrada manual de la fecha con teclado real.
- **Primer intento de ES2 inválido:** el intento de crear la especialidad "Pediatría" falló por la codificación de la consola de Git Bash (`Invalid UTF-8 middle byte`), un problema del entorno de prueba y no de la aplicación. Lo repetí con el escape `\u00eda` (ES2b).
- **Ejecución cortada:** se cortó una vez por un error de límite de la API (entre 17:03 y 17:20). Al retomarla repetí el mismo entorno y no repetí pruebas ya hechas.
- **Lo que no revisé:** `Historia_Clinica`, `Evolucion_Clinica`, `CIE`, `Ubigeo` y `Estado_*` (CRUD de catálogos), los componentes `legacy` (H-034, H-035), ni el endpoint `/api/medico/resumenMedico` (ya está en H-005). Sin registro de pruebas sobre ellos.
- **Fuga del texto SQL:** la fuga de detalles de la BD en los mensajes de error (AUD-LOG-05) se anota por su efecto en la lógica. Su valoración como problema de seguridad le corresponde al auditor de seguridad.
