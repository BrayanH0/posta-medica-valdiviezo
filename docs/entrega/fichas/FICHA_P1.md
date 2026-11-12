# Ficha P1 — Nada sensible en la consola y errores con rastro en el servidor

| Dato | Valor |
|---|---|
| RFC | RFC-014 (`docs/rfc/RFC-014.md`) |
| Hallazgo / issue | H-043 → issue **#43** (comprueba el número en GitHub antes de abrir el PR) |
| Rama que vas a crear | `feature/rfc-014-p1-consola-y-log` |
| Rama base | `develop` |
| Archivos | 4 que se modifican + 1 prueba nueva |

---

## 1. Qué arreglas y por qué (para la exposición)

1. Al iniciar sesión o registrarse, la página escribía en la consola del navegador el DNI, la respuesta del login y **la contraseña del registro**. Cualquiera que abra las herramientas del navegador (F12) en una computadora compartida las podía ver.
2. Quitamos esas 6 líneas `console.log`. La pantalla funciona igual.
3. En el servidor, los errores 500 no dejaban rastro en el log y nadie se enteraba. Ahora cada error se registra con un *logger*, **sin cambiar** la respuesta que recibe el navegador.

**Preguntas probables:**

- **¿Por qué no basta con que la contraseña viaje por HTTPS?** HTTPS protege el viaje por la red, pero la consola está **dentro** del navegador del usuario: lo que se imprime allí queda a la vista de quien use la computadora o de una extensión que lea la consola.
- **¿Cambió algo para el usuario?** No. Las pantallas y los mensajes son los mismos, y el cuerpo del error 500 es idéntico (se comprobó con `curl` antes y después). Solo cambia lo que se escribe en la consola y en el log del servidor.

---

## 2. Antes de empezar

- Necesitas una cuenta de GitHub con permiso de escritura en `BrayanH0/posta-medica-valdiviezo` (pídeselo a Brayan si no lo tienes).
- Todo se hace en la página web de GitHub. No necesitas instalar nada.
- **Regla de oro:** reemplaza solo lo que dice esta ficha. Copia los bloques con el botón de copiar de GitHub (el ícono de dos hojas, arriba a la derecha de cada bloque) para no perder espacios.

### Cómo reemplazar un bloque en el editor de GitHub
1. Haz clic dentro del editor y pulsa **Ctrl+F**. Escribe una parte de la **primera línea** del bloque ANTES y pulsa Enter para llegar a ella.
2. Haz clic **al inicio** de esa primera línea (antes de los espacios de la izquierda).
3. Busca la **última línea** del bloque ANTES, mantén pulsada **Shift** y haz clic **al final** de esa línea. Ahora el bloque está seleccionado.
4. Comprueba que lo seleccionado es exactamente el bloque ANTES (ni una línea más ni una menos).
5. Pulsa **Ctrl+V** para pegar el bloque DESPUÉS.

### Cómo reemplazar un archivo completo
1. Haz clic dentro del editor, pulsa **Ctrl+A** (selecciona todo) y luego **Ctrl+V** con el contenido DESPUÉS copiado.

---

## 3. Paso a paso

### Paso 1 — Primer archivo: crea la rama y el pull request

1. Entra a `https://github.com/BrayanH0/posta-medica-valdiviezo`.
2. Arriba a la izquierda verás un botón con el nombre de la rama (dice `master`). Haz clic y elige **`develop`**.
3. Abre el archivo `frontend/src/app/features/auth/login-paciente/login-paciente.component.ts` (haz clic en las carpetas una por una).
4. Comprueba que arriba dice **develop**. Haz clic en el **lápiz** ("Edit this file").
5. Reemplaza el bloque ANTES por el DESPUÉS de la sección 4.1.
6. Haz clic en el botón verde **"Commit changes..."**.
7. En la ventana:
   - **Commit message:** `P1: quitar console.log del login de paciente (RFC-014)`
   - Elige **"Create a new branch for this commit and start a pull request"**.
   - En el nombre de la rama borra lo que aparece y escribe exactamente: `feature/rfc-014-p1-consola-y-log`
   - Haz clic en **"Propose changes"**.
8. Se abre la página "Open a pull request". **Antes de crearlo**, mira la línea de arriba: debe decir **`base: develop`** ← `compare: feature/rfc-014-p1-consola-y-log`. Si dice `base: master`, haz clic en `base` y elige `develop`.
9. Escribe el título y la descripción de la sección 6 y haz clic en **"Create pull request"**.

### Paso 2 — Los demás archivos en la MISMA rama

Para cada archivo de las secciones 4.2, 4.3 y 4.4:
1. Ve a la pestaña **Code** del repositorio.
2. En el botón de la rama elige **`feature/rfc-014-p1-consola-y-log`** (no `develop`, no `master`).
3. Abre el archivo, haz clic en el lápiz y reemplaza el bloque.
4. **"Commit changes..."** → escribe el mensaje de commit de esa sección → elige **"Commit directly to the `feature/rfc-014-p1-consola-y-log` branch"** → **"Commit changes"**.
5. El pull request se actualiza solo: en su pestaña "Commits" verás un commit más.

### Paso 3 — La prueba nueva (sección 4.5)
1. En la rama `feature/rfc-014-p1-consola-y-log`, entra a la carpeta `backend/src/test/java/com/centro_valdiviezo/backend/`.
2. Haz clic en **"Add file" → "Create new file"**.
3. En el nombre escribe `exception/GlobalExceptionHandlerTest.java` (al escribir la `/`, GitHub crea la carpeta `exception`).
4. Pega el contenido de la sección 4.5.
5. **"Commit changes..."** → mensaje de la sección 4.5 → **"Commit directly to the `feature/rfc-014-p1-consola-y-log` branch"**.

Al final, el pull request debe tener **5 commits** y 5 archivos cambiados (pestaña "Files changed").

---

## 4. Archivos

### 4.1 `frontend/src/app/features/auth/login-paciente/login-paciente.component.ts`
Commit: `P1: quitar console.log del login de paciente (RFC-014)`

ANTES (4 líneas):
<!-- v:antes frontend/src/app/features/auth/login-paciente/login-paciente.component.ts -->
```ts
    console.log('Intentando login paciente:', this.dni);
    this.authService.login(this.dni, this.clave).subscribe({
        next: (res: any) => {
            console.log('Login exitoso', res);
```

DESPUÉS (2 líneas):
<!-- v:despues frontend/src/app/features/auth/login-paciente/login-paciente.component.ts -->
```ts
    this.authService.login(this.dni, this.clave).subscribe({
        next: (res: any) => {
```

### 4.2 `frontend/src/app/features/auth/login-medico/login-medico.component.ts`
Commit: `P1: quitar console.log del login de medico (RFC-014)`

ANTES (4 líneas):
<!-- v:antes frontend/src/app/features/auth/login-medico/login-medico.component.ts -->
```ts
    console.log('Intentando login medico:', this.dni);
    this.authService.login(this.dni, this.clave).subscribe({
        next: (res: any) => {
            console.log('Login exitoso', res);
```

DESPUÉS (2 líneas):
<!-- v:despues frontend/src/app/features/auth/login-medico/login-medico.component.ts -->
```ts
    this.authService.login(this.dni, this.clave).subscribe({
        next: (res: any) => {
```

### 4.3 `frontend/src/app/features/auth/registro/registro.component.ts`
Commit: `P1: no imprimir la clave del registro en consola (RFC-014)`

ANTES (6 líneas; la segunda línea tiene 4 espacios y nada más):
<!-- v:antes frontend/src/app/features/auth/registro/registro.component.ts -->
```ts
    console.log('Registrando paciente:', this.paciente);
    
    // Llamar al servicio para guardar en la base de datos
    this.servicePaciente.crearPaciente(this.paciente).subscribe({
      next: (response) => {
        console.log('Paciente registrado exitosamente:', response);
```

DESPUÉS (3 líneas):
<!-- v:despues frontend/src/app/features/auth/registro/registro.component.ts -->
```ts
    // Llamar al servicio para guardar en la base de datos
    this.servicePaciente.crearPaciente(this.paciente).subscribe({
      next: () => {
```

> Ojo: `next: (response) => {` pasa a `next: () => {` porque `response` ya no se usa. La línea `alert('Registro exitoso...')` que viene después **no se toca**.

### 4.4 `backend/src/main/java/com/centro_valdiviezo/backend/exception/GlobalExceptionHandler.java`
Commit: `P1: registrar en el log los errores 500 sin cambiar la respuesta (RFC-014)`

Este archivo es corto: **reemplázalo completo** (Ctrl+A y pegar).

<details><summary>ANTES (archivo completo, 21 líneas) — para comprobar que estás en el archivo correcto</summary>

<!-- v:archivo-antes backend/src/main/java/com/centro_valdiviezo/backend/exception/GlobalExceptionHandler.java -->
```java
package com.centro_valdiviezo.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        error.put("status", "error");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```
</details>

DESPUÉS (archivo completo):
<!-- v:archivo-despues backend/src/main/java/com/centro_valdiviezo/backend/exception/GlobalExceptionHandler.java -->
```java
package com.centro_valdiviezo.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        // Deja rastro en el log del servidor; la respuesta al cliente no cambia
        log.error("Error no controlado en la API", ex);
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        error.put("status", "error");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

### 4.5 Archivo NUEVO: `backend/src/test/java/com/centro_valdiviezo/backend/exception/GlobalExceptionHandlerTest.java`
Commit: `P1: prueba unitaria del registro de errores (RFC-014)`

<!-- v:nuevo backend/src/test/java/com/centro_valdiviezo/backend/exception/GlobalExceptionHandlerTest.java -->
```java
package com.centro_valdiviezo.backend.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// RFC-014 (P1): el error queda en el log del servidor y la respuesta al cliente no cambia
@ExtendWith(OutputCaptureExtension.class)
class GlobalExceptionHandlerTest {

    @Test
    void respondeIgualQueAntesYDejaElErrorEnElLog(CapturedOutput salida) {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        ResponseEntity<Map<String, String>> respuesta =
                handler.handleRuntimeException(new RuntimeException("falla de prueba"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, respuesta.getStatusCode());
        assertEquals(Map.of("message", "falla de prueba", "status", "error"), respuesta.getBody());
        assertTrue(salida.getAll().contains("Error no controlado en la API"));
        assertTrue(salida.getAll().contains("falla de prueba"));
    }
}
```

---

## 5. Mensajes de commit (en este orden)

1. `P1: quitar console.log del login de paciente (RFC-014)`
2. `P1: quitar console.log del login de medico (RFC-014)`
3. `P1: no imprimir la clave del registro en consola (RFC-014)`
4. `P1: registrar en el log los errores 500 sin cambiar la respuesta (RFC-014)`
5. `P1: prueba unitaria del registro de errores (RFC-014)`

## 6. Pull request

**Título:** `P1 (RFC-014): nada sensible en la consola y errores con rastro en el servidor`

**Descripción** (cópiala tal cual):

```text
Closes #43

Paquete P1 - RFC-014 (docs/rfc/RFC-014.md), hallazgo H-043.

Qué cambia:
- Se quitan 6 console.log que mostraban el DNI, la respuesta del login y la clave del registro (login de paciente, login de médico y registro).
- GlobalExceptionHandler registra cada error 500 con un logger. La respuesta al cliente no cambia.
- Prueba unitaria nueva: GlobalExceptionHandlerTest.

Cómo se verificó (en una copia de develop, antes de abrir este PR):
- ng build sin errores; mvnw test 51/51; pruebas unitarias del frontend 32/32 y 49/49; Playwright 6/6.
- Consola del navegador tras login de paciente, login de médico y registro: ya no aparecen la clave, el DNI ni "Login exitoso".
- POST /api/cita sin cuerpo: mismo cuerpo 500 que antes, y ahora el log del servidor tiene "Error no controlado en la API".
```

> **Importante:** GitHub cierra el issue #43 solo cuando el cambio llega a la rama principal (`master`). Al unir a `develop` el issue sigue abierto; Brayan lo cierra o se cierra al pasar `develop` a `master`.

---

## 7. Errores comunes y qué hacer

| Qué pasa | Qué hacer |
|---|---|
| No aparece el lápiz o GitHub dice "fork this repository" | No tienes permiso de escritura. Pídeselo a Brayan; **no** hagas un fork. |
| Editaste estando en `master` | No confirmes. Cierra la pestaña sin hacer commit, cambia la rama a `develop` y empieza de nuevo. |
| El PR dice `base: master` | En el PR, botón **Edit** junto al título → cambia `base` a `develop` → "Change base". |
| Elegiste "Commit directly to the develop branch" por error | No hagas nada más y avísale a Brayan: él lo revierte. |
| Ctrl+F no encuentra la primera línea del bloque ANTES | Revisa que estés en la rama correcta y en el archivo correcto. Si sigue sin aparecer, alguien cambió el archivo: avisa a Brayan y no inventes el cambio. |
| Después de pegar, la sangría (espacios a la izquierda) quedó distinta | Deshaz con Ctrl+Z, vuelve a seleccionar desde el **inicio** de la primera línea y pega otra vez. |
| Quedó una línea repetida o falta una llave `}` | Pestaña **Files changed** del PR: compara con el bloque DESPUÉS. Para corregir, edita el archivo en tu rama y haz otro commit. |
| Creaste el segundo commit en una rama nueva por error | Cierra ese PR nuevo sin unirlo y repite el paso en la rama `feature/rfc-014-p1-consola-y-log`. |
| El issue no se cerró al unir el PR | Es normal: ver la nota de la sección 6. |
