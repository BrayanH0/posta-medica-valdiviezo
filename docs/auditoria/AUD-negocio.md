# AUD-NEG — Auditoría de negocio
Ejecución: 2026-11-09 16:59:11 – 17:17:20 (hora del sistema, `date`). La ejecución se cortó entre 17:03:11 y 17:16:01 por un error de límite de la API y siguió después con los mismos datos. Entorno: repositorio en `master`, commit `3200a4d` (LB-9). Backend en `http://localhost:8080` (HTTP 200 a las 17:17:20, `show-sql` activo). Frontend en `http://localhost:4200` (HTTP 200). MySQL `posta_medica_valdiviezo`, recargada a las 16:57:43 (21 citas, 15 pacientes al inicio). Al mismo tiempo corrían otros auditores (por ejemplo, alguien creó una cita Atendida en `2099-12`); sus registros no se tocaron.

## Resumen
| ID | Título | Severidad | Relación | Apto integrante |
|---|---|---|---|---|
| AUD-NEG-01 | Un solo paciente puede acaparar todos los turnos de un médico y estar en varias citas a la misma hora | Alta | Nuevo (agrava H-012, H-016) | No |
| AUD-NEG-02 | Se pueden crear "citas fantasma": sin paciente, con cuerpo vacío, en el pasado, fuera de horario o con estado inicial arbitrario | Alta | Nuevo (relacionado con H-012, H-016, H-022, H-037) | No |
| AUD-NEG-03 | Los ingresos se pueden inflar: una cita creada como "Atendida" o marcada Atendida antes de su fecha cuenta como ingreso | Alta | Nuevo (relacionado con H-031, H-016) | No |
| AUD-NEG-04 | Los ingresos históricos cambian o desaparecen: precio actual, borrado físico de la cita y borrado en cascada del paciente | Alta | H-024 (amplía) + Nuevo | No |
| AUD-NEG-05 | Suplantación al registrarse: cualquiera toma un DNI libre y bloquea al titular; el backend acepta DNI y clave inválidos | Alta | Nuevo (relacionado con H-016, H-007) | No |
| AUD-NEG-06 | La respuesta de DNI duplicado revela si una persona es paciente de la posta y expone el SQL | Media | Nuevo | Sí |
| AUD-NEG-07 | Ningún flujo marca una cita como Atendida ni como "no asistió": no se puede medir el no-show y los reportes no crecen | Media | Nuevo (relacionado con H-023) | No |
| AUD-NEG-08 | Cancelar como paciente es un borrado físico, sin plazo y en cualquier estado (incluida Atendida) | Media | Nuevo | No |
| AUD-NEG-09 | La máquina de estados sigue abierta y además se puede saltar por `PUT /api/cita/{id}` (cambiar paciente, médico o estado) | Media | H-031 (amplía), H-016 | No |
| AUD-NEG-10 | No hay trazabilidad: ninguna tabla ni registro dice quién creó, cambió o borró una cita | Media | Nuevo | No |
| AUD-NEG-11 | Un paciente "Fallecido" o "Inactivo" puede iniciar sesión y reservar | Media | Nuevo | Sí |
| AUD-NEG-12 | El total de citas del dashboard no cuadra con el conteo por estado | Baja | Nuevo (consecuencia de AUD-NEG-02) | Sí |
| AUD-NEG-13 | "Registrar Cita" ofrece horas ya pasadas del día y, desde las 19:00 de Lima, bloquea el día de hoy (fecha mínima en UTC) | Baja | Nuevo | Sí |
| AUD-NEG-14 | Los datos semilla atribuyen estados de salud y diagnósticos a personas públicas reales | Media | Nuevo | No |

## Matriz de riesgos del dominio (aplica / no aplica / por qué)
| Riesgo / buena práctica | ¿Aplica? | Por qué (evidencia) |
|---|---|---|
| Acaparamiento de horarios | **Aplica** | `CitaService.crearCita` = `citaRepository.save(cita)`, sin tope por paciente ni por día. Se crearon 36 citas de 36 para un mismo paciente con el médico 1 el 2027-03-15; "Registrar Cita" calcula `{"horarios":[],"porDefecto":true}` para los demás (AUD-NEG-01) |
| No-show (paciente que no asiste) | **Aplica** | No hay estado "No asistió" y ninguna pantalla marca Atendida. Hay citas de 2023 que siguen Pendiente o Confirmada (6, 8 y 2) (AUD-NEG-07) |
| Suplantación (DNI ajeno) | **Aplica** | El registro solo valida el formato de 8 dígitos y solo en el frontend. Cualquiera puede registrar un DNI libre y el titular real recibe "Duplicate entry" (AUD-NEG-05). Login sin autenticación de la API: H-016 |
| Citas fantasma / datos basura | **Aplica** | `POST /api/cita` aceptó `id_paciente:null` y un cuerpo con solo `motivo` (idCita 62 y 63) (AUD-NEG-02) |
| Doble reserva | **Aplica** | H-012 sigue igual: citas 26 y 69 con médico 1, `2027-03-15 09:00:00` |
| Reserva en fin de semana o fuera de horario | **Aplica** | H-022 (frontend). En el backend se aceptó un sábado a las `23:59:00` (cita 67) y una hora `03:07:00` (cita 65) |
| Ingresos mal calculados: precio actual vs. precio cobrado | **Aplica** | H-024. Reproducido en transacción con ROLLBACK: 2023-07 pasa de 265.00 a 315.00 al cambiar solo el precio actual (AUD-NEG-04) |
| Ingresos: ¿se cuentan las canceladas? | **No aplica** | `sumTotalIngresos` e `ingresosMensuales` filtran `estado_cita = 4`. Las canceladas no suman. El riesgo está en cómo se llega al estado 4 (AUD-NEG-03) |
| Estados de cita incoherentes | **Aplica** | H-031: Pendiente→Cancelada→Confirmada y Atendida→Pendiente→Atendida respondieron 200. Además, una cita de 2027 quedó "Atendida" (AUD-NEG-03 y 09) |
| Cancelación tardía | **Aplica** | "Eliminar cita" del paciente hace un `DELETE` físico sin regla de tiempo ni de estado (AUD-NEG-08) |
| Trazabilidad (quién cambió qué) | **Aplica** | `Cita` tiene 7 columnas sin auditoría, no hay triggers y el único rastro es `Hibernate: delete from Cita where idCita=?` (AUD-NEG-10) |
| Paciente no habilitado (inactivo o fallecido) | **Aplica** | `AutenticadorPaciente` no mira `id_estado_paciente`. El login del paciente 15 (Fallecido) da 200 y su cita 66 se guardó (AUD-NEG-11) |
| Privacidad: revelar quién es paciente | **Aplica** | El 500 de DNI duplicado confirma que existe un paciente con ese DNI (AUD-NEG-06). Las listas completas por API ya están en H-013 y H-016 |
| Reprogramación | No aplica como riesgo hoy | El estado 5 "Reprogramada" existe, pero ningún flujo lo usa. En "Mis Citas" se mostraría "Desconocido" (`mis-citas.component.ts:195-202`, el switch llega hasta 4; ya citado en H-023) |

## Hallazgos

### AUD-NEG-01 — Un solo paciente puede acaparar todos los turnos de un médico y estar en varias citas a la misma hora
- Severidad: Alta
- Relación con hallazgos existentes: Nuevo. Lo agravan H-012 (no hay validación al guardar) y H-016 (cualquiera llama a la API).
- Evidencia (17:02:11–17:02:25):
  ```
  for m in $(seq 480 20 1180); do ... curl -X POST http://localhost:8080/api/cita -d "{\"id_paciente\":19,\"id_medico\":1,\"fecha_cita\":\"2027-03-15\",\"hora_cita\":\"$h\",\"motivo\":\"AUD-NEG acaparamiento\",\"estado_cita\":1}"; done
  POST 200: 36 de 36; ids: 23 24 25 26 ... 59
  --- mismo paciente, misma hora 10:00, con medicos 2 y 3
  {"idCita":60,"id_paciente":19,"id_medico":2,"fecha_cita":"2027-03-15","hora_cita":"10:00:00",...} HTTP 200
  {"idCita":61,"id_paciente":19,"id_medico":3,"fecha_cita":"2027-03-15","hora_cita":"10:00:00",...} HTTP 200
  curl -s http://localhost:8080/api/citas/medico/1/fecha/2027-03-15 | grep -o '"idCita"' | wc -l  →  36
  ```
  Para ver qué recibe otro paciente se ejecutó una copia sin cambios de `horarios-cita.ts` en el scratchpad (`node --experimental-strip-types`, Node v24.18.0), con la disponibilidad y las citas reales del backend:
  ```
  citas ocupadas: 36
  {"horarios":[],"porDefecto":true}
  ```
  Con esa lista vacía, la plantilla muestra "No hay horarios disponibles para esta fecha." (`registrar-cita.component.html:49-51`). No se comprobó en pantalla.
- Impacto en el negocio: una persona, o un script, deja sin agenda a un médico durante días. Los pacientes reales no consiguen cita y los ingresos se pierden. Una misma persona puede estar en 3 consultorios a la misma hora, lo que garantiza no-shows.
- Recomendación (con alternativas): (a) en `CitaService.crearCita`, limitar las citas activas (Pendiente o Confirmada) por paciente, en total o por día. (b) Rechazar una cita del mismo paciente que se cruce con otra suya a la misma fecha y hora, con cualquier médico. (c) Como mínimo, alertar al administrador cuando un paciente pase de N citas activas. Las tres opciones necesitan que la API sepa quién es el paciente (H-016); si no, el tope se evita cambiando `id_paciente`.
- Esfuerzo estimado: Medio (regla en el servicio + consultas en el repositorio + pruebas). Si se incluye la identidad (H-016), Alto.
- Archivos involucrados: `backend/src/main/java/com/centro_valdiviezo/backend/services/CitaService.java` (`crearCita`), `repository/CitaRepository.java`, `controller/CitaController.java`.
- Apto para integrante: No (es una regla de negocio nueva en el backend y depende de H-016).

### AUD-NEG-02 — Se pueden crear "citas fantasma": sin paciente, con cuerpo vacío, en el pasado, fuera de horario o con estado inicial arbitrario
- Severidad: Alta
- Relación con hallazgos existentes: Nuevo. H-012 dice que el backend guarda sin validar, pero solo lo prueba con la doble reserva. H-037 menciona `hora_cita` nula. H-022 es el fin de semana en el frontend. H-016.
- Evidencia (17:02:48):
  ```
  --- G1) cita sin paciente (id_paciente null)
  {"idCita":62,"id_paciente":null,"id_medico":1,"fecha_cita":"2027-03-16","hora_cita":"09:00:00","motivo":"AUD-NEG fantasma sin paciente","estado_cita":1} HTTP 200
  --- G2) cuerpo vacio {}
  {"idCita":63,"id_paciente":null,"id_medico":null,"fecha_cita":null,"hora_cita":null,"motivo":"AUD-NEG cuerpo casi vacio","estado_cita":null} HTTP 200
  --- G3) paciente inexistente 99999
  {"message":"could not execute statement [Cannot add or update a child row: a foreign key constraint fails (`posta_medica_valdiviezo`.`cita`, CONSTRAINT `cita_ibfk_2` FOREIGN KEY (`id_paciente`) REFERE...
  --- G4) fecha pasada 2019-01-15, hora 03:07 (fuera de horario y de bloque), estado 4 Atendida
  {"idCita":65,"id_paciente":19,"id_medico":3,"fecha_cita":"2019-01-15","hora_cita":"03:07:00","motivo":"AUD-NEG atendida inventada","estado_cita":4} HTTP 200
  --- G6) sabado 2027-03-20 (H-022 en backend)
  {"idCita":67,"id_paciente":19,"id_medico":1,"fecha_cita":"2027-03-20","hora_cita":"23:59:00","motivo":"AUD-NEG sabado 23:59","estado_cita":1} HTTP 200
  ```
  `SHOW COLUMNS FROM Cita` muestra que todas las columnas salvo `idCita` admiten NULL (`id_paciente | int | YES`, `fecha_cita | date | YES`, …). La clave foránea solo protege contra un paciente inexistente (G3, que además expone el SQL en el 500); no protege contra NULL.
- Impacto en el negocio: aparecen en la agenda turnos que nadie va a usar (G1 ocupa las 09:00 del médico 1 sin paciente), citas en fechas pasadas o a horas en que la posta está cerrada, y citas que entran directo como Atendidas (ver AUD-NEG-03). Ensucian los reportes (AUD-NEG-12) y pueden romper "Registrar Cita" (H-037 con `hora_cita` nula).
- Recomendación (con alternativas): (a) validar en `CitaService.crearCita` los campos obligatorios, que la fecha y hora sean futuras, que la hora caiga en `Disponibilidad_Medico` y en un bloque de 20 minutos, y que el estado inicial sea siempre Pendiente (sin aceptar el que mande el cliente). (b) Además, poner `NOT NULL` en `Cita.id_paciente`, `id_medico`, `fecha_cita`, `hora_cita` y `estado_cita` en `BDPostaMedica.sql`, como defensa en la base. (c) Bean Validation (`@NotNull`, `@Valid`) en la entidad o en un DTO de entrada.
- Esfuerzo estimado: Medio.
- Archivos involucrados: `services/CitaService.java`, `model/Cita.java`, `controller/CitaController.java`, `database/BDPostaMedica.sql` (`CREATE TABLE Cita`, líneas 120-131).
- Apto para integrante: No (cambia el comportamiento de P12 y P13 y del esquema; necesita RFC).

### AUD-NEG-03 — Los ingresos se pueden inflar: una cita creada como "Atendida" o marcada Atendida antes de su fecha cuenta como ingreso
- Severidad: Alta
- Relación con hallazgos existentes: Nuevo. Es la consecuencia económica de H-031 (sin máquina de estados) y de H-016 (sin autenticación).
- Evidencia:
  - Cita creada directamente con `estado_cita:4` (G4 de AUD-NEG-02, cita 65, 2019-01-15, médico 3 de Cardiología, S/ 80). Después (17:02:59):
    ```
    curl -s http://localhost:8080/api/reportes/ingresosMensuales
    [{"mesAno":"2019-01","total":80.0},{"mesAno":"2023-07","total":265.0},...]
    ```
  - Cita futura marcada Atendida por el endpoint del médico (17:03:11):
    ```
    PUT /api/citas/medico/1/24/estado {"estado":"Atendida"}
    {"idCita":24,"fecha":"2027-03-15","hora":"08:20:00",...,"estado":"Atendida",...} HTTP 200
    curl -s http://localhost:8080/api/reportes/ingresosMensuales
    [...,{"mesAno":"2027-03","total":50.0},{"mesAno":"2099-12","total":60.0}]
    ```
    (La fila `2099-12` la creó otro auditor y confirma el mismo efecto.)
- Impacto en el negocio: el reporte de "Total de Ingreso" (`admin-reportes.component.html:38`) y los ingresos mensuales incluyen consultas que nunca ocurrieron, incluso de meses futuros. El administrador toma decisiones con cifras falsas, y cualquiera con acceso a la API puede manipularlas.
- Recomendación (con alternativas): (a) el estado inicial lo fija el servidor (Pendiente) y no el cuerpo de la petición. (b) Solo se puede pasar a Atendida desde Confirmada y con `fecha_cita`/`hora_cita` ya cumplidas (parte del RFC de H-031). (c) Mientras tanto, que los reportes sumen solo citas con `fecha_cita <= CURDATE()`, como mitigación parcial que no reemplaza a (a) y (b).
- Esfuerzo estimado: Medio (incluido en el RFC de H-031 + validación de AUD-NEG-02).
- Archivos involucrados: `services/CitaService.java` (`crearCita`, `cambiarEstadoDeCitaDeMedico`), `repository/CitaRepository.java` (`sumTotalIngresos`, `ingresosMensuales`).
- Apto para integrante: No.

### AUD-NEG-04 — Los ingresos históricos cambian o desaparecen: precio actual, borrado físico de la cita y borrado en cascada del paciente
- Severidad: Alta
- Relación con hallazgos existentes: H-024 (precio actual), que aquí se reproduce y se amplía. El borrado de la cita y la cascada del paciente son nuevos.
- Evidencia:
  - H-024 reproducido sin dejar cambios (transacción con ROLLBACK, 17:16:12), usando la misma consulta de `ingresosMensuales`:
    ```
    START TRANSACTION; <consulta> ; UPDATE Especialidad SET precio = 100.00 WHERE id_especialidad = 1; <consulta> ; ROLLBACK;
    | 2023-07 | 265.00 |      →      | 2023-07 | 315.00 |
    | 2023-08 | 190.00 |      →      | 2023-08 | 240.00 |
    precio_tras_rollback 50.00
    ```
  - Borrado físico de una cita Atendida y borrado en cascada del paciente (17:16:01):
    ```
    PUT /api/cita/25 {"id_paciente":17,"id_medico":4,"fecha_cita":"2019-02-15",...,"estado_cita":4}  → HTTP 200
    ingresos antes de borrar:  {"mesAno":"2019-01","total":80.0  ,{"mesAno":"2019-02","total":70.0
    DELETE /api/cita/65                      → HTTP 200
    DELETE /api/paciente/eliminar/17         → {"status":"success","message":"Paciente eliminado correctamente"} HTTP 200
    ingresos despues: (sin filas 2019-01 ni 2019-02)
    SELECT idCita FROM Cita WHERE idCita IN (25,65);   → (vacío)
    ```
    Causa en el esquema: `FOREIGN KEY (id_paciente) REFERENCES Paciente(idPaciente) ON DELETE CASCADE` (`BDPostaMedica.sql:129`), y lo mismo en `Historia_Clinica` (que arrastra `Evolucion_Clinica`). La pantalla del administrador lo avisa ("Este paciente y todas sus citas e historia clínica se eliminarán de forma permanente", `admin-pacientes.component.ts:63`), pero no impide el borrado.
  - No verificado en vivo, solo leído en el código: el precio también depende de la especialidad **actual** del médico (`JOIN Medico m ... JOIN Especialidad e ON m.id_especialidad = e.id_especialidad`). Si un médico cambia de especialidad, sus atenciones pasadas cambian de precio y de especialidad en los reportes.
- Impacto en el negocio: los ingresos de meses cerrados no son estables. Borrar un paciente (o una cita desde "Mis Citas", AUD-NEG-08) borra el ingreso y la evidencia de la atención. En salud, además, se pierde la historia clínica, que por norma debe conservarse (consultarlo con el responsable legal; no verificado aquí).
- Recomendación (con alternativas): (a) guardar el precio cobrado en la cita (columna `precio` en `Cita` al crearla o al atenderla) y sumar ese valor (atiende H-024). (b) Cambiar `ON DELETE CASCADE` por `RESTRICT` y dar de baja lógica al paciente (`id_estado_paciente` Inactivo, que ya existe) en lugar de borrarlo. (c) No borrar físicamente las citas atendidas (ver AUD-NEG-08).
- Esfuerzo estimado: Alto (esquema + migración de datos + consultas + pantalla de admin).
- Archivos involucrados: `database/BDPostaMedica.sql`, `model/Cita.java`, `repository/CitaRepository.java`, `services/PacienteService.java` (`eliminarPaciente`), `controller/PacienteController.java`, `frontend/.../features/admin/pacientes/admin-pacientes.component.ts`.
- Apto para integrante: No.

### AUD-NEG-05 — Suplantación al registrarse: cualquiera toma un DNI libre y bloquea al titular; el backend acepta DNI y clave inválidos
- Severidad: Alta
- Relación con hallazgos existentes: Nuevo. Relacionado con H-016 (sin autenticación) y H-007 (la clave se guarda y se devuelve en texto plano; se ve en las respuestas de abajo).
- Evidencia (17:01:37 y 17:01:47):
  ```
  --- A) DNI con letras, clave '1', sin fecha, estado Fallecido(5)
  POST /api/paciente/crear {"nombres":"AUD-NEG","apellidos":"Basura","dni":"ABC","clave":"1","sexo":"M","id_estado_paciente":5,"id_ubigeo":1}
  {"idPaciente":17,"nombres":"AUD-NEG","apellidos":"Basura","dni":"ABC","clave":"1","fecha_nacimiento":null,...,"id_estado_paciente":5,"id_ubigeo":1} HTTP 200
  --- C) DNI libre 8 digitos (cualquier persona) con nombre ajeno
  {"idPaciente":19,"nombres":"AUD-NEG","apellidos":"Suplantado","dni":"70000017","clave":"Aa1!aa",...} HTTP 200
  --- El titular real intenta registrarse con su DNI
  POST /api/paciente/crear {"nombres":"AUD-NEG","apellidos":"Titular real","dni":"70000017",...}
  {"message":"could not execute statement [Duplicate entry '70000017' for key 'paciente.dni'] [insert into Paciente (apell...
  ```
  En el código, el frontend solo valida `/^\d{8}$/` (`registro.component.ts:38-42`), la clave fuerte (`:44-53`) y la fecha. El backend (`PacienteService.crearPaciente`) guarda sin validar nada (el `BCrypt` está comentado). Nada comprueba que el DNI pertenezca a quien se registra (no hay segundo dato del DNI, celular verificado ni validación presencial).
- Impacto en el negocio: una persona puede atenderse, o reservar, a nombre de otra. Las citas y la historia clínica quedan asociadas a la identidad equivocada (datos de salud, Ley 29733), y el titular real no puede registrarse. Con datos basura (DNI "ABC", clave "1") se crean cuentas que el formulario nunca permitiría.
- Recomendación (con alternativas): (a) repetir en el backend las validaciones que ya hace el formulario (DNI de 8 dígitos, clave fuerte, fecha válida) y fijar `id_estado_paciente` en el servidor. (b) Pedir en el registro un dato de verificación del DNI que ya figure en el documento (por ejemplo, la fecha de emisión o el dígito verificador) y comprobarlo. (c) Si no hay forma de verificarlo en línea, que el administrador valide la cuenta en la primera atención presencial (estado Inactivo hasta entonces, usando los estados que ya existen). (b) y (c) son decisiones de negocio del usuario.
- Esfuerzo estimado: Bajo para (a); Medio para (c).
- Archivos involucrados: `services/PacienteService.java`, `controller/PacienteController.java`, `model/Paciente.java`, `frontend/src/app/features/auth/registro/registro.component.ts`.
- Apto para integrante: No (aunque (a) toca pocos archivos, cambia el comportamiento de un endpoint público y debe ir con RFC y pruebas).

### AUD-NEG-06 — La respuesta de DNI duplicado revela si una persona es paciente de la posta y expone el SQL
- Severidad: Media
- Relación con hallazgos existentes: Nuevo. Relacionado con H-013 y H-016, que exponen listas completas por otros endpoints.
- Evidencia (17:01:37):
  ```
  --- B) DNI existente 12345678 (duplicado)
  {"message":"could not execute statement [Duplicate entry '12345678' for key 'paciente.dni'] [insert into Paciente (apellidos,clave,dni,fecha_nacimiento,id_estado_paciente,id_ubigeo,nombres,sexo,telefono) values (?,?,?,?,?,?,?,?,?)]; SQL [insert into Paciente ...]; constraint [paciente.dni]","status":"error"} HTTP 500
  ```
  El origen es `GlobalExceptionHandler.handleRuntimeException`, que devuelve `ex.getMessage()` con 500. El frontend depende de ese texto: `registro.component.ts:118` busca `'Duplicate entry'`.
- Impacto en el negocio: con un DNI se puede saber si esa persona se atiende en la posta, y eso ya es un dato de salud. La respuesta además muestra la estructura de la base.
- Recomendación (con alternativas): (a) en `PacienteController.crear`, comprobar antes `findByDni` y responder 409 con un mensaje genérico ("No se pudo completar el registro"), y ajustar el frontend al 409. (b) Atrapar `DataIntegrityViolationException` en el `GlobalExceptionHandler` y responder 409 sin el mensaje interno. Una respuesta neutra también limita la enumeración. Quitar por completo el oráculo exigiría verificación por un canal externo, que hoy no existe.
- Esfuerzo estimado: Bajo.
- Archivos involucrados: `controller/PacienteController.java` o `exception/GlobalExceptionHandler.java`; `frontend/src/app/features/auth/registro/registro.component.ts`.
- Apto para integrante: Sí (2 o 3 archivos; hay que actualizar la condición del frontend en el mismo cambio).

### AUD-NEG-07 — Ningún flujo marca una cita como Atendida ni como "no asistió": no se puede medir el no-show y los reportes no crecen
- Severidad: Media
- Relación con hallazgos existentes: Nuevo. H-023 trata los números fijos de estado, no la ausencia del flujo.
- Evidencia:
  - Código: `grep -rn -i "atendida\|'Confirmada'\|'Cancelada'..." frontend/src/app` (sin specs) muestra que el único cambio de estado de la interfaz es `medico-citas-pendientes.component.ts:50`: `const nuevoEstado = this.actionType === 'aceptar' ? 'Confirmada' : 'Cancelada';`. El tipo es `EstadoCita = 'Pendiente' | 'Confirmada' | 'Cancelada'` (`medico.service.ts:6`). Ninguna pantalla pasa una cita a Atendida, y `Estado_Cita` no tiene un estado de inasistencia (1 Pendiente, 2 Confirmada, 3 Cancelada, 4 Atendida, 5 Reprogramada).
  - Citas vencidas sin cerrar (17:16:21):
    ```
    SELECT ... WHERE c.fecha_cita < CURDATE() AND c.estado_cita IN (1,2) AND c.idCita<=21;
    |      6 |           1 | 2023-07-06 | 09:00:00  | Pendiente     |
    |      8 |           3 | 2023-07-08 | 11:00:00  | Pendiente     |
    |      2 |           2 | 2023-07-02 | 10:00:00  | Confirmada    |
    ```
- Impacto en el negocio: los ingresos (que solo suman Atendidas) se quedan en los datos semilla, salvo que alguien llame a la API a mano (AUD-NEG-03). No se puede distinguir a quien no asistió de una cita atendida pero sin registrar, así que no se puede medir ni gestionar el no-show. Las citas vencidas siguen saliendo como pendientes para el médico (`findCitasDeMedicoPorEstado` no filtra por fecha).
- Recomendación (con alternativas): sobre lo que ya existe, (a) agregar en la pantalla de citas confirmadas del médico la acción "Marcar atendida" (usa el endpoint actual con estado `Atendida`, que ya existe), habilitada solo cuando la fecha ya pasó. (b) Para el no-show, decidir con el usuario si se reutiliza "Cancelada" con motivo o si se agrega un estado al catálogo, porque eso es un cambio de alcance. (c) Que la lista de pendientes del médico separe las vencidas.
- Esfuerzo estimado: Medio.
- Archivos involucrados: `frontend/src/app/features/medico/medico-citas-aprobadas/*`, `features/medico/services/medico.service.ts`, `services/CitaService.java` (validación de la transición), `repository/CitaRepository.java`.
- Apto para integrante: No (depende de la máquina de estados, H-031).

### AUD-NEG-08 — Cancelar como paciente es un borrado físico, sin plazo y en cualquier estado (incluida Atendida)
- Severidad: Media
- Relación con hallazgos existentes: Nuevo (relacionado con H-016).
- Evidencia:
  - Código: `mis-citas.component.html:23` muestra el botón "Eliminar cita" en todas las tarjetas, sin condición de estado ni de fecha. `mis-citas.component.ts:177-183` llama a `this.http.delete(`${this.apiUrl}/cita/${id}`)`. `CitaService.eliminarCita` hace `citaRepository.deleteById(id)`.
  - API: `DELETE /api/cita/65` (cita Atendida) → `HTTP 200`; la fila desapareció y el ingreso 2019-01 bajó de 80.0 a nada (AUD-NEG-04). No se probó desde la pantalla.
- Impacto en el negocio: el paciente puede "cancelar" cinco minutos antes, sin que el médico se entere y sin que quede registro. La estadística de canceladas no cuenta las cancelaciones de pacientes, y el paciente puede borrar sus propias atenciones pasadas (y con ellas el ingreso).
- Recomendación (con alternativas): (a) que "Eliminar cita" cambie el estado a Cancelada (estado 3, que ya existe) en lugar de borrar. (b) Mostrar el botón solo en Pendiente o Confirmada y con fecha futura. (c) Fijar una anticipación mínima (por ejemplo, X horas) para cancelar en línea; el valor lo decide el negocio. El backend debe aplicar las mismas reglas.
- Esfuerzo estimado: Medio.
- Archivos involucrados: `frontend/src/app/features/paciente/mis-citas/mis-citas.component.ts` y `.html`, `services/CitaService.java`, `controller/CitaController.java`.
- Apto para integrante: No (cambia el comportamiento del paciente y necesita un endpoint de cancelación con reglas).

### AUD-NEG-09 — La máquina de estados sigue abierta y además se puede saltar por `PUT /api/cita/{id}` (cambiar paciente, médico o estado)
- Severidad: Media
- Relación con hallazgos existentes: H-031 (se reproduce en vivo; antes estaba demostrado solo con la prueba unitaria U46) y H-016. Lo nuevo es el camino del `PUT` genérico.
- Evidencia (17:03:11 y 17:16:01):
  ```
  PUT /api/citas/medico/1/23/estado {"estado":"Cancelada"}  → ..."estado":"Cancelada"... HTTP 200
  PUT /api/citas/medico/1/23/estado {"estado":"Confirmada"} → ..."estado":"Confirmada"... HTTP 200
  PUT /api/citas/medico/1/24/estado Atendida → Pendiente → Atendida: las 3 respuestas HTTP 200
  PUT /api/cita/25 {"id_paciente":17,"id_medico":4,"fecha_cita":"2019-02-15","hora_cita":"09:00:00","motivo":"AUD-NEG reasignada por PUT generico","estado_cita":4}
  {"idCita":25,"id_paciente":17,"id_medico":4,"fecha_cita":"2019-02-15",...,"estado_cita":4} HTTP 200
  ```
  `CitaService.actualizarCita` copia los 6 campos sin validar nada. Ese endpoint no comprueba que la cita sea del médico (cosa que sí hace `/api/citas/medico/...`) ni el estado. Ningún archivo del frontend lo llama (`grep` de `put(`/`cita/` en `features/paciente` y `features/medico` no lo encontró; revisión de código), pero está publicado.
- Impacto en el negocio: aunque se corrija H-031 en el endpoint del médico, el `PUT` genérico sigue permitiendo pasar una cita de un paciente a otro, moverla de médico o fecha, o marcarla Atendida.
- Recomendación (con alternativas): (a) que el RFC de H-031 cubra los dos caminos: o el `PUT /api/cita/{id}` deja de aceptar `estado_cita` e `id_paciente`, o pasa por la misma validación de transición. (b) Si ninguna pantalla usa el `PUT` genérico, evaluar con el usuario si se retira (cambia la API y lo decide el usuario).
- Esfuerzo estimado: Medio (junto con H-031).
- Archivos involucrados: `services/CitaService.java` (`actualizarCita`, `cambiarEstadoDeCitaDeMedico`), `controller/CitaController.java`.
- Apto para integrante: No.

### AUD-NEG-10 — No hay trazabilidad: ninguna tabla ni registro dice quién creó, cambió o borró una cita
- Severidad: Media
- Relación con hallazgos existentes: Nuevo (H-016 lo agrava: el servidor no sabe quién llama).
- Evidencia (17:16:21):
  ```
  SHOW COLUMNS FROM Cita;  → idCita, id_paciente, id_medico, fecha_cita, hora_cita, motivo, estado_cita (sin fecha de creación, usuario ni fecha de cambio)
  SHOW TRIGGERS;           → (sin filas)
  grep -rln -i "audit\|@CreatedDate\|@LastModified\|EntityListeners\|logger\.\(info\|warn\)" backend/src/main/java  → (sin resultados)
  ```
  El único rastro del borrado de AUD-NEG-04 está en el log del backend, por `show-sql`, sin usuario ni hora: `662:Hibernate: delete from Cita where idCita=?` y `665:Hibernate: delete from Paciente where idPaciente=?`.
- Impacto en el negocio: ante un reclamo ("yo no cancelé", "el médico no confirmó", "ese ingreso no existe") no hay forma de reconstruir qué pasó ni quién lo hizo. Para datos de salud (Ley 29733) se espera poder rendir cuentas del tratamiento de los datos.
- Recomendación (con alternativas): (a) tabla de historial de cambios de estado de cita (cita, estado anterior, estado nuevo, usuario, fecha y hora), escrita desde `CitaService`. (b) Columnas `creado_en`/`actualizado_en` en `Cita` con auditoría de JPA. (c) Registrar con un logger en `CitaService`/`PacienteService` las operaciones de escritura. El "quién" en (a) y (c) solo es confiable cuando se resuelva H-016.
- Esfuerzo estimado: Medio (a) / Bajo (b, c).
- Archivos involucrados: `database/BDPostaMedica.sql`, `model/Cita.java`, `services/CitaService.java`, `services/PacienteService.java`.
- Apto para integrante: No (cambia el esquema; (c) por sí sola sería apta, pero es parcial).

### AUD-NEG-11 — Un paciente "Fallecido" o "Inactivo" puede iniciar sesión y reservar
- Severidad: Media
- Relación con hallazgos existentes: Nuevo.
- Evidencia:
  ```
  (17:01:23) curl -X POST http://localhost:8080/login -d '{"dni":"60000010","clave":"123456"}'
  {"apellidos":"Kuczynski","tipo":"paciente","success":true,"id":15,"dni":"60000010","nombres":"Pedro Pablo"} HTTP 200
  (17:02:48) POST /api/cita {"id_paciente":15,...,"motivo":"AUD-NEG paciente fallecido reserva","estado_cita":1}
  {"idCita":66,"id_paciente":15,...} HTTP 200
  ```
  El paciente 15 tiene `id_estado_paciente = 5` (Fallecido); los pacientes 4, 8 y 14 están Inactivos. `AutenticadorPaciente.autenticar` (líneas 25-40) solo compara DNI y clave.
- Impacto en el negocio: dar de baja a un paciente (por fallecimiento, o como alternativa al borrado de AUD-NEG-04) no le quita el acceso. Una cuenta de un fallecido puede usarse para reservar (suplantación) y genera citas que nadie va a cumplir.
- Recomendación (con alternativas): (a) en `AutenticadorPaciente`, rechazar el login si el estado es Fallecido (y decidir con el usuario qué pasa con Inactivo). (b) Además, rechazar en `CitaService.crearCita` las citas de pacientes en esos estados. El mensaje no debe revelar el estado (usar el mismo "Credenciales inválidas").
- Esfuerzo estimado: Bajo.
- Archivos involucrados: `backend/.../autenticacion/AutenticadorPaciente.java` (y, para (b), `services/CitaService.java`).
- Apto para integrante: Sí, para (a): 1 o 2 archivos más su prueba unitaria. Conviene revisar que ninguna prueba P use los pacientes 4, 8, 14 o 15 para iniciar sesión (las credenciales de prueba documentadas son las del paciente 1).

### AUD-NEG-12 — El total de citas del dashboard no cuadra con el conteo por estado
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo, consecuencia de AUD-NEG-02.
- Evidencia (17:02:59):
  ```
  /api/reportes/dashboard → {"totalCitas":65,"citasAtendidas":19,"citasCanceladas":1,"totalIngresos":1275.0}
  /api/cita/porEstado     → Pendiente 43 + Confirmada 1 + Cancelada 1 + Atendida 19 = 64
  SQL: total 65 | sin_estado 1 | sin_paciente 2
  ```
  `ReporteController.getDashboardStats` usa `citaRepository.count()`, y `cantCitasPorEstado` usa `JOIN Estado_Cita`, que deja fuera la cita sin estado.
- Impacto en el negocio: dos reportes del mismo panel dan cifras distintas, y eso le resta confianza al administrador.
- Recomendación (con alternativas): la causa es la cita sin estado (corregir AUD-NEG-02). Mientras tanto, (a) que `totalCitas` cuente con el mismo criterio que `porEstado` o (b) mostrar aparte "sin estado" como alerta de calidad de datos.
- Esfuerzo estimado: Bajo.
- Archivos involucrados: `controller/ReporteController.java`, `repository/CitaRepository.java`.
- Apto para integrante: Sí (1 o 2 archivos; con la BD semilla, P02 no cambia porque todas las citas tienen estado).

### AUD-NEG-13 — "Registrar Cita" ofrece horas ya pasadas del día y, desde las 19:00 de Lima, bloquea el día de hoy (fecha mínima en UTC)
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo (misma regla que H-022 y H-037, otro defecto).
- Evidencia (17:16:39), con la copia de `horarios-cita.ts` en el scratchpad y los datos reales del médico 1:
  ```
  2026-11-09 17:16:39
  fecha 2026-11-09 primeros: 08:00,08:20,08:40,09:00 ... total 36
  TZ=America/Lima node -e "new Date('2026-11-09T19:30:00-05:00').toISOString().split('T')[0]"
  19:30 Lima -> minDate = 2026-11-10
  ```
  `calcularHorariosDisponibles` no recibe la hora actual. `minDate` es `new Date().toISOString().split('T')[0]` (`registrar-cita.component.ts:18`), que está en UTC. No se comprobó en pantalla.
- Impacto en el negocio: a las 17:16 se ofrece reservar a las 08:00 de hoy (una cita imposible, que termina en no-show). Desde las 19:00 de Lima ya no se puede reservar para hoy aunque queden bloques hasta las 20:00.
- Recomendación (con alternativas): (a) calcular `minDate` con la fecha local. (b) Si la fecha es hoy, descartar los bloques anteriores a la hora actual, pasando "ahora" como parámetro para que la función siga siendo pura. (c) Validar lo mismo en el backend (AUD-NEG-02).
- Esfuerzo estimado: Bajo.
- Archivos involucrados: `frontend/src/app/features/paciente/registrar-cita/registrar-cita.component.ts`, `horarios-cita.ts` (y una prueba unitaria nueva).
- Apto para integrante: Sí, para (a) y (b) en el frontend: 2 archivos y una prueba nueva. Las pruebas existentes U72–U79 no deberían cambiar si "ahora" es opcional; confirmarlo al hacerlo.

### AUD-NEG-14 — Los datos semilla atribuyen estados de salud y diagnósticos a personas públicas reales
- Severidad: Media
- Relación con hallazgos existentes: Nuevo.
- Evidencia (consulta de las 17:17; `BDPostaMedica.sql:238-245`):
  ```
  |  9 | Alan        | Garcia    | En tratamiento |
  | 10 | Alberto     | Fujimori  | Alta médica    |
  | 14 | Keiko       | Fujimori  | Inactivo       |
  | 15 | Pedro Pablo | Kuczynski | Fallecido      |
  (más Pedro Castillo, Dina Boluarte, Martin Vizcarra, Alejandro Toledo, Ollanta Humala, Nadine Heredia)
  ```
  Esos pacientes tienen citas con motivo clínico. Por ejemplo, la cita 20 (paciente 9) tiene `"Arritmia"`, Cardiología.
- Impacto en el negocio: el repositorio y las demos asocian diagnósticos y estados ("Fallecido") a personas reales e identificables. Hay riesgo reputacional y de datos personales (Ley 29733), sobre todo si el repositorio es público o se muestra en una presentación.
- Recomendación (con alternativas): (a) reemplazar nombres y apellidos de los pacientes 6–15 por nombres ficticios en `BDPostaMedica.sql`, sin tocar los DNI ni los IDs. (b) Si alguna prueba E2E compara nombres en pantalla, actualizar su resultado esperado en el mismo RFC (decide el usuario).
- Esfuerzo estimado: Bajo.
- Archivos involucrados: `database/BDPostaMedica.sql`.
- Apto para integrante: No. Toca un solo archivo, pero puede cambiar resultados de la batería (pantallas que muestran nombres, por ejemplo la lista de pacientes del médico en P20–P24) y hay que revisarlo contra la línea base antes.

## Revisado sin hallazgos
- **Ingresos y canceladas:** `sumTotalIngresos` e `ingresosMensuales` (`CitaRepository.java:21-26, 51-52`) suman solo `estado_cita = 4`. Las canceladas no cuentan como ingreso.
- **Cita de un paciente inexistente:** la clave foránea `cita_ibfk_2` la rechaza (G3). El rechazo es correcto; el problema es que el 500 expone el SQL (lo mismo que AUD-NEG-06).
- **DNI único:** `Paciente.dni CHAR(8) UNIQUE NOT NULL` impide dos cuentas con el mismo DNI. El riesgo está en quién lo registra primero (AUD-NEG-05), no en que se duplique.
- **Endpoint del médico para cambiar el estado:** comprueba que la cita sea del médico de la ruta (`CitaService.cambiarEstadoDeCitaDeMedico:229`) y que el estado exista. La identidad del médico depende de H-016.
- **Formulario de registro:** valida el formato del DNI, la clave fuerte y la fecha de nacimiento en el frontend (`registro.component.ts:74-105`). Esas validaciones no existen en el backend (AUD-NEG-05).
- **Doble reserva (H-012):** sin cambios respecto de lo documentado. Citas 26 y 69 (médico 1, `2027-03-15 09:00:00`). No se agrega un hallazgo nuevo.
- **Fin de semana en el frontend (H-022):** no se volvió a probar en pantalla. Con los datos actuales (los 15 médicos con horario Lunes–Viernes de 08:00 a 20:00), el caso "todo el día ocupado → horario por defecto" no ofrece horas extra (salida `{"horarios":[],"porDefecto":true}`).

## Datos creados en la BD
Todos tienen `nombres = 'AUD-NEG'` o `motivo` que empieza con `AUD-NEG`. Se eliminan al recargar la BD.

| Tabla | ID | Detalle | Estado al final |
|---|---|---|---|
| Paciente | 17 | `AUD-NEG Basura`, DNI `ABC`, clave `1`, estado 5 | **Eliminado** (17:16:01, `DELETE /api/paciente/eliminar/17`) |
| Paciente | 19 | `AUD-NEG Suplantado`, DNI `70000017` | Existe |
| Cita | 23–24, 26–40, 42–59 | `AUD-NEG acaparamiento`, paciente 19, médico 1, 2027-03-15. La 23 quedó Confirmada y la 24 Atendida; el resto Pendiente (35 filas) | Existen |
| Cita | 25 | Reasignada por `PUT` al paciente 17, médico 4, 2019-02-15, Atendida | **Eliminada** en cascada con el paciente 17 |
| Cita | 60, 61 | `AUD-NEG mismo paciente misma hora` (médicos 2 y 3, 10:00) | Existen |
| Cita | 62 | `AUD-NEG fantasma sin paciente` | Existe |
| Cita | 63 | `AUD-NEG cuerpo casi vacio` (todo NULL salvo el motivo) | Existe |
| Cita | 65 | `AUD-NEG atendida inventada` (2019-01-15 03:07, estado 4) | **Eliminada** (`DELETE /api/cita/65`) |
| Cita | 66 | `AUD-NEG paciente fallecido reserva` (paciente 15) | Existe |
| Cita | 67 | `AUD-NEG sabado 23:59` | Existe |
| Cita | 68 | `AUD-NEG doble reserva` (08:40; al final no fue doble, porque la 25 ya se había movido) | Existe |
| Cita | 69 | `AUD-NEG doble reserva` (09:00, duplica la 26) | Existe |
| Especialidad | 1 | Precio cambiado a 100.00 **dentro de una transacción con ROLLBACK** | Sin cambios (50.00 comprobado) |

Las citas 41 y 64, y el paciente 18, no son de esta auditoría: los generó otro auditor o un insert fallido que consumió el autoincremento (G3 pudo consumir el 64; sin registro de cuál).

## Limitaciones
- No se usó navegador: Playwright no estaba conectado en esta sesión. Lo que se describe de pantalla ("No hay horarios disponibles", el botón "Eliminar cita" en todos los estados, `minDate`) sale del código y de ejecutar en Node una **copia sin cambios** de `horarios-cita.ts` en el scratchpad. No se comprobó en pantalla.
- Otros auditores escribían al mismo tiempo en la BD. Por eso los totales globales (dashboard 65 citas, 1275.0) incluyen datos ajenos, y para medir efectos se usaron meses que nadie más usaba (2019-01, 2019-02, 2027-03).
- La ejecución se cortó entre 17:03:11 y 17:16:01 por un error de límite de la API. Se retomó con los mismos datos; ninguna prueba se repitió a ciegas.
- No verificado: el efecto en los reportes de cambiar la especialidad de un médico (AUD-NEG-04, solo leído en el código) y la obligación legal de conservar la historia clínica (requiere consulta normativa).
- No se ejecutaron las pruebas unitarias ni E2E existentes (no hacía falta para esta auditoría de solo lectura). No se modificó ningún archivo del repositorio. Los scripts temporales (`sql.sh`, `slots.ts`, `hoy.ts`, copia de `horarios-cita.ts`, JSON) están en `C:/Users/braya/AppData/Local/Temp/claude/85b186d9b1722304/0f4da1a6-6e30-4eb8-804c-f218b75ed1f0/scratchpad/aud-negocio/`.
