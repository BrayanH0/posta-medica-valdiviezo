# AUD-CAR — Pruebas de carga y estrés
Ejecución: Mon Nov 9 17:54:06 HPS 2026 – Mon Nov 9 18:02:09 HPS 2026 (`date`). Entorno: PC de desarrollo con Windows 11 Pro, Intel Core i5-10400F (6 núcleos, 12 hilos), 15,9 GB de RAM (2,7 GB libres al empezar), OpenJDK 21.0.12.1 Temurin, Spring Boot 3.5.6, MySQL 8.0.46 (`max_connections=151`) y Node v24.18.0. El backend tiene PID 29304, `show-sql=true` y Hikari/Tomcat con sus valores por defecto (no hay `spring.datasource.hikari.*` ni `server.tomcat.*` en `application.properties`). El generador de carga corre en el mismo PC que el backend y MySQL, así que estos números no sirven para estimar producción. Herramienta: script propio de Node (`http` con `Agent({keepAlive:true, maxSockets:C})` y `perf_hooks`, timeout de 30 s por petición) en `C:/Users/braya/AppData/Local/Temp/claude/85b186d9b1722304/0f4da1a6-6e30-4eb8-804c-f218b75ed1f0/scratchpad/aud-carga/carga.js`. Las salidas están en `login.txt`, `login-extra.txt`, `cita.txt`, `cita4015.txt`, `medico.txt` y `reservar.txt` de esa misma carpeta.

## Resumen
| ID | Título | Severidad | Relación | Apto integrante |
|---|---|---|---|---|
| AUD-CAR-01 | Con 4015 citas en la BD, `GET /api/cita` (sin paginación) pasa de 1600 a 90 peticiones/s, y su p95 llega a 2,4 s con 200 usuarios simultáneos | Alta | H-013, AUD-ROB-07 (se mide el efecto) | No |
| AUD-CAR-02 | `POST /api/cita` aceptó 3900 reservas en unos 3 s, desde un cliente sin autenticar y para un médico sin horario. No hay límite de frecuencia | Alta | H-016, H-012, H-022, AUD-ROB-01 (aspecto nuevo: abuso por volumen) | No |
| AUD-CAR-03 | `show-sql=true`: el log del backend creció 155 MB (647.048 líneas `Hibernate:`) en unos 16 min de prueba | Media | AUD-DES-05 (se mide el efecto) | Sí |
| AUD-CAR-04 | Login y la consulta del médico no se rompen hasta 2000 concurrentes: 0 % de errores y el pool sin agotarse; la latencia crece solo por cola | Informativa | AUD-REN-09 | — |

## Resultados por escenario (tablas por escalón)
Los escalones se midieron por tiempo (10 s cada uno), salvo "reservar", que usó un número fijo de peticiones. Latencias en ms. "Err" son las respuestas no 2xx, los timeouts o los errores de conexión.

**POST /login** (paciente 12345678 / 123456)
| Conc. | n | pet/s | p50 | p95 | p99 | máx | Err |
|---|---|---|---|---|---|---|---|
| 1 | 6811 | 681,0 | 1,4 | 1,7 | 2,5 | 28,5 | 0 % |
| 10 | 48135 | 4813,0 | 1,9 | 2,8 | 5,0 | 31,5 | 0 % |
| 25 | 44871 | 4486,5 | 5,1 | 7,8 | 14,4 | 39,9 | 0 % |
| 50 | 51636 | 5162,5 | 9,1 | 11,7 | 23,1 | 55,9 | 0 % |
| 100 | 48857 | 4883,6 | 19,1 | 26,9 | 45,0 | 84,6 | 0 % |
| 200 | 49627 | 4959,0 | 38,1 | 48,4 | 106,7 | 137,6 | 0 % |
| 500 | 43943 | 4379,9 | 107,9 | 144,1 | 277,4 | 376,4 | 0 % |
| 1000 | 51440 | 5108,7 | 183,4 | 215,3 | 550,5 | 651,0 | 0 % |
| 2000 | 43155 | 4238,8 | 397,7 | 528,0 | 1864,6 | 1934,4 | 0 % |

**GET /api/cita**, con 115 citas en la BD (respuesta de 16.295 bytes)
| Conc. | n | pet/s | p50 | p95 | p99 | máx | Err |
|---|---|---|---|---|---|---|---|
| 1 | 2481 | 248,1 | 3,9 | 4,4 | 5,1 | 35,1 | 0 % |
| 10 | 17728 | 1772,2 | 5,5 | 6,6 | 7,7 | 35,9 | 0 % |
| 25 | 17198 | 1717,7 | 14,3 | 21,8 | 27,5 | 62,3 | 0 % |
| 50 | 15997 | 1595,4 | 30,5 | 54,9 | 77,1 | 171,7 | 0 % |
| 100 | 16212 | 1612,5 | 60,3 | 115,6 | 167,1 | 274,0 | 0 % |
| 200 | 16273 | 1609,2 | 121,4 | 237,0 | 345,1 | 651,5 | 0 % |

**GET /api/cita**, con 4015 citas en la BD, después de las reservas (respuesta de 530.219 bytes)
| Conc. | n | pet/s | p50 | p95 | p99 | máx | Err |
|---|---|---|---|---|---|---|---|
| 1 | 163 | 16,3 | 61,1 | 63,1 | 64,5 | 83,2 | 0 % |
| 10 | 938 | 93,3 | 106,7 | 121,5 | 128,9 | 154,2 | 0 % |
| 50 | 949 | 90,1 | 536,0 | 631,2 | 655,8 | 1065,1 | 0 % |
| 100 | 931 | 83,1 | 1180,0 | 1235,5 | 1252,5 | 2257,7 | 0 % |
| 200 | 1029 | 82,7 | 2394,4 | 2449,4 | 2472,3 | 4672,5 | 0 % |

**GET /api/citas/medico/1?estado=Pendiente** (8338 bytes)
| Conc. | n | pet/s | p50 | p95 | p99 | máx | Err |
|---|---|---|---|---|---|---|---|
| 1 | 4600 | 459,9 | 2,1 | 2,5 | 3,3 | 27,1 | 0 % |
| 10 | 32621 | 3261,4 | 2,9 | 3,7 | 4,9 | 31,9 | 0 % |
| 25 | 32199 | 3218,3 | 7,4 | 10,0 | 18,0 | 55,4 | 0 % |
| 50 | 31754 | 3174,4 | 14,9 | 20,3 | 42,5 | 123,2 | 0 % |
| 100 | 31006 | 3098,9 | 30,3 | 39,5 | 70,6 | 121,9 | 0 % |
| 200 | 31446 | 3140,2 | 61,3 | 72,5 | 137,2 | 190,9 | 0 % |

**POST /api/cita** (médico 23 y paciente 51, ambos AUD-CAR; cada reserva con fecha y hora distintas desde 2031-01-01)
| Conc. | n | pet/s | p50 | p95 | p99 | máx | Err |
|---|---|---|---|---|---|---|---|
| 1 | 50 | 172,6 | 5,2 | 6,0 | 29,8 | 29,8 | 0 % |
| 10 | 100 | 909,1 | 7,5 | 17,0 | 19,6 | 34,5 | 0 % |
| 25 | 250 | 1147,0 | 17,4 | 30,0 | 33,4 | 43,5 | 0 % |
| 50 | 500 | 1353,5 | 32,4 | 42,8 | 54,8 | 63,5 | 0 % |
| 100 | 1000 | 1388,1 | 65,4 | 75,9 | 93,6 | 125,6 | 0 % |
| 200 | 2000 | 1429,9 | 128,6 | 144,6 | 183,5 | 322,5 | 0 % |

**Punto de quiebre:** no se alcanzó por errores en ningún escenario: 0 % de errores en todos los escalones, incluidos 2000 concurrentes en login. A partir de 10 concurrentes el rendimiento se estanca (unas 5000 pet/s en login, 3100 en la consulta del médico, 1600 en `/api/cita` con 115 filas y 1400 en reservar). Desde ahí la latencia crece de forma casi lineal con la concurrencia, es decir, por cola. El único caso en que p95 se dispara es `/api/cita` con 4015 filas (AUD-CAR-01): 631 ms con 50, 1,2 s con 100 y 2,4 s con 200. No se sabe si el tope de unas 5000 pet/s lo pone el backend o el generador, porque comparten CPU (no verificado).

**Log del backend** (las líneas desde las 17:55, cuando empezó esta prueba):
```
grep -i "error\|exception\|hikari\|OutOfMemory\|warn" backend2.log | grep "2026-11-09T1[78]:\(5[5-9]\|0\)"
(sin salida)
```
No aparecen errores de HikariCP (como "Connection is not available") ni `OutOfMemoryError`. Las únicas líneas ERROR/WARN del log son de antes de las 17:49, de otras auditorías (Duplicate entry '74000010', Data too long for 'motivo', etc.). `Threads_connected` de MySQL fue 11 antes y después. El proceso java pasó de 337.724 KB a 956.504 KB de memoria (`tasklist`). No se midió el uso de CPU.

## Hallazgos
### AUD-CAR-01 — Con 4015 citas, `GET /api/cita` cae a ~90 pet/s y su p95 llega a 2,4 s con 200 concurrentes
- Severidad: Alta
- Relación con hallazgos existentes: H-013 (el frontend descarga todas las citas) y AUD-ROB-07 (sin paginación). Este hallazgo mide el efecto bajo carga.
- Evidencia:
  ```
  # 115 filas
  cita c=200 n=16273 t=10.1s rps=1609.2 p50=121.4 p95=237.0 ... codes={"200":16273}
  # 4015 filas (tras 3900 reservas AUD-CAR)
  GET /api/cita 200 bytes=530219 t=0.063973
  cita c=1   n=163  rps=16.3 p50=61.1 p95=63.1
  cita c=200 n=1029 rps=82.7 p50=2394.4 p95=2449.4 p99=2472.3 max=4672.5ms
  # MySQL por sí solo:
  set profiling=1; select * from Cita; show profiles; → 0.00342550 s
  ```
  Con 35 veces más filas, la respuesta pesa 32,5 veces más y el rendimiento cae unas 19 veces. MySQL resuelve la consulta en 3,4 ms, así que casi todo el tiempo se va en la parte Java (Hibernate, Jackson y el envío de 530 KB). Este reparto es una deducción; no se perfiló.
- Impacto en el negocio: el historial de citas solo crece, y cada pantalla que usa `/api/cita` descarga la tabla entera (H-013). Con unos miles de citas, unos pocos usuarios simultáneos bastan para tiempos de segundos. Con varias decenas de miles empeoraría en proporción (extrapolación no verificada).
- Recomendación (con alternativas): (a) que el frontend use endpoints filtrados por paciente o por médico, como ya existe `/api/citas/medico/{id}`, y no `/api/cita` (es la corrección de H-013); (b) paginar `GET /api/cita` (`Pageable`) para pantallas de administración; (c) devolver un DTO solo con los campos necesarios. La opción (b) por sí sola no arregla el filtrado en el navegador.
- Esfuerzo estimado: medio (backend y varias pantallas del frontend).
- Archivos involucrados: `backend/src/main/java/com/centro_valdiviezo/backend/controller/CitaController.java` (`obtenerTodos`), `CitaService.listarCitas` y los componentes del frontend señalados en H-013.
- Apto para integrante: No

### AUD-CAR-02 — `POST /api/cita` acepta reservas masivas sin autenticación ni límite de frecuencia
- Severidad: Alta
- Relación con hallazgos existentes: H-016 (la API no exige autenticación), H-012 y AUD-ROB-01 (sin validación de choque), H-022 (no se valida el horario). El aspecto nuevo es el volumen: no hay ningún límite de frecuencia.
- Evidencia:
  ```
  reservar c=200 n=2000 t=1.4s rps=1429.9 ... err=0.00% codes={"200":2000}
  (total 6 escalones: 3900 enviadas, 3900 con 200, entre 17:59:34 y 17:59:38)
  select count(*) despues, count(distinct fecha_cita,hora_cita) distintas ... where motivo='AUD-CAR' and id_medico=23
  → 3900  3900  2031-01-01  2031-11-21
  select count(*) from Disponibilidad_Medico where id_medico=23 → 0
  ```
  Se guardaron todas: 3900 filas de 3900 enviadas, sin pérdidas ni duplicados, para un médico que no tiene ningún horario registrado.
- Impacto en el negocio: en 3 segundos, un único cliente anónimo puede ocupar casi un año de agenda de un médico. Eso deja la agenda inutilizable y, de paso, agrava AUD-CAR-01.
- Recomendación (con alternativas): (a) exigir autenticación y tomar el paciente del token, no del cuerpo (depende de H-016); (b) validar en el backend que la hora esté dentro de la disponibilidad del médico (H-022); (c) poner un límite por paciente, como un máximo de citas pendientes, o un límite de frecuencia por IP o usuario (filtro con Bucket4j, o en el proxy o API gateway). La opción (c) sin (a) se evade cambiando de IP.
- Esfuerzo estimado: alto si se incluye la autenticación; medio solo con (b) y (c).
- Archivos involucrados: `backend/.../controller/CitaController.java`, `backend/.../services/CitaService.java`, `backend/.../seguridad/WebSecurityConfig.java`
- Apto para integrante: No

### AUD-CAR-03 — `show-sql=true` hace crecer el log 155 MB en unos 16 minutos
- Severidad: Media
- Relación con hallazgos existentes: AUD-DES-05 (ya señala `show-sql=true`). Aquí se mide su efecto.
- Evidencia:
  ```
  ls -la backend2.log → 154844979 bytes; grep -c "" → 647139 líneas
  grep -c "^Hibernate:" backend2.log → 647048
  (backend arrancado 2026-11-09T17:46:20; medición 18:01:48)
  ```
  Cada petición escribe al menos una línea `Hibernate: ...` en la salida estándar. No se midió cuánto rendimiento cuesta esa escritura, porque haría falta reiniciar el backend sin `show-sql` (no verificado).
- Impacto en el negocio: en producción, el disco o la cuota de logs del host se llena en horas bajo carga moderada, y la escritura a consola compite con las peticiones.
- Recomendación (con alternativas): (a) `spring.jpa.show-sql=false` en un perfil de producción y `true` solo en `dev`; (b) usar el logger `org.hibernate.SQL` con nivel configurable por perfil.
- Esfuerzo estimado: bajo.
- Archivos involucrados: `backend/src/main/resources/application.properties` (más un `application-prod.properties` si se usan perfiles)
- Apto para integrante: Sí

### AUD-CAR-04 — Login y la consulta del médico aguantan hasta 2000 concurrentes sin errores
- Severidad: Informativa
- Relación con hallazgos existentes: AUD-REN-09 (los SELECT en serie del login no son un cuello de botella a esta escala).
- Evidencia: tablas anteriores. `login c=2000 ... p95=528.0 ... err=0.00% codes={"200":43155}`. Comprobación posterior: `post-check 200 0.013079`. No aparecen errores de Hikari en el log.
- Impacto en el negocio: con los datos actuales, la capacidad sobra para una posta médica (decenas de usuarios). El riesgo real está en el crecimiento de datos (AUD-CAR-01) y en el abuso (AUD-CAR-02).
- Recomendación: ninguna por ahora. Si se despliega, repetir la prueba desde otra máquina y con k6.
- Esfuerzo estimado: —
- Archivos involucrados: —
- Apto para integrante: —

## Datos creados en la BD
- Médico `id_medico=23`, nombres "AUD-CAR", dni 75100001, cmp CAR001 (`POST /api/medico/crear` → 200).
- Paciente `idPaciente=51`, nombres "AUD-CAR", dni 75000001 (`POST /api/paciente/crear` → 200).
- 3900 citas con `motivo='AUD-CAR'` (médico 23, paciente 51, fechas del 2031-01-01 al 2031-11-21, de 08:00 a 19:00, estado 1). Se enviaron 3900 y quedaron 3900 filas.
- Antes de empezar, la BD ya tenía 115 citas, 93 de ellas de otras auditorías (AUD-NEG 43, AUD-ROB 28, AUD-LOG 19, AUD-DIS 2, AUD-SEG 1). Al terminar hay 4015. Hay que recargar la BD (`database/BDPostaMedica.sql`).

## Estado en que quedó el entorno
- El backend (PID 29304) sigue arriba y respondiendo: `health /api/cita 200 0.064534` a las 18:02:09. No se reinició ni se detuvo. Ocupa 956.504 KB de memoria.
- MySQL: `Threads_connected=11`, igual que al principio.
- El log del backend pesa unos 155 MB (`backend2.log`).
- La BD tiene 3900 filas AUD-CAR más 1 médico y 1 paciente AUD-CAR, pendientes de recarga.

## Limitaciones
- No hay k6 ni autocannon (ya estaba comprobado), así que se usó un script de Node con módulos integrados. k6 o autocannon darían mediciones más finas (latencia corregida por *coordinated omission*, conexiones abiertas por segundo, informes), si el usuario autoriza instalarlos.
- El generador, el backend y MySQL comparten el mismo PC. El tope de rendimiento puede venir del generador, y no se midió la CPU.
- Todas las pruebas usaron conexiones keep-alive. No se probó con una conexión nueva por petición ni con TLS.
- La carga fue de un solo endpoint cada vez. No se probó una mezcla realista ni escalones largos (fatiga o fugas de memoria), y cada escalón duró 10 s.
- Las reservas se lanzaron por número fijo de peticiones, no por tiempo, y cada escalón duró menos de 1,5 s.
- `/api/cita` se midió con 115 y con 4015 filas. La línea base del proyecto (23 citas) no se midió porque la BD ya traía datos de otras auditorías.
- La fecha de 2026 corresponde al reloj del sistema (`date`).
