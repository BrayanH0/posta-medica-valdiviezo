# AUD-PRI — Auditoría de privacidad (Ley 29733)
Ejecución: 2026-11-09 16:59:14 – 17:22:16 (hora del sistema, `date`; hubo una interrupción por error de límite de la API entre 17:03:49 y 17:20:27). Entorno: rama `master`, HEAD `3200a4d` (`git describe` → `ENTREGA-T2-2-g3200a4d`, última línea base LB-9). Backend en `http://localhost:8080` (`show-sql=true`), frontend `ng serve` en `http://localhost:4200`, MySQL local `posta_medica_valdiviezo`. Chromium de Playwright (`e2e/node_modules/playwright`). Scripts y salidas en `C:/Users/braya/AppData/Local/Temp/claude/85b186d9b1722304/0f4da1a6-6e30-4eb8-804c-f218b75ed1f0/scratchpad/aud-privacidad/` (`inventario.js`, `muestras.js`, `cruce.js`, `navegador.js` + `navegador.out.txt`, `navegador2.js` + `navegador2.out.txt`).

Credenciales usadas (datos ficticios de `docs/PRUEBAS.md`, P05–P07): paciente `12345678`, médico `10000001`, admin `87654321`, todas con clave `123456`. El resto de los datos personales copiados aquí están enmascarados (`xxxx****`).

## Resumen
| ID | Título | Severidad | Relación | Apto integrante |
|---|---|---|---|---|
| AUD-PRI-01 | Diagnósticos (incluido VIH), alergias, tipo de sangre y anotaciones clínicas se leen sin sesión y se pueden unir a nombre y DNI | Crítica | H-016, H-013 (aporta: evolución y CIE, cruce de identidad) | No |
| AUD-PRI-02 | La identidad del paciente en pantalla sale de `localStorage.userId`: se ve la historia clínica de otro paciente sin iniciar sesión | Crítica | H-016, H-013 (vía de explotación nueva) | No |
| AUD-PRI-03 | Las contraseñas en texto plano llegan al navegador en flujos normales (claves de médicos al paciente, de pacientes al admin) y `/usuarios` expone la del admin | Crítica | H-007 (aporta: admin, `/api/medico/especialidad/{id}` y flujos de pantalla) | No |
| AUD-PRI-04 | "Registrar Cita" recibe las citas de otros pacientes (id y motivo de consulta) | Alta | Nuevo (mismo patrón que H-013) | No |
| AUD-PRI-05 | Las pantallas de admin muestran datos de pacientes sin sesión (no hay guardas de ruta) | Alta | Nuevo en el frontend (la API ya está en H-016) | No |
| AUD-PRI-06 | Registro sin información al titular ni consentimiento para datos sensibles | Alta (riesgo legal) | Nuevo | No (lo decide el usuario/negocio) |
| AUD-PRI-07 | Borrado físico en cascada (paciente → citas → historia → evoluciones), sin sesión y sin rastro | Alta | H-016 (aporta: cascada y retención) | No |
| AUD-PRI-08 | `console.log` con la contraseña en claro (registro) y con DNI y datos de la respuesta de login | Media | Nuevo | Sí |
| AUD-PRI-09 | Los errores SQL con DNI se devuelven al cliente y quedan en el log; permiten saber si un DNI es paciente | Media | H-005 (aporta lo de privacidad) | No (toca el manejador global) |
| AUD-PRI-10 | Minimización por rol: el médico puede pedir pacientes de otros médicos, el admin ve nombre + especialidad por cita y recibe teléfono y clave que no muestra | Media | H-016, H-007 (aporta: análisis por rol) | No |
| AUD-PRI-11 | No hay registro de quién accede a los datos de salud | Baja | Nuevo | No |

## Inventario de exposición por endpoint (tabla)
Comprobación de sesión: **ningún endpoint la exige**. `WebSecurityConfig.java` tiene `.anyRequest().permitAll()` y los filtros JWT comentados (H-016). Todos los GET de la tabla respondieron sin cabecera `Authorization` (`inventario.js`, 17:00). Las entidades JPA son planas (sin `@OneToMany`/`@ManyToOne`), así que no hay grafos de relaciones serializados; la sobreexposición viene de **devolver la entidad completa**, con la columna `clave` incluida (no hay ningún `@JsonIgnore` en `model/`).

Leyenda: **P** = dato personal; **S** = dato sensible de salud; **C** = credencial.

| Endpoint (GET salvo indicación) | Estado | n | Claves del JSON | P / S / C | Observación |
|---|---|---|---|---|---|
| `/api/paciente` | 200 | 15 (24 durante la corrida) | idPaciente, nombres, apellidos, dni, **clave**, fecha_nacimiento, sexo, telefono, id_estado_paciente, id_ubigeo | P, C | Entidad completa; 15/15 con clave no nula |
| `/api/paciente/codigo/{id}` | 200 | 1 | ídem | P, C | H-007 |
| `/api/medico` | 200 | 15 | id_medico, nombres, apellidos, cmp, dni, **clave**, id_especialidad | P, C | 15/15 con clave |
| `/api/medico/codigo/{id}` | 200 | 1 | ídem | P, C | Lo usan "Mis Citas" e "Historial" (paciente) |
| `/api/medico/especialidad/{id}` | 200 | 3 | ídem | P, C | Lo usa "Registrar Cita" (paciente) |
| `/api/medico/apellidos/{x}`, `/nombres/{x}` | 200 | 0 en la prueba | ídem (entidad `Medico`) | P, C | Por código |
| `/api/medico/conEspecialidad` | 200 | 15 | id_medico, nombre_medico, apellido_medico, cmp, nombre_especialidad, descripcion | P | DTO sin clave (correcto) |
| `/api/medico/resumenMedico` | 500 | – | message, status | – | Mensaje interno de Hibernate (H-005) |
| `/usuarios` | 200 | 1 | id, apellidos, dni, **clave**, rol, nombre | P, C | Clave del administrador en claro |
| `/api/cita`, `/api/cita/{id}` | 200 | 21 (65 durante la corrida) | idCita, id_paciente, id_medico, fecha_cita, hora_cita, **motivo**, estado_cita | P, S (motivo) | Todas las citas de todos los pacientes (H-013) |
| `/api/cita/porEstado`, `/porEspecialidad` | 200 | 4 / 5 | estadoCita, cantCita / especialidad, totalCitas | – | Agregados (correcto) |
| `/api/citas/medico/{id}?estado=` | 200 | 4 | idCita, fecha, hora, motivo, estado, idPaciente, pacienteNombres, pacienteApellidos, pacienteDni | P, S | DTO sin clave; cualquier `{id}` |
| `/api/citas/medico/{id}/pacientes` | 200 | 4 / 3 / 4 (médicos 1/2/3) | idPaciente, nombres, apellidos, dni, fechaNacimiento, sexo, telefono, estadoPaciente, departamento, distrito | P | DTO sin clave; cualquier `{id}` |
| `/api/citas/medico/{id}/fecha/{f}` | 200 | 1 | idCita, **id_paciente**, id_medico, fecha_cita, hora_cita, **motivo**, estado_cita | P, S | Entidad `Cita` completa; la usa el paciente (AUD-PRI-04) |
| `/api/historia_clinica`, `/{id}` | 200 | 5 | idhistoria_Clinica, id_paciente, fecha_creacion, **observaciones, tipo_sangre, alergias** | S | H-013 |
| `/api/evolucion_clinica`, `/{id}` | 200 | 11 | idEvolucion_Clinica, id_historia, id_medico, fecha_evolucion, **anotaciones, id_cie** | S | No está en H-013 |
| `/api/cie`, `/{id}` | 200 | 5 | idCIE, codigo, descripcion | (catálogo) | Al unirlo con la evolución da el diagnóstico |
| `/api/reportes/resumen` | 200 | 21 | especialidad, **pacienteNombre**, medicoNombre, fecha, hora | P, S (paciente + especialidad) | 13 pacientes distintos |
| `/api/reportes/dashboard`, `/ingresosMensuales` | 200 | 1 / 6 | totalCitas, citasAtendidas, citasCanceladas, totalIngresos / mesAno, total | – | Agregados |
| `/api/disponibilidad_medico`, `/medico/{id}` | 200 | 75 / 5 | idDisponibilidad_Medico, id_medico, dia_semana, hora_inicio, hora_fin | – | – |
| `/api/especialidad`, `/{id}`, `/especialidad/especialidad` | 200 | 5 | id_especialidad, nombre_especialidad, descripcion, precio | – | – |
| `/api/estado_cita`, `/api/estado_paciente`, `/api/ubigeo` (+ `/{id}`) | 200 | 5 | catálogos | – | – |
| `POST /login` | 200 | 1 | success, tipo, id, nombres, apellidos, dni (+cmp médico, +rol admin) | P | Sin clave (correcto) |
| `POST /api/paciente/crear`, `POST /api/medico/crear`, `POST /usuarios/nuevo`, `POST/PUT/DELETE` del resto de CRUD, `PUT /api/citas/medico/{id}/{idCita}/estado` | no llamados (salvo 1 POST rechazado, AUD-PRI-09) | – | devuelven la entidad completa (por código) | P, S, C | Escritura y borrado sin sesión (H-016) |

## Inventario por pantalla y rol (tabla)
Fuente: `navegador.js` (17:02:53–17:03:49), que captura cada respuesta de `:8080` de la pantalla.

| Rol | Pantalla | Lo que recibe el navegador | Lo que muestra | Exceso respecto del mínimo necesario |
|---|---|---|---|---|
| Paciente | Mis Citas | `/api/cita` n=65 con ids de 16 pacientes; `/api/medico/codigo/{1,6}` con **dni y clave del médico** | Sus citas: fecha, hora, estado, médico, especialidad, motivo | Citas y motivos de todos los pacientes (H-013); DNI y clave de los médicos (AUD-PRI-03) |
| Paciente | Historial Médico | `/api/historia_clinica` n=5 (pacientes 1–5), `/api/evolucion_clinica` n=11, `/api/medico/codigo/*` con clave, `/api/cie/5` | Su tipo de sangre, alergias, observaciones, evoluciones, CIE | Historias y evoluciones de otros pacientes (H-013); claves de médicos |
| Paciente | Registrar Cita | `/api/medico/especialidad/2` n=3 **con dni y clave**; `/api/citas/medico/{id}/fecha/{f}` (citas de otros pacientes con `id_paciente` y `motivo`) | Nombres de médicos y horas libres | DNI y clave de los médicos; citas ajenas (AUD-PRI-04) |
| Médico | Pacientes (+ modal "Resumen") | `/api/citas/medico/1/pacientes` n=6: dni, fecha nac., sexo, teléfono, ubigeo | Lo mismo (el teléfono solo en el modal) | Razonable para el rol. La API acepta cualquier `idMedico` (AUD-PRI-10). No hay pantalla de historia clínica para el médico |
| Médico | Citas Pendientes / Confirmadas / Canceladas | `/api/citas/medico/1?estado=…`: motivo, nombre y DNI del paciente | Lo mismo | Adecuado (DTO filtrado en el servidor) |
| Admin | Pacientes | `/api/paciente` n=24 con **clave** (24/24) y teléfono | ID, nombres, apellidos, DNI, fecha nac., sexo, estado, ubigeo | Recibe la clave y el teléfono, que no muestra |
| Admin | Médicos | `/api/medico/conEspecialidad` (DTO sin clave) | Lo mismo | Adecuado |
| Admin | Informes | `/api/reportes/resumen` n=22: nombre del paciente + especialidad + médico + fecha | Tabla con esos campos | Para un informe bastaría el agregado; une identidad con especialidad (p. ej. Ginecología) (AUD-PRI-10) |
| Admin | Gráficos | Solo agregados | Agregados | Adecuado. El admin no tiene pantalla de historia clínica (correcto), aunque la API se la daría sin sesión |
| Sin sesión | `/admin/pacientes`, `/admin/reportes` | Lo mismo que el admin | **24 y 22 filas** | No hay guarda de ruta (AUD-PRI-05) |
| Sin sesión | `/medico-dashboard/pacientes` | Nada (`MedicoService` no llama sin `userId`) | 0 filas | – |
| Sin sesión | `/paciente/historial-medico` | Nada; diálogo "Sesión no válida." → `/login-paciente` | – | Pero basta con escribir `userId` en localStorage (AUD-PRI-02) |

## Hallazgos

### AUD-PRI-01 — Diagnósticos, alergias, tipo de sangre y anotaciones clínicas se leen sin sesión y se pueden unir a nombre y DNI
- Severidad: Crítica
- Relación con hallazgos existentes: H-016 (API sin autenticación) y H-013 (el frontend descarga todo). **Nuevo:** H-013 menciona `/api/cita` y `/api/historia_clinica`; aquí se agregan `/api/evolucion_clinica` (anotaciones + CIE), `/api/cie` y `/api/reportes/resumen`, y se comprueba que con 4 GET anónimos se une un diagnóstico de VIH a un paciente con nombre y DNI.
- Evidencia (`cruce.js`, sin cabeceras de sesión, ~17:01):
  ```
  evolución 8 → historia 4 → paciente id 4 DNI 45**** nombre An**** → CIE B20
  evolución 9 → historia 4 → paciente id 4 DNI 45**** nombre An**** → CIE B20
  evoluciones con historia vinculable a paciente con nombre: 11 de 11
  ```
  `/api/cie` → `[…{"idCIE":2,"codigo":"B20","descripcion":"VIH/SIDA"},…{"idCIE":4,"codigo":"E11","descripcion":"Diabetes tipo 2"}…]`. `/api/historia_clinica` → 5 registros con `tipo_sangre`, `alergias` (`Peni****`, `Aspi****`…) y `observaciones`.
- Impacto en el negocio: son datos sensibles en el sentido de la Ley 29733. Cualquiera que llegue al puerto 8080 puede extraer en segundos un listado "paciente + DNI + diagnóstico". Eso implica sanción administrativa (ANPD), daño a los titulares (estigma: VIH) y daño reputacional.
- Recomendación (con alternativas): (a) atender H-016: autenticación en la API (el JWT ya está escrito pero comentado) y autorización por rol y por titular (el paciente solo ve su propia historia); (b) endpoints por titular (`/api/paciente/{id}/historia`) que filtren en el servidor y devuelvan un DTO, en lugar de los CRUD genéricos de `historia_clinica` y `evolucion_clinica`; (c) como mínimo inmediato, quitar los `GET` de listado completo de historia y evolución, que ninguna pantalla necesita si se filtra en el servidor. Las tres opciones requieren su RFC.
- Esfuerzo estimado: Alto (autenticación + autorización + nuevos endpoints + cambios en 2 pantallas).
- Archivos involucrados: `backend/src/main/java/com/centro_valdiviezo/backend/seguridad/WebSecurityConfig.java`; `controller/Historia_ClinicaController.java`; `controller/Evolucion_ClinicaController.java`; `controller/ReporteController.java`; `frontend/src/app/features/paciente/historial-medico/historial-medico.component.ts`.
- Apto para integrante: No

### AUD-PRI-02 — La identidad del paciente sale de `localStorage.userId`: se ve la historia clínica de otro paciente sin iniciar sesión
- Severidad: Crítica
- Relación con hallazgos existentes: H-016 y H-013 (causa de fondo). **Nuevo:** se reproduce por la propia interfaz, sin `curl`. H-002 (cerrado) trataba de lo que queda tras cerrar sesión; esto es suplantación sin haber iniciado sesión nunca.
- Evidencia (`navegador2.js`, 17:21:28–17:22:06): contexto de navegador nuevo, sin login; se ejecuta `localStorage.setItem('userId','4'); localStorage.setItem('userType','paciente')` y se abre `/paciente/historial-medico`:
  ```
  [suplantación] peticiones a /login = 0 | url = /paciente/historial-medico
  [suplantación] contiene "B20" = false | contiene "VIH" = true | contiene "Tipo de Sangre" = true
  [suplantación] extracto (enmascarado): Tipo de Sangre: (valor) Alergias: Pol**** Observaciones: Che****
  ```
  (En la salida original se veían el valor real del tipo de sangre y la alergia completa; aquí se enmascararon.) Código: `historial-medico.component.ts:21-24` y `mis-citas.component.ts:21-24` toman `userId` de localStorage sin que el servidor lo valide.
- Impacto en el negocio: cualquier persona con un navegador ve el historial clínico (diagnósticos incluidos) de cualquier paciente con solo cambiar un número. No hace falta ningún conocimiento técnico avanzado.
- Recomendación (con alternativas): la identidad tiene que venir de un token emitido por el servidor (JWT o sesión) y el servidor tiene que filtrar por el titular del token (lo mismo que AUD-PRI-01 a/b). Una guarda de ruta en Angular **no** basta, porque localStorage lo controla el usuario.
- Esfuerzo estimado: Alto (va con AUD-PRI-01).
- Archivos involucrados: `frontend/src/app/features/auth/login-comun.ts` (`guardarSesion`); `features/paciente/historial-medico/historial-medico.component.ts`; `features/paciente/mis-citas/mis-citas.component.ts`; `features/paciente/registrar-cita/registrar-cita.component.ts`; backend `seguridad/`.
- Apto para integrante: No

### AUD-PRI-03 — Las contraseñas en texto plano llegan al navegador en flujos normales; `/usuarios` expone la del administrador
- Severidad: Crítica
- Relación con hallazgos existentes: H-007 (contraseñas en texto plano en la BD y en `/api/paciente/codigo/1` y `/api/medico/codigo/1`). **Nuevo:** (1) `GET /usuarios` devuelve la clave del administrador; (2) `GET /api/medico/especialidad/{id}` también devuelve `clave` y `dni`; (3) las pantallas del paciente reciben, en su uso normal, la clave y el DNI de los médicos, y la pantalla del admin recibe la clave de todos los pacientes.
- Evidencia: `/usuarios = [{"id":1,"apellidos":"Principal","dni":"87654321","clave":"123456","rol":"ADMIN","nombre":"Admin"}]` (dato de prueba documentado). Red capturada en la sesión del paciente `12345678`:
  ```
  RED GET 200 /api/medico/codigo/1 n=1 claves=[id_medico,nombres,apellidos,cmp,dni,clave,id_especialidad] conClave=1
  RED GET 200 /api/medico/especialidad/2 n=3 claves=[...,dni,clave,id_especialidad] conClave=3
  ```
  Sesión del admin: `RED GET 200 /api/paciente n=24 claves=[…,dni,clave,…] conClave=24`. `muestras.js`: `pacientes con clave no nula = 15 de 15`, `médicos con clave no nula = 15 de 15`.
- Impacto en el negocio: un paciente obtiene, desde las herramientas de su navegador, las credenciales de los médicos, y con ellas acceso al módulo médico. La clave del administrador está publicada. Como las claves no tienen hash, cualquier filtración de la BD o de la API las expone tal cual.
- Recomendación (con alternativas): (a) hash con BCrypt (el código ya lo tiene comentado en `PacienteService.crearPaciente`) y migración de las claves existentes; (b) DTOs de salida sin `clave` (o `@JsonProperty(access = WRITE_ONLY)` en `clave`) para `Paciente`, `Medico` y `UsuarioModel`; (c) en el frontend, usar `/api/medico/conEspecialidad` o un DTO público del médico (nombre + especialidad) en las pantallas del paciente. (b) es pequeño, pero cambia las respuestas que usan `admin-pacientes` (su PUT reenvía el objeto) y la caracterización de H-032, así que necesita RFC y revisar las pruebas.
- Esfuerzo estimado: Medio para (b)+(c); Alto para (a) (migración + login).
- Archivos involucrados: `backend/.../model/Paciente.java`, `model/Medico.java`, `model/UsuarioModel.java`, `controller/UsuarioController.java`, `controller/MedicoController.java`, `services/PacienteService.java`, `autenticacion/*`; `frontend/.../paciente/mis-citas/`, `historial-medico/`, `registrar-cita/`.
- Apto para integrante: No

### AUD-PRI-04 — "Registrar Cita" recibe las citas de otros pacientes (id y motivo de consulta)
- Severidad: Alta
- Relación con hallazgos existentes: Nuevo (mismo patrón que H-013, en otro endpoint y otra pantalla).
- Evidencia: `registrar-cita.component.ts:65` llama a `GET /api/citas/medico/{id_medico}/fecha/{fecha}` para calcular las horas libres, y el endpoint devuelve la entidad `Cita` completa. `curl` a las 17:20:27 (motivo enmascarado):
  ```
  [{"idCita":14,"id_paciente":11,"id_medico":1,"fecha_cita":"2023-09-20","hora_cita":"11:00:00","motivo":"Dolo****","estado_cita":4}]
  ```
  La cita es del paciente 11, no del paciente que reserva. En la corrida de Playwright la pantalla eligió la especialidad 2 / médico 8 y esa fecha devolvió `n=0`, así que en pantalla se comprobó la llamada pero **no** una respuesta con citas ajenas. Esto último se verificó solo con `curl` al mismo endpoint.
- Impacto en el negocio: cada paciente que reserva recibe el motivo de consulta (dato de salud) y el identificador de otros pacientes del mismo médico. Con `/api/paciente` (sin sesión) el identificador se convierte en nombre y DNI.
- Recomendación (con alternativas): (a) un endpoint de horas ocupadas que devuelva solo `hora_cita` (por ejemplo `List<String>`); (b) un DTO `HoraOcupadaDTO`; (c) que el servidor calcule y devuelva directamente las horas libres (sirve también para H-012 y H-022).
- Esfuerzo estimado: Bajo-medio (backend + 1 componente), con RFC.
- Archivos involucrados: `backend/.../controller/CitaConsultaController.java`, `services/CitaService.java` (`citasDeMedicoEnFecha`); `frontend/.../paciente/registrar-cita/registrar-cita.component.ts`, `horarios-cita.ts`.
- Apto para integrante: No (cambia el contrato del endpoint y pruebas U19–U23/U72–U79)

### AUD-PRI-05 — Las pantallas de admin muestran datos de pacientes sin sesión (no hay guardas de ruta)
- Severidad: Alta
- Relación con hallazgos existentes: H-016 cubre la API. **Nuevo en el frontend:** `app.routes.ts` no tiene `canActivate` en ninguna ruta (`grep -rn canActivate` → sin resultados en el código de rutas). Las pantallas de admin no comprueban `userType`.
- Evidencia (`navegador.js`, contexto nuevo, localStorage `{}`):
  ```
  -> /admin/pacientes
     RED GET 200 /api/paciente n=24 claves=[idPaciente,nombres,apellidos,dni,clave,...] conClave=24
     url final=/admin/pacientes filas de tabla visibles=24
  -> /admin/reportes
     url final=/admin/reportes filas de tabla visibles=22
  ```
- Impacto en el negocio: con solo escribir la URL se ve el padrón de pacientes (nombre, DNI, fecha de nacimiento, sexo) y la lista "paciente + especialidad + médico + fecha", y desde ahí se puede editar o eliminar pacientes (AUD-PRI-07).
- Recomendación (con alternativas): guardas de ruta por rol (`CanActivateFn`) para `/admin/**`, `/medico-dashboard/**` y `/paciente/**`, como capa de experiencia de usuario. **No sustituye** a la autenticación en la API (H-016): sin ella, la guarda se salta con `curl` o editando localStorage.
- Esfuerzo estimado: Bajo para la guarda (1 archivo nuevo + `app.routes.ts`), pero la protección real depende de H-016.
- Archivos involucrados: `frontend/src/app/app.routes.ts`; nuevo `core/guards/`.
- Apto para integrante: No (la guarda sola daría una falsa sensación de seguridad; debe ir junto con el RFC de H-016)

### AUD-PRI-06 — Registro sin información al titular ni consentimiento para datos sensibles
- Severidad: Alta (riesgo legal)
- Relación con hallazgos existentes: Nuevo
- Evidencia: `grep -rn -i -E "consent|privacidad|29733|tratamiento de datos"` en `frontend/src/app` (html y ts) → sin resultados. `navegador2.js` sobre `/registro`: `casillas de consentimiento en el formulario = 0 | enlaces/textos "privacidad" = 0`. El formulario pide DNI, nombres, apellidos, contraseña, fecha de nacimiento, sexo y teléfono (`registro.component.html:10-47`) y solo tiene los botones "Registrar" y "Volver".
- Impacto en el negocio: la Ley 29733 exige informar al titular (finalidad, destinatarios, banco de datos, cómo ejercer los derechos ARCO) y, para datos sensibles, un consentimiento calificado. La ley prevé excepciones para la atención sanitaria, pero el deber de informar se mantiene. **No verificado legalmente:** el alcance exacto (artículos aplicables, si la excepción sanitaria cubre el registro web y la inscripción del banco de datos ante la ANPD) debe confirmarlo un asesor legal. Sin aviso, la posta queda expuesta a observaciones de la autoridad.
- Recomendación (con alternativas): no se propone funcionalidad nueva en esta auditoría. Lo decide el negocio: (a) aviso de privacidad visible en el registro, con enlace a la política; (b) casilla de consentimiento expreso con registro de fecha y versión; (c) consentimiento firmado en ventanilla, si el alta web no es el canal principal.
- Esfuerzo estimado: Bajo (texto) a Medio (consentimiento con registro en la BD).
- Archivos involucrados: `frontend/src/app/features/auth/registro/registro.component.html`, `registro.component.ts`; posible columna nueva en `database/BDPostaMedica.sql`.
- Apto para integrante: No (requiere decisión del usuario/negocio y texto legal)

### AUD-PRI-07 — Borrado físico en cascada (paciente → citas → historia → evoluciones), sin sesión y sin rastro
- Severidad: Alta
- Relación con hallazgos existentes: H-016 (el DELETE no exige sesión). **Nuevo:** efecto en la retención de datos clínicos.
- Evidencia (solo lectura de código y esquema; **no se ejecutó ningún DELETE**): `PacienteService.eliminarPaciente` → `pacienteRepository.deleteById(id)`. Reglas de la BD en vivo (`information_schema.REFERENTIAL_CONSTRAINTS`, 17:20:40):
  ```
  cita               paciente          CASCADE
  historia_clinica   paciente          CASCADE
  evolucion_clinica  historia_clinica  CASCADE
  ```
  El propio frontend lo avisa: `admin-pacientes.component.ts` → `confirm('Este paciente y todas sus citas e historia clínica se eliminarán de forma permanente…')`. El paciente también borra físicamente sus citas, incluso las atendidas: `mis-citas.component.ts:55` → `DELETE /api/cita/{id}` (botón "Eliminar cita"). En el log del backend se ve que otro proceso concurrente ejecutó `delete from Paciente where idPaciente=?` (línea 665), lo que confirma que la operación está disponible.
- Impacto en el negocio: (1) cualquiera, sin sesión, puede destruir de forma irreversible la historia clínica de un paciente; (2) aunque lo haga un admin legítimo, la historia clínica suele tener obligaciones de conservación según la normativa sanitaria (**no verificado**: confirmar el plazo vigente de la norma técnica del MINSA con asesoría). El derecho de cancelación de la Ley 29733 no obliga a borrar datos que deben conservarse por mandato legal.
- Recomendación (con alternativas): (a) baja lógica del paciente (`id_estado_paciente` = inactivo; la tabla `Estado_Paciente` ya existe) en lugar de `DELETE`; (b) quitar `ON DELETE CASCADE` de `historia_clinica` y `evolucion_clinica`; (c) "cancelar" la cita (estado 3) en lugar de borrarla; (d) proteger con autenticación y rol (H-016).
- Esfuerzo estimado: Medio (backend + 2 pantallas + esquema), con RFC.
- Archivos involucrados: `backend/.../controller/PacienteController.java`, `services/PacienteService.java`, `controller/CitaController.java`; `database/BDPostaMedica.sql:129,143,165`; `frontend/.../admin/pacientes/admin-pacientes.component.ts`, `paciente/mis-citas/mis-citas.component.ts`.
- Apto para integrante: No

### AUD-PRI-08 — `console.log` con la contraseña en claro (registro) y con DNI y datos de la respuesta de login
- Severidad: Media
- Relación con hallazgos existentes: Nuevo
- Evidencia: código `registro.component.ts:107` `console.log('Registrando paciente:', this.paciente);` y `:112`; `login-paciente.component.ts:35,38` y `login-medico.component.ts:35,38` (`'Intentando login …:', this.dni` y `'Login exitoso', res`). Consola capturada:
  ```
  [registro] CONSOLA: Registrando paciente: {nombres: AUD-PRI, apellidos: Prueba, dni: 12345678, clave: AudPri#2026, fecha_nacimiento: 2000-01-01}
  CONSOLA log: Intentando login paciente: 12345678
  CONSOLA log: Login exitoso {apellidos: Perez Gomez, tipo: paciente, success: true, id: 1, dni: 12345678}
  CONSOLA log: Intentando login medico: 10000001
  ```
  (Datos de prueba; la clave `AudPri#2026` la inventó el auditor y el registro fue rechazado.) Menor: `admin-reportes.component.ts:50` imprime solo agregados.
- Impacto en el negocio: en un equipo compartido (recepción, cabina) la contraseña y el DNI quedan visibles en la consola del navegador; extensiones o herramientas de soporte que capturan la consola los recogen.
- Recomendación (con alternativas): (a) quitar esas 5 líneas `console.log`; (b) o un servicio de log que no se ejecute en producción y nunca reciba el objeto completo. No se verificó si el build de producción las elimina (Angular no las quita por defecto).
- Esfuerzo estimado: Bajo
- Archivos involucrados: `frontend/src/app/features/auth/registro/registro.component.ts`, `features/auth/login-paciente/login-paciente.component.ts`, `features/auth/login-medico/login-medico.component.ts`
- Apto para integrante: Sí (3 archivos, sin cambio de comportamiento visible; ninguna prueba depende de la consola, aunque conviene confirmarlo con la batería)

### AUD-PRI-09 — Los errores SQL con DNI se devuelven al cliente y quedan en el log; permiten saber si un DNI es paciente
- Severidad: Media
- Relación con hallazgos existentes: H-005 (el mismo manejador expone mensajes internos en `/api/medico/resumenMedico`). **Nuevo:** dato personal en el cuerpo de error y en el log, y enumeración de DNI.
- Evidencia: `GlobalExceptionHandler.handleRuntimeException` devuelve `ex.getMessage()`. A las 17:20:40, `POST /api/paciente/crear` con DNI `12345678` (de prueba):
  ```
  {"message":"could not execute statement [Duplicate entry '12345678' for key 'paciente.dni'] [insert into Paciente (apellidos,clave,dni,...) values (?,?,...)]; SQL [...]; constraint [paciente.dni]","status":"error"}
  HTTP 500
  ```
  La pantalla de registro lo traduce a "El DNI ya está registrado…" (`registro.component.ts:118`). En el log del backend: `ERROR … SqlExceptionHelper : Duplicate entry '12345678' for key 'paciente.dni'` (línea 256), más otras de otros auditores (`Duplicate entry '7100****'`).
- Impacto en el negocio: saber que un DNI "es paciente de la posta" ya es un dato personal; el formulario público de registro lo confirma, y el log acumula DNI. Además el cuerpo de error expone la estructura de la tabla. (El listado completo de DNI también sale de `/api/paciente` por H-016; esta vía seguiría abierta aunque se cierre H-016, porque el registro es público.)
- Recomendación (con alternativas): (a) manejar `DataIntegrityViolationException` con un mensaje genérico y código 409, sin el mensaje SQL; (b) en el log, registrar el tipo de error sin el valor; (c) aceptar la enumeración en el registro como riesgo asumido, pero con límite de intentos.
- Esfuerzo estimado: Bajo-medio (el manejador es global y el frontend depende del texto `Duplicate entry`).
- Archivos involucrados: `backend/.../exception/GlobalExceptionHandler.java`; `frontend/.../auth/registro/registro.component.ts:118`.
- Apto para integrante: No (2 archivos, pero cambia el comportamiento de todos los errores 500 y el criterio del registro)

### AUD-PRI-10 — Minimización por rol: el médico pide pacientes de otros médicos, el admin ve nombre + especialidad por cita y recibe datos que no muestra
- Severidad: Media
- Relación con hallazgos existentes: H-016 (sin sesión no hay autorización por titular); H-007 (clave). **Nuevo:** análisis de lo mínimo necesario por rol.
- Evidencia: sin sesión, `/api/citas/medico/{1,2,3}/pacientes` → `n=4, 3, 4`, todos con teléfono; el `idMedico` sale de la URL y `MedicoService` lo toma de `localStorage.userId` (`medico.service.ts:45`), así que un médico ve los pacientes de otro cambiando el número. El admin en "Informes" recibe y muestra `pacienteNombre` + `especialidad` + `medicoNombre` + fecha (22 filas), y en "Pacientes" recibe `telefono` y `clave`, que la tabla no muestra (`admin-pacientes.component.html:61-81`).
- Impacto en el negocio: se trata más información de la necesaria (principio de proporcionalidad). Un informe administrativo que une nombre con especialidad revela datos de salud (p. ej. Ginecología) a personal que no los necesita.
- Recomendación (con alternativas): (a) autorizar `idMedico` contra el token (H-016); (b) informe de admin con datos agregados o con el paciente seudonimizado (iniciales o ID); (c) DTO de listado de pacientes para el admin sin clave ni teléfono, si la tabla no los usa (el formulario de edición sí podría necesitar el teléfono, véase H-032).
- Esfuerzo estimado: Medio
- Archivos involucrados: `backend/.../controller/CitaConsultaController.java`, `controller/ReporteController.java`, `controller/PacienteController.java`; `frontend/.../admin/reportes/`, `admin/pacientes/`, `medico/services/medico.service.ts`.
- Apto para integrante: No

### AUD-PRI-11 — No hay registro de quién accede a los datos de salud
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo
- Evidencia: `SHOW TABLES` → 12 tablas de negocio y ninguna de auditoría/accesos; `SHOW VARIABLES` → `general_log OFF`; el backend no registra el usuario en ningún log (no hay usuario autenticado, H-016); `show-sql` registra la sentencia sin quién la pidió.
- Impacto en el negocio: ante una filtración (AUD-PRI-01/02) no se puede saber qué historias se consultaron ni quién lo hizo, ni notificar a los afectados con precisión.
- Recomendación (con alternativas): una vez exista la autenticación, (a) una tabla de bitácora de accesos a historia y evolución (usuario, paciente, fecha); (b) o logs estructurados del backend con usuario + recurso, sin datos clínicos en el mensaje.
- Esfuerzo estimado: Medio (depende de H-016)
- Archivos involucrados: `backend/.../controller/Historia_ClinicaController.java`, `Evolucion_ClinicaController.java`; `database/BDPostaMedica.sql`.
- Apto para integrante: No

## Revisado sin hallazgos
- **Caché HTTP:** `curl -D -` a `/api/paciente/codigo/1` → `Cache-Control: no-cache, no-store, max-age=0, must-revalidate`, `Pragma: no-cache`, `Expires: 0` (cabeceras por defecto de Spring Security). Las respuestas con datos personales no se guardan en la caché del navegador.
- **Cookies y sessionStorage:** tras el login de los 3 roles, `cookies=[]` y `sessionStorage={}`.
- **localStorage tras el login:** solo `userId`, `userName`, `userType` (paciente `{"userId":"1","userName":"Juan Perez Gomez","userType":"paciente"}`, médico `…"Jorge Santos Ruiz","userType":"medico"}`, admin `…"Admin Principal","userType":"administrador"}`). No se guarda el DNI, la clave ni datos clínicos. (El problema es que `userId` se usa como identidad: AUD-PRI-02.)
- **Cierre de sesión:** los 3 roles quedan en `/login-selection` con `localStorage={}` (`AuthService.logout()` → `localStorage.clear()`). Confirma que H-002 sigue cerrado.
- **Respuesta de `/login`:** no incluye `clave` (claves `success,tipo,id,nombres,apellidos,dni` + `cmp`/`rol`).
- **Mensaje de login uniforme:** "Credenciales inválidas" sin distinguir si el DNI existe (P08/P10), así que el login no permite enumerar DNI.
- **`show-sql`:** imprime las sentencias con `?`, sin valores. `grep` en el log del backend de `123456`, `10000001`, `87654321` y `clave=` → ninguna coincidencia de valores de clave; la única coincidencia con un DNI viene del mensaje de error de MySQL (AUD-PRI-09), no de `show-sql`. No hay `logging.level` definido en `application.properties`.
- **DTOs del médico** (`CitaMedicoDTO`, `PacienteMedicoDTO`) y **`/api/medico/conEspecialidad`**: sin clave, con campos acordes a la pantalla.
- **Pantallas sin sesión del médico y del paciente:** `/medico-dashboard/pacientes` muestra 0 filas sin llamar a la API; `/paciente/historial-medico` muestra "Sesión no válida." y redirige (pero ver AUD-PRI-02).
- **Entidades JPA:** sin relaciones bidireccionales ni grafos anidados en el JSON; la sobreexposición se limita a la columna `clave` y a los listados completos.

## Datos creados en la BD
Ninguno. Hubo 2 intentos de alta que el backend rechazó por DNI duplicado y no dejaron registro:
- 17:20:40, `POST /api/paciente/crear` con `nombres":"AUD-PRI"` y DNI `12345678` → `HTTP 500 Duplicate entry`.
- 17:21:28–17:22:06, formulario `/registro` con nombres `AUD-PRI`, DNI `12345678` → "El DNI ya está registrado…".

Comprobación a las 17:22:16: `SELECT COUNT(*) FROM Paciente WHERE nombres LIKE 'AUD-PRI%' OR apellidos LIKE 'AUD-PRI%'` → `0`. No se ejecutó ningún PUT ni DELETE.

## Limitaciones
- **Datos cambiantes:** en paralelo corrían otros auditores. Durante la corrida, `/api/cita` pasó de 21 a 65 registros y `/api/paciente` de 15 a 24; el log del backend muestra `update Administrador`, `update Paciente` y `delete from Paciente` ajenos a esta auditoría. Los conteos de las tablas son los del momento de cada comando.
- **AUD-PRI-04:** la fuga en pantalla no se vio con datos (el script eligió médico 8, fecha sin citas, `n=0`); se verificó con `curl` al mismo endpoint que llama el componente.
- **AUD-PRI-07:** la cascada se comprobó en el código y en el esquema de la BD en vivo; no se ejecutó el borrado.
- **Aspectos legales** (artículos concretos de la Ley 29733 y su reglamento, excepción sanitaria, plazo de conservación de la historia clínica, inscripción del banco de datos): **no verificados**; requieren asesoría legal.
- No se revisó el build de producción del frontend (si conserva los `console.log`), ni TLS/HTTPS (el entorno es solo `localhost`), ni las copias de respaldo de la BD.
- Los endpoints de escritura (POST/PUT/DELETE) se clasificaron por código; no se llamaron, salvo el POST rechazado.
- La auditoría se interrumpió entre 17:03:49 y 17:20:27 (error de límite de la API) y se retomó desde el mismo punto con el mismo entorno.
- Estado del repositorio al terminar: `git status --short` → ` M docs/BITACORA.md`, `?? .claude/agents/`. Este auditor no modificó `docs/BITACORA.md` (no tiene herramientas de edición); el cambio viene de otro proceso.
