// Hook PreToolUse (Edit|Write|MultiEdit): pide confirmación antes de modificar
// un archivo de pruebas que YA EXISTE. Crear pruebas nuevas no pregunta.
const fs = require('fs');
const path = require('path');

let entrada = '';
process.stdin.on('data', (d) => (entrada += d));
process.stdin.on('end', () => {
  const datos = JSON.parse(entrada || '{}');
  const archivo = (datos.tool_input && datos.tool_input.file_path) || '';
  if (!archivo) return;

  // Acepta rutas de Windows (C:\...) y de Git Bash (/c/...)
  const normalizar = (p) => p.replace(/^\/([a-zA-Z])\//, '$1:/');
  const raiz = normalizar(process.env.CLAUDE_PROJECT_DIR || datos.cwd || process.cwd());
  const absoluto = path.resolve(raiz, normalizar(archivo));
  const relativo = path.relative(raiz, absoluto).split(path.sep).join('/');

  const esPrueba =
    /\.spec\.ts$/i.test(relativo) ||
    /(^|\/)tests\//i.test(relativo) ||
    /^backend\/(.*\/)?src\/test\//i.test(relativo);

  if (esPrueba && fs.existsSync(absoluto)) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `Se intenta modificar una prueba existente: ${relativo}`,
      },
    }));
  }
});
