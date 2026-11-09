# AUD-ROB — Auditoría de robustez
Ejecución: Mon Nov 9 17:38:08 – 17:50:09 HPS 2026 (-05:00, hora de `date`). Entorno: rama master en `3200a4d` (`git describe` → `ENTREGA-T2-2-g3200a4d`, LB-9). Backend Spring Boot en http://localhost:8080. Al inicio era el PID 12964; lo detuve una vez (autorizado) y desde las 17:46:20 corre con `mvnw spring-boot:run`, PID 29304. Frontend `ng serve` en http://localhost:4200 (PID 25220, no lo toqué). MySQL 8.0.46, aislamiento `REPEATABLE-READ`. Playwright/Chromium headless desde `e2e/node_modules`, con todas las peticiones que no van a localhost bloqueadas por `page.route` (6 por pantalla: los CDN de `index.html`). Durante la ejecución solo corrí yo. Las citas pasaron de 87 a 115, todas mías (28).
La evidencia completa (salidas reales, scripts y capturas) está en `C:/Users/braya/AppData/Local/Temp/claude/85b186d9b1722304/0f4da1a6-6e30-4eb8-804c-f218b75ed1f0/scratchpad/aud-robustez/`, en los archivos `01-setup.log` … `16-estado-concurrente.log` y `capturas/`.

No repito lo que ya está demostrado en AUD-LOG y AUD-SEG: datos basura, campos nulos, fechas y horas imposibles, JSON mal formado con respuesta 500, IDs inexistentes con 200 vacío o 500, sobrescritura por "crear" y fuga del texto SQL (AUD-LOG-01/02/05/06/09, AUD-SEG-04/07). Aquí solo aporto lo propio.

## Resumen
| ID | Título | Severidad | Relación | Apto integrante |
|---|---|---|---|---|
| AUD-ROB-01 | 2 y 10 reservas simultáneas al mismo médico, fecha y hora: todas se guardan. Tampoco alcanza con "consultar y luego insertar" | Crítica | H-012 (amplía: concurrencia), AUD-REN-07 | No |
| AUD-ROB-02 | Doble clic en "Confirmar Cita" (Registrar Cita) crea 2 citas idénticas del mismo paciente | Alta | H-012, AUD-LOG-03/04 (otra causa, en el frontend) | Sí |
| AUD-ROB-03 | Médico: doble clic en "Confirmar Aceptación/Cancelación" envía 2 PUT; con red lenta el modal sigue abierto y la acción contraria queda sobrescrita | Media | H-031 (relacionado) | Sí |
| AUD-ROB-04 | Cambios de estado concurrentes sobre la misma cita: sin transacción ni control de versión; una respuesta 200 informa un estado distinto al pedido | Media | H-031, AUD-LOG-08 | No |
| AUD-ROB-05 | Backend caído: 7 pantallas muestran "no hay datos", ceros o selects vacíos en lugar de un error; Informes sigue mostrando datos viejos; nada se recupera solo | Media | H-029 (caso inverso), P11/P18 | Sí (por pantalla) |
| AUD-ROB-06 | Los errores 500 que no vienen de SQL (JSON, conversión de tipos) no dejan rastro en el log del servidor; hay dos formatos de cuerpo de error | Media | AUD-LOG-05, AUD-SEG-07 (aspecto nuevo) | Sí (solo el registro en el log) |
| AUD-ROB-07 | Sin límite de tamaño del cuerpo: un `motivo` de 10 MB se procesa entero y llega a MySQL antes de rechazarse; `GET /api/cita` sin paginación | Baja | H-013, AUD-REN | Parcial |

## Hallazgos

### AUD-ROB-01 — Reservas simultáneas al mismo horario: todas se guardan
- Severidad: Crítica
- Relación con hallazgos existentes: H-012. H-012 y P13 demuestran la doble reserva con dos peticiones **secuenciales**. Aquí se demuestra en paralelo, y además que una validación del tipo "consultar si está libre y luego insertar" tampoco la evita. Esto condiciona cómo debe corregirse H-012. AUD-REN-07 ya anotó que falta el índice compuesto.
- Evidencia:
  - Esquema (`SHOW INDEX FROM Cita`): solo hay `PRIMARY(idCita)` y los índices de las FK `estado_cita`, `id_paciente` e `id_medico`. **No hay UNIQUE** sobre `(id_medico, fecha_cita, hora_cita)`. En `backend/src/main/java`, `grep -rn "@Version\|@Lock\|@Transactional\|LockModeType\|synchronized"` no devuelve nada. `CitaService.crearCita` es `return citaRepository.save(cita);`.
  - 2 simultáneas (`concurrencia.cjs`, `Promise.all`, médico propio 22, 2026-12-07 10:00:00, 17:40:19):
    ```
    {"i":1,"status":200,"body":"{\"idCita\":97,...\"hora_cita\":\"10:00:00\"...","ms":77}
    {"i":2,"status":200,"body":"{\"idCita\":96,...\"hora_cita\":\"10:00:00\"...","ms":76}
    total 2 peticiones, HTTP 200: 2, otros: 0, duracion 77 ms
    SELECT COUNT(*) ... hora_cita='10:00:00' → 2
    ```
  - 10 simultáneas (10:20:00, 17:40:37): `total 10 peticiones, HTTP 200: 10, otros: 0, duracion 82 ms`. En la BD quedaron `n=10`, ids `98,...,107`.
  - Cada cliente hace lo mismo que "Registrar Cita": `GET /api/citas/medico/22/fecha/...` y solo envía el POST si la hora está libre (`verificar-y-reservar.cjs`, 10:40:00, 17:40:54):
    ```
    {"i":1,"libre":true,"post":200,"idCita":112} ... {"i":10,"libre":true,"post":200,"idCita":117}
    creadas: 10 de 10   → COUNT(*) = 10
    control secuencial después: {"i":1,"libre":false,"post":"no enviado"}
    ```
    Los 10 vieron la hora libre porque ninguno había insertado todavía. Una validación de "consultar y luego insertar" en `CitaService`, sin restricción en la BD ni bloqueo, tendría la misma carrera.
  - Contraste: 5 altas simultáneas de paciente con el mismo DNI (`11-dni-concurrente.log`) → 1 con `HTTP 200` (idPaciente 46) y 4 con `HTTP 500 Duplicate entry '74000010'`. El `UNIQUE` de `Paciente.dni` sí protege contra la carrera.
- Impacto en el negocio: en horas de alta demanda (apertura de agenda), varios pacientes obtienen la misma hora con el mismo médico, todos con "Cita registrada con éxito". Sin intervención manual no hay forma de detectarlo.
- Recomendación (con alternativas):
  - (a) **Restricción en la BD:** índice único que excluya las citas canceladas. Por ejemplo, una columna generada `activa = IF(estado_cita = 3, NULL, 1)` y `UNIQUE(id_medico, fecha_cita, hora_cita, activa)`; MySQL admite varios NULL, así que una hora cancelada se puede volver a reservar. El backend traduce `DataIntegrityViolationException` a 409 y el frontend muestra "La hora ya fue tomada". Es la única opción que resiste cualquier cliente y cualquier carrera.
  - (b) Bloqueo pesimista: `@Transactional` + `SELECT ... FOR UPDATE` sobre la fila del médico antes de comprobar e insertar. Serializa las reservas por médico, pero depende de que todo camino de escritura (POST y PUT `/api/cita`) pase por ahí.
  - (c) Aislamiento `SERIALIZABLE` solo en la reserva: más costoso y con riesgo de bloqueos mutuos.
  - Se recomienda (a), en el RFC de H-012. Al aplicarla, P13 cambiará de resultado (es la corrección esperada) y antes hay que depurar los duplicados existentes. En los datos semilla no hay: la consulta de duplicados excluyendo `AUD-%` no devolvió filas.
- Esfuerzo estimado: 1 día (script SQL, handler 409, mensaje en el frontend y pruebas, incluida una de concurrencia).
- Archivos involucrados: `database/BDPostaMedica.sql`, `backend/.../services/CitaService.java`, `backend/.../exception/GlobalExceptionHandler.java`, `frontend/.../registrar-cita/registrar-cita.component.ts`
- Apto para integrante: No (cambia el esquema y el contrato; necesita RFC)

### AUD-ROB-02 — Doble clic en "Confirmar Cita" crea 2 citas
- Severidad: Alta
- Relación con hallazgos existentes: H-012 (el backend acepta el duplicado). Es una causa nueva, en el frontend, distinta de AUD-LOG-03 (hora conservada al cambiar de fecha).
- Evidencia (`05-dobleclic-registrar.log`, `06-dosclics-latencia.log`; login real del paciente 42, médico 22):
  ```
  dblclick → respuesta POST /api/cita 200 {"idCita":118,...}
             respuesta POST /api/cita 200 {"idCita":119,...}
             POST /api/cita enviados: 2 | separacion ms: 1
             dialogos: ["Cita registrada con éxito","Cita registrada con éxito"]
  dos clics con 1500 ms de latencia simulada en el POST:
             durante la espera (1500 ms): boton habilitado= true | URL .../paciente/registrar-cita
             POST /api/cita enviados: 2 | separacion ms: 33 → idCita 120 y 121
  BD: 118 y 119 → 42/22/2026-12-14 11:00:00 ; 120 y 121 → 42/22/2026-12-14 11:20:00
  ```
  Causa: `registrar-cita.component.ts`. `registrarCita()` no tiene bandera de "enviando", y el botón (`[disabled]="!isValid()"`) sigue habilitado mientras el POST está en curso. En todo `features/`, `grep -i "cargando|loading|enviando"` no encuentra nada.
- Impacto en el negocio: un paciente impaciente o un mouse con rebote reserva dos veces la misma hora: ocupa dos turnos del médico y aparece duplicado en "Mis Citas" y en la lista del médico.
- Recomendación (con alternativas):
  - (a) Agregar `enviando = true` antes del POST, `false` en `error`, y `[disabled]="!isValid() || enviando"`.
  - (b) Además, `exhaustMap` sobre un `Subject` de envíos.
  - Lo mínimo es (a). AUD-ROB-01 sigue siendo necesario: con el índice único el segundo envío daría 409, y la pantalla mostraría "Error al registrar cita" después del éxito si no se aplica (a).
- Esfuerzo estimado: 1–2 horas con prueba unitaria.
- Archivos involucrados: `frontend/src/app/features/paciente/registrar-cita/registrar-cita.component.ts` y `.html`
- Apto para integrante: Sí (2 archivos, sin riesgo)

### AUD-ROB-03 — Médico: doble envío de Aceptar/Cancelar y acción contraria sobrescrita
- Severidad: Media
- Relación con hallazgos existentes: H-031 (el backend acepta cualquier transición, también Cancelada→Confirmada). Lo nuevo es el doble envío desde la pantalla.
- Evidencia (`07-dobleclic-medico.log`, `08-acciones-cruzadas.log`; login real del médico 22):
  ```
  dblclick en "Confirmar Aceptación" (cita 96):
    PUT enviados: 2 ["/api/citas/medico/22/96/estado {\"estado\":\"Confirmada\"}", (igual)] | separacion ms: 1
    GET de recarga de la lista tras la accion: 2
  dos clics con 1500 ms de latencia (cita 97, Cancelar):
    durante la espera (1500 ms): modal visible= true | boton confirmar habilitado= true
    PUT enviados: 2 ... | separacion ms: 215
  Aceptar con red lenta (solo el 1.er PUT demorado 1500 ms), cerrar el modal y Cancelar la misma cita (98):
    fila sigue en la lista tras cerrar el modal: 1
    94025 respuesta 200 Cancelada
    95239 respuesta 200 Confirmada
    ultima accion del medico: Cancelar  → BD: 98 Confirmada
  ```
  Causa: `medico-citas-pendientes.component.ts`. `executeAction()` no tiene bandera de envío, el modal no se cierra hasta la respuesta, y la fila sigue en la lista con sus botones activos.
- Impacto en el negocio: con la misma acción repetida el efecto es inocuo (mismo estado), pero con red lenta un médico que se corrige (Aceptar → Cancelar) puede terminar con la cita confirmada sin saberlo. El paciente asiste a una cita que el médico quiso cancelar.
- Recomendación (con alternativas):
  - (a) Bandera `procesando` que deshabilite "Confirmar" y los botones de la fila mientras hay un PUT en curso.
  - (b) Quitar la fila o marcarla como "procesando" al confirmar.
  - (c) En el backend, PUT condicional al estado esperado (`WHERE estado_cita = Pendiente`), que va con el RFC de H-031 y con AUD-ROB-04.
  - Lo mínimo es (a).
- Esfuerzo estimado: 1–2 horas.
- Archivos involucrados: `frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.ts` y `.html`
- Apto para integrante: Sí (2 archivos)

### AUD-ROB-04 — Cambios de estado concurrentes sin atomicidad
- Severidad: Media
- Relación con hallazgos existentes: H-031 y AUD-LOG-08 (sin máquina de estados). Aspecto nuevo: concurrencia.
- Evidencia (`16-estado-concurrente.log`, 6 PUT simultáneos y contradictorios sobre la cita 100, 17:48:45):
  ```
  1 pidio Confirmada: HTTP 200, respuesta dice estado=Confirmada
  2 pidio Cancelada: HTTP 200, respuesta dice estado=Cancelada
  3 pidio Confirmada: HTTP 200, respuesta dice estado=Cancelada
  ...
  BD: 100 Cancelada
  ```
  Causa: `CitaService.cambiarEstadoDeCitaDeMedico` hace `findById` → `save` → `findCitaMedicoPorId` sin `@Transactional` ni `@Version`. Gana la última escritura, y la respuesta vuelve a leer la cita después de que otra petición la cambió.
- Impacto en el negocio: dos actores sobre la misma cita (el médico en dos pestañas, o el médico y una llamada a la API) reciben "OK" con estados contradictorios. El cliente 3 creyó confirmar y recibió 200 con "Cancelada".
- Recomendación (con alternativas):
  - (a) `@Version` en `Cita` (bloqueo optimista) y 409 ante un conflicto.
  - (b) `UPDATE Cita SET estado_cita=? WHERE idCita=? AND estado_cita=?` (transición condicional, junto con la máquina de estados de H-031), con 409 si no afecta filas.
  - (b) resuelve a la vez H-031 y la carrera.
- Esfuerzo estimado: 0,5–1 día (junto con el RFC de H-031).
- Archivos involucrados: `backend/.../services/CitaService.java`, `backend/.../repository/CitaRepository.java`, `backend/.../model/Cita.java`
- Apto para integrante: No (depende del RFC de H-031)

### AUD-ROB-05 — Backend caído: estados vacíos engañosos, datos viejos y sin recuperación
- Severidad: Media
- Relación con hallazgos existentes: H-029 trata el caso inverso (mensaje de conexión ante errores que no son de conexión). Aquí falta el mensaje cuando sí es de conexión. Login (P18) y módulo médico (P11) avisan bien. Nuevo para el resto de las pantallas.
- Evidencia (`10-backend-caido.log`, 17:44:53–17:45:53, backend detenido; sesión puesta en localStorage; capturas en `capturas/caido-*.png`):
  | Pantalla | Qué muestra con el backend caído |
  |---|---|
  | login-paciente | "No se pudo conectar con el servidor. Intente nuevamente." (correcto) |
  | registrar-cita | Selects de especialidad y médico vacíos, sin ningún aviso; botón "Confirmar Cita" deshabilitado (captura `caido-paciente_registrar-cita.png`) |
  | mis-citas | "No tienes citas registradas." |
  | historial-medico | "No se encontró historia clínica para este paciente." |
  | médico (pendientes, confirmadas, pacientes) | "No se pudo conectar con el servidor…" (correcto) |
  | admin pacientes / médicos | "No hay pacientes registrados" / "No hay médicos registrados" |
  | admin reportes | "Total de Citas 0 … Total de Ingreso S/ 0.00", "No hay datos disponibles" (captura `caido-admin_reportes.png`) |
  | admin Gráficos | "No hay información disponible para el gráfico…" (×3) |
  | registro | "Error al registrar. Por favor intente nuevamente." (genérico) |

  Caída a mitad de uso (`09-transicion.log`, 3 pantallas abiertas con el backend arriba):
  ```
  17:44:49 B1. Registrar Cita, dialogos: ["Error al registrar cita"] | boton habilitado: true
  17:44:51 B2. Medico tras Confirmar Aceptacion: ["No se pudo conectar con el servidor..."] | tabla visible: 0 | modal visible: 0
  17:45:03 B3. reportes 12 s despues de la caida: ... Total de Citas 113 ... Total de Ingreso S/ 1,220.00 ...
  17:45:03 B3. errores de consola en reportes hasta ahora: 11 [... "Error al cargar resumen: HttpErrorResponse", "net::ERR_CONNECTION_REFUSED"]
  17:46:32 C2. medico sigue mostrando: ["No se pudo conectar con el servidor..."] | tabla visible: 0   (backend ya de vuelta)
  ```
  No hay pantallas en blanco ni spinners infinitos, porque no existe ningún indicador de carga. Causa: en `mis-citas.component.ts:34`, `historial-medico.component.ts:34,46` y `registrar-cita.component.ts:45,52,63,65`, los `subscribe` no tienen rama `error`. Los componentes de admin (`admin-pacientes`, `admin-medicos`, `admin-reportes`) solo hacen `console.error`. No hay `HttpInterceptor` ni `timeout(` en `frontend/src/app`. "Informes" consulta cada 10 s y conserva los últimos datos sin indicar que no se actualizan. La pantalla del médico vacía la tabla al fallar y no reintenta.
- Impacto en el negocio: el paciente cree que perdió sus citas o su historia clínica; el administrador ve "no hay pacientes" o ingresos de S/ 0.00, o cifras "en tiempo real" que están congeladas, y puede tomar decisiones con datos falsos. Con un backend lento (no caído) tampoco hay ningún indicador ni tope de espera.
- Recomendación (con alternativas):
  - (a) Por pantalla: agregar `error:` que muestre un mensaje de conexión y distinga "sin datos" de "no se pudo cargar"; un botón "Reintentar".
  - (b) Un `HttpInterceptor` global con `timeout` y un aviso común (banner) para `status 0`.
  - (c) En Informes, mostrar "Última actualización: hh:mm" y un aviso si falla la consulta periódica.
  - (a) se puede repartir por pantalla; (b) es más limpio pero toca la configuración global.
- Esfuerzo estimado: 1–2 horas por pantalla; (b) medio día.
- Archivos involucrados: `frontend/src/app/features/paciente/{mis-citas,historial-medico,registrar-cita}/*`, `features/admin/{pacientes,medicos,reportes,cant-estado-cita}/*`
- Apto para integrante: Sí, por pantalla (1–2 archivos cada una); (b) No

### AUD-ROB-06 — Errores 500 sin rastro en el log y dos formatos de error
- Severidad: Media
- Relación con hallazgos existentes: AUD-LOG-05 (validación → 500) y AUD-SEG-07 (fuga del mensaje). Lo nuevo es la falta de registro en el servidor y la inconsistencia del formato.
- Evidencia (`12-limites.log`, 17:47:11; log `backend2.log`):
  ```
  L1 GET /api/cita/2147483648 → {"message":"Method parameter 'id': Failed to convert ... For input string: \"2147483648\"","status":"error"} 500
  L3 POST id_medico 2147483648 → {"message":"JSON parse error: Numeric value (2147483648) out of range of int ...","status":"error"} 500
  L5 POST sin cuerpo → {"message":"Required request body is missing: public com.centro_valdiviezo.backend.model.Cita com.centro_valdiviezo...CitaController.crear(...)"} 500
  L8 GET /api/citas/medico/22/fecha/no-es-fecha → {"message":"JDBC exception executing SQL [select ... from Cita ...] [Incorrect DATE value: 'no-es-fecha']"} 500
  L4 POST Content-Type text/plain → {"timestamp":"...","status":415,"error":"Unsupported Media Type","path":"/api/cita"} 415
  L6 PATCH → {...,"status":405,"error":"Method Not Allowed",...} 405 ; L7 sin ?estado → {...,"status":400,"error":"Bad Request",...} 400
  ```
  ```
  $ grep -c "JSON parse\|Failed to convert\|Required request body\|StreamReadConstraints" backend2.log
  0
  ```
  Solo quedan en el log los errores SQL (porque Hibernate los registra con `SqlExceptionHelper`) y los 400/405/415 (`DefaultHandlerExceptionResolver`). `GlobalExceptionHandler.handleRuntimeException` (líneas 14-20) no usa logger. Hay dos formatos de cuerpo: `{"message","status":"error"}` para las `RuntimeException` y `{"timestamp","status","error","path"}` de Spring para el resto. El path id fuera de rango y la fecha mal escrita dan 500 en lugar de 400. `/api/citas/medico/{id}/fecha/{fecha}` es el endpoint que usa "Registrar Cita".
- Impacto en el negocio: en producción, un fallo de deserialización (por ejemplo, un cambio de contrato del frontend) devuelve 500 sin que el equipo lo vea en los logs. El frontend tiene que interpretar dos formatos de error.
- Recomendación (con alternativas):
  - (a) Agregar `private static final Logger` y `log.error("...", ex)` en el handler (cambio mínimo, no altera respuestas).
  - (b) Handlers específicos: `HttpMessageNotReadableException` y `MethodArgumentTypeMismatchException` → 400, con un formato único de error (por ejemplo, `ProblemDetail`). Va en el RFC de AUD-LOG-05.
- Esfuerzo estimado: (a) 30 min; (b) 0,5 día.
- Archivos involucrados: `backend/src/main/java/com/centro_valdiviezo/backend/exception/GlobalExceptionHandler.java`
- Apto para integrante: Sí, solo (a) (1 archivo, sin cambio de comportamiento externo); (b) No

### AUD-ROB-07 — Sin límite de tamaño del cuerpo; listado de citas sin paginación
- Severidad: Baja
- Relación con hallazgos existentes: H-013 (`GET /api/cita` devuelve todo) y AUD-REN (rendimiento). Lo nuevo es el tamaño del cuerpo de entrada.
- Evidencia (`13-cuerpos-grandes.log`, `14-recursos-get-cita.log`):
  ```
  G4 motivo de 10 MB: cuerpo 10.00 MB -> HTTP 500 en 638 ms | Data truncation: Data too long for column 'motivo'
  G5 motivo de 25 MB: cuerpo 25.00 MB -> HTTP 500 en 135 ms | JSON parse error: String value length (20051112) exceeds the maximum allowed (20000000, from `StreamReadConstraints...`)
  G6 motivo de 100 MB: ... mismo error de Jackson en 389 ms
  filas en Cita: 115 ; GET /api/cita -> HTTP 200, 16295 B, 0.011–0.014 s ; ?page=0&size=5 -> 16295 B (ignora la paginacion)
  elementos en la respuesta: 115 | bytes por cita aprox: 142
  ```
  El único tope efectivo es el de Jackson (20 millones de caracteres por string). Hasta ese tamaño, el cuerpo se lee entero en memoria y se envía a MySQL. `application.properties` no fija ningún límite. `CitaService.listarCitas` es `findAll()`, sin `Pageable`.
- Impacto en el negocio: hoy es bajo (16 KB para 115 citas, unos 142 B por cita: con 10.000 citas serían unos 1,4 MB por cada carga de "Mis Citas"). Varios cuerpos de unos 19 MB en paralelo pueden presionar la memoria del backend y del pool de MySQL. No lo probé en paralelo para no tumbar el backend (ver Limitaciones).
- Recomendación (con alternativas):
  - (a) Un filtro que rechace con 413 un `Content-Length` mayor que, por ejemplo, 64 KB en `/api/**`.
  - (b) El límite en el proxy de despliegue (`client_max_body_size` o equivalente).
  - (c) `@Size(max=255)` con validación (AUD-LOG-01).
  - Para el listado: endpoint por paciente o médico (H-013) o `Pageable`.
- Esfuerzo estimado: (a) 1–2 horas; paginación 0,5–1 día.
- Archivos involucrados: nuevo filtro en `backend/.../seguridad/` o `config`; `CitaController.java`, `CitaService.java` (paginación)
- Apto para integrante: Parcial (el filtro sí, 1 archivo nuevo; la paginación no, porque cambia el contrato)

## Revisado sin hallazgos
- **Unicode y emoji:** `motivo` con `😀🩺 ñandú 中文` y U+202E → 200. En la BD, `HEX` del emoji = `F09F9880` (utf8mb4 correcto), y el `GET` lo devuelve igual (G1).
- **Límite exacto de `motivo`:** 255 caracteres → 200 (cita 123). 256 → rechazado (con 500, ver AUD-LOG-05).
- **DNI duplicado en paralelo:** el `UNIQUE` funciona bajo carrera (1 de 5 creados).
- **Doble clic en "Registrar" (alta de paciente, `15-dobleclic-registro.log`):** salen 2 POST, pero el segundo da `500 Duplicate entry` y solo queda el paciente 49. La pantalla muestra "Registro exitoso" y navega a `/login-paciente`. No se verificó el orden inverso de llegada de las respuestas.
- **Códigos HTTP correctos de Spring:** `Content-Type` incorrecto → 415 (también en `/login`), método no soportado → 405, parámetro obligatorio ausente → 400 (solo cambia el formato, AUD-ROB-06).
- **Pool de conexiones:** 10 POST simultáneos atendidos en unos 80 ms sin errores (Hikari por defecto, 10 conexiones). Solo lo observé; la carga la mide otro agente.
- **Login y módulo médico con el backend caído:** muestran el mensaje de conexión (coincide con P18 y P11). Ninguna pantalla queda en blanco ni con un spinner infinito.

## Datos creados en la BD
Todos con `nombres = 'AUD-ROB'` o `motivo` que empieza con `AUD-ROB`. La BD se recarga al final.
- **Paciente:** 42 (DNI 74000001), 43 (74000002), 46 (74000010, prueba concurrente) y 49 (74000020, doble clic en registro). Los saltos de id (44, 45, 47, 48) son altas que fallaron por duplicado.
- **Médico:** 22 (DNI 74100001, CMP ROB001, especialidad 1, sin `Disponibilidad_Medico`: usa el horario por defecto de H-022).
- **Cita:** 96–123 (28 filas), todas del médico 22 y de los pacientes 42 y 43.
  - 2026-12-07 10:00 → 96, 97; 10:20 → 98–107; 10:40 → 108–117.
  - 2026-12-14 11:00 → 118, 119; 11:20 → 120, 121.
  - 2026-12-28 08:00 → 122 (unicode) y 123 (255 caracteres).
  - Estados finales: 96 Confirmada, 97 Cancelada, 98 Confirmada, 100 Cancelada; el resto, Pendiente.
- No se creó la cita "AUD-ROB transicion" ni el paciente 74000098, que se intentaron con el backend caído (verificado: `COUNT = 0`).
- No modifiqué registros que existían antes de la auditoría.

## Estado en que quedó el entorno (backend/frontend corriendo: evidencia)
- **Backend:** detenido una vez (autorizado) a las 17:44:45 con `taskkill //PID 12964 //F` ("Correcto: se terminó el proceso con PID 12964", `java.exe`). Lo reinicié con el comando indicado en segundo plano (log `scratchpad/backend2.log`; Maven: "Nothing to compile - all classes are up to date"). `Started CentroValdiviezoApplication in 5.225 seconds` a las 17:46:20, PID **29304**. Primer `curl` con 200 en `/api/especialidad` a las 17:46:22.
- Comprobación final, 17:49:27 y 17:50:09:
  ```
  /api/especialidad -> 200 ; /api/cita -> 200 ; /api/medico -> 200 ; /api/reportes/dashboard -> 200
  TCP 0.0.0.0:8080 LISTENING 29304
  ```
- **Diferencia con el estado inicial:** el backend ahora corre con `mvnw spring-boot:run` y su log es `backend2.log`. El log anterior (`backend.log`) ya no recibe líneas.
- **Frontend:** no lo toqué. `:4200 -> 200`, `[::1]:4200 LISTENING 25220`.
- **MySQL:** no se detuvo (PID 7744 en 3306).
- **Repositorio:** `git status --short` igual al inicio (`M docs/BITACORA.md`, `?? .claude/agents/`, `?? docs/auditoria/`). No modifiqué archivos del repositorio. Los scripts y las salidas están solo en el scratchpad.

## Limitaciones
- **BD caída:** no verificado (no se detiene el servicio de MySQL).
- **Latencia de red:** se simuló con `page.route` y una demora de 1500 ms en el cliente (AUD-ROB-02 y 03). Sin demora, el doble clic también produjo 2 peticiones (separación de 1 ms). No probé con una red real lenta.
- **Backend colgado** (que no responde, en lugar de rechazar la conexión): no verificado en ejecución. Que no hay `timeout` sale de la revisión de código (`grep "timeout("` sin resultados).
- **Cuerpos grandes en paralelo:** no los probé, para no arriesgar una segunda caída del backend (solo estaba autorizada una detención). El riesgo de memoria de AUD-ROB-07 es una deducción.
- **Recuperación de "Informes" al volver el backend:** a las 17:46:32 mostraba los mismos números que antes de la caída (113 citas). Como no hubo cambios entre medio, no puedo distinguir "se recuperó" de "siguió con los datos viejos". Sin registro concluyente.
- **Sesiones con el backend caído:** se pusieron en localStorage (con el backend caído no se puede iniciar sesión). Con el backend arriba usé el login real.
- **Pruebas del proyecto:** no ejecuté la batería de `docs/PRUEBAS.md` ni las de Maven (no se pidió, y no cambié código).
- **Nota sobre otro informe:** AUD-SEG-07 cita `GlobalExceptionHandler.java:161-167`, pero el archivo en LB-9 tiene 21 líneas; el handler está en las líneas 14-20. El contenido del hallazgo es correcto; solo la línea citada no coincide.
