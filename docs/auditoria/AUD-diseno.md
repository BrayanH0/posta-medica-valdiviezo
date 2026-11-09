# AUD-DIS — Auditoría de diseño, accesibilidad y usabilidad
Ejecución: lun 9 nov 2026, 16:59:13 – 17:24:25 (HPS, comando `date`). La ejecución se cortó por un error de límite de la API y siguió a partir de las 17:20:23. Entorno: rama `master`, commit `3200a4d` (`git describe`: `ENTREGA-T2-2-g3200a4d`, LB-9). Frontend `ng serve` en http://localhost:4200 y backend en http://localhost:8080, los dos en marcha y sin reiniciar. BD recargada a las 16:57:43 y compartida con otros auditores que corrían en paralelo. Navegador: Playwright Chromium (desde `e2e/node_modules`) en modo headless. Scripts y capturas en `C:/Users/braya/AppData/Local/Temp/claude/85b186d9b1722304/0f4da1a6-6e30-4eb8-804c-f218b75ed1f0/scratchpad/aud-diseno/` (abajo, `SCR/`).

## Resumen
| ID | Título | Severidad | Criterio WCAG / tipo | Relación | Apto integrante |
|---|---|---|---|---|---|
| AUD-DIS-01 | Paneles médico y admin no se pueden usar a 360 px: la barra lateral fija tapa el contenido y las acciones quedan fuera de alcance | Alta | 1.4.10 Reflow / responsive | Nuevo | Sí |
| AUD-DIS-02 | `login-selection` se desborda 20 px a 360 px (`min-width: 400px`) | Baja | 1.4.10 Reflow | Nuevo | Sí |
| AUD-DIS-03 | Contraste insuficiente en botones de acción principales (blanco sobre verde/naranja/azul/rojo) | Media | 1.4.3 Contraste mínimo | Nuevo | Sí |
| AUD-DIS-04 | Campos sin etiqueta asociada en "Registrar Cita" y en el modal "Editar Paciente" | Media | 1.3.1 / 4.1.2 / 3.3.2 | Nuevo | Sí |
| AUD-DIS-05 | Los modales no son diálogos accesibles: el foco no entra, no queda atrapado, Escape no cierra y "×" no tiene nombre | Media | 2.4.3 / 2.1.2 / 4.1.2 | Nuevo | Sí |
| AUD-DIS-06 | Los mensajes de error no se anuncian (sin `role="alert"`/`aria-live`) | Media | 4.1.3 Mensajes de estado | Relacionado H-003/H-029 | Sí |
| AUD-DIS-07 | `lang="en"` y título "ProyectoValdiviezo" en una app en español | Baja | 3.1.1 / 2.4.2 | Nuevo | Sí |
| AUD-DIS-08 | Indicador de foco casi invisible en los inputs de login y registro | Baja | 2.4.7 Foco visible | Nuevo | Sí |
| AUD-DIS-09 | Botones sin nombre accesible o con nombre poco claro (hamburguesa, `<`/`>`, `×`, emojis) y horas sin `aria-pressed` | Baja | 4.1.2 / 2.4.6 | Nuevo | Sí |
| AUD-DIS-10 | Inconsistencias visuales y de términos entre roles | Baja | Consistencia (3.2.4) | Relacionado H-023 | Sí |
| AUD-DIS-11 | Las pantallas internas del paciente no tienen menú ni "Cerrar sesión", y el logo cambia de pantalla sin cerrar sesión | Media | Usabilidad / 2.4.5 | Nuevo | Sí |
| AUD-DIS-12 | Sin confirmación visible tras aceptar/cancelar una cita (médico); se usa `alert()` nativo en el flujo del paciente | Baja | Usabilidad / 4.1.3 | Nuevo | Sí |
| AUD-DIS-13 | El paciente ve "Eliminar cita" en citas Confirmadas, Canceladas y Atendidas, y no tiene "Cancelar" | Media | Usabilidad / regla de negocio | Nuevo (relacionado H-031) | No |
| AUD-DIS-14 | Sin guardas de ruta: un paciente con sesión abre `/admin/inicio` y ve el panel de administración | Alta (fuera de mi alcance, es seguridad) | Navegación por rol | Relacionado H-016 | No |

## Matriz responsive (pantalla × 360/768/1280)
Medido con `responsive.js`. "OK" significa `scrollWidth == innerWidth`, ningún elemento sale de la ventana y el contenido se puede usar. Capturas: `SCR/<ancho>_<ruta>.png`.

| Pantalla | 360 | 768 | 1280 |
|---|---|---|---|
| /login-selection | **Desborda**: `sw=380 > 360`, `div.selection-box right=380` | OK | OK |
| /login-paciente, /login-medico, /login-admin | OK | OK | OK |
| /registro | OK | OK | OK |
| /welcome | OK (el menú hamburguesa abre: `aria-expanded=true`) | OK | OK |
| /paciente/registrar-cita | OK | OK | OK |
| /paciente/mis-citas | OK | OK | OK |
| /paciente/historial-medico | OK | OK | OK |
| /medico-dashboard (inicio) | **No usable**: sidebar 250 px, contenido 110 px, `div.card right=404` cortada | OK (sidebar 250, contenido 518) | OK |
| /medico-dashboard/pacientes | **No usable**: tabla 853 px dentro de un contenedor de 10 px | Scroll interno (tabla 853 en 418 px, `overflow-x=auto`) | OK (930/930) |
| /medico-dashboard/citas-pendientes, -aprobadas, -canceladas | **No usable**: tabla 800 px dentro de un contenedor de 10 px; botón "Aceptar" en `left=926`, inalcanzable | Scroll interno (800 en 418) | OK |
| /admin/inicio | **No usable**: sidebar 260, contenido 100 px; `div.hero right=418`, `div.card right=572` | OK | OK |
| /admin/pacientes | **No usable**: tabla 741 px dentro de un contenedor de 0 px; `btn-refresh right=402` | Scroll interno (750 en 408) | OK |
| /admin/medicos | **No usable**: tabla 555 en 0 px | Scroll interno (555 en 408) | OK |
| /admin/reportes | **No usable**: `stat-card right=560`, tabla 424 en 0 px | Scroll interno (424 en 368) | OK |
| /admin/cant-estado-cita | Contenido de 100 px (no se detectó desborde, gráficos comprimidos) | OK | OK |

Nota: en ningún panel a 360 px `scrollWidth` supera 360, porque el desborde ocurre *dentro* de `.main-content`/`main.content` y no en el documento. Por eso la comprobación `scrollWidth > innerWidth` no lo detecta, aunque el contenido queda cortado (ver AUD-DIS-01).

## Hallazgos

### AUD-DIS-01 — Paneles médico y admin no se pueden usar a 360 px
- Severidad: Alta (un médico o un administrador desde el celular no puede aceptar ni cancelar citas, ni gestionar pacientes)
- Relación con hallazgos existentes: Nuevo
- Evidencia: `responsive.js` y `teclado.js`. Resultado real:
  - `{"w":360,"p":"/medico-dashboard/citas-pendientes",...,"off":["table. right=1100"],"tables":["table 800px en contenedor 10px overflow-x=auto"],"sidebar":250,"main":110}`
  - `{"w":360,"p":"/admin/reportes",...,"off":["button.btn-refresh right=402","div.stat-card.total right=560",...],"tables":["table 424px en contenedor 0px overflow-x=auto"],"sidebar":260,"main":100}`
  - `== 360 citas-pendientes Aceptar: rect left=926 right=998 innerWidth=360; elemento en ese punto=main-content; scrollWidth=360; contenedor tabla clientWidth=10`
  - Admin: el botón para colapsar el menú está en `y= 2648` (con una ventana de 800 px de alto). Al colapsarlo queda `sidebar=80 main=280 tablaContenedor=180`. Mejora, pero hay que bajar unos 2600 px para encontrarlo.
  - Causa: ningún CSS fuera de `legacy/` tiene `@media` (`grep -rln "@media" frontend/src` solo devuelve `legacy/detalle-medico.css` y `legacy/detalle-paciente.css`). `.sidebar { width: 250px; flex-shrink: 0 }` (médico) y `.sidebar { width: 260px }` (admin) no se adaptan.
  - Capturas: `SCR/360_medico-dashboard_citas-pendientes.png`, `SCR/360_admin_reportes.png`, `SCR/360_medico_pendientes_viewport.png`, `SCR/360_admin_pacientes_colapsado.png`.
- Impacto en el negocio: el médico no puede gestionar su agenda desde el teléfono. Las citas quedan "Pendiente" más tiempo.
- Recomendación (con alternativas): (a) agregar `@media (max-width: 768px)` que ponga la barra lateral arriba como menú horizontal o hamburguesa (`flex-direction: column` en el contenedor); (b) ocultar la barra lateral tras un botón fijo (patrón *off-canvas* de Bootstrap, que ya está cargado); (c) mínimo: en admin, empezar con el menú colapsado en pantallas angostas y poner el botón de colapsar arriba. Para las tablas, convertir cada fila en una tarjeta en pantallas angostas, o dejar el `overflow-x:auto` existente una vez que el contenedor tenga ancho.
- Esfuerzo estimado: 2–4 h
- Archivos involucrados: `frontend/src/app/features/medico/medico-dashboard.component.css`, `frontend/src/app/features/admin/dashboard/admin-dashboard.component.css` (y `.html` si se agrega un botón)
- Apto para integrante: Sí

### AUD-DIS-02 — `login-selection` se desborda a 360 px
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo
- Evidencia: `{"w":360,"p":"/login-selection","iw":360,"sw":380,"overflow":true,"off":["div.selection-box right=380"]}`. Causa: `login-selection.component.css` tiene `.selection-box { ... min-width: 400px; }`. Captura `SCR/360_login-selection.png`: la tarjeta queda cortada en el borde.
- Impacto en el negocio: es la primera pantalla. A 360 px aparece una barra de scroll horizontal y la tarjeta se ve cortada.
- Recomendación: cambiar a `width: 100%; max-width: 400px;` (o `min-width: min(400px, 100%)`).
- Esfuerzo estimado: 10 min
- Archivos involucrados: `frontend/src/app/features/auth/login-selection/login-selection.component.css`
- Apto para integrante: Sí

### AUD-DIS-03 — Contraste insuficiente en botones principales
- Severidad: Media
- Relación con hallazgos existentes: Nuevo
- Evidencia: `a11y.js` calcula la razón de contraste según WCAG con `getComputedStyle`. No revisa textos sobre degradados. Resultado real a 1280 px:
  - `/login-selection`: `"Soy Paciente" blanco sobre rgb(33,150,243) 3.12:1 (16px)`, `"Soy Médico" ... rgb(76,175,80) 2.78:1`, `"Soy Administrador" ... rgb(255,152,0) 2.16:1`
  - `/login-paciente`: `"Iniciar Sesión" ... 3.12:1`; `/registro`: `"Registrar" ... rgb(40,167,69) 3.13:1`, `"Volver" rgb(102,126,234) sobre blanco 3.66:1 (14px)`
  - `/welcome`: `"Mis Citas" blanco sobre rgb(13,202,240) 1.96:1` (`btn-info text-white`)
  - `/medico-dashboard/citas-pendientes`: `"Aceptar" ... 2.78:1 (13.6px)`, `"Cancelar" ... 3.68:1`, `"Cerrar Sesión" ... 3.68:1` (75 fallos en la página, uno por fila)
  - `/admin/pacientes`: `"✏️ Editar" blanco sobre rgb(243,156,18) 2.19:1 (12px)`, `"🗑️ Eliminar" 3.82:1`, `"🔄 Actualizar" 3.15:1` (64 fallos)
  - `/admin/reportes`: títulos de tarjeta `rgb(127,140,141)` sobre blanco 3.48:1 (14px)
- Impacto en el negocio: los botones son difíciles de leer para personas mayores o con baja visión, que son un público frecuente de una posta médica.
- Recomendación: oscurecer los fondos (por ejemplo, verde `#2e7d32`, naranja `#e65100` o texto oscuro sobre naranja, azul `#1565c0`, rojo `#c62828`, gris `#5f6b6d` para los títulos de tarjeta) o usar texto oscuro. Alternativa: definir variables de color comunes en `styles.css` (ver AUD-DIS-10).
- Esfuerzo estimado: 1–2 h
- Archivos involucrados: `login-selection.component.css`, `login-paciente/medico/admin.component.css`, `registro.component.css`, `welcome.component.html` (`btn-info`), `medico-citas-pendientes.component.css`, `medico-dashboard.component.css`, `admin-pacientes.component.css`, `admin-reportes.component.css`, `admin-dashboard.component.css`. Son más de 3 archivos, pero con cambios de un solo valor cada uno. Se puede dividir por rol.
- Apto para integrante: Sí (por partes, 1–3 archivos por tarea)

### AUD-DIS-04 — Campos sin etiqueta asociada
- Severidad: Media
- Relación con hallazgos existentes: Nuevo
- Evidencia: `a11y.js` en `/paciente/registrar-cita` da `"sinLabel":["select[name=especialidad]","select[name=medico]","input[name=fecha]","textarea[name=motivo]"]`. `teclado.js` (modal Editar en `/admin/pacientes`, se abrió y se canceló sin guardar) da `modal editar inputs sin label asociado: nombres,apellidos,dni,fecha_nacimiento,sexo,telefono,estado,ubigeo`. Causa: `<label class="form-label">` sin `for` y controles sin `id`. Los logins y el registro sí están bien (`label for="dni"`, etc.). En el modal admin, "Estado" y "Ubigeo" además son `input type="number"` donde se escribe un ID sin descripción.
- Impacto en el negocio: un lector de pantalla anuncia "cuadro combinado" sin decir qué pide. Hacer clic en la etiqueta no lleva el foco al campo.
- Recomendación: agregar `id` a cada control y `for` a su `label`. Alternativa: `aria-label`. Para Estado y Ubigeo del modal admin, usar `select` con nombres (mejora aparte).
- Esfuerzo estimado: 30 min
- Archivos involucrados: `frontend/src/app/features/paciente/registrar-cita/registrar-cita.component.html`, `frontend/src/app/features/admin/pacientes/admin-pacientes.component.html`
- Apto para integrante: Sí

### AUD-DIS-05 — Los modales no son diálogos accesibles
- Severidad: Media
- Relación con hallazgos existentes: Nuevo
- Evidencia: `teclado.js` sobre el modal "Resumen del Paciente" del médico:
  - `== modal resumen: foco tras abrir = button#|"Resumen"|` (el foco se queda en la tabla)
  - `role=dialog? null aria-modal=null`
  - `Tabs con foco fuera del modal (de 12): 10 ['1:button#|"Resumen"|...', ...]`
  - `modal abierto tras Escape? 1`
  - `boton cerrar: "×" aria-label=null`
  - Modal admin "Editar Paciente": `foco tras abrir: button#|"✏️ Editar"|`. Los modales "Aceptar/Cancelar Cita" de `medico-citas-pendientes.component.html` tienen la misma estructura (`div.modal-overlay` sin `role`). Por código y por analogía no se recorrieron con Tab: **no verificado con teclado**.
- Impacto en el negocio: quien usa teclado o lector de pantalla no sabe que se abrió un diálogo, sigue navegando la tabla de atrás y no puede cerrarlo con Escape.
- Recomendación: (a) `role="dialog" aria-modal="true" aria-labelledby`, mover el foco al abrir, atrapar Tab, cerrar con Escape y devolver el foco al botón que lo abrió; (b) usar el modal de Bootstrap ya cargado o `@angular/cdk/dialog` (es una dependencia nueva y habría que evaluarla); (c) mínimo: `aria-label="Cerrar"` en "×" y `(keydown.escape)`.
- Esfuerzo estimado: 2–3 h (3 modales)
- Archivos involucrados: `medico-pacientes.component.html/.ts`, `medico-citas-pendientes.component.html/.ts`, `admin-pacientes.component.html/.ts`
- Apto para integrante: Sí (un modal por tarea)

### AUD-DIS-06 — Los mensajes de error no se anuncian
- Severidad: Media
- Relación con hallazgos existentes: relacionado con H-003 (unificación de mensajes, cerrado) y H-029 (texto del mensaje ante error 500). Esto trata de cómo se anuncia el mensaje, no de su texto.
- Evidencia: `teclado.js`, login de paciente con clave incorrecta: `== error login: <div ... class="error-message"> Credenciales inválidas </div> role=null aria-live=null`. `a11y.js` da `"live":0` en todas las páginas revisadas. `grep -rn "aria-\|role=" features` (sin `legacy/`) no devuelve resultados. Captura `SCR/error-login.png`.
- Impacto en el negocio: un usuario de lector de pantalla no se entera de que el login falló ni de los errores del registro.
- Recomendación: `role="alert"` en `.error-message` (logins, registro, listas del médico). Alternativa: `aria-live="polite"` en un contenedor fijo.
- Esfuerzo estimado: 20 min
- Archivos involucrados: `login-paciente/medico/admin.component.html`, `registro.component.html` (las listas del médico aparte)
- Apto para integrante: Sí

### AUD-DIS-07 — Idioma del documento y título
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo
- Evidencia: `a11y.js` da `"lang":"en","title":"ProyectoValdiviezo"` en todas las páginas. `frontend/src/index.html`: `<html lang="en">`, `<title>ProyectoValdiviezo</title>`.
- Impacto en el negocio: los lectores de pantalla leen el español con pronunciación inglesa. Todas las pestañas del navegador muestran el mismo título técnico.
- Recomendación: `lang="es"` y título "Posta Médica Valdiviezo". Opcional: título por ruta con `title` en `app.routes.ts`.
- Esfuerzo estimado: 10 min (lang + título), 30 min (títulos por ruta)
- Archivos involucrados: `frontend/src/index.html` (y opcionalmente `app.routes.ts`)
- Apto para integrante: Sí

### AUD-DIS-08 — Indicador de foco débil en los inputs
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo
- Evidencia: `teclado.js`, Tab en `/login-paciente`: `1 input#dni| outline=none 3px | shadow=rgba(33, 150, 243, 0.1) 0px 0px 0px 3px`. La sombra tiene opacidad 0,1 y solo queda el cambio del borde de 1 px a `#2196F3` (3,12:1 sobre blanco). Los botones sí conservan el contorno del navegador (`outline=auto`). CSS: `input:focus { outline: none; ... box-shadow: 0 0 0 3px rgba(33,150,243,0.1); }` en los 3 logins y en el registro.
- Impacto en el negocio: con teclado cuesta saber en qué campo se está escribiendo.
- Recomendación: subir la opacidad de la sombra (≥ 0,5) o usar `outline: 2px solid #1565c0` con `:focus-visible`.
- Esfuerzo estimado: 15 min
- Archivos involucrados: `login-paciente.component.css`, `login-medico.component.css`, `login-admin.component.css`, `registro.component.css`
- Apto para integrante: Sí

### AUD-DIS-09 — Botones sin nombre accesible o con nombre poco claro
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo
- Evidencia:
  - `a11y.js` en `/welcome`: `"sinNombre":["<button type=\"button\" data-bs-toggle=\"collapse\" data-bs-target=\"#navbarNav\" clas..."]` (hamburguesa sin `aria-label`, confirmado por `teclado.js`: `toggler visible: true aria-label= null`)
  - Admin: `== admin toggle: "<" aria-label=null title=` (el lector lee "menor que")
  - Modales: `"×" aria-label=null`
  - Botones admin con emoji en el nombre (`🔄 Actualizar`, `✏️ Editar`, `🗑️ Eliminar`): el lector lee el nombre del emoji
  - Horas de "Registrar Cita": `aria-pressed antes: null`. La selección solo se marca con la clase `.active`.
- Impacto en el negocio: con lector de pantalla no se puede saber qué hacen estos botones ni qué hora quedó elegida.
- Recomendación: `aria-label` ("Abrir menú", "Contraer menú", "Cerrar"), emojis dentro de `<span aria-hidden="true">`, `[attr.aria-pressed]="cita.hora_cita === hora"`.
- Esfuerzo estimado: 30 min
- Archivos involucrados: `welcome.component.html`, `admin-dashboard.component.html`, `registrar-cita.component.html` (los "×" van con AUD-DIS-05)
- Apto para integrante: Sí

### AUD-DIS-10 — Inconsistencias visuales y de términos entre roles
- Severidad: Baja
- Relación con hallazgos existentes: H-023 (ruta/archivo "aprobadas" frente a "Confirmada"). En la interfaz ya dice "Citas Confirmadas" y "Gestión de Citas Confirmadas", y el paciente ve "Confirmada" (comprobado en el flujo). La diferencia que queda está solo en la URL `/citas-aprobadas`.
- Evidencia (lectura de plantillas y CSS, más capturas):
  - Nombre de la institución: "Centro De Salud Valdiviezo" (`login-selection`) frente a "Posta Médica Valdiviezo" (welcome, paneles).
  - Tres sistemas visuales: el paciente usa Bootstrap (`btn btn-primary` `#0d6efd`, tipografía del sistema); el médico usa CSS propio con 'Segoe UI', barra `#1a237e`, cerrar sesión `#f44336` y radio 4 px; el admin usa degradado `#1a237e→#283593`, cerrar sesión `#ef5350` y radio 25 px. En el paciente, "Cerrar Sesión" es un enlace rojo del navbar.
  - Términos: menú admin "Medicos" sin tilde (`admin-dashboard.component.html`), "Informes" en el menú pero "Reportes y Estadísticas" en la página, "Gráficos" lleva a la ruta `cant-estado-cita`.
  - Botón Volver en tres estilos (gris Bootstrap, `btn-secondary` propio de los logins, texto `#667eea` en el registro).
  - Formato de hora con segundos: "2026-12-16 - 19:20:00" en "Mis Citas" y en la tabla del médico. Fechas `yyyy-MM-dd` en el paciente, `dd/MM/yyyy` en Pacientes del médico, `yyyy-MM-dd` sin formato en Pacientes del admin, y el sexo como "M/F" en el admin frente a "Masculino" en el médico.
  - Footer "© 2024".
  - No se encontraron textos visibles en inglés en las pantallas en uso (`grep "Approved|Pending|Dashboard|Loading"` sin resultados fuera de `legacy/`), salvo `lang`/título (AUD-DIS-07).
- Impacto en el negocio: la aplicación parece hecha de piezas distintas y los usuarios dudan de si están en el mismo sistema.
- Recomendación: definir colores y botones comunes (variables CSS en `styles.css`), unificar el nombre de la institución, usar `DatePipe` con un formato común y mostrar las horas en HH:mm. Corregir "Médicos" y renombrar "Informes" como "Reportes".
- Esfuerzo estimado: textos 30 min; unificación visual 1–2 días
- Archivos involucrados: textos en `admin-dashboard.component.html`, `login-selection.component.html`, `mis-citas.component.html`; unificación visual en muchos archivos
- Apto para integrante: Sí para los textos; No para la unificación visual completa

### AUD-DIS-11 — Pantallas internas del paciente sin menú ni cierre de sesión; el logo cambia de pantalla sin cerrar sesión
- Severidad: Media
- Relación con hallazgos existentes: Nuevo
- Evidencia: `marca.js`:
  - `mis-citas: navbar presente? 0 | h2: Mis Citas`. Registrar Cita, Mis Citas e Historial solo tienen un botón "Volver" a `/welcome`. No hay menú ni "Cerrar Sesión".
  - El logo `<a class="navbar-brand" href="#">` lleva a `URL: http://localhost:4200/login-selection | localStorage userType tras click marca: paciente`: el paciente cae en la selección de rol con la sesión todavía abierta.
- Impacto en el negocio: hay que dar pasos de más para moverse entre secciones. En una computadora compartida (recepción de la posta) el usuario cree que salió y la sesión sigue abierta.
- Recomendación: extraer el navbar a un componente o layout de paciente que se use en las 4 pantallas (alternativa: copiar el `<nav>`, lo que repite código, H-008). El logo debe apuntar a `routerLink="/welcome"`.
- Esfuerzo estimado: 1–2 h (layout); 5 min (logo)
- Archivos involucrados: `welcome.component.html`, `registrar-cita.component.html`, `mis-citas.component.html`, `historial-medico.component.html` (o un componente de layout nuevo con su ruta en `app.routes.ts`)
- Apto para integrante: Sí para el logo; el layout son más de 3 archivos

### AUD-DIS-12 — Retroalimentación pobre tras las acciones
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo
- Evidencia: `flujo.js` (17:22:49–17:23:25):
  - Médico, tras "Confirmar Aceptación" y "Confirmar Cancelación": `tras confirmar: mensajes visibles= (ninguno) fila sigue? 0`. La fila desaparece sin ningún aviso.
  - Paciente: registro, reserva y errores usan `alert()` nativo (`[dialogo alert] "Registro exitoso. Ahora puede iniciar sesión con su DNI y contraseña."`, `[dialogo alert] "Cita registrada con éxito"`). Tras registrarse hay que iniciar sesión otra vez a mano (`URL tras registro: /login-paciente`).
  - Lo que sí funciona: el modal de confirmación del médico resume la cita (`¿Estás seguro que deseas aceptar la siguiente cita? Paciente: AudDis Prueba Diseno Fecha: 2026-12-16 - 19:20:00 ...`). En "Registrar Cita", el botón Confirmar está deshabilitado hasta completar todo (`boton Confirmar deshabilitado: true`) y la hora ya reservada desaparece de la lista (cita 2: 35 horas, sin 19:20).
  - El select de especialidad empieza vacío, sin texto guía (`texto visible="(ninguna opción seleccionada)"`). Captura `SCR/flujo_registrar_cita.png`.
- Impacto en el negocio: el médico no sabe si la acción se guardó. Los `alert()` bloquean la pantalla y no siguen el estilo de la aplicación.
- Recomendación: mensaje en la página (`role="status"`) tipo "Cita 91 confirmada", o un *toast* de Bootstrap. Opción "Seleccione..." en los select. Opcional: iniciar sesión automáticamente tras el registro (cambia el comportamiento y requiere RFC).
- Esfuerzo estimado: 1–2 h
- Archivos involucrados: `medico-citas-pendientes.component.html/.ts`, `registrar-cita.component.html`
- Apto para integrante: Sí

### AUD-DIS-13 — "Eliminar cita" disponible en cualquier estado; no hay "Cancelar" para el paciente
- Severidad: Media
- Relación con hallazgos existentes: Nuevo (relacionado con H-031, que trata la falta de una máquina de estados en el backend)
- Evidencia: `flujo.js`, "Mis citas después": `2026-12-16 - 19:20:00 Confirmada ... Eliminar cita || 2026-12-16 - 18:40:00 Cancelada ... Eliminar cita`. En `mis-citas.component.html`, el botón no tiene condición de estado y `eliminarCita` hace `DELETE /api/cita/{id}` tras `confirm('¿Seguro que desea eliminar esta cita?')`. P05 muestra citas "Atendida" del paciente 1, que también tendrían el botón (deducido del código; **no se pulsó**, para no borrar datos del seed).
- Impacto en el negocio: el paciente puede borrar físicamente una cita confirmada o atendida, con lo que se pierde el registro de atención e ingresos (ver reportes). El médico no se entera, porque la cita desaparece en lugar de pasar a "Cancelada".
- Recomendación: (a) reemplazar "Eliminar" por "Cancelar cita" (`PUT` a estado Cancelada), solo para Pendiente y Confirmada; (b) como mínimo, ocultar el botón para Atendida y Cancelada. Cambia el comportamiento y la regla de negocio, por lo que requiere RFC y decisión del usuario, y posiblemente un endpoint de paciente.
- Esfuerzo estimado: 2–4 h (frontend + backend)
- Archivos involucrados: `mis-citas.component.html/.ts` y, según la opción, un controlador del backend
- Apto para integrante: No (regla de negocio, frontend y backend)

### AUD-DIS-14 — Sin guardas de ruta por rol
- Severidad: Alta (es un tema de seguridad que queda fuera del alcance de diseño; lo dejo para el auditor de seguridad)
- Relación con hallazgos existentes: H-016 (la API no exige autenticación). Esto es el equivalente en el frontend.
- Evidencia: `marca.js`, con sesión de paciente: `paciente abre /admin/inicio -> http://localhost:4200/admin/inicio | contenido: Panel Admin Inicio Pacientes Medicos Informes Gráficos < Cerrar Sesión Bienvenid`. `grep "canActivate|Guard"` en `frontend/src/app` no encuentra guardas (solo un comentario en `login-admin.component.ts`).
- Impacto en el negocio: un paciente puede llegar a pantallas de administración (listado y edición de pacientes).
- Recomendación: `CanActivateFn` por rol (`userType`) en `app.routes.ts`. No sustituye la autenticación del backend (H-016).
- Esfuerzo estimado: 1–2 h
- Archivos involucrados: `frontend/src/app/app.routes.ts` y un archivo de guarda nuevo
- Apto para integrante: No (seguridad; debe ir con H-016)

## Revisado sin hallazgos
- Desborde horizontal a 360/768/1280 en los logins, el registro, welcome, Registrar Cita, Mis Citas e Historial: `sw == iw` en todas.
- Menú hamburguesa de `/welcome` a 360 px: abre bien (`menu visible tras click: true aria-expanded= true`, `SCR/360_welcome_menu.png`).
- Etiquetas de los formularios de login y registro: todas asociadas (`"sinLabel":[]`).
- Imágenes sin `alt`: 0 en todas las páginas (no hay `<img>`; los íconos son Font Awesome `<i>`).
- Orden de Tab en los logins (DNI → Contraseña → Mostrar → Iniciar Sesión → Registrarse → Volver), en login-selection y en la barra lateral del médico: es lógico, y los botones y enlaces muestran contorno (`outline=auto`).
- No hay `div` ni `span` con `(click)` usados como botón. El único elemento no-botón con `(click)` es el overlay del modal admin (cierre al hacer clic fuera) y el enlace "Cerrar Sesión" con `href="#"`, que funciona con teclado.
- Confirmación antes de acciones destructivas: hay modal en aceptar/cancelar (médico), `confirm()` en eliminar paciente (admin) y en eliminar cita (paciente).
- Estados vacíos con texto: "No tienes citas registradas.", "No hay citas pendientes.", "No hay datos disponibles", y para el paciente nuevo "No se encontró historia clínica para este paciente." (comprobado con el paciente 41).
- Términos "Confirmada/Confirmadas" coherentes en la interfaz del médico y del paciente (comprobado en el flujo). Lo de "aprobadas" (H-023) solo queda en la URL y en los nombres de archivo.
- Contraste de los textos de Bootstrap en Registrar Cita, Mis Citas e Historial: sin fallos detectados.

## Datos creados en la BD
Creados a través de la interfaz el 2026-11-09 entre 17:22:49 y 17:23:25 (script `SCR/flujo.js`). Comprobado con MySQL:
- Paciente `idPaciente=41`, DNI `71930001`, nombres `AudDis`, apellidos `Prueba Diseno` (clave de prueba definida en el script; no se repite aquí).
- Cita `idCita=91`: paciente 41, médico 1, `2026-12-16 19:20:00`, motivo `AUD-DIS flujo cita 1`, `estado_cita=2` (confirmada por el médico desde la interfaz).
- Cita `idCita=92`: paciente 41, médico 1, `2026-12-16 18:40:00`, motivo `AUD-DIS flujo cita 2`, `estado_cita=3` (cancelada por el médico desde la interfaz).
- No se confirmó, canceló ni borró ninguna cita del seed ni de otros auditores. El modal "Editar Paciente" del admin se abrió y se cerró con "Cancelar", sin guardar.

## Limitaciones
- **axe-core no está instalado** (en `e2e/node_modules` solo están `@playwright`, `playwright` y `playwright-core`) y no se instaló nada. Las comprobaciones WCAG son manuales con Playwright: contraste por `getComputedStyle` (fórmula de luminancia relativa), etiquetas por `label[for]`/`aria-label`, recorrido con Tab y atributos `role`/`aria-*`. No se usó `accessibility.snapshot()`.
- El cálculo de contraste **omite los textos sobre degradados** (héroe de welcome, fondo de los logins, barra lateral admin, banners) y supone fondo blanco cuando no encuentra color. Esos textos quedan **sin verificar**.
- Contraste revisado solo a 1280 px, y en una muestra de páginas (no se revisaron `/login-medico`, `/login-admin`, `/medico-dashboard/pacientes`, `/citas-canceladas`, `/admin/medicos` ni `/admin/cant-estado-cita`, aunque comparten CSS con las revisadas).
- No se probó con lectores de pantalla reales (NVDA/JAWS), ni zoom al 200 %, ni modo de alto contraste.
- Los modales "Aceptar/Cancelar Cita" no se recorrieron con Tab (el foco atrapado es "no verificado"; se infiere por estructura del código).
- La matriz responsive usa alto de 800 px y Chromium. No se probó Safari/iOS ni Firefox.
- Bootstrap y Font Awesome se cargan desde CDN (`index.html`). Las capturas dependen de que esos CDN respondieran durante la ejecución, y la app no se ve igual sin conexión (esto no se probó).
- La BD era compartida con otros auditores (por ejemplo, citas `AUD-NEG` del médico 1 en 2027-03-15). El número de filas de "Citas Pendientes" (42) incluye datos de esos auditores.
- Las 36 horas ofrecidas para el 2026-12-16 (08:00–19:40) podrían deberse al horario por defecto de H-022. No se comprobó la tabla `disponibilidad_medico` del médico 1: **no verificado**.
- La ejecución se interrumpió una vez por un error de límite de la API (entre las 17:02:41 y las 17:20:23). Los scripts se reejecutaron completos después y no se perdieron resultados.
- `git status` al terminar muestra ` M docs/BITACORA.md`, `?? .claude/agents/`, `?? docs/auditoria/`. Ninguno es obra de este auditor, que no modificó archivos del repositorio.
