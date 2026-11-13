# Evidencia para el informe T3 (ítems 13 a 14.3)

Texto listo para pegar en el informe. Cada imagen está en `img/`, tiene 1400 px de ancho y lleva su pie de figura debajo. Las fechas y horas salen de `git log`, `git for-each-ref` y de la API de GitHub (`gh`), en hora de Perú (UTC−5). Ninguna imagen muestra tokens, claves ni el `JWT_SECRET`.

Imágenes tomadas el 2026-11-12. Las de GitHub, entre las 17:31:07 y las 17:31:42 (Figuras 13-1 y 13-2) y entre las 18:00:11 y las 18:00:58 (Figuras 14-3, 21 y 22, tomadas de nuevo después de marcar v1.1.0 como "Latest" y cerrar el issue #25), sin iniciar sesión (el repositorio es público; por eso arriba aparecen "Sign in" y "Sign up" y las fechas se ven como "yesterday" o "1h ago"). Las de la aplicación, entre las 17:24 y las 17:25, con la versión 1.1.0 (`master` = tag `LB-11`, `df2f792`) y la base de datos recién cargada con `database/BDPostaMedica.sql` (datos ficticios). Durante las capturas no se guardó ninguna cita.

---

## Ítem 13 — Taller de gestión de cambios: el caso del paquete P1 (RFC-014)

Elegimos P1 porque es el único paquete que recorrió el ciclo completo de un cambio con revisión: el revisor pidió cambios, el integrante subió un commit de corrección y recién entonces se aprobó y se unió.

**Recorrido del cambio**

1. **Solicitud de cambio (RFC-014).** El 2026-11-10 a las 15:54 se registró RFC-014 para atender el hallazgo H-043: el login y el registro mostraban el DNI y la contraseña en la consola del navegador, y los errores 500 del servidor no dejaban rastro en el log. Tipo de mantenimiento: correctivo.
2. **Issue #43.** Ese mismo día, a las 17:55, se creó en GitHub el issue #43 con la descripción del problema, su ubicación en el código y el cambio que lo atiende (RFC-014).
3. **Rama.** El integrante pfaberio27-png trabajó en la rama `feature/rfc-014-p1-consola-y-log`, creada desde `develop`.
4. **Commits.** El 2026-11-11, entre las 10:48 y las 11:05, hizo 5 commits pequeños, uno por cada cambio de la ficha: quitar los `console.log` del login de paciente y del de médico, no imprimir la clave del registro, registrar en el log los errores 500 sin cambiar la respuesta, y una prueba unitaria nueva.
5. **Pull request #50.** A las 10:49 abrió el PR #50 hacia `develop`, con "Closes #43" en la descripción.
6. **Revisión.** El revisor (BrayanH0) probó el PR: compiló, corrió todas las pruebas y comparó cada archivo con la ficha. Todo pasaba, pero en un archivo había 2 líneas con espacios de más. A las 17:49 marcó **"Request changes"** y explicó exactamente qué corregir y cómo hacerlo.
7. **Corrección.** A las 18:27 el integrante subió el commit `9d59c01` "P1: corregir espacios en login de paciente (RFC-014)", que toca solo esas 2 líneas.
8. **Aprobación.** El revisor volvió a probar (todas las pruebas pasan y la batería de regresión da lo mismo que la línea base LB-10) y a las 18:42 marcó **"Approve"**.
9. **Merge a `develop`.** A las 18:42:56 unió el PR con un merge commit (`f1d56ff`).
10. **Release v1.1.0.** El 2026-11-12 se creó la rama `release/1.1` desde `develop`, se subió la versión a 1.1.0 y se volvió a correr toda la batería. A las 16:10 el PR #59 unió la release a `master`, y a las 16:11 se crearon los tags `v1.1.0` y `LB-11` sobre ese merge.
11. **Cierre del issue.** Al llegar el cambio a `master`, GitHub cerró el issue #43 (16:10:46), con referencia al PR #59. RFC-014 se dio por cerrado después de la evaluación posterior (tarea 29): el objetivo se cumplió y no hizo falta el plan de vuelta atrás.

![PR #50: cambios pedidos, commit de corrección, aprobación y merge](img/fig-13-1.png)

**Figura 13-1.** Pull request #50 (paquete P1, RFC-014) en GitHub. Arriba, el título y el estado "Merged". Debajo, el ciclo de revisión: "requested changes" con el pedido del revisor, el commit de corrección `9d59c01`, "approved these changes" y el merge a `develop`. Se recortaron la descripción del PR y los 5 commits iniciales.

![Issue #43 cerrado](img/fig-13-2.png)

**Figura 13-2.** Issue #43 (hallazgo H-043) cerrado. La etiqueta "Closed" lleva el enlace al PR #59, y en la línea de tiempo se lee "closed this as completed in #59". En "Development" aparece la release v1.1.0.

---

## Ítem 14.1 — Estrategia de ramas

![Diagrama GitFlow](img/fig-14-1.png)

**Figura 14-1.** Estrategia de ramas GitFlow del repositorio: `master` (versiones publicadas, con sus tags), `develop` (integración), `feature/*` (un paquete o RFC por rama), `hotfix/rfc-010-claves-seguras` (corrección urgente que sale de `master`) y `release/1.1` (preparación de la versión 1.1.0).

**Cómo trabajamos con las ramas**

- **`master`** solo recibe versiones terminadas: el hotfix v1.0.1 (PR #48) y la release v1.1.0 (PR #59). Cada merge a `master` lleva un tag de versión (`v1.0.1`, `v1.1.0`) y un tag de línea base (`LB-10`, `LB-11`).
- **`develop`** reúne los cambios aprobados. Cada RFC o paquete se trabaja en su propia rama `feature/…` creada desde `develop` y vuelve a ella por un pull request.
- **Hotfix:** el error crítico de contraseñas en texto plano (RFC-010) no podía esperar a la siguiente versión. Se corrigió en una rama que salió de `master`, se publicó como v1.0.1 y luego se llevó también a `develop` (PR #49).
- **Release:** para la versión 1.1.0 se abrió `release/1.1` desde `develop`. Allí solo se cambió el número de versión y la documentación de la release, y se volvió a correr toda la batería de pruebas antes del merge a `master`. Después, el PR #60 devolvió ese merge a `develop`.

**Reglas que aplicamos**

- **Protección de ramas:** `master` y `develop` están protegidas en GitHub. No se puede hacer push directo (todo cambio entra por un pull request), ni force push, ni borrar la rama.
- **Pull request obligatorio, con revisión:** los 14 merges a `master` y `develop` (PR #48 a #62) entraron por pull request. En los PR de los integrantes (#50 a #53), el revisor probó el cambio antes de aprobarlo y, cuando algo no coincidía, pidió cambios (#50 y #51). GitHub no exige un número mínimo de aprobaciones (está en 0) y la protección no se aplica a los administradores; la revisión la hicimos por acuerdo del grupo.
- **Merge commit (no squash ni rebase):** los 14 PR se unieron con "Create a merge commit". Así cada commit del integrante queda en el historial con su autor (lo que permite el conteo del ítem 14.2) y el tag de versión queda sobre el commit de merge. GitHub también permite squash y rebase en este repositorio: usar el merge commit es una regla del grupo, no un bloqueo técnico.
- **Cada cambio cita su RFC y su issue:** la rama y los commits nombran la RFC (por ejemplo "P1: … (RFC-014)"), y el PR dice "Closes #N" para que el issue se cierre solo cuando el cambio llega a `master`.

---

## Ítem 14.2 — Commits por integrante

Conteo con `git log LB-11 --no-merges` (commits propios, sin contar los de merge) sobre la versión 1.1.0.

| Integrante | Cuenta de GitHub | Paquete / RFC | Pull request | N.º de commits |
|---|---|---|---|---|
| Clauder Paulo Faberio Carhuapoma | pfaberio27-png | P1 — RFC-014 (consola y log de errores) | #50 | 6 (5 + 1 de corrección) |
| Christian Paolo Silva Carrillo | Paolo1710 | P3 — RFC-015 (Aceptar/Cancelar del médico) | #51 | 3 |
| Angel Gabriel Nolasco Poves | Angel29042001 | P4 — RFC-013 (accesibilidad y celular) | #53 | 4 |
| Rashid Gabriel Chavez Zevallos | Rashidchz | P5 — RFC-016 (configuración para el despliegue) | #52 | 4 |
| Brayan Junior Huamani Ostos | BrayanH0 | Hotfix RFC-010, RFC-011, RFC-012, RFC-017 y release v1.1.0 (además, en la etapa T2: RFC-001 a RFC-009 y la documentación) | #48, #49, #55, #56, #57, #58, #59, #60 | 53 |
| **Total** | | | | **70** |

**Detalle de los 53 commits de BrayanH0:** 6 de RFC-011; 2 de RFC-010; 2 de RFC-017; 1 por cada uno de RFC-001 a RFC-009 y RFC-012 (10; RFC-004 es la reorganización y RFC-005 a 008 las refactorizaciones R1–R4); y 33 de documentación, pruebas de caracterización, la batería de regresión y la release (por ejemplo "Release v1.1.0" y los registros de la bitácora). Además figuran 19 commits de merge de Brayan hasta el PR #62: 14 hechos desde GitHub al unir los PR y 5 locales (en `LB-11` eran 16: 11 desde GitHub y 5 locales).

**Notas:**
- 52 de los 53 commits de BrayanH0 y los 4 de Angel29042001 llevan `Co-Authored-By: Claude Opus 5.5`: se hicieron con ayuda de Claude Code. Los de pfaberio27-png, Paolo1710 y Rashidchz no lo llevan (se hicieron en el editor web de GitHub).
- El PR de P1 tiene 6 commits porque incluye el de corrección pedido en la revisión (ítem 13).

---

## Ítem 14.3 — Releases y tags

![Releases en GitHub](img/fig-14-3.png)

**Figura 14-3.** Página Releases del repositorio en GitHub, con la versión vigente v1.1.0 "Seguridad, reservas y uso en el celular" (marcada "Latest"; tag `v1.1.0`, commit `df2f792`) y la versión anterior v1.0.1 "Hotfix de seguridad" (tag `v1.0.1`, commit `0af31db`). Cada release trae su descripción, los issues que cierra y el código fuente descargable (Assets).

**Tags del repositorio**

| Tag | Commit | Fecha | Qué marca |
|---|---|---|---|
| `LB-0` | `1a5df63` | 2026-10-20 | Estado inicial, antes de cualquier cambio |
| `LB-1` | `0659bec` | 2026-10-20 | RFC-001: correcciones del login |
| `LB-2` | `6588eaf` | 2026-10-21 | RFC-002: el login de paciente comprueba el rol |
| `LB-3` | `4fb12a6` | 2026-10-21 | RFC-003: el módulo médico usa datos de la base |
| `LB-4` | `e7829cb` | 2026-10-21 | Reorganización de carpetas (RFC-004) |
| `LB-5` | `bc282c3` | 2026-10-21 | Refactorización R1, DRY (RFC-005) |
| `LB-6` | `8d17c28` | 2026-10-21 | Refactorización R2, responsabilidad única (RFC-006) |
| `LB-7` | `df97480` | 2026-10-21 | Refactorización R3, abierto/cerrado (RFC-007) |
| `LB-8` | `679ba05` | 2026-10-21 | Refactorización R4, inversión de control (RFC-008) |
| `LB-9` | `bf107d3` | 2026-10-21 | RFC-009: contraseña de MySQL fuera del código |
| `ENTREGA-T2` | `606d3de` | 2026-10-21 | Versión entregada en la evaluación T2 |
| `LB-10` | `0af31db` | 2026-11-10 | Hotfix RFC-010 (merge del PR #48) |
| `v1.0.1` | `0af31db` | 2026-11-10 | Versión publicada 1.0.1 (mismo commit que LB-10) |
| `LB-11` | `df2f792` | 2026-11-12 | Release con RFC-011 a RFC-017 (merge del PR #59) |
| `v1.1.0` | `df2f792` | 2026-11-12 | Versión publicada 1.1.0 (mismo commit que LB-11) |

Todos son tags anotados: guardan el autor, la fecha y un mensaje. Los `LB-n` marcan las **líneas base** del proceso de gestión de configuración: cada uno es un estado probado con la batería completa. Los `v…` marcan las **versiones publicadas** para el usuario. Desde que hay versiones, cada versión coincide con una línea base: `v1.0.1` = `LB-10` y `v1.1.0` = `LB-11`.

**Versionado semántico (MAYOR.MENOR.PARCHE)**
- **PARCHE** sube cuando solo se corrigen errores sin cambiar el uso: **1.0.1** es el hotfix RFC-010, que guarda las contraseñas con BCrypt y deja de devolverlas en la API.
- **MENOR** sube cuando se agregan mejoras o correcciones compatibles: **1.1.0** agrega el inicio de sesión con token, impide la doble reserva, adapta las pantallas al celular y reemplaza los datos de ejemplo. El número de versión se cambió en `backend/pom.xml` y `frontend/package.json` en la rama `release/1.1`.
- **MAYOR** subiría si un cambio rompiera la compatibilidad con lo anterior. Todavía no ocurrió.
- Qué trae cada versión está en `CHANGELOG.md` y en la página Releases.

---

## Figura 19 — Pruebas que pasan por línea base

![Pruebas que pasan de LB-0 a LB-11](img/fig-19.png)

**Figura 19.** Pruebas de la batería de regresión que pasan en cada línea base, de LB-0 a LB-11. Encima de cada barra se indica cuántas pruebas se ejecutaron en esa línea base: la batería creció de 17 pruebas (LB-0) a 28 (LB-11), porque cada RFC agrega las suyas. De LB-4 a LB-9 el resultado no cambia, porque las refactorizaciones no deben cambiar el comportamiento. En LB-11 pasan 27 de 28; la única que falla es P04 (hallazgo H-005, todavía abierto).

Datos (de `docs/PRUEBAS.md`, tabla "Pruebas que pasan por línea base"): LB-0 7 de 17 (más 1 mixta) · LB-1 12 de 18 · LB-2 13 de 19 · LB-3 19 de 24 · LB-4 19 de 24 · LB-5 a LB-10 20 de 25 · LB-11 27 de 28.

---

## Figuras 21 y 22 — Issues en GitHub

![Issues abiertos](img/fig-21.png)

**Figura 21.** Issues abiertos en GitHub (16): los hallazgos que todavía no tienen un cambio aplicado, cada uno con su gravedad y su tipo (`bug`, `mejora`).

![Issues cerrados](img/fig-22.png)

**Figura 22.** Issues cerrados en GitHub (32; se ve la primera página, con 25). H-042 a H-048, H-016, H-013 y H-012 se cerraron con la release v1.1.0 y muestran el ícono del pull request que los cerró. H-025 (clave secreta de JWT en el código) se cerró después de la release, con un comentario: el secreto ya no está en el código y el antiguo, que quedó en el historial, fue rotado. Los demás se cerraron en octubre, con un comentario de cierre: son hallazgos atendidos entre LB-1 y LB-9, y correcciones de documentación (H-040, H-041).

---

## Pantallas de la versión 1.1.0 (reemplazan las Figuras 25 a 35)

Mismos pies de figura del informe. Las pantallas se tomaron con un ancho de ventana de 1400 px y datos ficticios. Para las listas del médico se entró con el médico que tiene citas en ese estado: pendientes con el médico 6, confirmadas con el 2 y canceladas con el 4.

![Figura 25](img/fig-25.png)

**Figura 25.** Selección de rol y logins de paciente, médico y administrador.

![Figura 26](img/fig-26.png)

**Figura 26.** Registro de paciente y pantalla de bienvenida.

![Figura 27](img/fig-27.png)

**Figura 27.** Registrar cita: los horarios disponibles se calculan con la regla separada en RFC-006.

![Figura 28](img/fig-28.png)

**Figura 28.** Mis citas: las citas del paciente con su estado.

![Figura 29](img/fig-29.png)

**Figura 29.** Historial médico con evoluciones y diagnósticos.

![Figura 30](img/fig-30.png)

**Figura 30.** Citas pendientes del médico, con las acciones Aceptar y Cancelar.

![Figura 31](img/fig-31.png)

**Figura 31.** Citas confirmadas y canceladas.

![Figura 32](img/fig-32.png)

**Figura 32.** Pacientes del médico, solo con campos que existen en la base.

![Figura 33](img/fig-33.png)

**Figura 33.** Panel de administración y gestión de médicos.

![Figura 34](img/fig-34.png)

**Figura 34.** Gestión de pacientes.

![Figura 35](img/fig-35.png)

**Figura 35.** Reportes: totales, ingresos y resumen de citas.

### Imagen nueva: uso en el celular

![Login y panel del médico a 360 px](img/fig-36.png)

**Figura 36.** Login y panel del médico en un celular (pantalla de 360 px de ancho), después de RFC-013: el formulario y el menú se adaptan al ancho y no hay desplazamiento horizontal.

*El número 36 es provisional: es el siguiente después de la Figura 35. Si el informe ya tiene una Figura 36, renumerar esta imagen y su archivo.*
