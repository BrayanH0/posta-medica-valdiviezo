# Reglas del proyecto

## Calidad de los cambios
- Cada cambio corrige la CAUSA del problema, no el síntoma. Antes de
  modificar código, explica en la bitácora por qué ocurre el problema.
- PROHIBIDO acomodar el código para que una prueba pase:
  - nada de valores escritos a mano para que coincida un resultado;
  - nada de condiciones especiales para los datos de prueba (DNIs,
    IDs o fechas usados en las pruebas);
  - nada de atrapar errores y dejarlos pasar en silencio.
- PROHIBIDO modificar, debilitar, omitir o desactivar una prueba para
  que pase. Si una prueba está mal planteada, detente y explícalo:
  la decisión de cambiarla la toma el usuario.
- Si la solución correcta es más grande que el alcance de la tarea,
  NO hagas una versión recortada que solo "funcione": detente y
  explica las opciones.
- Si no estás seguro de que un cambio sea correcto, dilo. Es
  preferible un "no estoy seguro" a un cambio que solo parece
  funcionar.
- Los archivos se crean, modifican y borran SOLO con las herramientas
  de edición (Edit/Write), nunca con comandos de terminal (rm, sed,
  echo >, etc.), para que los hooks puedan controlarlos.

## Documentación
- Todo cambio queda en docs/BITACORA.md con: qué se cambió, por qué,
  qué alternativas se descartaron y la evidencia.
- Las fechas y horas se registran en el momento en que ocurren, con
  la hora real del sistema (comando date o git log). NUNCA se estiman
  ni se escriben por adelantado.
- No reportes "funciona" sin pegar la evidencia real.
- Donde no haya dato real, escribe "Sin registro"; nunca lo inventes.
- Todo lo que incluyas en el reporte final del chat debe estar
  también escrito en docs/ (bitácora o hallazgos): problemas
  encontrados, decisiones, fallos propios, estado del entorno y
  cualquier cosa que el usuario deba saber. El reporte del chat es
  solo un resumen de lo que ya está en el repositorio.

## Pruebas
- Cada cambio se valida con la batería completa de docs/PRUEBAS.md
  contra la línea base anterior (prueba de regresión).
- Cada cambio de código incluye, según corresponda: pruebas
  unitarias, de integración, de sistema (E2E) y criterios de
  aceptación.

## Proceso (curso Evolución y Configuración de Software)
- Refactorizar NO cambia el comportamiento. Las correcciones van
  separadas, cada una con su RFC en docs/rfc/.
- No toques código fuera del alcance de la tarea. Si ves otro
  problema, regístralo en docs/HALLAZGOS.md y sigue.
- Cada línea base lleva un tag anotado de Git (LB-n).

## Hooks activos
Configurados a nivel de proyecto en `.claude/settings.json`; los scripts
están en `.claude/hooks/` (Node.js, funcionan en Windows). Se ejecutan
antes de cada herramienta (PreToolUse).

1. **Pruebas protegidas** (`proteger-pruebas.js`, en Edit/Write/MultiEdit):
   si el archivo YA EXISTE y es de pruebas (`*.spec.ts`, carpeta
   `tests/` —desde LB-4, `e2e/tests/`—, `backend/src/test/**`), pide confirmación al usuario
   con el motivo "Se intenta modificar una prueba existente". Crear
   archivos de prueba nuevos no pregunta.
2. **Datos de prueba en el código** (`datos-prueba.js`, en
   Edit/Write/MultiEdit): si el archivo NO es de pruebas y el texto
   nuevo contiene alguno de los DNIs o la clave usados en las pruebas
   (la lista está en `DATOS_DE_PRUEBA` dentro del script), pide
   confirmación con el motivo "El cambio incluye datos usados en las
   pruebas". Excepciones: `database/BDPostaMedica.sql`, `docs/` y `.claude/`.
3. **Git destructivo** (`git-destructivo.js`, en Bash/PowerShell):
   bloquea push, reset --hard, borrado de tags (-d / --delete),
   checkout -- . y clean, con el motivo "Comando de Git bloqueado:
   puede borrar líneas base". El bloqueo mira el texto completo del
   comando, así que también bloquea un comando que solo mencione esas
   palabras (por ejemplo, dentro de un echo o un heredoc).
