# Registro de cambios — Posta Médica Valdiviezo

Este archivo resume, en lenguaje sencillo, qué cambia en cada versión publicada del sistema.
El detalle técnico de cada cambio está en su RFC (`docs/rfc/`), en `docs/HALLAZGOS.md` y en `docs/BITACORA.md`.

Las versiones siguen el formato MAYOR.MENOR.PARCHE:
- **PARCHE** (1.0.**1**): corrección urgente que se publica sola (hotfix).
- **MENOR** (1.**1**.0): un grupo de correcciones y mejoras que no obligan a cambiar la forma de usar el sistema.

---

## [1.1.0] — rama `release/1.1` (2026-11-12; se publica al unirla a `master`)

Línea base: **LB-11**. Versión en `backend/pom.xml` y `frontend/package.json`: `1.1.0`.

### Seguridad
- **Ahora hay que iniciar sesión para usar la API** (RFC-011, PR #57). Al entrar, el sistema entrega un *token* que vence a las 2 horas. Sin ese token, la API responde "Debe iniciar sesión".
- **Cada usuario ve solo lo suyo** (RFC-011). Un paciente ya no recibe las citas ni las historias clínicas de los demás; un médico no puede ver las citas de otro médico. Si alguien pide algo ajeno, recibe "No tiene permiso para este recurso".
- **Cada rol entra solo a sus pantallas** (RFC-011). Un paciente no puede abrir el panel del administrador ni el del médico, y viceversa.
- **La clave secreta de los tokens ya no está en el código** (RFC-011). Se lee de la variable de entorno `JWT_SECRET`; sin ella, el backend no arranca (ver `SETUP.md`).
- **Nada sensible en la consola del navegador** (RFC-014, PR #50). El login y el registro ya no muestran el DNI, la respuesta del servidor ni la contraseña.

### Correcciones
- **Ya no se puede reservar dos veces el mismo horario** con el mismo médico (RFC-012, PR #56). Si dos personas lo intentan a la vez, solo una lo consigue; la otra ve "Ese horario ya fue reservado. Elija otra hora." Cancelar una cita libera el horario.
- **El médico ya no puede aceptar o cancelar una cita dos veces por error** (RFC-015, PR #51). Los botones se desactivan mientras se guarda y aparece un mensaje que confirma la acción.
- **Los datos de ejemplo usan nombres inventados** (RFC-017, PR #55). Antes, 10 pacientes y 10 médicos de ejemplo tenían nombres de personas públicas reales. También se corrigieron las tildes que se veían mal (por ejemplo "Pediatr├¡a").
- **Los errores del servidor quedan registrados** en su log (RFC-014, PR #50), para poder investigarlos.

### Mejoras
- **Se puede usar en el celular** (RFC-013, PR #53). La pantalla de elección de rol y los paneles del médico y del administrador se adaptan a pantallas angostas. La página declara el idioma español y el título "Posta Médica Valdiviezo".
- **Listo para configurar en otro servidor** (RFC-016, PR #52). La base de datos, el puerto, el registro de consultas SQL y los orígenes permitidos (CORS) se configuran con variables de entorno; se agregó `vercel.json` para publicar el frontend en Vercel.

### Issues que se cierran con esta versión
| Issue | Hallazgo | Qué era | Lo resuelve |
|---|---|---|---|
| #12 | H-012 | Doble reserva del mismo horario | RFC-012 (PR #56) |
| #13 | H-013 | El navegador recibía datos de todos los pacientes | RFC-011 (PR #57) |
| #16 | H-016 | La API no pedía iniciar sesión | RFC-011 (PR #57) |
| #42 | H-042 | Datos de ejemplo con nombres de personas reales | RFC-017 (PR #55) |
| #43 | H-043 | Clave y DNI en la consola; errores sin registro | RFC-014 (PR #50) |
| #44 | H-044 | Doble envío al aceptar o cancelar (médico) | RFC-015 (PR #51) |
| #45 | H-045 | Idioma, título y uso en el celular | RFC-013 (PR #53) |
| #46 | H-046 | Backend no configurable para desplegar | RFC-016 (PR #52) |
| #54 | H-048 | Codificador de claves sin cifrado en la configuración de seguridad | RFC-011 (PR #57) |

También entra en esta versión:
- **PR #49**: lleva a `develop` el hotfix de la versión 1.0.1.
- **PR #58**: documentación de la revisión de los PR del grupo (tareas 22 y 23).
- **Script de la batería de regresión** (`e2e/bateria/`, EC-19), que ejecuta todas las pruebas del sistema con un solo comando.

### Antes de actualizar
- Definir la variable de entorno **`JWT_SECRET`** (al menos 32 bytes; ver `SETUP.md`). Sin ella el backend no arranca.
- Si la base de datos ya existe, aplicar `database/migraciones/RFC-012-slot-activo.sql` (la reversión es `RFC-012-slot-activo-revertir.sql`). Una base creada desde cero con `database/BDPostaMedica.sql` ya trae el cambio.

### Lo que sigue pendiente
- **P04**: el resumen del médico (`/api/medico/resumenMedico`) sigue respondiendo con error 500 (H-005, issue #5).
- **RFC-018** (formulario "Registrar Cita" a prueba de doble clic; H-047, issue #47): no entra en esta versión.
- La clave secreta de tokens antigua todavía aparece en el historial de Git (H-025); falta decidir si se purga.

### Pruebas de esta versión
Batería completa sobre `release/1.1` (2026-11-12): P01–P28 con **27 PASA y 1 FALLA (P04)**; pruebas unitarias del frontend 32/32 y 73/73; backend 97/97; Playwright 11/11; `ng build` de producción y `mvnw package` sin errores. Evidencia: `docs/evidencias/t27-release-v1.1.0.txt`.

---

## [1.0.1] — 2026-11-10 (hotfix)

Línea base: **LB-10**. Tag `v1.0.1` sobre el commit `0af31db` de `master`.

### Seguridad
- **Las contraseñas se guardan cifradas** con BCrypt en la base de datos (RFC-010, PR #48). Antes estaban en texto plano. Las contraseñas viejas se convierten solas al arrancar el backend.
- **La API ya no devuelve las contraseñas** en sus respuestas (RFC-010).

### Issues que se cierran con esta versión
| Issue | Hallazgo | Qué era | Lo resuelve |
|---|---|---|---|
| #7 | H-007 | Contraseñas en texto plano en la BD y en las respuestas de la API | RFC-010 (PR #48) |

El mismo cambio se llevó a `develop` con el PR #49.
