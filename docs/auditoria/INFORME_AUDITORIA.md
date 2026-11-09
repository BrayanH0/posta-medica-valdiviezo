# Informe consolidado de auditoría (tarea 17)

**Sistema:** posta médica Valdiviezo, rama `master`, commit `3200a4d` (LB-9 + docs). **Fecha:** 2026-11-09, de 16:53 a 18:04 (hora del sistema).
**Tipo:** auditoría de solo lectura y pruebas contra `localhost`. **No se corrigió nada.**
**Fuentes:** los 9 informes de esta carpeta (`AUD-negocio.md`, `AUD-seguridad.md`, `AUD-privacidad.md`, `AUD-logica.md`, `AUD-robustez.md`, `AUD-carga.md`, `AUD-rendimiento.md`, `AUD-diseno.md`, `AUD-despliegue.md`). Cada hallazgo tiene allí su evidencia reproducible (comando y resultado), o dice "no verificado". Este informe solo agrupa y prioriza.

## Cómo se ejecutó
- Agentes en `.claude/agents/auditor-*.md`: `model: opus`; herramientas `Read, Grep, Glob, Bash`; sin `Edit, Write, NotebookEdit`.
- En esta sesión los agentes no se pudieron invocar por su nombre, porque se crearon después de iniciarla. Se ejecutaron como agentes `general-purpose` con la misma definición y el mismo `effort`. Así, la restricción de herramientas fue por instrucción, no impuesta por el sistema. Al terminar, `git status` muestra que ningún agente modificó archivos del repositorio. Detalle en `docs/BITACORA.md`.
- Los agentes son de solo lectura, así que cada uno devolvió su informe y el orquestador lo guardó con Write sin cambios.
- **Orden:**
  - Primera ola en paralelo: negocio, seguridad, privacidad, lógica, rendimiento, diseño y despliegue.
  - Después, robustez sola: detuvo y reinició el backend.
  - Al final, carga sola: inundó la BD con 3900 citas.
- **Interrupción:** los 7 agentes de la primera ola se cortaron entre las 17:03 y las 17:20 por el límite de gasto de la API (HTTP 429). Se retomaron con su contexto, y cada informe registra el corte.
- **BD:** se recargó a las 16:57:43 y otra vez a las 18:04:33 (`DROP DATABASE` + `database/BDPostaMedica.sql`). Quedó con 21 citas, 15 pacientes, 15 médicos, 1 administrador y 5 especialidades. Los datos que crearon los auditores (prefijo `AUD-`) ya no existen.

## Resumen por área y severidad

| Área | Crítica | Alta | Media | Baja | Informativa | Total |
|---|---|---|---|---|---|---|
| Negocio (NEG) | 0 | 5 | 7 | 2 | 0 | 14 |
| Seguridad (SEG) | 5 | 2 | 2 | 0 | 0 | 9 |
| Privacidad (PRI) | 3 | 4 | 3 | 1 | 0 | 11 |
| Lógica (LOG) | 0 | 7 | 9 | 2 | 0 | 18 |
| Robustez (ROB) | 1 | 1 | 4 | 1 | 0 | 7 |
| Carga (CAR) | 0 | 2 | 1 | 0 | 1 | 4 |
| Rendimiento (REN) | 0 | 0 | 5 | 3 | 1 | 9 |
| Diseño (DIS) | 0 | 2 | 6 | 6 | 0 | 14 |
| Despliegue (DES) | 1 | 5 | 5 | 4 | 0 | 15 |
| **Total** | **10** | **28** | **42** | **19** | **2** | **101** |

El conteo sale de la columna Severidad de la tabla Resumen de cada informe. AUD-DES-11 ("Media, solo si se cambia de motor") cuenta como Media.

**Los 101 hallazgos no son 101 problemas distintos.** Varios auditores encontraron la misma causa desde ángulos diferentes. Por ejemplo, la API sin autenticación (H-016) aparece en SEG-01, PRI-01, DES-01 y CAR-02. La tabla de riesgos de abajo agrupa por causa.

**Hallazgos existentes que la auditoría confirmó en LB-9:** H-005, H-007, H-012, H-013, H-014, H-016, H-022, H-023, H-024, H-025, H-031, H-032, H-037. H-002 sigue cerrado: tras cerrar sesión, el `localStorage` queda vacío (AUD-PRI).

## Top 10 riesgos para el negocio

| # | Riesgo | Hallazgos que lo componen | Severidad | Por qué importa al negocio |
|---|---|---|---|---|
| 1 | **La API no exige identidad: cualquiera lee, cambia y borra todo, e incluso se crea un administrador** | H-016; AUD-SEG-01, SEG-02, SEG-03; AUD-DES-01; AUD-CAR-02; AUD-LOG-17 | Crítica | Si el backend se publica, la posta queda abierta a Internet. Bloquea el despliegue |
| 2 | **Diagnósticos (incluido VIH), alergias e historia clínica legibles y cruzables con nombre y DNI; basta cambiar `userId` en el navegador para ver el historial de otro** | H-013; AUD-PRI-01, PRI-02, PRI-04, PRI-10; AUD-DIS-14 / PRI-05 (sin guardas de ruta) | Crítica | Datos sensibles (Ley 29733): sanción, daño a los pacientes y daño reputacional |
| 3 | **Contraseñas en texto plano que la API devuelve en el uso normal (el paciente recibe las claves de los médicos)** | H-007; AUD-SEG-05; AUD-PRI-03; AUD-SEG-09 | Crítica | Cualquiera toma cuentas de médico o de administrador con las herramientas del navegador |
| 4 | **Un "crear" con un id existente sobrescribe la cuenta y su clave** | AUD-SEG-04; AUD-LOG-06 | Crítica | Toma de cualquier cuenta conociendo solo su id |
| 5 | **Doble reserva: en paralelo (10 de 10 se guardan), con doble clic, al cambiar de fecha en el formulario, y acaparamiento de agenda (3900 citas en 3 s)** | H-012; AUD-ROB-01, ROB-02; AUD-LOG-03, LOG-04; AUD-NEG-01; AUD-CAR-02; AUD-REN-07 | Crítica | Pacientes citados a la misma hora y agendas bloqueadas. Corregir H-012 con "consultar y luego insertar" no basta (ROB-01) |
| 6 | **Ingresos manipulables e inestables: citas creadas como "Atendida", fechas futuras, precios negativos, precio actual en vez del cobrado, borrados que bajan ingresos pasados** | H-024, H-031; AUD-NEG-03, NEG-04, NEG-12; AUD-LOG-10, LOG-15; AUD-ROB-04 | Alta | El reporte financiero del administrador no es confiable |
| 7 | **El backend no valida ningún dato: citas sin paciente, sin hora, en el año 9999, a las 25:00 o un sábado; DNI "ABC"; clave "1"** | AUD-LOG-01, LOG-02, LOG-13, LOG-18; AUD-NEG-02, NEG-05; H-022, H-037 | Alta | Datos basura que rompen agenda, reportes y login |
| 8 | **Pérdida irreversible de historia clínica y citas atendidas, sin rastro de quién lo hizo** (borrado físico en cascada; el paciente "elimina" en lugar de cancelar) | AUD-PRI-07, PRI-11; AUD-NEG-04, NEG-08, NEG-10; AUD-LOG-11; AUD-DIS-13 | Alta | Obligación de conservar la historia clínica (no verificado legalmente) y sin forma de responder a un reclamo |
| 9 | **Identidad débil: registro con un DNI ajeno; un DNI repetido entre tablas deja sin acceso a un médico; un paciente "Fallecido" inicia sesión y reserva** | AUD-NEG-05, NEG-11; AUD-LOG-07, LOG-16; AUD-PRI-06 (sin aviso ni consentimiento) | Alta | Suplantación, citas a nombre de otro y riesgo legal en el alta |
| 10 | **No se puede desplegar tal como está: URL `localhost:8080` fija en 9 sitios, CORS solo para localhost, nombres de tabla `Medico`/`medico` que fallan en Linux, 54 vulnerabilidades npm (incluido el runtime de Angular), secreto JWT en el código** | AUD-DES-02, DES-03, DES-04, DES-06, DES-07, DES-09; H-025 | Alta | El sitio en Vercel no funcionaría y el backend en Linux podría fallar al arrancar consultas |

**Fuera del top 10, pero a tener en cuenta:**
- Los errores 500 filtran SQL y esquema, y no quedan en el log (AUD-SEG-07, AUD-LOG-05, AUD-ROB-06, AUD-DES-10, AUD-PRI-09).
- Con el backend caído, las pantallas dicen "no tienes citas" o "S/ 0.00" en lugar de mostrar un error (AUD-ROB-05).
- Los paneles de médico y de administrador no se pueden usar en el celular (AUD-DIS-01).
- `GET /api/cita` cae a unas 90 pet/s con 4000 citas (AUD-CAR-01).
- Los datos semilla atribuyen diagnósticos a personas públicas reales (AUD-NEG-14).

## Propuesta: 5 paquetes de trabajo (uno por integrante)

**Criterio:** solo hallazgos marcados como "apto para integrante". Cada paquete trae de 1 a 3 cambios chicos, y **ningún archivo aparece en dos paquetes**.

**Reglas de CLAUDE.md que aplican a cada paquete:**
- Cada corrección va en su propio RFC en `docs/rfc/`.
- Antes y después del cambio se corre la batería de `docs/PRUEBAS.md` contra la línea base.
- Una prueba existente no se cambia sin decisión del usuario.

| Paquete | Cambios | Hallazgos | Archivos (exclusivos del paquete) | Riesgo para las pruebas existentes |
|---|---|---|---|---|
| **P1 — Nada sensible en consola ni errores sin rastro** | (1) Quitar los `console.log` que imprimen la clave del registro, el DNI y la respuesta del login. (2) Registrar con un logger, en el servidor, las excepciones que hoy se devuelven sin dejar huella, **sin cambiar la respuesta** | AUD-PRI-08; AUD-ROB-06 (opción a) | `frontend/src/app/features/auth/registro/registro.component.ts`, `features/auth/login-paciente/login-paciente.component.ts`, `features/auth/login-medico/login-medico.component.ts`, `backend/.../exception/GlobalExceptionHandler.java` | Bajo. Ninguna prueba conocida depende de la consola. El cuerpo de error del backend no cambia: `registro.component.ts:118` sigue dependiendo de `Duplicate entry` |
| **P2 — Formulario "Registrar Cita" a prueba de errores del usuario** | (1) Bandera "enviando" que deshabilite "Confirmar" durante el POST. (2) Limpiar la hora elegida al cambiar de fecha o de médico, y exigir que esté entre las ofrecidas. (3) `minDate` con la fecha local en vez de UTC, y motivo con `trim()` y `maxlength=255` | AUD-ROB-02; AUD-LOG-03; AUD-LOG-14 / AUD-NEG-13 / AUD-DES-14 (sin tocar `horarios-cita.ts`) | `frontend/src/app/features/paciente/registrar-cita/registrar-cita.component.ts`, `registrar-cita.component.html` | Medio. Revisar las pruebas de caracterización U19–U23 de este componente y P12. No resuelve H-012 en el backend |
| **P3 — Médico: Aceptar/Cancelar sin doble envío y con confirmación visible** | (1) Bandera "procesando" que deshabilite "Confirmar" y los botones de la fila mientras hay un PUT en curso. (2) Mensaje en la página ("Cita N confirmada/cancelada", `role="status"`) | AUD-ROB-03; AUD-DIS-12 (parte del médico) | `frontend/src/app/features/medico/medico-citas-pendientes/medico-citas-pendientes.component.ts`, `medico-citas-pendientes.component.html` | Bajo-medio. Revisar P20–P22 y `e2e/tests/medico-citas-pendientes.spec.ts` (que no se modifica sin autorización) |
| **P4 — Accesibilidad y uso en celular** | (1) `lang="es"` y título "Posta Médica Valdiviezo". (2) `login-selection` sin `min-width: 400px` (se desborda a 360 px). (3) `@media (max-width: 768px)` para que la barra lateral de los paneles de médico y de administrador no tape el contenido | AUD-DIS-07; AUD-DIS-02; AUD-DIS-01 | `frontend/src/index.html`, `features/auth/login-selection/login-selection.component.css`, `features/medico/medico-dashboard.component.css`, `features/admin/dashboard/admin-dashboard.component.css` | Bajo. Son cambios de presentación; hay que revisar las capturas E2E y comprobarlo visualmente a 360, 768 y 1280 px |
| **P5 — Configuración del backend lista para desplegar** | (1) `application.properties` con variables y valores por defecto: `DB_URL`, `PORT`, `SHOW_SQL`. (2) Orígenes CORS leídos de una propiedad (`CORS_ORIGINS`, por defecto `http://localhost:4200`). (3) `frontend/vercel.json` con el rewrite de la SPA | AUD-DES-05 / AUD-CAR-03; AUD-DES-03; AUD-DES-09 | `backend/src/main/resources/application.properties`, `backend/.../seguridad/WebSecurityConfig.java`, `frontend/vercel.json` (nuevo) | Bajo, si los valores por defecto reproducen el comportamiento actual. P25 (CORS) debe dar el mismo resultado. Decidir si `SHOW_SQL` queda en `true` por defecto para no alterar el entorno de desarrollo |

**Archivos de cada paquete (ninguno se repite):**

| Paquete | Archivos |
|---|---|
| P1 | registro, login-paciente, login-medico, GlobalExceptionHandler |
| P2 | registrar-cita.ts/.html |
| P3 | medico-citas-pendientes.ts/.html |
| P4 | index.html, login-selection.css, medico-dashboard.css, admin-dashboard.css |
| P5 | application.properties, WebSecurityConfig, vercel.json |

**Fuera de los paquetes, porque no son aptos para un integrante (necesitan diseño y RFC mayor):** autenticación y autorización (H-016), hash de claves (H-007), validación en el backend, restricción UNIQUE de citas, máquina de estados (H-031), precio cobrado (H-024), borrado lógico y URL configurable del frontend (AUD-DES-02, 10 archivos).

## Hotfix candidato

**Que la API deje de devolver la contraseña en las respuestas JSON** (H-007, parcial; AUD-SEG-05, AUD-PRI-03).
- **Qué cambiaría:** el campo `clave` de `Paciente`, `Medico` y `UsuarioModel` se seguiría aceptando al crear, pero no se incluiría en las respuestas (`@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)`).
  - Archivos: `backend/.../model/Paciente.java`, `model/Medico.java`, `model/UsuarioModel.java`.
- **Por qué es el candidato:** corta, con 3 archivos, la vía más directa de toma de cuentas. Hoy un paciente recibe las claves de los médicos en el uso normal de "Registrar Cita" y "Mis Citas", y `/usuarios` devuelve la del administrador.
- **Lo que no resuelve:**
  - No resuelve H-016 (API abierta).
  - No resuelve el almacenamiento en texto plano.
  - No resuelve la sobrescritura por "crear" (AUD-SEG-04).
- **Antes de aplicarlo hay que verificar (no verificado en esta auditoría):**
  - Que el login lea la clave de la entidad y no del JSON (por código parece que sí).
  - Que `admin-pacientes` siga actualizando bien: su PUT reenvía el objeto y `actualizarPaciente` no copia la clave (H-032).
  - El efecto en P03, que hoy muestra `clave`, y en la caracterización U52. P03 cambiaría de resultado como corrección esperada; decide el usuario.
- **Alternativa más fuerte, pero más grande:** DTOs de salida sin `clave`.

## Observaciones para `docs/HALLAZGOS.md` (no se editó: lo decide el usuario)
- **H-032, evidencia incorrecta.** Dice que ningún archivo del frontend llama al endpoint. La ruta real `PUT /api/paciente/actualizar/{id}` se usa desde "Gestión de Pacientes" del administrador (AUD-LOG-12).
- **AUD-SEG-07 cita una línea que no existe:** `GlobalExceptionHandler.java:161-167`. El archivo tiene 21 líneas (`wc -l` → 21) y el handler está en las líneas 14-20. El contenido del hallazgo es correcto (lo detectó AUD-ROB).
- **Visto de paso por AUD-REN, sin probar:** `PacienteRepository.findByApellidosContaining` y `findByNombresContaining` declaran que devuelven `ArrayList<Medico>`.
- **Nuevo, sin hallazgo previo:** los datos semilla asocian diagnósticos y el estado "Fallecido" a personas públicas reales (AUD-NEG-14).

## Estado del entorno al terminar
- Backend en `:8080`, PID 29304. Lo reinició el auditor de robustez a las 17:46:20. Su log, `backend2.log`, está en el scratchpad de la sesión y pesa unos 155 MB por `show-sql`.
- Frontend `ng serve` en `:4200`. MySQL en `:3306`. BD recargada a las 18:04:33.
- Archivos temporales de los auditores: en el scratchpad de la sesión, fuera del repositorio. `aud-despliegue/pac.json` contiene la respuesta de `/api/paciente` (datos semilla con claves de prueba).
- No se instaló nada. k6 y autocannon no están instalados; la carga se midió con Node. Lighthouse y axe-core no están instalados; se usó Playwright en su lugar.
