# AUD-DES — Auditoría de despliegue
Ejecución: lun 9 nov 2026 16:59:08 – 17:20:29 (hora del sistema, `date`; zona "HPS" = UTC-5). Hubo una interrupción por un error de límite de la API y la auditoría siguió en la misma sesión.
Entorno: Windows 11 Pro. Repo `master` en `3200a4d` (`git describe`: `ENTREGA-T2-2-g3200a4d`, LB-9). Node v24.18.0, npm 11.16.0, OpenJDK Temurin 21.0.12.1. MySQL Community 8.0.46 local. El backend estaba corriendo en `localhost:8080` y no se detuvo. `git status` al inicio y al final: `M docs/BITACORA.md` (no es cambio de este auditor) y `?? .claude/agents/`.

## Resumen
| ID | Título | Severidad | Relación | Apto integrante |
|---|---|---|---|---|
| AUD-DES-01 | La API pública expone todos los datos sin autenticación, con claves incluidas | Crítica (bloqueante) | H-016, H-007, H-013 | No |
| AUD-DES-02 | La URL del backend está fija en `http://localhost:8080` en 9 sitios y no hay `environment*.ts` | Alta (bloqueante) | Nuevo | No (9 archivos + angular.json) |
| AUD-DES-03 | CORS acepta un solo origen, fijo (`http://localhost:4200`): el origen de Vercel recibe 403 | Alta (bloqueante) | Nuevo (relacionado con H-010, cerrado) | Sí |
| AUD-DES-04 | Nombres de tabla con mayúsculas mezcladas (`Medico`/`medico`): falla en MySQL de Linux (`lower_case_table_names=0`) | Alta | Nuevo | No |
| AUD-DES-05 | `application.properties` no está listo para producción: BD en `localhost`, sin `PORT`, sin perfiles, `show-sql=true`, sin SSL | Media | H-006 (cerrado; complementa) | Sí |
| AUD-DES-06 | El secreto JWT está escrito en el código | Alta | H-025 | Sí |
| AUD-DES-07 | npm audit del frontend: 54 vulnerabilidades (3 críticas, 37 altas), incluidas las del runtime de Angular 20.3.9 | Alta | Nuevo | No |
| AUD-DES-08 | Backend: versiones sin verificar contra una base de CVE; jjwt 0.11.5 antiguo; el JAR de `target/` es de abril 2026 | Media | Nuevo | No |
| AUD-DES-09 | Vercel: falta `vercel.json` para que funcionen las rutas de Angular, y la salida es `dist/proyecto_valdiviezo/browser` | Media | Nuevo | Sí |
| AUD-DES-10 | Los errores 500 devuelven al cliente el mensaje interno de la excepción | Media | H-005 (síntoma); Nuevo (causa) | Sí |
| AUD-DES-11 | SQL propio de MySQL: no se puede migrar a PostgreSQL sin reescribir | Media (solo si se cambia de motor) | H-024 (mismas consultas) | No |
| AUD-DES-12 | El build de producción supera su presupuesto: 808 kB iniciales contra un límite de 500 kB, con advertencia CommonJS | Baja | Nuevo | Sí |
| AUD-DES-13 | `index.html` carga recursos de CDN sin SRI y Bootstrap entra dos veces | Baja | Nuevo | Sí |
| AUD-DES-14 | `minDate` de "Registrar Cita" se calcula en UTC: desde las 19:00 hora de Perú bloquea el día actual | Baja | Nuevo | Sí |
| AUD-DES-15 | La documentación de despliegue no coincide con la realidad (Java 17 o 21, rutas de otro equipo, comando de build) | Baja | Nuevo | Sí |

## Dependencias (npm audit, Maven)

### npm audit (autorizado)
Comandos: `npm audit --json` en `frontend/`, `e2e/` y la raíz. Las salidas están en el scratchpad (`audit-*.json`).

| Carpeta | Código de salida | info | low | moderate | high | critical | total | Dependencias |
|---|---|---|---|---|---|---|---|---|
| frontend/ | 1 | 0 | 1 | 13 | 37 | 3 | **54** | prod 86, dev 609, optional 109, total 694 |
| e2e/ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | total 3 |
| raíz | 0 | 0 | 0 | 0 | 0 | 0 | 0 | total 3 (no hay `package.json`; npm usó el `package-lock.json` suelto, que instala `@playwright/test` 1.64.1) |

**Paquetes directos afectados en frontend/** (salida real, `isDirect=true`):
- **Runtime, entran al bundle que se publica en Vercel:**
  - `@angular/core` (high): XSS en i18n, sanitización saltada con SVG o MathML, namespace bypass, GHSA-hh8m-fm6v-7cvg, entre otros.
  - `@angular/common` (high): fuga del token XSRF (GHSA-58c5-g7wp-6w37 y GHSA-jfgx-762w-99vr), DoS en `formatDate`/`digitsInfo`, `HttpTransferCache`.
  - `@angular/compiler` (high): XSS.
  - `@angular/forms`, `@angular/platform-browser` (high, por dependencia).
  - `@angular/router` (high: DoS en SSR; esta app no usa SSR).
  - `echarts` (moderate): XSS GHSA-fgmj-fm8m-jvvx, rango `<6.1.0`; la versión instalada es 6.0.0.
  - Versión instalada de Angular: `@angular/core 20.3.9` y `@angular/common 20.3.9`. Los rangos vulnerables llegan a `20.3.27` en core y `20.3.33` en common.
- **Herramientas de build (solo tiempo de compilación o servidor de desarrollo):**
  - `@angular/build` 20.3.8 (high, por vite, rollup y piscina).
  - `@angular/cli` 20.3.8 (high).
  - `@angular/compiler-cli` y `@angular/localize` (high).
- **Transitivas críticas:**
  - `piscina` (RCE por prototype pollution, GHSA-x9g3-xrwr-cwfg).
  - `tar` (path traversal, GHSA-34x7-hfp2-rc4v y otras).
  - `proxy-addr` (IP spoofing, GHSA-jqcg-44mw-7w3h).
  - Las tres son de herramientas de build o desarrollo; no van en el bundle del navegador.
- `fixAvailable: true` en todas. No se ejecutó `npm audit fix` ni `npm install`.

### Maven
- `./mvnw -q -o dependency:tree` → `[ERROR] No plugin found for prefix 'dependency' in the current project and in the plugin groups [...] available from the repositories [local (C:\Users\braya\.m2\repository), central ...]`. El plugin no está en caché y no se instaló.
- En su lugar se usó el `pom.xml` y el contenido del JAR existente (`unzip -l target/backend-0.0.1-SNAPSHOT.jar | grep BOOT-INF/lib`). Ese JAR tiene **fecha 15 abr 2026**, anterior a LB-9 (ver AUD-DES-08).

| Componente | Versión | Fuente | Observación |
|---|---|---|---|
| spring-boot-starter-parent | 3.5.6 | pom.xml | La rama 3.5 es la última 3.x. Fin del soporte OSS: **no verificado** (sin consulta externa) |
| spring-core/web/webmvc | 6.2.11 | JAR | no verificado contra base de CVE |
| spring-security-* | 6.5.5 | JAR | no verificado contra base de CVE |
| tomcat-embed-core | 10.1.46 | JAR | no verificado contra base de CVE |
| hibernate-core | 6.6.29.Final | JAR | — |
| mysql-connector-j | 9.4.0 | JAR | no verificado contra base de CVE |
| jjwt-api/impl/jackson | **0.11.5** | pom.xml (versión fija) | Rama antigua; la API usada (`parserBuilder`, `setSigningKey`) está deprecada en 0.12. No verificado contra base de CVE |
| jackson-databind | 2.19.2 | JAR | — |
| logback | 1.5.18 | JAR | — |
| lombok | 1.18.40 | JAR (va dentro del fat-jar) | — |
| `java.version` | **17** | pom.xml | La máquina tiene JDK 21 (compila con target 17) |

## Checklist por pieza (Vercel / backend / MySQL en la nube)

**Frontend en Vercel**
- [x] El build de producción compila (`rc=0`, 13 s). Detalle en AUD-DES-12.
- [ ] Carpeta de salida: con la configuración por defecto, `dist/proyecto_valdiviezo/browser`. Hay que declararla en Vercel ("Output Directory"), porque la detección automática puede no dar con `browser/`.
- [ ] Comando de build: `npm run build` (que ejecuta `ng build`, por defecto `production`). Instalación: `npm ci` (`frontend/package-lock.json` está versionado ✔).
- [ ] Root Directory del proyecto en Vercel = `frontend`.
- [ ] Reescritura de rutas de la SPA (`vercel.json` con rewrite a `/index.html`): **falta** (AUD-DES-09).
- [ ] URL del backend configurable en el build (environment + `fileReplacements`): **falta** (AUD-DES-02).
- [ ] El backend en HTTPS: si no, el navegador bloquea las llamadas desde una página HTTPS (mixed content).
- [ ] Versión de Node: `package.json` no tiene `engines`. Angular 20 necesita Node 20.19+ o 22.12+ o 24; hay que fijarla en Vercel.

**Backend (host aparte)**
- [ ] Java: el pom pide 17; un JRE 17 o 21 sirve. Elegir una y alinear la documentación (AUD-DES-15).
- [ ] Puerto: `server.port` no está definido, así que queda en 8080 fijo. Muchos hosts entregan `PORT` y Spring no lo lee solo (AUD-DES-05).
- [ ] Variables: `DB_PASSWORD` (obligatoria) ✔ y `DB_USER` ✔. **Faltan** variables para la URL de la BD, el secreto JWT y los orígenes CORS.
- [ ] Health check: `/actuator/health` → **404** (no hay actuator). Por ahora solo se puede apuntar a un GET existente.
- [ ] Perfil prod: no existe (`grep -rn "spring.profiles\|@Profile" backend/src` → sin resultados).
- [ ] Autenticación real: **bloqueante** (AUD-DES-01).

**MySQL en la nube**
- [ ] Script de carga `database/BDPostaMedica.sql`:
  - Usa `CREATE DATABASE IF NOT EXISTS` + `USE`. En un MySQL gestionado puede requerir permisos o una base ya creada.
  - Usa `DELIMITER //` con un procedimiento: hay que cargarlo con el cliente `mysql`, porque algunas consolas web no lo aceptan.
  - Usa `SET FOREIGN_KEY_CHECKS`.
- [ ] Usuario no root: localmente solo existe `root@localhost` (`SELECT user,host FROM mysql.user`). Hace falta un usuario de aplicación con permisos DML sobre `posta_medica_valdiviezo`.
- [ ] SSL: local `@@have_ssl=YES` y `@@require_secure_transport=0`. La URL JDBC no define `sslMode`; con un proveedor que exija SSL hay que agregar `sslMode=REQUIRED` o `VERIFY_CA`.
- [ ] `lower_case_table_names`: local = 1 (Windows). En Linux el valor por defecto es 0: **riesgo alto** (AUD-DES-04).
- [ ] Versión: necesita MySQL ≥ 8.0, porque se usa `ROW_NUMBER() OVER` en `CitaRepository`. Local: 8.0.46.
- [ ] `sql_mode` local = `ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,...` (el valor por defecto de 8.0). Las consultas ya funcionan con ese modo: `/api/reportes/ingresosMensuales` → 200.
- [ ] Zona horaria: local `@@time_zone=SYSTEM` ("Hora est. Pacífico, Sudamérica"). En la nube suele ser UTC. Las fechas se guardan como `DATE`/`TIME` y se mapean a `String`, así que el riesgo es bajo en el backend (ver AUD-DES-14 para el frontend).

## Hallazgos

### AUD-DES-01 — La API pública expone todos los datos sin autenticación, con claves incluidas
- Severidad: Crítica (bloquea el despliegue público)
- Relación con hallazgos existentes: H-016 (`anyRequest().permitAll()`), H-007 (claves en texto plano en el JSON), H-013 (el frontend descarga los datos de todos)
- Evidencia:
  - `WebSecurityConfig.java`: `.anyRequest().permitAll()) // Permitir todo para pruebas`, filtros JWT comentados y `NoOpPasswordEncoder`.
  - `curl -s http://localhost:8080/api/paciente` sin credenciales → `HTTP 200`, `registros: 18 | campos: idPaciente,nombres,apellidos,dni,clave,fecha_nacimiento,sexo,telefono,id_estado_paciente,id_ubigeo`. No se imprimieron los valores.
- Impacto en el negocio: en cuanto el backend tenga URL pública, cualquiera en Internet puede leer y modificar los datos de pacientes (DNI, teléfono, clave) e historias clínicas. Son datos de salud con protección legal.
- Recomendación (con alternativas): no publicar el backend antes de resolver H-016 y H-007. Opciones:
  - (a) Activar el filtro JWT existente con reglas por rol y BCrypt.
  - (b) Como medida temporal, publicar solo en una red privada o detrás de autenticación del host. Esto no sirve si el frontend en Vercel debe llamarlo desde el navegador.
- Esfuerzo estimado: alto (varios días: backend, frontend y migración de claves).
- Archivos involucrados: `backend/src/main/java/com/centro_valdiviezo/backend/seguridad/WebSecurityConfig.java`, `JWTAuthorizationFilter.java`, `model/Paciente.java`, `model/Medico.java`, servicios del frontend.
- Apto para integrante: No

### AUD-DES-02 — La URL del backend está fija en `http://localhost:8080` en 9 sitios y no hay `environment*.ts`
- Severidad: Alta (bloqueante para Vercel)
- Relación con hallazgos existentes: Nuevo
- Evidencia:
  - `grep -rn "localhost" frontend/src | grep -v spec` →
    - `core/config/appsettings.ts:2`
    - `core/services/auth.ts:9`
    - `core/services/service-cita.ts:37`
    - `core/services/usuario.ts:9`
    - `features/admin/reportes/admin-reportes.component.ts:21`
    - `features/medico/services/medico.service.ts:39`
    - `features/paciente/historial-medico/historial-medico.component.ts:16`
    - `features/paciente/mis-citas/mis-citas.component.ts:16`
    - `features/paciente/registrar-cita/registrar-cita.component.ts:29`
  - `find ... -name "environment*.ts"` → sin resultados.
  - `angular.json` → `production` sin `fileReplacements`.
  - En el build de producción, `grep -l "localhost:8080" dist/browser/*.js | wc -l` → **8** archivos.
- Impacto en el negocio: el sitio en Vercel intentaría conectarse al `localhost` del visitante. Ningún login ni pantalla con datos funcionaría. Además sería contenido mixto (HTTP desde HTTPS).
- Recomendación (con alternativas):
  - (a) Crear `environment.ts` y `environment.development.ts` con `fileReplacements` en `angular.json`, y hacer que los 9 sitios usen una sola constante (ya existe `appsettings.apiUrl`, que usan solo 3 servicios).
  - (b) Usar rutas relativas `/api` y un rewrite o proxy de Vercel hacia el backend. Esto evita CORS, pero acopla la configuración a Vercel.
- Esfuerzo estimado: medio (unas 2 h + pruebas E2E).
- Archivos involucrados: los 9 de arriba + `frontend/angular.json`.
- Apto para integrante: No (más de 3 archivos)

### AUD-DES-03 — CORS acepta un solo origen, fijo (`http://localhost:4200`): el origen de Vercel recibe 403
- Severidad: Alta (bloqueante)
- Relación con hallazgos existentes: Nuevo. H-010 (cerrado) quitó los `@CrossOrigin`; el único punto de control quedó en `WebSecurityConfig`.
- Evidencia:
  - `configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));`
  - `curl -X OPTIONS http://localhost:8080/api/cita -H "Origin: https://posta-valdiviezo.vercel.app" -H "Access-Control-Request-Method: GET"` → `HTTP/1.1 403` sin `Access-Control-Allow-Origin`. El dominio es un ejemplo.
  - El mismo preflight con `Origin: http://localhost:4200` → `HTTP/1.1 200`, `Access-Control-Allow-Origin: http://localhost:4200`.
- Impacto en el negocio: aunque se corrija AUD-DES-02, el navegador bloquea todas las llamadas desde el dominio de Vercel.
- Recomendación (con alternativas):
  - (a) Leer los orígenes de una propiedad, por ejemplo `app.cors.allowed-origins=${CORS_ORIGINS:http://localhost:4200}`, con varios valores.
  - (b) Usar `setAllowedOriginPatterns` para las URL de preview de Vercel (`https://*-<equipo>.vercel.app`). Ojo: no combinar `*` con `allowCredentials(true)`.
- Esfuerzo estimado: bajo (1 h).
- Archivos involucrados: `backend/src/main/java/com/centro_valdiviezo/backend/seguridad/WebSecurityConfig.java`, `backend/src/main/resources/application.properties`.
- Apto para integrante: Sí

### AUD-DES-04 — Nombres de tabla con mayúsculas mezcladas (`Medico`/`medico`): falla en MySQL de Linux
- Severidad: Alta
- Relación con hallazgos existentes: Nuevo
- Evidencia:
  - `database/BDPostaMedica.sql:94` crea `CREATE TABLE Medico (`, pero la entidad usa `model/Medico.java:6` `@Table(name = "medico")`.
  - `MedicoRepository.java:23` `FROM Medico`; `:26` `from medico group by id_especialidad`; `:32` `from Medico m`. `CitaRepository` usa `JOIN Medico m`.
  - Las demás entidades usan mayúscula inicial (`@Table(name = "Cita")`, `"Paciente"`, `"Administrador"`…), y `PhysicalNamingStrategyStandardImpl` conserva las mayúsculas.
  - MySQL local: `@@lower_case_table_names: 1`. `information_schema.tables` lista todo en minúsculas (`administrador, cie, cita, ..., medico, paciente, ubigeo`). Por eso hoy funciona.
  - **No verificado en Linux** (no hay un MySQL de Linux disponible). La deducción: con `lower_case_table_names=0`, el valor por defecto en Linux, los nombres distinguen mayúsculas y `medico` ≠ `Medico`.
- Impacto en el negocio: en un MySQL de Linux, las pantallas de médicos, reportes y login de médico pueden fallar con "Table doesn't exist". Además, un `mysqldump` de la base local exporta las tablas **en minúsculas**: si se migra así, fallarían también `Cita`, `Paciente`, etc.
- Recomendación (con alternativas):
  - (a) Unificar los nombres: el mismo nombre exacto en el script, en `@Table` y en las consultas nativas.
  - (b) Crear la instancia gestionada con `lower_case_table_names=1`. En MySQL 8 solo se puede fijar al inicializar el servidor; hay que confirmar si el proveedor lo permite.
  - (c) Cargar siempre desde `BDPostaMedica.sql` y nunca desde un dump de Windows.
- Esfuerzo estimado: medio.
- Archivos involucrados: `backend/src/main/java/com/centro_valdiviezo/backend/model/Medico.java`, `repository/MedicoRepository.java`, `repository/CitaRepository.java`, `database/BDPostaMedica.sql`.
- Apto para integrante: No (necesita pruebas en un motor sensible a mayúsculas)

### AUD-DES-05 — `application.properties` no está listo para producción
- Severidad: Media
- Relación con hallazgos existentes: H-006 (cerrado: las credenciales ya están en variables de entorno; esto lo complementa)
- Evidencia (contenido real; las claves no aparecen):
  ```
  spring.datasource.url=jdbc:mysql://localhost:3306/posta_medica_valdiviezo
  spring.datasource.username=${DB_USER:root}
  spring.datasource.password=${DB_PASSWORD}
  spring.jpa.hibernate.ddl-auto=none
  spring.jpa.show-sql=true
  ```
  - No hay `server.port`, `spring.profiles` ni `sslMode`.
  - `/actuator/health` → `404`.
- Impacto en el negocio:
  - No se puede apuntar a una BD remota sin editar el archivo.
  - En hosts que asignan `PORT`, el servicio no responde en el puerto esperado.
  - `show-sql` llena los logs de producción con todas las consultas.
  - No hay una ruta de health check estable.
  - `ddl-auto=none` es correcto: no modifica el esquema.
- Recomendación (con alternativas):
  - (a) `spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/posta_medica_valdiviezo}`, `server.port=${PORT:8080}`, `spring.jpa.show-sql=${SHOW_SQL:false}`.
  - (b) Un `application-prod.properties` activado con `SPRING_PROFILES_ACTIVE=prod`.
  - Opcional: agregar `spring-boot-starter-actuator` exponiendo solo `health`.
- Esfuerzo estimado: bajo.
- Archivos involucrados: `backend/src/main/resources/application.properties` (+ `pom.xml` si se agrega actuator).
- Apto para integrante: Sí

### AUD-DES-06 — El secreto JWT está escrito en el código
- Severidad: Alta
- Relación con hallazgos existentes: H-025
- Evidencia: `TokenUtils.java:15: private final static String ACCESS_TOKEN_SECRET = "****…(enmascarado)";` (valor real enmascarado). Está versionado.
- Impacto en el negocio: cuando se active JWT (AUD-DES-01), cualquiera con acceso al repo puede firmar tokens válidos. El secreto ya está en el historial de Git.
- Recomendación (con alternativas):
  - (a) `@Value("${JWT_SECRET}")` sin valor por defecto, con una clave nueva (la actual debe considerarse comprometida).
  - (b) Un gestor de secretos del host.
- Esfuerzo estimado: bajo-medio (`TokenUtils` usa campos `static`, así que hay que convertirlo en bean).
- Archivos involucrados: `backend/src/main/java/com/centro_valdiviezo/backend/seguridad/TokenUtils.java`, `application.properties`.
- Apto para integrante: Sí

### AUD-DES-07 — npm audit del frontend: 54 vulnerabilidades, incluidas las del runtime de Angular
- Severidad: Alta
- Relación con hallazgos existentes: Nuevo
- Evidencia: `npm audit --json` en `frontend/` → `{"info":0,"low":1,"moderate":13,"high":37,"critical":3,"total":54}`. Las versiones instaladas son `@angular/core 20.3.9` y `echarts 6.0.0`. Detalle en "Dependencias".
- Impacto en el negocio: las vulnerabilidades del runtime (XSS en el sanitizador, fuga del token XSRF) van dentro del bundle publicado. Las críticas (`piscina`, `tar`, `proxy-addr`) afectan solo a la máquina de build o desarrollo.
- Recomendación (con alternativas):
  - (a) Actualizar a la última versión parche de Angular 20.3.x y a `echarts ≥ 6.1.0` en un RFC propio, con la batería completa de pruebas.
  - (b) Migrar a una versión mayor de Angular con soporte activo. Es más trabajo.
  - No usar `npm audit fix --force` sin revisión.
- Esfuerzo estimado: medio (actualizar + regresión E2E).
- Archivos involucrados: `frontend/package.json`, `frontend/package-lock.json`.
- Apto para integrante: No (actualización con riesgo de regresión)

### AUD-DES-08 — Backend: versiones sin verificar contra CVE; jjwt antiguo; JAR desactualizado
- Severidad: Media
- Relación con hallazgos existentes: Nuevo
- Evidencia:
  - `dependency:tree` no disponible (error citado arriba).
  - Versiones tomadas del pom y del JAR (tabla en "Dependencias").
  - `ls -la backend/target` → `backend-0.0.1-SNAPSHOT.jar` con fecha `Apr 15 2026`, anterior a LB-9.
  - **No verificado contra base de CVE.**
- Impacto en el negocio: no se sabe si las versiones tienen CVE conocidas. Si alguien desplegara el JAR que está en `target/`, publicaría código viejo (anterior a RFC-001…RFC-009, con la clave de BD en texto plano según H-006).
- Recomendación (con alternativas):
  - (a) Ejecutar OWASP dependency-check o `mvn versions:display-dependency-updates` en una tarea aparte, con autorización.
  - (b) Usar Dependabot en GitHub.
  - Construir siempre el artefacto en CI desde el tag LB-n, nunca reutilizar `target/`.
  - Subir jjwt a 0.12.x junto con AUD-DES-06.
- Esfuerzo estimado: bajo (escaneo) / medio (actualización).
- Archivos involucrados: `backend/pom.xml`.
- Apto para integrante: No

### AUD-DES-09 — Vercel: falta `vercel.json` para las rutas de Angular
- Severidad: Media
- Relación con hallazgos existentes: Nuevo
- Evidencia:
  - `find` de `vercel.json` → sin resultados.
  - `app.routes.ts` usa rutas con path (`/admin/inicio`, `/paciente/mis-citas`, `/medico-dashboard/...`).
  - `grep "withHashLocation|useHash"` → sin resultados.
  - La salida del build está en `dist/browser/` (`ls dist` → `3rdpartylicenses.txt  browser  prerendered-routes.json`). Sin `--output-path` sería `dist/proyecto_valdiviezo/browser`.
  - No se probó en Vercel.
- Impacto en el negocio: recargar la página o abrir un enlace directo (por ejemplo `/paciente/mis-citas`) daría 404 en Vercel.
- Recomendación (con alternativas):
  - (a) `frontend/vercel.json` con `"rewrites":[{"source":"/(.*)","destination":"/index.html"}]` y Output Directory `dist/proyecto_valdiviezo/browser`.
  - (b) Usar `withHashLocation()`. Cambia las URL y afecta las pruebas E2E.
- Esfuerzo estimado: bajo.
- Archivos involucrados: `frontend/vercel.json` (nuevo).
- Apto para integrante: Sí

### AUD-DES-10 — Los errores 500 devuelven al cliente el mensaje interno de la excepción
- Severidad: Media
- Relación con hallazgos existentes: H-005 (es el endpoint usado como evidencia); la causa es nueva
- Evidencia:
  - `GlobalExceptionHandler.java`: `error.put("message", ex.getMessage());` para cualquier `RuntimeException`.
  - `curl http://localhost:8080/api/medico/resumenMedico` → `HTTP 500` `{"message":"Cannot instantiate query result type 'com.centro_valdiviezo.backend.dto.ResumenMedico' due to: Result class must have a single constructor with exactly 2 parameters ...","status":"error"}`.
- Impacto en el negocio: en producción revela nombres de clases y, en errores de BD, detalles del esquema o SQL que facilitan un ataque.
- Recomendación (con alternativas):
  - (a) Devolver un mensaje genérico con un identificador de correlación y registrar el detalle en el log.
  - (b) Mostrar el detalle solo con el perfil `dev`.
- Esfuerzo estimado: bajo.
- Archivos involucrados: `backend/src/main/java/com/centro_valdiviezo/backend/exception/GlobalExceptionHandler.java`.
- Apto para integrante: Sí

### AUD-DES-11 — SQL propio de MySQL: no se puede migrar a PostgreSQL sin reescribir
- Severidad: Media (solo si el proveedor en la nube no es MySQL)
- Relación con hallazgos existentes: H-024 (mismas consultas de ingresos)
- Evidencia:
  - `grep -c "nativeQuery = true"` → `CitaRepository` 6, `MedicoRepository` 3, `Disponibilidad_MedicoRepository` 1 (10 en total).
  - `CitaRepository.java:51` usa `DATE_FORMAT(c.fecha_cita, '%Y-%m')` (no existe en PostgreSQL) y agrupa por un alias.
  - `ROW_NUMBER() OVER` exige MySQL ≥ 8.0.
  - El script usa `AUTO_INCREMENT`, `sexo ENUM('M','F')`, `DELIMITER //` + `CREATE PROCEDURE`, `SET FOREIGN_KEY_CHECKS` y `CREATE DATABASE ... ; USE`.
  - Hay identificadores con mayúsculas sin comillas (`idPaciente`, `idCita`): PostgreSQL los pasa a minúsculas.
  - No se encontraron backticks, `GROUP_CONCAT` ni `LIMIT` en el código Java.
- Impacto en el negocio: con PostgreSQL (por ejemplo Supabase o Neon) hay que reescribir el script y las consultas nativas. Con un MySQL 8 gestionado (Aiven, Azure, RDS, PlanetScale) el riesgo baja a AUD-DES-04 y al SSL. PlanetScale no admite FK ni procedimientos en todos sus planes: no verificado.
- Recomendación (con alternativas):
  - (a) Elegir MySQL ≥ 8.0 gestionado (recomendado).
  - (b) Si es PostgreSQL, pasar las nativas a JPQL o `to_char`, migrar el script y mapear el `ENUM`.
- Esfuerzo estimado: bajo (a) / alto (b).
- Archivos involucrados: `backend/src/main/java/com/centro_valdiviezo/backend/repository/*.java`, `database/BDPostaMedica.sql`.
- Apto para integrante: No

### AUD-DES-12 — El build de producción supera su presupuesto, con advertencia CommonJS
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo
- Evidencia (`npx ng build --configuration production --output-path <scratchpad>/dist`, `rc=0`, 17:01:49–17:02:02):
  ```
  Initial total | 808.17 kB | 183.14 kB
  ▲ [WARNING] bundle initial exceeded maximum budget. Budget 500.00 kB was not met by 308.17 kB with a total of 808.17 kB.
  ▲ [WARNING] Module 'jquery' used by 'src/app/features/admin/legacy/detalle-medico/detalle-medico.ts' is not ESM
  chunk-RLLNB3AE.js | cant-estado-cita | 1.13 MB | 304.12 kB
  [baseline-browser-mapping] The data in this module is over two months old.
  ```
  `styles` = 230.97 kB: Bootstrap entra por `angular.json`. `scripts` = 169.18 kB (bootstrap.js, popper, jquery).
- Impacto en el negocio: carga inicial más lenta en móviles. No impide el despliegue: el límite de error es 1 MB y no se superó.
- Recomendación (con alternativas):
  - (a) Quitar jQuery y el Bootstrap JS duplicado (ver AUD-DES-13).
  - (b) Si no, ajustar el presupuesto de forma justificada.
  - Cargar `echarts` de forma modular (es el chunk lazy de 1.13 MB).
- Esfuerzo estimado: medio.
- Archivos involucrados: `frontend/angular.json`, `frontend/src/index.html`, `features/admin/legacy/detalle-medico/detalle-medico.ts`.
- Apto para integrante: Sí (solo la parte de `angular.json` e `index.html`)

### AUD-DES-13 — `index.html` carga recursos de CDN sin SRI y Bootstrap entra dos veces
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo
- Evidencia: el `index.html` del build carga `https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css`, `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css` y `https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js`. `grep -c "integrity="` → `0`. Además `angular.json` empaqueta `bootstrap` 5.3.8 (CSS y JS).
- Impacto en el negocio: si un CDN se ve comprometido, se ejecuta código ajeno en el sitio. Hay dos versiones distintas de Bootstrap (5.3.0 y 5.3.8) y peso duplicado.
- Recomendación (con alternativas):
  - (a) Quitar los enlaces de Bootstrap del CDN (ya está en el bundle) y agregar `integrity` + `crossorigin` a Font Awesome.
  - (b) Instalar Font Awesome por npm.
- Esfuerzo estimado: bajo (requiere verificación visual).
- Archivos involucrados: `frontend/src/index.html`.
- Apto para integrante: Sí

### AUD-DES-14 — `minDate` de "Registrar Cita" se calcula en UTC
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo (no depende de dónde se despliegue; se detectó al revisar la zona horaria)
- Evidencia:
  - `registrar-cita.component.ts:18: minDate: string = new Date().toISOString().split('T')[0];`
  - `TZ=America/Lima node -e '... new Date("2026-11-09T20:30:00-05:00") ...'` → `local: Mon Nov 09 2026 20:30:00 GMT-0500 (hora estándar de Perú) | minDate: 2026-11-10`.
  - No se probó en pantalla.
- Impacto en el negocio: desde las 19:00 hora de Perú, el paciente no puede elegir el día actual.
- Recomendación (con alternativas):
  - (a) Calcular la fecha con los componentes locales (`getFullYear/getMonth/getDate`).
  - (b) Usar `formatDate(new Date(),'yyyy-MM-dd','es-PE')`.
  - Debe ir en un RFC correctivo con prueba unitaria.
- Esfuerzo estimado: bajo.
- Archivos involucrados: `frontend/src/app/features/paciente/registrar-cita/registrar-cita.component.ts`.
- Apto para integrante: Sí

### AUD-DES-15 — La documentación de despliegue no coincide con la realidad
- Severidad: Baja
- Relación con hallazgos existentes: Nuevo
- Evidencia:
  - `README.md` dice "Java 17" y "Angular 17+"; el instalado es Angular 20.3.9, el pom pide Java 17 y la máquina usa JDK 21.
  - `SETUP.md` tiene rutas de otro equipo (`c:\Users\ORLANDO\Desktop\sitio web Jean Piier\proyecto_valdiviezo\...`, estructura anterior a LB-4) y la contraseña de ejemplo `admin`.
  - `README.md` dice "Contraseñas encriptadas (preparado para BCrypt)", pero el código usa `NoOpPasswordEncoder`.
  - README lista `POST /api/auth/login`; el frontend llama a `/login` (`auth.ts:9`).
  - No hay una sección de despliegue en ninguno de los dos.
- Impacto en el negocio: quien despliegue seguirá instrucciones incorrectas.
- Recomendación (con alternativas): (a) Corregir README y SETUP y agregar una sección "Despliegue" con el checklist de este informe; (b) crear un documento nuevo en `docs/`.
- Esfuerzo estimado: bajo.
- Archivos involucrados: `README.md`, `SETUP.md`.
- Apto para integrante: Sí

## Revisado sin hallazgos
- `e2e/`: `npm audit` → 0 vulnerabilidades. Raíz: 0 (solo hay un `package-lock.json` suelto, ignorado por `.gitignore:12`).
- `frontend/package-lock.json` está versionado (`git ls-files`), así que Vercel puede usar `npm ci`.
- `spring.jpa.hibernate.ddl-auto=none`: no modifica el esquema en producción ✔.
- Las credenciales de la BD vienen de variables (`${DB_USER:root}`, `${DB_PASSWORD}`), según H-006/RFC-009 ✔.
- `sql_mode` estricto con `ONLY_FULL_GROUP_BY`: ya es el modo local y los reportes responden (`/api/reportes/ingresosMensuales` → 200, `/api/medico/especialidad/1` → 200).
- Juego de caracteres: la base usa `utf8mb4` / `utf8mb4_0900_ai_ci` en todas las tablas. Compatible con MySQL 8 gestionado; no lo es con MariaDB o MySQL 5.7, que no tienen esa collation.
- El backend no usa `LocalDate.now()`, `new Date()` ni `TimeZone`: las fechas viajan como `String`.
- `backend/target/` y `frontend/.angular/` están ignorados por Git (`backend/.gitignore:2`, `.gitignore:8`).
- `provideHttpClient()` está configurado en `main.ts`.

## Limitaciones
- **No se ejecutó `./mvnw -q -DskipTests package`** (paso 5 de la definición): el orquestador lo prohibió porque el backend corre desde `backend/target`. La compilación del backend queda **no verificada** en esta auditoría.
- `dependency:tree` no disponible (plugin no cacheado, modo offline). Las versiones salen de un JAR de abril 2026, que puede no coincidir con LB-9.
- No hay base de CVE local para Maven: las vulnerabilidades del backend están **no verificadas**. No se instaló OWASP dependency-check.
- No se probó en Vercel, en un host de backend ni en un MySQL de Linux. AUD-DES-04 y AUD-DES-09 son deducciones del código y de la configuración local.
- Las fechas de fin de soporte de Spring Boot 3.5 y Angular 20 no se consultaron en fuentes externas: no verificado.
- `ng build` actualiza la caché `frontend/.angular/cache` (carpeta ignorada por Git, anterior a esta auditoría). La salida se escribió solo en el scratchpad.
- Archivos temporales en el scratchpad `C:/Users/braya/AppData/Local/Temp/claude/85b186d9b1722304/0f4da1a6-6e30-4eb8-804c-f218b75ed1f0/scratchpad/aud-despliegue/`: `audit-*.json`, `ngbuild.log`, `dist/` y **`pac.json`**, que es la respuesta de `/api/paciente` con datos de pacientes y sus claves. Conviene borrarlo; este auditor no puede borrar archivos.
- La auditoría se interrumpió una vez por un error de límite de la API y se retomó en la misma sesión; no se repitieron comandos.
- No se modificó ningún archivo del repositorio (`git status --short` final: `M docs/BITACORA.md`, presente desde antes, y `?? .claude/agents/`).
