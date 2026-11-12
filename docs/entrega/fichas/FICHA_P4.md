# Ficha P4 — Accesibilidad y uso en el celular

| Dato | Valor |
|---|---|
| RFC | RFC-013 (`docs/rfc/RFC-013.md`) |
| Hallazgo / issue | H-045 → issue **#45** (comprueba el número en GitHub antes de abrir el PR) |
| Rama que vas a crear | `feature/rfc-013-p4-accesibilidad-celular` |
| Rama base | `develop` |
| Archivos | 4 que se modifican (solo HTML y CSS) |

---

## 1. Qué arreglas y por qué (para la exposición)

1. La página decía estar en inglés (`lang="en"`) y la pestaña mostraba "ProyectoValdiviezo": los lectores de pantalla leían el español con pronunciación inglesa. Ahora es `lang="es"` y el título es "Posta Médica Valdiviezo".
2. En un celular (360 px de ancho), la tarjeta de "Seleccione su rol" se salía de la pantalla, y en los paneles de médico y de administrador la barra lateral ocupaba casi todo: la tabla de citas tenía **10 px** de ancho y no se podía usar.
3. Con una regla `@media (max-width: 768px)`, en pantallas angostas el menú pasa arriba y el contenido usa todo el ancho (la tabla pasa de 10 px a 290 px, y se desplaza de lado dentro de su recuadro). En la computadora (1280 px) la pantalla queda **exactamente igual**.

**Preguntas probables:**

- **¿Cómo saben que en la computadora no cambió nada?** Se tomaron capturas a 1280 px antes y después en 3 pantallas (selección de rol, citas pendientes del médico y reportes del admin), y los archivos de imagen son idénticos byte a byte.
- **¿Qué es `@media (max-width: 768px)`?** Una regla de CSS que solo se aplica cuando la ventana mide 768 px o menos (celulares y tablets en vertical). En pantallas más anchas el navegador la ignora.

---

## 2. Antes de empezar

- Necesitas permiso de escritura en `BrayanH0/posta-medica-valdiviezo` (pídeselo a Brayan).
- Todo se hace en la página web de GitHub.
- Copia los bloques con el botón de copiar de GitHub (ícono de dos hojas, arriba a la derecha del bloque).

### Cómo reemplazar un bloque en el editor de GitHub
1. Haz clic dentro del editor y pulsa **Ctrl+F**. Escribe una parte de la **primera línea** del bloque ANTES y pulsa Enter.
2. Haz clic **al inicio** de esa primera línea (antes de los espacios de la izquierda).
3. Busca la **última línea** del bloque ANTES, mantén **Shift** y haz clic **al final** de esa línea.
4. Comprueba que lo seleccionado es exactamente el bloque ANTES.
5. **Ctrl+V** para pegar el bloque DESPUÉS.

En los 2 archivos de los paneles (4.3 y 4.4) el bloque ANTES es **lo último del archivo**: el DESPUÉS lo repite y le agrega la regla nueva al final.

---

## 3. Paso a paso

### Paso 1 — Primer archivo: crea la rama y el pull request
1. Entra a `https://github.com/BrayanH0/posta-medica-valdiviezo`.
2. Botón de la rama (arriba a la izquierda, dice `master`) → elige **`develop`**.
3. Abre `frontend/src/index.html`.
4. Comprueba que arriba dice **develop** y haz clic en el **lápiz** ("Edit this file").
5. Reemplaza el bloque de la sección 4.1.
6. **"Commit changes..."**:
   - **Commit message:** `P4: idioma es y titulo Posta Medica Valdiviezo (RFC-013)`
   - Elige **"Create a new branch for this commit and start a pull request"**.
   - Nombre de la rama, exactamente: `feature/rfc-013-p4-accesibilidad-celular`
   - **"Propose changes"**.
7. En "Open a pull request" comprueba **`base: develop`** ← `compare: feature/rfc-013-p4-accesibilidad-celular`. Si dice `master`, cámbialo a `develop`.
8. Título y descripción de la sección 6 → **"Create pull request"**.

### Paso 2 — Los otros 3 archivos en la MISMA rama
Para cada archivo de las secciones 4.2, 4.3 y 4.4:
1. Pestaña **Code** → botón de la rama → elige **`feature/rfc-013-p4-accesibilidad-celular`**.
2. Abre el archivo → lápiz → reemplaza el bloque.
3. **"Commit changes..."** → mensaje de esa sección → **"Commit directly to the `feature/rfc-013-p4-accesibilidad-celular` branch"** → **"Commit changes"**.

Al final, el PR debe tener **4 commits** y 4 archivos en "Files changed".

---

## 4. Archivos

### 4.1 `frontend/src/index.html`
Commit: `P4: idioma es y titulo Posta Medica Valdiviezo (RFC-013)`

ANTES (4 líneas):
<!-- v:antes frontend/src/index.html -->
```html
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>ProyectoValdiviezo</title>
```

DESPUÉS (4 líneas):
<!-- v:despues frontend/src/index.html -->
```html
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Posta Médica Valdiviezo</title>
```

### 4.2 `frontend/src/app/features/auth/login-selection/login-selection.component.css`
Commit: `P4: la tarjeta de seleccion de rol no se sale en el celular (RFC-013)`

ANTES (3 líneas):
<!-- v:antes frontend/src/app/features/auth/login-selection/login-selection.component.css -->
```css
    text-align: center;
    min-width: 400px;
}
```

DESPUÉS (4 líneas):
<!-- v:despues frontend/src/app/features/auth/login-selection/login-selection.component.css -->
```css
    text-align: center;
    /* 400px en pantallas grandes; en el celular, como máximo el ancho de la pantalla (RFC-013) */
    min-width: min(400px, 100%);
}
```

### 4.3 `frontend/src/app/features/medico/medico-dashboard.component.css`
Commit: `P4: panel medico usable en pantallas angostas (RFC-013)`

ANTES (las 5 últimas líneas del archivo):
<!-- v:antes frontend/src/app/features/medico/medico-dashboard.component.css -->
```css
.card p {
    color: #666;
    line-height: 1.5;
    margin: 0;
}
```

DESPUÉS:
<!-- v:despues frontend/src/app/features/medico/medico-dashboard.component.css -->
```css
.card p {
    color: #666;
    line-height: 1.5;
    margin: 0;
}

/* Celular y tablet vertical: el menú pasa arriba y el contenido usa todo el ancho (RFC-013) */
@media (max-width: 768px) {
    .dashboard-container {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
    }

    .sidebar-header {
        padding: 12px 15px;
    }

    .sidebar-nav {
        flex-direction: row;
        flex-wrap: wrap;
        margin-top: 0;
    }

    .nav-item {
        padding: 10px 12px;
    }

    .nav-item.active {
        border-left: none;
        border-bottom: 4px solid #5c6bc0;
    }

    .sidebar-footer {
        padding: 10px 15px;
    }

    .main-content {
        padding: 15px;
        min-width: 0;
    }

    .cards-container {
        flex-direction: column;
    }
}
```

### 4.4 `frontend/src/app/features/admin/dashboard/admin-dashboard.component.css`
Commit: `P4: panel admin usable en pantallas angostas (RFC-013)`

ANTES (las 2 últimas líneas del archivo):
<!-- v:antes frontend/src/app/features/admin/dashboard/admin-dashboard.component.css -->
```css
.collapsed .logout-btn { padding: 10px; width: 40px; height: 40px; border-radius: 50%; }
.collapsed .sidebar-footer { align-items: center; }
```

DESPUÉS:
<!-- v:despues frontend/src/app/features/admin/dashboard/admin-dashboard.component.css -->
```css
.collapsed .logout-btn { padding: 10px; width: 40px; height: 40px; border-radius: 50%; }
.collapsed .sidebar-footer { align-items: center; }

/* Celular y tablet vertical: el menú pasa arriba y el contenido usa todo el ancho (RFC-013) */
@media (max-width: 768px) {
  .dashboard-wrapper { flex-direction: column; }
  .sidebar, .collapsed .sidebar { width: 100%; padding: 12px 15px; }
  .sidebar .logo { margin-bottom: 10px; padding-bottom: 10px; }
  .nav { flex-direction: row; flex-wrap: wrap; gap: 6px; }
  .nav a, .collapsed .nav a { padding: 8px 12px; }
  .nav a:hover { transform: none; }
  .sidebar-footer { flex-direction: row; justify-content: flex-end; margin-top: 10px; padding-top: 10px; }
  .toggle { display: none; }
  .logout-btn, .collapsed .logout-btn { width: auto; height: auto; padding: 8px 16px; border-radius: 25px; }
  .content { padding: 15px; min-width: 0; }
}
```

---

## 5. Mensajes de commit (en este orden)

1. `P4: idioma es y titulo Posta Medica Valdiviezo (RFC-013)`
2. `P4: la tarjeta de seleccion de rol no se sale en el celular (RFC-013)`
3. `P4: panel medico usable en pantallas angostas (RFC-013)`
4. `P4: panel admin usable en pantallas angostas (RFC-013)`

## 6. Pull request

**Título:** `P4 (RFC-013): accesibilidad (lang y título) y uso en el celular`

**Descripción** (cópiala tal cual):

```text
Closes #45

Paquete P4 - RFC-013 (docs/rfc/RFC-013.md), hallazgo H-045.

Qué cambia:
- index.html: lang="es" y título "Posta Médica Valdiviezo".
- login-selection: min-width: min(400px, 100%) para que la tarjeta no se salga a 360 px.
- Paneles de médico y de administrador: @media (max-width: 768px) con el menú arriba y el contenido a todo el ancho.

Cómo se verificó (en una copia de develop, antes de abrir este PR):
- ng build sin errores; unitarias del frontend 32/32 y 49/49; Playwright 6/6.
- Medición con Playwright a 360, 768 y 1280 px:
  - 360 px: login-selection sin desborde (ancho de página 380 -> 360); citas pendientes del médico: contenido 110 -> 360 px, tabla 10 -> 290 px; reportes del admin: contenido 100 -> 360 px.
  - 1280 px: las capturas de las 3 pantallas son idénticas byte a byte a las de develop.
```

> **Importante:** GitHub cierra el issue #45 solo cuando el cambio llega a `master`. Al unir a `develop` el issue sigue abierto.

---

## 7. Errores comunes y qué hacer

| Qué pasa | Qué hacer |
|---|---|
| No aparece el lápiz o GitHub dice "fork this repository" | No tienes permiso de escritura. Pídeselo a Brayan; **no** hagas un fork. |
| Editaste estando en `master` | No confirmes. Cierra la pestaña sin hacer commit, cambia a `develop` y empieza de nuevo. |
| El PR dice `base: master` | En el PR, **Edit** junto al título → `base` = `develop` → "Change base". |
| Elegiste "Commit directly to the develop branch" | No hagas nada más y avísale a Brayan para que lo revierta. |
| Ctrl+F no encuentra la primera línea del bloque ANTES | Revisa la rama y el archivo. Si sigue sin aparecer, alguien cambió el archivo: avisa a Brayan. |
| `.card p {` aparece, pero no es lo último del archivo | Alguien agregó algo al final. No pegues: avisa a Brayan. |
| Pegaste la regla nueva pero el bloque viejo quedó repetido | Deshaz con Ctrl+Z y vuelve a seleccionar **todo** el bloque ANTES antes de pegar. |
| Falta una llave `}` al final | Cada `{` debe tener su `}`. Compara con el DESPUÉS en "Files changed" y corrige con otro commit en tu rama. |
| La "é" de "Médica" se ve rara | Copia el bloque con el botón de copiar de GitHub, no desde un PDF o Word. |
| El issue no se cerró al unir el PR | Es normal: ver la nota de la sección 6. |
