# Issues de la T3 (tarea 18) — listos para copiar a GitHub

Repositorio: `BrayanH0/posta-medica-valdiviezo`. Mismo formato que los issues #1–#41 (tarea 16).

**Antes de crear:**
1. Créalos **en este orden** (H-042, H-043, …, H-047) y **antes de abrir cualquier pull request**. En GitHub, issues y PR comparten la numeración. El 2026-11-10 a las 15:25 había 41 issues y 0 PR, así que H-042 quedará como #42, …, H-047 como #47, y las fichas usan esos números en "Closes #N".
2. Si algún número no coincide, corrige el "Closes #N" de la ficha correspondiente (`docs/entrega/fichas/`) antes de pasársela al integrante.
3. Las etiquetas siguen la convención de la tarea 16: gravedad (`critica`, `alta`, `media`, `baja`) + `bug` (Correctivo) o `mejora` (Preventivo/Adaptativo). Todas existen ya en el repositorio.
4. Después de crearlos, actualiza la tabla "Issues de GitHub" de `docs/HALLAZGOS.md` (hoy dice "por crear").

Al final de este archivo están los **comentarios para los issues existentes** #7, #12, #13 y #16, cuyos hallazgos se ampliaron con la auditoría.

---

## Issue 1 — H-042

**Título:** `H-042: Datos semilla con nombres de personas publicas reales`
**Etiquetas:** `bug`, `media`

**Cuerpo:**
```markdown
**Hallazgo:** H-042 (docs/HALLAZGOS.md) · Auditoría: AUD-NEG-14

## Descripción
Los datos semilla atribuyen estados de salud ("Fallecido", "En tratamiento", "Alta médica", "Inactivo") y citas con motivo clínico (por ejemplo "Arritmia", Cardiología) a 10 personas públicas reales e identificables (pacientes 6 a 15). El repositorio y las demos asocian diagnósticos a personas reales (riesgo reputacional y Ley 29733).

## Ubicación
`database/BDPostaMedica.sql:236-245` (`INSERT INTO Paciente`, pacientes 6 a 15)

**Gravedad:** Media  
**Tipo de mantenimiento:** Correctivo  
**Estado en HALLAZGOS.md:** Abierto

## Evidencia
AUD-NEG-14 (`docs/auditoria/AUD-negocio.md`), consulta del 2026-11-09 17:17. Ninguna prueba compara esos nombres (`grep` en e2e/tests, frontend/src, backend/src y docs/PRUEBAS.md, tarea 18).

## Cambio que lo atiende
RFC-017 (`docs/rfc/RFC-017.md`), estado Registrado. Cambia solo nombres y apellidos; no cambian IDs, DNI, claves ni citas.
```

---

## Issue 2 — H-043 (paquete P1)

**Título:** `H-043: Clave y DNI en la consola del navegador; errores 500 sin rastro en el log (P1)`
**Etiquetas:** `bug`, `media`

**Cuerpo:**
```markdown
**Hallazgo:** H-043 (docs/HALLAZGOS.md) · Auditoría: AUD-PRI-08, AUD-ROB-06 (opción a) · Paquete P1

## Descripción
1. El login de paciente, el de médico y el registro escriben en la consola del navegador el DNI, la respuesta completa del login y, en el registro, el objeto del paciente con la contraseña en claro (6 `console.log`).
2. `GlobalExceptionHandler` responde 500 sin registrar nada en el log del servidor: los errores de deserialización, de conversión de parámetros y de cuerpo faltante no dejan rastro.

## Ubicación
- `frontend/src/app/features/auth/registro/registro.component.ts:107,112`
- `frontend/src/app/features/auth/login-paciente/login-paciente.component.ts:35,38`
- `frontend/src/app/features/auth/login-medico/login-medico.component.ts:35,38`
- `backend/src/main/java/com/centro_valdiviezo/backend/exception/GlobalExceptionHandler.java:14-20`

**Gravedad:** Media  
**Tipo de mantenimiento:** Correctivo  
**Estado en HALLAZGOS.md:** Abierto

## Evidencia
AUD-PRI-08 (consola capturada con la clave del registro); AUD-ROB-06 (`grep` de los errores en el log → 0). Reproducido sobre develop en la tarea 18: `docs/evidencias/t18-verificacion-fichas.txt`.

## Cambio que lo atiende
RFC-014 (`docs/rfc/RFC-014.md`), estado Registrado. Ficha: `docs/entrega/fichas/FICHA_P1.md`. Rama: `feature/rfc-014-p1-consola-y-log`.
```

---

## Issue 3 — H-044 (paquete P3)

**Título:** `H-044: Medico - doble envio de Aceptar/Cancelar y sin confirmacion visible (P3)`
**Etiquetas:** `bug`, `media`

**Cuerpo:**
```markdown
**Hallazgo:** H-044 (docs/HALLAZGOS.md) · Auditoría: AUD-ROB-03, AUD-DIS-12 (parte del médico) · Paquete P3

## Descripción
En "Citas Pendientes" del médico, `executeAction()` no tiene bandera de envío: el modal no se cierra hasta la respuesta y la fila sigue con sus botones activos. Con doble clic se envían 2 PUT; con la red lenta, si el médico corrige (Aceptar → Cancelar), la cita puede quedar Confirmada sin que lo sepa. Tras confirmar o cancelar, la fila desaparece sin ningún aviso.

## Ubicación
- `frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.ts:48-63`
- `frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.html:28-29,45,56-59`

**Gravedad:** Media  
**Tipo de mantenimiento:** Correctivo  
**Estado en HALLAZGOS.md:** Abierto

## Evidencia
AUD-ROB-03 (2 PUT separados 1 ms; acciones cruzadas → la BD queda en Confirmada); AUD-DIS-12. Reproducido sobre develop en la tarea 18: 2 PUT con doble clic (`docs/evidencias/t18-verificacion-fichas.txt`).

## Cambio que lo atiende
RFC-015 (`docs/rfc/RFC-015.md`), estado Registrado. Ficha: `docs/entrega/fichas/FICHA_P3.md`. Rama: `feature/rfc-015-p3-medico-doble-envio`. La validación en el backend (máquina de estados) sigue en H-031.
```

---

## Issue 4 — H-045 (paquete P4)

**Título:** `H-045: Idioma y titulo del documento; paneles de medico y admin inutilizables a 360 px (P4)`
**Etiquetas:** `bug`, `alta`

**Cuerpo:**
```markdown
**Hallazgo:** H-045 (docs/HALLAZGOS.md) · Auditoría: AUD-DIS-07, AUD-DIS-02, AUD-DIS-01 · Paquete P4

## Descripción
1. `index.html` declara `lang="en"` y el título "ProyectoValdiviezo": los lectores de pantalla leen el español con pronunciación inglesa.
2. A 360 px, la tarjeta de `login-selection` (`min-width: 400px`) se sale de la pantalla.
3. A 360 px, los paneles de médico y de administrador no se pueden usar: la barra lateral (250 y 260 px) deja 110 y 100 px de contenido; la tabla de citas pendientes queda con 10 px. Ningún CSS fuera de `legacy/` tiene `@media`.

## Ubicación
- `frontend/src/index.html:2,5`
- `frontend/src/app/features/auth/login-selection/login-selection.component.css:16`
- `frontend/src/app/features/medico/medico-dashboard.component.css:7-14`
- `frontend/src/app/features/admin/dashboard/admin-dashboard.component.css:2`

**Gravedad:** Alta  
**Tipo de mantenimiento:** Correctivo  
**Estado en HALLAZGOS.md:** Abierto

## Evidencia
AUD-DIS-01, DIS-02, DIS-07 (`docs/auditoria/AUD-diseno.md`). Reproducido sobre develop en la tarea 18 con Playwright: a 360 px `scrollWidth` 380, médico `main` 110 y tabla 10, admin `main` 100.

## Cambio que lo atiende
RFC-013 (`docs/rfc/RFC-013.md`), estado Registrado. Ficha: `docs/entrega/fichas/FICHA_P4.md`. Rama: `feature/rfc-013-p4-accesibilidad-celular`.
```

---

## Issue 5 — H-046 (paquete P5)

**Título:** `H-046: Backend no configurable para desplegar - BD, puerto, show-sql, CORS fijo y sin vercel.json (P5)`
**Etiquetas:** `mejora`, `alta`

**Cuerpo:**
```markdown
**Hallazgo:** H-046 (docs/HALLAZGOS.md) · Auditoría: AUD-DES-05 / AUD-CAR-03, AUD-DES-03, AUD-DES-09 · Paquete P5

## Descripción
- La URL de la BD y `show-sql=true` están fijos y no hay `server.port` (AUD-DES-05). `show-sql` hizo crecer el log 155 MB en 16 minutos (AUD-CAR-03).
- El único origen CORS permitido está escrito en `WebSecurityConfig` (`http://localhost:4200`): el frontend publicado recibe 403 (AUD-DES-03).
- No hay `vercel.json`: en Vercel, recargar una ruta de Angular daría 404 (AUD-DES-09).

## Ubicación
- `backend/src/main/resources/application.properties:1,6`
- `backend/src/main/java/com/centro_valdiviezo/backend/seguridad/WebSecurityConfig.java:87`
- `frontend/vercel.json` (no existe)

**Gravedad:** Alta  
**Tipo de mantenimiento:** Adaptativo  
**Estado en HALLAZGOS.md:** Abierto

## Evidencia
AUD-DES-03 (preflight con `Origin` de Vercel → 403), AUD-DES-05, AUD-DES-09, AUD-CAR-03 (`docs/auditoria/`).

## Cambio que lo atiende
RFC-016 (`docs/rfc/RFC-016.md`), estado Registrado. Ficha: `docs/entrega/fichas/FICHA_P5.md`. Rama: `feature/rfc-016-p5-config-despliegue`.
```

---

## Issue 6 — H-047 (paquete P2, opcional)

**Título:** `H-047: Registrar Cita - doble clic, hora que no corresponde a la fecha, fecha minima en UTC (P2)`
**Etiquetas:** `bug`, `alta`

**Cuerpo:**
```markdown
**Hallazgo:** H-047 (docs/HALLAZGOS.md) · Auditoría: AUD-ROB-02, AUD-LOG-03, AUD-LOG-14 / AUD-NEG-13 / AUD-DES-14 · Paquete P2 (opcional)

## Descripción
1. "Confirmar" sigue activo durante el POST y el doble clic crea 2 citas (AUD-ROB-02).
2. Al cambiar de fecha o de médico se conserva la hora elegida aunque no esté entre las ofrecidas (AUD-LOG-03).
3. La fecha mínima se calcula en UTC (desde las 19:00 de Lima bloquea el día de hoy) y el motivo acepta solo espacios o más de 255 caracteres (AUD-LOG-14, AUD-NEG-13, AUD-DES-14).

No reemplaza la corrección en el backend (H-012 / RFC-012).

## Ubicación
- `frontend/src/app/features/paciente/registrar-cita/registrar-cita.component.ts`
- `frontend/src/app/features/paciente/registrar-cita/registrar-cita.component.html`

**Gravedad:** Alta  
**Tipo de mantenimiento:** Correctivo  
**Estado en HALLAZGOS.md:** Abierto

## Evidencia
AUD-ROB-02, AUD-LOG-03, AUD-LOG-14, AUD-NEG-13, AUD-DES-14 (`docs/auditoria/`).

## Cambio que lo atiende
RFC-018 (`docs/rfc/RFC-018.md`), estado Registrado (opcional). Sin ficha todavía.
```

---

## Comentarios para los issues existentes

Pegar cada uno como **comentario** en su issue (no se crea un issue nuevo, porque la causa es la misma).

### #7 (H-007)
```markdown
**Actualización (tarea 18, 2026-11-10):** la auditoría de la tarea 17 confirmó H-007 en LB-9 y lo amplió (AUD-SEG-05, AUD-PRI-03, AUD-SEG-09):
- También el administrador (`UsuarioModel`); `GET /usuarios` devuelve su clave.
- En el uso normal, un paciente recibe las claves de los médicos ("Registrar Cita" y "Mis Citas" piden `/api/medico`).
- Los 3 autenticadores comparan en texto plano con `equals` y el `PasswordEncoder` es `NoOpPasswordEncoder`.

**Cambio que lo atiende:** RFC-010 (hotfix de emergencia, estado Registrado): hash BCrypt, `matches()` en los 3 autenticadores, `clave` WRITE_ONLY en la API y migración de las claves existentes. Rama `hotfix/rfc-010-claves-seguras` desde `master`.
```

### #12 (H-012)
```markdown
**Actualización (tarea 18, 2026-11-10):** la auditoría de la tarea 17 amplió H-012:
- En paralelo se guardan 10 de 10 reservas al mismo horario (AUD-ROB-01). "Consultar y luego insertar" tampoco lo evita: no hay UNIQUE ni bloqueo.
- También con doble clic (AUD-ROB-02) y al cambiar de fecha en el formulario (AUD-LOG-03); acaparamiento de turnos (AUD-NEG-01, AUD-CAR-02).

**Cambio que lo atiende:** RFC-012 (estado Registrado): `UNIQUE (id_medico, fecha_cita, hora_cita)` + 409 con un mensaje propio. El formulario se atiende aparte en H-047 / RFC-018.
```

### #13 (H-013)
```markdown
**Actualización (tarea 18, 2026-11-10):** la auditoría de la tarea 17 amplió H-013:
- Diagnósticos (incluido VIH), alergias y anotaciones clínicas se leen sin sesión y se cruzan con nombre y DNI (AUD-PRI-01).
- La identidad del paciente sale de `localStorage.userId`: cambiando ese valor se ve la historia de otro paciente (AUD-PRI-02, IDOR).
- "Registrar Cita" recibe las citas de otros pacientes (AUD-PRI-04); el médico pide pacientes de otros médicos (AUD-PRI-10); no hay guardas de ruta por rol (AUD-DIS-14).

**Cambio que lo atiende:** RFC-011 (estado Registrado), junto con H-016: JWT en el login, endpoints protegidos por rol, el servidor toma la identidad del token y cada paciente solo accede a lo suyo.
```

### #16 (H-016)
```markdown
**Actualización (tarea 18, 2026-11-10):** la auditoría de la tarea 17 confirmó H-016 en LB-9 y lo amplió:
- Ningún endpoint exige identidad (AUD-SEG-01, AUD-DES-01).
- IDOR: cambiando el ID se leen, modifican y borran datos ajenos (AUD-SEG-02).
- Sin sesión se crea un administrador (AUD-SEG-03); el campo `rol` es texto libre (AUD-LOG-17).
- Reservas masivas sin autenticación (AUD-CAR-02). Bloquea el despliegue.

**Cambio que lo atiende:** RFC-011 (estado Registrado): JWT al iniciar sesión, endpoints protegidos por rol, cada paciente solo accede a lo suyo, interceptor en el frontend.
```
