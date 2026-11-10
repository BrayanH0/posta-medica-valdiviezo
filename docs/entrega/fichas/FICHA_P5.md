# Ficha P5 — Configuración del backend lista para desplegar

| Dato | Valor |
|---|---|
| RFC | RFC-016 (`docs/rfc/RFC-016.md`) |
| Hallazgo / issue | H-046 → issue **#46** (comprueba el número en GitHub antes de abrir el PR) |
| Rama que vas a crear | `feature/rfc-016-p5-config-despliegue` |
| Rama base | `develop` |
| Archivos | 2 que se modifican + 2 nuevos (`vercel.json` y una prueba) |

---

## 1. Qué arreglas y por qué (para la exposición)

1. La dirección de la base de datos, el puerto (8080) y los orígenes permitidos por CORS (`http://localhost:4200`) estaban **escritos fijos** en el código. En un servidor en la nube eso no sirve: la BD está en otra dirección, el host asigna el puerto y el frontend en Vercel tiene otro dominio (el navegador recibía 403).
2. Ahora se leen de **variables de entorno** (`DB_URL`, `PORT`, `CORS_ORIGINS`, `SHOW_SQL`) y, si no están definidas, se usan los mismos valores de hoy: en la computadora de desarrollo todo funciona igual.
3. `frontend/vercel.json` le dice a Vercel que cualquier ruta de Angular (por ejemplo `/paciente/mis-citas`) sirva `index.html`; sin eso, recargar la página daría 404.

**Preguntas probables:**

- **¿Por qué `SHOW_SQL` sigue en `true` por defecto si llena el log?** Para no cambiar el entorno de desarrollo (la regla del curso: cada cambio se compara con la línea base). En producción se define `SHOW_SQL=false`; se probó y el log quedó con 0 líneas `Hibernate:`.
- **¿Esto abre la API a cualquier sitio?** No. Solo se aceptan los orígenes que se escriban en `CORS_ORIGINS`. Se probó: con `CORS_ORIGINS=http://localhost:4200,https://posta-valdiviezo.vercel.app` el dominio de Vercel recibe 200 y un origen ajeno sigue recibiendo 403. (La API sigue sin autenticación: eso es H-016 / RFC-011, otro cambio.)

---

## 2. Antes de empezar

- Necesitas permiso de escritura en `BrayanH0/posta-medica-valdiviezo` (pídeselo a Brayan).
- Todo se hace en la página web de GitHub.
- Los 2 archivos que se modifican se **reemplazan completos**: clic dentro del editor, **Ctrl+A** (selecciona todo) y **Ctrl+V** con el contenido DESPUÉS. Copia los bloques con el botón de copiar de GitHub (ícono de dos hojas, arriba a la derecha).
- El bloque ANTES está plegado: ábrelo solo para comprobar que estás en el archivo correcto.

---

## 3. Paso a paso

### Paso 1 — Primer archivo: crea la rama y el pull request
1. Entra a `https://github.com/BrayanH0/posta-medica-valdiviezo`.
2. Botón de la rama (arriba a la izquierda, dice `master`) → elige **`develop`**.
3. Abre `backend/src/main/resources/application.properties`.
4. Comprueba que arriba dice **develop** y haz clic en el **lápiz** ("Edit this file").
5. Ctrl+A y pega el DESPUÉS de la sección 4.1.
6. **"Commit changes..."**:
   - **Commit message:** `P5: url de BD, puerto, show-sql y CORS desde variables de entorno (RFC-016)`
   - Elige **"Create a new branch for this commit and start a pull request"**.
   - Nombre de la rama, exactamente: `feature/rfc-016-p5-config-despliegue`
   - **"Propose changes"**.
7. En "Open a pull request" comprueba **`base: develop`** ← `compare: feature/rfc-016-p5-config-despliegue`. Si dice `master`, cámbialo a `develop`.
8. Título y descripción de la sección 6 → **"Create pull request"**.

### Paso 2 — Segundo archivo en la MISMA rama
1. Pestaña **Code** → botón de la rama → elige **`feature/rfc-016-p5-config-despliegue`**.
2. Abre `backend/src/main/java/com/centro_valdiviezo/backend/seguridad/WebSecurityConfig.java` → lápiz → Ctrl+A → pega el DESPUÉS de la sección 4.2.
3. **"Commit changes..."** → mensaje de la sección 4.2 → **"Commit directly to the `feature/rfc-016-p5-config-despliegue` branch"** → **"Commit changes"**.

### Paso 3 — Los 2 archivos nuevos en la MISMA rama
Para cada uno (secciones 4.3 y 4.4):
1. En la rama `feature/rfc-016-p5-config-despliegue`, entra a la carpeta que indica la sección.
2. **"Add file" → "Create new file"** y escribe el nombre que indica la sección.
3. Pega el contenido.
4. **"Commit changes..."** → mensaje de la sección → **"Commit directly to the `feature/rfc-016-p5-config-despliegue` branch"**.

Al final, el PR debe tener **4 commits** y 4 archivos en "Files changed".

---

## 4. Archivos

### 4.1 `backend/src/main/resources/application.properties`
Commit: `P5: url de BD, puerto, show-sql y CORS desde variables de entorno (RFC-016)`

<details><summary>ANTES (archivo completo, 7 líneas)</summary>

<!-- v:archivo-antes backend/src/main/resources/application.properties -->
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/posta_medica_valdiviezo
spring.datasource.username=${DB_USER:root}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
```
</details>

DESPUÉS (archivo completo, 9 líneas):
<!-- v:archivo-despues backend/src/main/resources/application.properties -->
```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/posta_medica_valdiviezo}
spring.datasource.username=${DB_USER:root}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=${SHOW_SQL:true}
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
server.port=${PORT:8080}
app.cors.allowed-origins=${CORS_ORIGINS:http://localhost:4200}
```

> No escribas ninguna contraseña en este archivo: `${DB_PASSWORD}` se queda **sin** valor por defecto (RFC-009).

### 4.2 `backend/src/main/java/com/centro_valdiviezo/backend/seguridad/WebSecurityConfig.java`
Commit: `P5: origenes CORS leidos de la propiedad app.cors.allowed-origins (RFC-016)`

Cambian 3 cosas: el `import` de `@Value`, el método `filterChain` recibe la configuración CORS como parámetro, y `corsConfigurationSource` lee los orígenes de la propiedad.

<details><summary>ANTES (archivo completo, 97 líneas)</summary>

<!-- v:archivo-antes backend/src/main/java/com/centro_valdiviezo/backend/seguridad/WebSecurityConfig.java -->
```java
package com.centro_valdiviezo.backend.seguridad;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.AllArgsConstructor;

@Configuration
@AllArgsConstructor
public class WebSecurityConfig {
    private final UserDetailsService userDetailsService;
    private final JWTAuthorizationFilter jwtAuthorizationFilter;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, AuthenticationManager authManager)
            throws Exception {

        // JWTAuthenticationFilter jwtAuthenticationFilter = new JWTAuthenticationFilter();
        // jwtAuthenticationFilter.setAuthenticationManager(authManager);
        // jwtAuthenticationFilter.setFilterProcessesUrl("/login");

        return http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()) // Permitir todo para pruebas
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // .addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();

    }

    @SuppressWarnings("deprecation")
    @Bean
    PasswordEncoder passwordEncoder() {
        return org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance();
    }

    /*
     * @Bean
     * UserDetailsService userDetailsService() {
     * InMemoryUserDetailsManager iudm = new InMemoryUserDetailsManager();
     * iudm.createUser(User.withUsername("admin")
     * .password(passwordEncoder().encode("database"))
     * .roles()
     * .build());
     * return iudm;
     * }
     */
    /*
     * @Bean
     * UserDetailsService userDetailsService() {
     * InMemoryUserDetailsManager iudm = new InMemoryUserDetailsManager();
     * iudm.createUser(User.withUsername("grupo3@gmail.com")
     * .password(passwordEncoder().encode("123456"))
     * .roles("USER")
     * .build());
     * return iudm;
     * }
     */
    @Bean
    AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder()).and().build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200")); // tu frontend
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
```
</details>

DESPUÉS (archivo completo):
<!-- v:archivo-despues backend/src/main/java/com/centro_valdiviezo/backend/seguridad/WebSecurityConfig.java -->
```java
package com.centro_valdiviezo.backend.seguridad;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.AllArgsConstructor;

@Configuration
@AllArgsConstructor
public class WebSecurityConfig {
    private final UserDetailsService userDetailsService;
    private final JWTAuthorizationFilter jwtAuthorizationFilter;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, AuthenticationManager authManager,
            CorsConfigurationSource corsConfigurationSource) throws Exception {

        // JWTAuthenticationFilter jwtAuthenticationFilter = new JWTAuthenticationFilter();
        // jwtAuthenticationFilter.setAuthenticationManager(authManager);
        // jwtAuthenticationFilter.setFilterProcessesUrl("/login");

        return http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()) // Permitir todo para pruebas
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // .addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();

    }

    @SuppressWarnings("deprecation")
    @Bean
    PasswordEncoder passwordEncoder() {
        return org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance();
    }

    /*
     * @Bean
     * UserDetailsService userDetailsService() {
     * InMemoryUserDetailsManager iudm = new InMemoryUserDetailsManager();
     * iudm.createUser(User.withUsername("admin")
     * .password(passwordEncoder().encode("database"))
     * .roles()
     * .build());
     * return iudm;
     * }
     */
    /*
     * @Bean
     * UserDetailsService userDetailsService() {
     * InMemoryUserDetailsManager iudm = new InMemoryUserDetailsManager();
     * iudm.createUser(User.withUsername("grupo3@gmail.com")
     * .password(passwordEncoder().encode("123456"))
     * .roles("USER")
     * .build());
     * return iudm;
     * }
     */
    @Bean
    AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder()).and().build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String[] origenesPermitidos) {
        CorsConfiguration configuration = new CorsConfiguration();
        // Orígenes del frontend, separados por comas (variable CORS_ORIGINS; por defecto http://localhost:4200)
        configuration.setAllowedOrigins(Arrays.asList(origenesPermitidos));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
```

### 4.3 Archivo NUEVO: `frontend/vercel.json`
Carpeta: `frontend/` · Nombre: `vercel.json`
Commit: `P5: vercel.json con rewrite de la SPA (RFC-016)`

<!-- v:nuevo frontend/vercel.json -->
```json
{
  "outputDirectory": "dist/proyecto_valdiviezo/browser",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> En Vercel, el proyecto debe tener **Root Directory = `frontend`**. Eso se configura en el panel de Vercel, no en este PR.

### 4.4 Archivo NUEVO: `backend/src/test/java/com/centro_valdiviezo/backend/seguridad/WebSecurityConfigCorsTest.java`
Carpeta: `backend/src/test/java/com/centro_valdiviezo/backend/` · Nombre: `seguridad/WebSecurityConfigCorsTest.java` (al escribir la `/`, GitHub crea la carpeta)
Commit: `P5: prueba unitaria de los origenes CORS configurables (RFC-016)`

<!-- v:nuevo backend/src/test/java/com/centro_valdiviezo/backend/seguridad/WebSecurityConfigCorsTest.java -->
```java
package com.centro_valdiviezo.backend.seguridad;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

// RFC-016 (P5): los orígenes CORS salen de la propiedad app.cors.allowed-origins (variable CORS_ORIGINS)
class WebSecurityConfigCorsTest {

    private CorsConfiguration configuracionPara(String... origenes) {
        WebSecurityConfig config = new WebSecurityConfig(null, null);
        CorsConfigurationSource fuente = config.corsConfigurationSource(origenes);
        return fuente.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/especialidad"));
    }

    @Test
    void conElValorPorDefectoSoloAceptaLocalhost4200ComoAntes() {
        CorsConfiguration cors = configuracionPara("http://localhost:4200");

        assertEquals(List.of("http://localhost:4200"), cors.getAllowedOrigins());
        assertEquals("http://localhost:4200", cors.checkOrigin("http://localhost:4200"));
        assertEquals(null, cors.checkOrigin("http://otro-origen.example"));
        assertEquals(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"), cors.getAllowedMethods());
        assertEquals(List.of("Authorization", "Content-Type"), cors.getAllowedHeaders());
        assertTrue(cors.getAllowCredentials());
    }

    @Test
    void aceptaVariosOrigenesSeparadosPorComas() {
        CorsConfiguration cors = configuracionPara("http://localhost:4200", "https://posta.example.app");

        assertEquals("https://posta.example.app", cors.checkOrigin("https://posta.example.app"));
        assertEquals("http://localhost:4200", cors.checkOrigin("http://localhost:4200"));
        assertEquals(null, cors.checkOrigin("http://otro-origen.example"));
    }
}
```

---

## 5. Mensajes de commit (en este orden)

1. `P5: url de BD, puerto, show-sql y CORS desde variables de entorno (RFC-016)`
2. `P5: origenes CORS leidos de la propiedad app.cors.allowed-origins (RFC-016)`
3. `P5: vercel.json con rewrite de la SPA (RFC-016)`
4. `P5: prueba unitaria de los origenes CORS configurables (RFC-016)`

## 6. Pull request

**Título:** `P5 (RFC-016): configuración del backend por variables de entorno y vercel.json`

**Descripción** (cópiala tal cual):

```text
Closes #46

Paquete P5 - RFC-016 (docs/rfc/RFC-016.md), hallazgo H-046.

Qué cambia:
- application.properties: DB_URL, PORT, SHOW_SQL y CORS_ORIGINS con valores por defecto iguales a los de hoy.
- WebSecurityConfig: los orígenes CORS salen de app.cors.allowed-origins (antes estaban fijos en el código).
- frontend/vercel.json: rewrite de todas las rutas a index.html.
- Prueba unitaria nueva: WebSecurityConfigCorsTest (2 casos).

Cómo se verificó (en una copia de develop, antes de abrir este PR):
- mvnw compile sin errores; mvnw test 52/52 (50 de antes + 2 nuevas); Playwright 6/6.
- Sin variables: P25 (CORS) idéntico a develop, línea por línea.
- Con PORT=8081, SHOW_SQL=false y CORS_ORIGINS="http://localhost:4200,https://posta-valdiviezo.vercel.app": arranca en 8081; el origen de Vercel recibe 200, un origen ajeno 403; 0 líneas "Hibernate:" en el log.
- ng build deja index.html en dist/proyecto_valdiviezo/browser (outputDirectory). No se probó en Vercel.
```

> **Importante:** GitHub cierra el issue #46 solo cuando el cambio llega a `master`. Al unir a `develop` el issue sigue abierto.

---

## 7. Errores comunes y qué hacer

| Qué pasa | Qué hacer |
|---|---|
| No aparece el lápiz o GitHub dice "fork this repository" | No tienes permiso de escritura. Pídeselo a Brayan; **no** hagas un fork. |
| Editaste estando en `master` | No confirmes. Cierra la pestaña sin hacer commit, cambia a `develop` y empieza de nuevo. |
| El PR dice `base: master` | En el PR, **Edit** junto al título → `base` = `develop` → "Change base". |
| Elegiste "Commit directly to the develop branch" | No hagas nada más y avísale a Brayan para que lo revierta. |
| Escribiste una contraseña en `application.properties` | **No hagas el commit.** Si ya lo hiciste, avisa a Brayan de inmediato: la clave queda en el historial y hay que cambiarla. |
| El ANTES (plegado) no se parece a lo que ves | Estás en otro archivo u otra rama, o alguien lo cambió. No pegues: avisa a Brayan. |
| `vercel.json` quedó en la raíz del repositorio y no en `frontend/` | Bórralo (abrir el archivo → `...` → "Delete file", commit en tu rama) y créalo dentro de `frontend/`. |
| GitHub marca el JSON en rojo | Falta una coma o una llave. Copia de nuevo el bloque completo con el botón de copiar. |
| El issue no se cerró al unir el PR | Es normal: ver la nota de la sección 6. |
