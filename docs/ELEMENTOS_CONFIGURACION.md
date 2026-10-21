# Elementos de configuración (identificación)

Inventario de los elementos de configuración (EC) del sistema "Posta Médica Valdiviezo" en la línea base **LB-0**.

- **Versión:** versión declarada por el propio elemento cuando existe (`pom.xml`, `package.json`, versión del instalador). Si el elemento no declara versión, se usa la línea base en la que está (`LB-0`).
- **Fecha:** fecha en que el elemento entró al control de versiones (commit inicial `17e2118`, 2026-10-20), salvo que se indique otra.
- **Autor / Aprobado por:** el proyecto se recibió sin registro de autoría ni de aprobaciones. Donde no hay dato real se escribe "Sin registro".
- **Distribución:** dónde se encuentra y quién lo recibe. Hoy todo vive en el repositorio Git local del grupo; no hay repositorio remoto.

---

## Elementos del producto

| ID | Nombre | Tipo | Versión | Estado | Fecha | Ubicación | Autor / Aprobado por | Relación con otros elementos | Distribución |
|---|---|---|---|---|---|---|---|---|---|
| EC-01 | Código fuente del backend | Código fuente (Java / Spring Boot) | 0.0.1-SNAPSHOT (`pom.xml`) | En línea base LB-0 | 2026-10-20 | `backend/backend/src/main/java/` (64 archivos `.java`: 14 controladores, modelos, repositorios, servicios, DTO) | Sin registro / Sin registro | Lo construye EC-05. Lo configura EC-04. Lee y escribe en la BD creada por EC-03. Lo consume EC-02. | Repositorio Git local |
| EC-02 | Código fuente del frontend | Código fuente (Angular / TypeScript) | 0.0.0 (`package.json`); LB-1 | Modificado en LB-1 (RFC-001: login, sesión y mensajes) | 2026-10-20 | `proyecto_valdiviezo/src/` (58 archivos `.ts` sin contar `.spec.ts`, más plantillas HTML y CSS) | Sin registro / Sin registro | Depende de EC-01 (llama a `http://localhost:8080`). Lo construyen EC-06 y EC-07. | Repositorio Git local |
| EC-03 | Script de base de datos | Script SQL | LB-0 | En línea base LB-0 (modificado: nombre de BD `posta_medica_valdiviezo`) | 2026-10-20 | `BDPostaMedica.sql` | Sin registro / Sin registro | Crea la BD `posta_medica_valdiviezo` (12 tablas y datos de ejemplo) que usa EC-01. Su nombre debe coincidir con la URL de EC-04. Requiere EC-14. | Repositorio Git local |
| EC-04 | Configuración del backend | Archivo de configuración | LB-0 | En línea base LB-0 (modificado: URL y contraseña) | 2026-10-20 | `backend/backend/src/main/resources/application.properties` | Sin registro / Sin registro | Configura la conexión de EC-01 a la BD creada por EC-03 (URL, usuario, contraseña) y el comportamiento de JPA. Contiene credenciales (H-006). | Repositorio Git local |
| EC-05 | Descriptor de construcción del backend | Archivo de construcción (Maven) | Proyecto 0.0.1-SNAPSHOT; padre Spring Boot 3.5.6; `java.version` 17 | En línea base LB-0 | 2026-10-20 | `backend/backend/pom.xml` (y wrapper `mvnw`, `mvnw.cmd`, `.mvn/wrapper/`) | Sin registro / Sin registro | Construye EC-01. Declara dependencias: spring-boot-starter-web, spring-boot-starter-data-jpa, mysql-connector-j, jjwt 0.11.5, spring-boot-starter-test. Requiere EC-12 y EC-15. | Repositorio Git local |
| EC-06 | Descriptor de dependencias del frontend | Archivo de construcción (npm) | 0.0.0; `@angular/core` ^20.3.0, `@angular/cli` ^20.3.7, `typescript` ~5.9.2 | En línea base LB-0 | 2026-10-20 | `proyecto_valdiviezo/package.json` y `package-lock.json` | Sin registro / Sin registro | Define las dependencias y scripts (`npm start`) de EC-02. `package-lock.json` fija las versiones exactas. Requiere EC-13. | Repositorio Git local |
| EC-07 | Configuración del espacio de trabajo Angular | Archivo de configuración | LB-0 | En línea base LB-0 | 2026-10-20 | `proyecto_valdiviezo/angular.json` (y `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`) | Sin registro / Sin registro | Define cómo EC-16 compila y sirve EC-02. | Repositorio Git local |
| EC-08 | Pruebas automatizadas de Playwright | Código de pruebas (TypeScript) | `@playwright/test` ^1.57.0 (declarado en `package.json` raíz, no instalado) | En línea base LB-0 (no ejecutadas) | 2026-10-20 | `tests/` (6 archivos `.spec.ts`), `package.json` raíz, `test-results/` | Sin registro / Sin registro | Prueban EC-02 en ejecución, que a su vez depende de EC-01. Cubren admin-reportes y el módulo médico. | Repositorio Git local |
| EC-09 | README del proyecto | Documentación | LB-0 | En línea base LB-0 (modificado: nombre de BD) | 2026-10-20 | `README.md` | Sin registro / Sin registro | Describe EC-01, EC-02 y EC-03. | Repositorio Git local |
| EC-10 | Guía de instalación | Documentación | LB-0 | En línea base LB-0 (modificado: nombre de BD) | 2026-10-20 | `SETUP.md` | Sin registro / Sin registro | Explica cómo preparar EC-03, EC-04 y las herramientas EC-12 a EC-16. | Repositorio Git local |
| EC-11 | Documentación de mantenimiento | Documentación | LB-0 | Creado en LB-0 | 2026-10-20 | `docs/` (`BITACORA.md`, `HALLAZGOS.md`, `PRUEBAS.md`, `ELEMENTOS_CONFIGURACION.md`, `rfc/`, `evidencias/`, `refactorizaciones/`) | Grupo del curso / Sin registro | Registra el estado de todos los EC. `HALLAZGOS.md` referencia ubicaciones en EC-01, EC-02 y EC-04. | Repositorio Git local; insumo para quienes redactan el informe |

## Herramientas requeridas

Versiones instaladas y verificadas en el equipo de desarrollo durante la línea base.

| ID | Nombre | Tipo | Versión | Estado | Fecha | Ubicación | Autor / Aprobado por | Relación con otros elementos | Distribución |
|---|---|---|---|---|---|---|---|---|---|
| EC-12 | JDK (OpenJDK) | Herramienta (compilador / entorno Java) | 21.0.12.1 LTS (`java -version`) | Instalado y verificado | 2026-10-20 | Equipo de desarrollo (PATH del sistema) | Proyecto OpenJDK (distribución exacta sin registro) / Sin registro | Compila y ejecuta EC-01 vía EC-15. `pom.xml` (EC-05) pide Java 17; el JDK 21 lo compila sin errores. | Instalación local en cada equipo |
| EC-13 | Node.js y npm | Herramienta (entorno JavaScript) | Node v24.18.0; npm 11.16.0 | Instalado y verificado | 2026-10-20 | Equipo de desarrollo (PATH del sistema) | OpenJS Foundation (proveedor) / Sin registro | Instala las dependencias de EC-06 y ejecuta EC-16. | Instalación local en cada equipo |
| EC-14 | MySQL Community Server | Herramienta (motor de base de datos) | 8.0.46 for Win64 | Instalado y verificado (servicio `MySQL80`) | 2026-10-20 | `C:\Program Files\MySQL\MySQL Server 8.0\` | Oracle (proveedor) / Sin registro | Aloja la BD creada por EC-03. EC-01 se conecta según EC-04. | Instalación local en cada equipo |
| EC-15 | Apache Maven (vía wrapper) | Herramienta (construcción Java) | 3.9.11 (`mvnw -v`) | Instalado y verificado | 2026-10-20 | `backend/backend/mvnw` (descarga Maven automáticamente) | Apache Software Foundation (proveedor) / Sin registro | Construye y ejecuta EC-01 según EC-05. Requiere EC-12. | Incluido en el repositorio (wrapper) |
| EC-16 | Angular CLI | Herramienta (construcción frontend) | CLI 20.3.8; framework Angular 20.3.9 (`ng version`) | Instalado y verificado | 2026-10-20 | `proyecto_valdiviezo/node_modules/` (dependencia de desarrollo) | Google (proveedor) / Sin registro | Compila y sirve EC-02 según EC-07. Requiere EC-13. | Se instala con `npm install` |
| EC-17 | Git | Herramienta (control de versiones) | 2.55.0.windows.2 | Instalado y verificado | 2026-10-20 | Equipo de desarrollo (PATH del sistema) | Proveedor: comunidad Git / Sin registro | Versiona todos los EC del producto (EC-01 a EC-11). Las líneas base se marcan con tags (`LB-0`). | Instalación local en cada equipo |
