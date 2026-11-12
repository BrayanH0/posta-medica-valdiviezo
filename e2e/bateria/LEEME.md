# Batería de regresión (EC-19)

Ejecuta la regresión completa de `docs/PRUEBAS.md`: compilación del frontend, pruebas unitarias del frontend y del backend, Playwright y la batería P01–P28 contra el sistema encendido (y P11/P18 con el backend apagado).

## Archivos
- `correr.cjs`: orquesta la corrida completa (recarga la BD, arranca y detiene backend y frontend).
- `bateria.cjs`: las pruebas P01–P28. La llama `correr.cjs`; también se puede correr sola si backend y frontend ya están encendidos (`node e2e/bateria/bateria.cjs <salida> on`).

## Requisitos
- MySQL local con usuario `root`; cliente `mysql` y `curl` en el `PATH`.
- Node.js; dependencias instaladas en `frontend/` y `e2e/` (`npm install`), Chromium de Playwright (`npx playwright install chromium`).
- Puertos 8080 y 4200 libres.
- Variables de entorno:
  - `DB_PASSWORD`: clave de MySQL (obligatoria).
  - `JWT_SECRET` (opcional): si no está definida, `correr.cjs` genera una aleatoria **solo en memoria** para esa corrida. No se imprime ni se escribe en ningún archivo.

## Cómo se ejecuta
Desde la raíz del repositorio, con una carpeta de salida **fuera** del repositorio:

```
node e2e/bateria/correr.cjs C:\ruta\fuera\del\repo\corrida-AAAA-MM-DD
```

Deja en esa carpeta `resumen.txt` (horas y códigos de salida), una salida por paso (`ng-build.txt`, `fe-32.txt`, `fe-todas.txt`, `mvn-test.txt`, `playwright.txt`), `bateria.txt`, `bateria-apagado.txt` y los registros `backend.log` / `frontend.log`.

## Reglas
- Ninguna clave ni token se escribe completo: los tokens se enmascaran (primeros 10 caracteres y `…`); las credenciales de prueba se leen de `docs/PRUEBAS.md`.
- La BD se recarga con `database/BDPostaMedica.sql` antes de cada fase y al final: **borra los datos locales** de `posta_medica_valdiviezo`.
- Cambiar lo que verifica una prueba requiere la decisión del usuario (CLAUDE.md); cada cambio se registra en `docs/PRUEBAS.md` (antes / después / por qué).
