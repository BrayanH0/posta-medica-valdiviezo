# AUD-SEG — Auditoría de seguridad (OWASP Top 10)

Ejecución: 2026-11-09 16:59:13 – 17:21:39 (-05:00). Entorno: repo `Proyecto` en `master`, LB-9 (tag `ENTREGA-T2-2-g3200a4d`); backend Spring Boot en `http://localhost:8080` (`show-sql` activo), frontend Angular en `http://localhost:4200`, MySQL `posta_medica_valdiviezo` (recargada 16:57:43: 21 citas, 15 pacientes). Pruebas solo contra localhost con `curl` y `mysql` local. Secretos enmascarados.

## Resumen

| ID | Título | Severidad | OWASP | Relación | Apto integrante |
|---|---|---|---|---|---|
| AUD-SEG-01 | La API no exige autenticación en ningún endpoint | Crítica | A01 Broken Access Control | H-016 | No |
| AUD-SEG-02 | IDOR: leer y modificar datos de cualquier paciente/cita cambiando el ID | Crítica | A01 / A04 | H-013, H-016 | No |
| AUD-SEG-03 | Escalada de privilegios: crear un administrador sin sesión | Crítica | A01 | Nuevo (deriva de H-016) | No |
| AUD-SEG-04 | Mass assignment: sobrescribir cuenta y robar/cambiar clave con POST `.../crear` | Crítica | A01 / A08 | Nuevo | No |
| AUD-SEG-05 | Contraseñas en texto plano guardadas y devueltas por la API | Crítica | A02 Cryptographic Failures | H-007 | No |
| AUD-SEG-06 | `/login` sin límite de intentos, bloqueo ni retardo (fuerza bruta) | Alta | A07 Auth Failures | Nuevo | No |
| AUD-SEG-07 | Mensajes 500 filtran SQL, tablas y restricciones (fuga de información) | Media | A05 Misconfiguration | Nuevo | Sí |
| AUD-SEG-08 | Secreto de firma JWT escrito en el código y en el historial de Git | Alta | A02 / A05 | H-025 | Sí |
| AUD-SEG-09 | Configuración de seguridad débil: `NoOpPasswordEncoder`, CSRF off, sin HSTS/CSP | Media | A05 Misconfiguration | H-016, H-007 | Parcial |

## Hallazgos

### AUD-SEG-01 — La API no exige autenticación en ningún endpoint
- Severidad / Categoría OWASP: Crítica / A01 Broken Access Control.
- Relación con hallazgos existentes: H-016 (confirmado y ampliado).
- Causa: `WebSecurityConfig.filterChain` usa `.anyRequest().permitAll()` ("Permitir todo para pruebas") y los filtros JWT están comentados (`backend/.../seguridad/WebSecurityConfig.java:34-36,41,43-44`). Sin filtro de autenticación, cualquier petición sin credenciales accede a todo.
- Evidencia (16:59–17:02, sin cabecera de sesión ni token):
  - `curl http://localhost:8080/usuarios` → `200` `[{"id":1,"apellidos":"Principal","dni":"87654321","clave":"<clave admin>","rol":"ADMIN","nombre":"Admin"}]`
  - `curl http://localhost:8080/api/paciente/codigo/2` → `200` con todos los datos de otro paciente (DNI, teléfono, `"clave":"123456"`).
  - `curl http://localhost:8080/api/historia_clinica/2` → `200 {"id_paciente":2,...,"tipo_sangre":"A+","alergias":"Penicilina"}` (dato de salud sensible, Ley 29733).
  - `curl http://localhost:8080/api/citas/medico/2/pacientes` → `200` con la lista de pacientes de otro médico (nombres, DNI, teléfono, departamento).
- Impacto: exposición y manipulación total de datos de salud de todos los pacientes sin credenciales. Al desplegar el backend en un host público (Vercel + host externo) la base queda abierta a Internet. Incumple la Ley 29733 (datos sensibles de salud).
- Recomendación (con alternativas): activar la cadena de seguridad real —reactivar `JWTAuthenticationFilter`/`JWTAuthorizationFilter`, cambiar `permitAll()` por `authenticated()` y exigir rol por ruta (`/usuarios`, `/api/reportes`, administración → `ROLE_ADMIN`)—; `/login` y catálogos de solo lectura con política explícita. Alternativa mínima mientras se implementa JWT: colocar el backend en red privada y un gateway con autenticación. No es un parche de 1 archivo: requiere diseño de autorización.
- Esfuerzo estimado: Alto (varios días; toca seguridad, controladores y pruebas).
- Archivos involucrados: `backend/.../seguridad/WebSecurityConfig.java`, `.../seguridad/JWTAuthenticationFilter.java`, `.../seguridad/JWTAuthorizationFilter.java`, y todos los controladores.
- Apto para integrante: No (cambio grande y de riesgo).

### AUD-SEG-02 — IDOR: leer y modificar datos de cualquier paciente/cita cambiando el ID
- Severidad / Categoría OWASP: Crítica / A01 + A04 Insecure Design.
- Relación con hallazgos existentes: H-013 (el frontend descarga todo y filtra en el navegador) y H-016; el IDOR de **escritura** se reproduce aquí.
- Causa: los endpoints reciben el ID por la URL/cuerpo y operan sin comprobar a quién pertenece el recurso ni quién lo pide (`CitaController.java:155-163` `PUT/DELETE /api/cita/{id}`; `CitaConsultaController.java:49-63` cambia estado solo validando que la cita sea del `idMedico` **que manda el propio cliente**; `PacienteController.java:39-45`). El backend confía en el `idMedico`/`idPaciente` enviado por el cliente.
- Evidencia (17:02, sobre un registro propio AUD-SEG, cita 41):
  - `PUT /api/cita/41` sin sesión con `{"id_paciente":21,"id_medico":2,"estado_cita":3,...}` → `200`, reasignó la cita a otro médico y cambió su estado.
  - `PUT /api/citas/medico/2/41/estado` con `{"estado":"Atendida"}` → `200` (cualquiera dice ser "médico 2" y cambia el estado; sin máquina de estados, ver H-031). Respuesta devolvió nombres/DNI del paciente.
  - Lectura cruzada ya mostrada en AUD-SEG-01 (`/api/historia_clinica/2`, `/api/medico/codigo/2` con `"clave":"123456"`).
- Impacto: cualquier usuario puede leer historiales clínicos ajenos y alterar/cancelar citas de otros, sin dejar rastro de identidad.
- Recomendación: tras implementar autenticación (AUD-SEG-01), derivar el ID del paciente/médico del token, no del parámetro; validar propiedad del recurso en el servicio antes de leer/escribir; devolver 403 si no corresponde.
- Esfuerzo estimado: Alto (depende de AUD-SEG-01).
- Archivos involucrados: `CitaController.java`, `CitaConsultaController.java`, `PacienteController.java`, `Historia_ClinicaController.java`, servicios asociados.
- Apto para integrante: No.

### AUD-SEG-03 — Escalada de privilegios: crear un administrador sin sesión
- Severidad / Categoría OWASP: Crítica / A01.
- Relación con hallazgos existentes: Nuevo (consecuencia concreta de H-016; no estaba demostrado).
- Causa: `POST /usuarios/nuevo` (`UsuarioController.java:30`, `UsuarioService.save`) guarda cualquier `UsuarioModel`, incluido `rol:"ADMIN"`, sin autenticación.
- Evidencia (17:02): `curl -d '{"nombre":"AUD-SEG","apellidos":"AdminEscalado","dni":"91919191","clave":"audseg-01","rol":"ADMIN"}' http://localhost:8080/usuarios/nuevo` → `200 {"id":2,...,"rol":"ADMIN"}`; luego `POST /login` con `91919191/audseg-01` → `200 {"tipo":"administrador","rol":"ADMIN","id":2}`. Un anónimo se convirtió en administrador funcional.
- Impacto: toma de control administrativo del sistema desde Internet.
- Recomendación: proteger `/usuarios/**` con `ROLE_ADMIN`; nunca aceptar el campo `rol` desde el cuerpo público.
- Esfuerzo estimado: Medio (depende de AUD-SEG-01 para el control de rol).
- Archivos involucrados: `UsuarioController.java`, `UsuarioService.java`, `WebSecurityConfig.java`.
- Apto para integrante: No.

### AUD-SEG-04 — Mass assignment: sobrescribir una cuenta y cambiar su clave con `.../crear`
- Severidad / Categoría OWASP: Crítica / A01 + A08 Integrity Failures.
- Relación con hallazgos existentes: Nuevo.
- Causa: `save()` de JPA actúa como *upsert*: si el cuerpo trae un ID existente, reemplaza el registro. `PacienteController.crear` y `UsuarioController.crear` pasan la entidad entera (`crearPaciente`→`pacienteRepository.save` en `PacienteService.java:89-94`; `UsuarioService.save:21`) con todos los campos editables, incluida `clave`.
- Evidencia (17:02, registro propio AUD-SEG 21):
  - `POST /api/paciente/crear` con `{"idPaciente":21,"clave":"nueva-clave",...}` → `200`; MySQL confirma `clave_cambiada=1` para `idPaciente=21` (un solo registro, no se duplicó). Luego `POST /login` con el DNI y `"nueva-clave"` → `200 success:true`. Secuestro de cuenta reescribiendo la clave.
  - `POST /usuarios/nuevo` con `{"id":2,...,"clave":"audseg-03"}` → `200` sobrescribió al administrador 2; login con la nueva clave → `200`.
- Impacto: toma de control de cualquier cuenta (paciente, médico o admin) conociendo solo su ID, sin la contraseña anterior.
- Recomendación: no exponer entidades JPA en el cuerpo; usar DTO de creación sin ID; en actualización, no permitir cambiar la clave por esta vía; endpoint de cambio de clave separado y autenticado.
- Esfuerzo estimado: Medio.
- Archivos involucrados: `PacienteController.java`, `PacienteService.java`, `UsuarioController.java`, `UsuarioService.java`, `MedicoService.java` (mismo patrón `save`).
- Apto para integrante: No (toca varios archivos y lógica de datos).

### AUD-SEG-05 — Contraseñas en texto plano guardadas y devueltas por la API
- Severidad / Categoría OWASP: Crítica / A02 Cryptographic Failures.
- Relación con hallazgos existentes: H-007 (confirmado; ampliado a `/usuarios`).
- Causa: la clave se guarda sin cifrar (`PasswordEncoder` = `NoOpPasswordEncoder`, `WebSecurityConfig.java:49-53`; el `BCrypt` está comentado en `PacienteService.java:90-92`) y las entidades `Paciente`/`Medico`/`UsuarioModel` exponen `clave` en el JSON.
- Evidencia: `/api/paciente/codigo/2` → `"clave":"123456"`; `/api/medico/codigo/2` → `"clave":"123456"`; `/usuarios` → clave del admin en claro. En la BD `SELECT * FROM Administrador` muestra la clave en texto plano.
- Impacto: fuga masiva de credenciales; con AUD-SEG-01 cualquiera las descarga. Las personas reutilizan contraseñas: el daño trasciende el sistema.
- Recomendación: cifrar con BCrypt al crear/actualizar; migrar las claves existentes; excluir `clave` de la serialización (`@JsonIgnore` o DTO de salida). Validar login contra el hash.
- Esfuerzo estimado: Medio.
- Archivos involucrados: `model/Paciente.java`, `model/Medico.java`, `model/UsuarioModel.java`, los `Autenticador*`, `WebSecurityConfig.java`, servicios de creación.
- Apto para integrante: No (requiere migración de datos y cambio en login).

### AUD-SEG-06 — `/login` sin límite de intentos, bloqueo ni retardo
- Severidad / Categoría OWASP: Alta / A07 Identification and Authentication Failures.
- Relación con hallazgos existentes: Nuevo.
- Causa: `AuthController.login` recorre los autenticadores y responde 401 sin registrar ni limitar intentos; no hay bloqueo de cuenta, captcha ni backoff.
- Evidencia (17:01): 20 intentos con clave incorrecta contra el DNI admin `87654321` → los 20 responden `401` en 0.006–0.013 s; el intento 21 con la clave correcta → `200`. No hubo bloqueo ni demora creciente (tiempos planos). Enumeración por DNI: 5 peticiones con DNI existente y 5 con inexistente dieron idéntico `401`, mismo tamaño (35 B) y mismos tiempos → el login **no** permite enumerar DNIs (aspecto positivo), pero los datos quedan expuestos por AUD-SEG-01 de todos modos.
- Impacto: fuerza bruta de contraseñas (de 6 dígitos como las de prueba) en segundos.
- Recomendación: limitar intentos por DNI/IP (p. ej. bloqueo temporal tras N fallos), retardo incremental y registro de auditoría; combinar con contraseñas fuertes. Alternativa: rate limiting en un gateway/proxy.
- Esfuerzo estimado: Medio.
- Archivos involucrados: `controller/AuthController.java`, nueva lógica/almacén de intentos.
- Apto para integrante: No (introduce estado y política nueva).

### AUD-SEG-07 — Mensajes 500 filtran SQL, nombres de tablas y restricciones
- Severidad / Categoría OWASP: Media / A05 Security Misconfiguration (fuga de información).
- Relación con hallazgos existentes: Nuevo (el `GlobalExceptionHandler` no estaba evaluado en seguridad).
- Causa: `GlobalExceptionHandler.handleRuntimeException` (`exception/GlobalExceptionHandler.java:161-167`) devuelve `ex.getMessage()` tal cual al cliente; además `AuthController` hace `e.printStackTrace()` y devuelve `"Error interno: " + e.getMessage()`.
- Evidencia (17:01):
  - `POST /api/cita` con médico inexistente → `500 {"message":"... a foreign key constraint fails (`posta_medica_valdiviezo`.`cita`, CONSTRAINT `cita_ibfk_3` FOREIGN KEY (`id_medico`) REFERENCES `medico`...)] [insert into Cita (...) values (?,?,?,?,?,?)] ...","status":"error"}` — expone esquema, nombres de tablas/columnas, constraints y la sentencia SQL.
  - `POST /api/paciente/crear` con DNI duplicado → `500 {"message":"... Duplicate entry '60000010' for key 'paciente.dni' [insert into Paciente (...)] ..."}`.
  - `PUT /api/paciente/actualizar/999999` → `500 {"message":"No value present"}` (NPE de `Optional.get()`); `/login` con JSON roto → `500 {"message":"JSON parse error..."}`.
- Impacto: facilita el reconocimiento del esquema y la construcción de ataques; revela estructura interna.
- Recomendación: devolver mensajes genéricos ("Error interno") con un ID de correlación; registrar el detalle solo en el log del servidor; manejar duplicados/FK como 409/400 con texto neutro; quitar `printStackTrace` y la concatenación de `e.getMessage()`.
- Esfuerzo estimado: Bajo (1 archivo principal, `GlobalExceptionHandler`, + un ajuste en `AuthController`).
- Archivos involucrados: `exception/GlobalExceptionHandler.java`, `controller/AuthController.java`.
- Apto para integrante: Sí (1–2 archivos, sin riesgo de regresión funcional).

### AUD-SEG-08 — Secreto de firma JWT en el código y en el historial de Git
- Severidad / Categoría OWASP: Alta / A02 + A05.
- Relación con hallazgos existentes: H-025 (confirmado; además sigue en el historial).
- Causa: `TokenUtils.java:15` define `private final static String ACCESS_TOKEN_SECRET = "<SECRETO JWT ENMASCARADO>"` (32 caracteres) usado para firmar y validar los JWT. Está versionado.
- Evidencia: `grep ACCESS_TOKEN_SECRET` → `backend/.../seguridad/TokenUtils.java:15,28,37`. `git log -S "<secreto>" -- backend` → aparece desde el commit inicial `17e2118` y permanece en `HEAD` (a diferencia de la contraseña de MySQL de H-006, que sí se purgó en RFC-009). Hoy los filtros JWT están desactivados (AUD-SEG-01), pero al reactivarlos el secreto ya es público.
- Impacto: cuando se active JWT, cualquiera que vea el repo puede firmar tokens válidos y suplantar a cualquier usuario.
- Recomendación: mover el secreto a variable de entorno (como se hizo con `DB_PASSWORD`), generar uno nuevo y, si el repo es/será público, purgarlo del historial con `git filter-repo` (igual que en la tarea 15). Enmascarado en este informe por la regla.
- Esfuerzo estimado: Bajo (1 archivo + variable de entorno; la purga del historial es aparte).
- Archivos involucrados: `backend/.../seguridad/TokenUtils.java`, configuración de entorno.
- Apto para integrante: Sí (el cambio de código es de 1 archivo; la purga del historial la coordina el responsable, como en RFC-009).

### AUD-SEG-09 — Configuración de seguridad débil (encoder, CSRF, cabeceras)
- Severidad / Categoría OWASP: Media / A05 Security Misconfiguration.
- Relación con hallazgos existentes: apoya H-016 y H-007.
- Causa y evidencia:
  - `NoOpPasswordEncoder` (`WebSecurityConfig.java:52`) — no cifra contraseñas (ligado a AUD-SEG-05).
  - CSRF deshabilitado (`WebSecurityConfig.java:38`): hoy no hay sesión por cookie, así que el riesgo es bajo, pero debe revisarse al añadir autenticación por cookie.
  - Cabeceras: el backend envía `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` (positivo), pero **no** `Strict-Transport-Security` ni `Content-Security-Policy`. El frontend `http://localhost:4200` no envía ninguna cabecera de seguridad (es el `ng serve` de desarrollo; en producción/Vercel deberán configurarse CSP, HSTS, X-Frame-Options).
  - `application.properties`: `spring.jpa.hibernate.ddl-auto=none` (correcto, no altera el esquema) pero `spring.jpa.show-sql=true` (activo; conviene desactivarlo en producción para no volcar SQL a los logs).
  - CORS correcto: preflight y GET desde `Origin: http://ajeno.example` → `403`; desde `http://localhost:4200` → `200` con `Access-Control-Allow-Origin: http://localhost:4200` y `Allow-Credentials: true` (coherente con H-010/RFC-005).
- Impacto: sin HSTS/CSP en producción aumenta el riesgo de downgrade y de XSS; `show-sql` filtra consultas a los logs.
- Recomendación: BCrypt (ver AUD-SEG-05); añadir HSTS y CSP en el despliegue (backend host y Vercel); `show-sql=false` en producción; revisar CSRF cuando haya sesión por cookie.
- Esfuerzo estimado: Bajo–Medio, repartido.
- Archivos involucrados: `WebSecurityConfig.java`, `application.properties`, configuración de Vercel/host.
- Apto para integrante: Parcial (desactivar `show-sql` y añadir cabeceras en `WebSecurityConfig` es apto, 1 archivo; el encoder no, por la migración).

## Revisado sin hallazgos
- **Inyección SQL/JPQL (A03):** probada y **no explotable**. Las `@Query` nativas de `CitaRepository`, `MedicoRepository`, `Disponibilidad_MedicoRepository` usan parámetros posicionales (`?1`), no concatenan entrada del usuario. Payloads contra `/api/medico/apellidos/' OR '1'='1`, `/api/medico/nombres/x' OR 1=1-- `, `/api/citas/medico/1/fecha/<inyección>`, `/api/citas/medico/1?estado=Pendiente' OR '1'='1` → `200` con `[]` (0 filas), sin evasión. El log de Hibernate confirma consultas parametrizadas (`... where c1_0.fecha_cita=?`, `... nombres like ? escape '\'`). Inyección en `/login` → `401`. Los IDs de ruta son `Integer`: `1 OR 1=1` da `500` de conversión de tipo, no inyección. `UsuarioRepository.listaUsuario` usa `@Param` (parametrizado).
- **XSS (A07/A03):** el backend **almacena** HTML/script sin sanear (creé paciente con `nombres` = `AUD-SEG<img src=x onerror=alert(1)>` y cita con `motivo` = `AUD-SEG <script>alert(1)</script>`, ambos `200` y persistidos), pero el frontend Angular usa interpolación `{{ }}`, que escapa por defecto; no hay `innerHTML`, `bypassSecurityTrust*`, `DomSanitizer`, `insertAdjacentHTML` ni `document.write` en `frontend/src` (grep sin resultados). Por ahora el XSS almacenado **no se dispara** en la UI actual; queda como riesgo latente si en el futuro se renderiza con `[innerHTML]`. Recomendación preventiva: validar/sanear entradas en el backend.
- **Enumeración de usuarios por `/login`:** no vulnerable (DNI existente vs. inexistente dan 401 idéntico en código, tamaño y tiempo).
- **Actuator / consolas / docs expuestas:** `/actuator`, `/actuator/env`, `/actuator/health`, `/h2-console`, `/swagger-ui.html`, `/v3/api-docs` → `404` (no expuestos).
- **Contraseña de MySQL:** no está en el código ni en el historial reciente (`application.properties` usa `${DB_PASSWORD}`; H-006/RFC-009 cerrado, verificado).
- **Secretos en el repo:** aparte del JWT (AUD-SEG-08), el grep no encontró otras claves/tokens incrustados en `backend/src/main/resources` ni `frontend/src` (las coincidencias son nombres de campos `password`/`token` de UI y de `usuario.ts`, no valores).

## Datos creados en la BD
Todos con prefijo AUD-SEG, para demostrar AUD-SEG-02/03/04 (no se alteró ningún registro preexistente; solo registros propios). La BD se recarga al final.
- `Administrador` id **2**: DNI `91919191`, nombre "AUD-SEG AdminEscalado2", rol ADMIN (creado por `/usuarios/nuevo`, luego sobrescrito por mass assignment).
- `Paciente` id **21**: DNI `91919192`, "AUD-SEG sobrescrito / via crear" (creado con payload XSS en `nombres`, luego sobrescrito y clave cambiada a `nueva-clave`).
- `Cita` id **41**: `id_paciente=21`, `id_medico=2` (reasignada), `motivo` con `<script>` de prueba, estado quedó "Atendida" tras las pruebas IDOR.

Nota: en `/api/citas/medico/3?estado=Atendida` se observaron registros con prefijo `AUD-NEG` (idPaciente 19, etc.) creados por otro auditor en paralelo; se ignoraron según lo indicado.

## Limitaciones
- No se reiniciaron ni detuvieron backend, frontend ni MySQL; no se ejecutó build de Maven.
- La fuerza bruta se demostró con 20 intentos (no miles), según la regla; la carga la cubre otro agente.
- El XSS almacenado se verificó a nivel de persistencia de la API, no renderizándolo en el navegador (Playwright no se usó); la conclusión de "no se dispara" se basa en el análisis estático del frontend (ausencia de sinks peligrosos), no en una prueba E2E.
- Las cabeceras del frontend se midieron sobre `ng serve` (desarrollo); el comportamiento en Vercel dependerá de su configuración, aún no disponible.
- Secretos (clave de admin, secreto JWT, contraseña de MySQL) enmascarados en el informe conforme a las reglas del agente.
