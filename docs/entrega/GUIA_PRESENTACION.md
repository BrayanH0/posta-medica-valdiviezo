# Guía para la presentación

Para el grupo que expone. Cada fila dice qué archivo abrir, qué poner en la lámina y qué decir.

> **Importante:** la lista oficial de los 12 puntos de la presentación **no está en el repositorio**. Solo se conocen tres: el **3** (ingeniería inversa), el **8** (resultados) y el **12** (pantallas). Para los demás, el título queda como "Sin registro" y el contenido es una **propuesta** que sigue el orden del trabajo realizado. Antes de armar las láminas, comparen esta tabla con la lista oficial del profesor y muevan las filas si hace falta.

## Los 12 puntos

| # | Punto | Archivo de `docs/` | Qué poner en la lámina | Frases clave para el expositor |
|---|---|---|---|---|
| 1 | Sin registro. *Propuesta:* presentación del sistema | `README.md`, `entrega/PANTALLAS.md` | Captura 01 (selección de rol) y una frase por rol | "Es un sistema de citas para una posta médica, con tres roles: paciente, médico y administrador." "Lo recibimos funcionando a medias y sin documentación." |
| 2 | Sin registro. *Propuesta:* línea base inicial (LB-0) e identificación de la configuración | `ELEMENTOS_CONFIGURACION.md`, `BITACORA.md` (2026-10-20) | Tabla de elementos de configuración EC-01 a EC-17 (resumida) | "Antes de tocar nada congelamos el estado inicial en Git: esa es la línea base LB-0." "Inventariamos cada pieza y su versión para poder volver atrás." |
| 3 | Ingeniería inversa | `entrega/INGENIERIA_INVERSA.md` | Los 5 pasos (tabla) + un diagrama por lámina: ER, clases, mapa de pantallas | "Reconstruimos el diseño a partir del código y de la base de datos, porque no había documentación." "Con análisis estático leímos el código; con análisis dinámico lo ejecutamos y vimos qué fallaba." |
| 4 | Sin registro. *Propuesta:* diagnóstico (hallazgos) | `HALLAZGOS.md` | Tabla de totales por gravedad y tipo (de `entrega/RESULTADOS.md`, sección 2) y 3 ejemplos críticos | "Encontramos 39 problemas, 7 de ellos críticos." "Cada uno tiene archivo, línea y evidencia; nada es opinión." |
| 5 | Sin registro. *Propuesta:* control de cambios (RFC y flujo de aprobación) | `rfc/RFC-001.md` (ejemplo completo) | Flujo de estados: Registrado → ¿Completa? → Investigación → Aprobado → Asignado → Implementación → Pruebas → Cerrado | "Ningún cambio de código se hizo sin una solicitud aprobada." "Cada RFC tiene análisis de impacto y plan para deshacer el cambio." |
| 6 | Sin registro. *Propuesta:* mantenimiento correctivo (RFC-001 a RFC-003) | `rfc/RFC-001.md`, `RFC-002.md`, `RFC-003.md` | Tabla: RFC → hallazgo → prueba que pasó de FALLA a PASA | "Primero corregimos lo que estaba roto: el login dejaba entrar a cualquiera con la clave 123456." "El módulo del médico mostraba datos inventados; ahora lee la base." |
| 7 | Sin registro. *Propuesta:* reorganización y refactorizaciones R1–R4 (RFC-004 a RFC-008) | `rfc/RFC-004.md` a `RFC-008.md` | Tabla: refactorización → principio (DRY, SRP, OCP, IoC) → qué cambió; diagrama antes/después de RFC-007 | "Refactorizar es mejorar el código por dentro sin cambiar lo que hace." "Un rol nuevo ahora es una clase nueva; no hay que tocar el controlador." |
| 8 | Resultados | `entrega/RESULTADOS.md` | Tabla de pruebas por línea base + gráfico; tabla de métricas antes/después | "De 7 pruebas que pasaban al inicio llegamos a 20 de 25." "Las 5 que fallan son errores que ninguna refactorización debe corregir, y siguen fallando igual: eso demuestra que no cambiamos el comportamiento." |
| 9 | Sin registro. *Propuesta:* pruebas y regresión | `PRUEBAS.md` | Tipos de prueba (integración, E2E, aceptación, unitaria) y cantidades al inicio y al final | "En cada línea base corrimos todas las pruebas otra vez: eso es la prueba de regresión." "Al inicio no se ejecutaba ninguna prueba del frontend; al final hay 49 en el frontend y 50 en el backend." |
| 10 | Sin registro. *Propuesta:* gestión de configuración con Git (líneas base y versiones) | `entrega/RESULTADOS.md` (sección 5), `BITACORA.md` | Grafo de Git (gitGraph) con LB-0 a LB-8 | "Cada línea base es un tag anotado de Git; podemos volver a cualquiera." "La bitácora dice qué se hizo, por qué y con qué evidencia, con la hora real." |
| 11 | Sin registro. *Propuesta:* pendientes y trabajo futuro | `HALLAZGOS.md`, `entrega/RESULTADOS.md` (pendientes críticos) | Tabla de los 4 pendientes críticos (H-007, H-012, H-013, H-016) | "Quedan 21 hallazgos abiertos; 4 son críticos y necesitan RFC correctivas propias." "La doble reserva y la API sin autenticación son lo primero que haríamos." |
| 12 | Pantallas del sistema | `entrega/PANTALLAS.md` | 4 a 6 capturas: selección de rol, registrar cita, citas pendientes del médico, reportes del admin | "Estas pantallas son del sistema en la versión final, LB-8, con los datos reales de la base." "El módulo del médico ya muestra citas reales que se pueden aceptar o cancelar." |

## Preguntas probables del profesor

**1. ¿Por qué la refactorización no corrigió la doble reserva?**
Porque refactorizar no cambia el comportamiento externo; solo mejora la estructura interna. La doble reserva (H-012) es un error de comportamiento: corregirlo es mantenimiento correctivo y necesita su propia RFC. Por eso P13 sigue fallando igual en LB-4 a LB-8, y eso prueba que las refactorizaciones no alteraron nada.

**2. ¿Qué diferencia hay entre RFC-001 y RFC-002?**
Las dos son correctivas y tocan los logins. RFC-001 corrigió el atajo de la clave `123456` (H-001), la sesión que no se borraba al salir (H-002) y los mensajes de error distintos (H-003). RFC-002 corrigió que el login de paciente no comprobaba el rol: un médico podía entrar como paciente (H-028). H-028 se descubrió al probar RFC-001.

**3. ¿Qué es una línea base y cuáles tienen?**
Es una versión aprobada y congelada del sistema que sirve de referencia para los cambios siguientes. Tenemos 9, cada una con un tag anotado de Git: LB-0 (estado inicial), LB-1 a LB-3 (correcciones RFC-001 a 003), LB-4 (reorganización), LB-5 a LB-8 (refactorizaciones R1 DRY, R2 SRP, R3 OCP, R4 IoC).

**4. ¿Cómo saben que una refactorización no cambió el comportamiento?**
Porque corrimos la batería completa antes y después y comparamos las salidas con `diff`: en LB-4 a LB-8 dieron lo mismo. Además, las pruebas unitarias de caracterización (que registran el comportamiento actual, incluso el incorrecto) siguieron pasando sin modificarlas.

**5. ¿Qué tipos de mantenimiento aplicaron?**
Correctivo (RFC-001, 002 y 003: errores que ya ocurrían) y preventivo (RFC-004 a 008: reorganización y refactorizaciones que mejoran la mantenibilidad sin fallas visibles). No hubo adaptativo ni perfectivo.

**6. ¿Qué es la ingeniería inversa y por qué la necesitaban?**
Es reconstruir el diseño de un sistema a partir del producto ya hecho. Lo necesitábamos porque recibimos solo el código y la base de datos, sin diagramas ni documentación. Hicimos ingeniería inversa de datos (diagrama ER), de lógica (diagrama de clases) y de interfaces (mapa de pantallas).

**7. ¿Qué principio aplicaron en cada refactorización?**
R1 DRY: la lógica de los 3 logins y el CORS quedaron en un solo lugar. R2 SRP: la regla de horarios salió de la pantalla a su propio archivo. R3 Abierto/Cerrado: cada rol es una clase; agregar un rol no modifica el controlador. R4 Inversión de Control: dependencias por constructor y hacia interfaces.

**8. ¿Qué es una prueba de regresión?**
Volver a ejecutar todas las pruebas después de un cambio para comprobar que no se rompió nada de lo que funcionaba. Nosotros corrimos la batería completa (P01–P25, más las unitarias y las de Playwright) en cada línea base.

**9. ¿Qué es una prueba de caracterización?**
Una prueba que registra lo que el código hace **hoy**, aunque esté mal. Sirve de red de seguridad: si una refactorización cambia ese comportamiento, la prueba falla. Por ejemplo, U21 comprueba que sin horario se ofrecen todas las horas (error H-022) y debe seguir pasando hasta que una RFC lo corrija.

**10. ¿Qué harían a continuación?**
Abrir RFC correctivas para los 4 pendientes críticos: autenticación en la API (H-016), que las pantallas pidan solo los datos del paciente (H-013), contraseñas cifradas (H-007) y validar la doble reserva en el backend (H-012). Cada una con su análisis de impacto, sus pruebas y su línea base nueva.
