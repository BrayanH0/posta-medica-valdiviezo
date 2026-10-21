// Hook PreToolUse (Edit|Write|MultiEdit): pide confirmación si el texto nuevo de
// un archivo que NO es de pruebas contiene DNIs o claves usados en las pruebas.
// Excepciones: BDPostaMedica.sql, docs/ y .claude/.
const path = require('path');

const DATOS_DE_PRUEBA = ['99999999', '12345678', '10000001', '87654321', '123456'];

let entrada = '';
process.stdin.on('data', (d) => (entrada += d));
process.stdin.on('end', () => {
  const datos = JSON.parse(entrada || '{}');
  const ti = datos.tool_input || {};
  const archivo = ti.file_path || '';
  if (!archivo) return;

  // Acepta rutas de Windows (C:\...) y de Git Bash (/c/...)
  const normalizar = (p) => p.replace(/^\/([a-zA-Z])\//, '$1:/');
  const raiz = normalizar(process.env.CLAUDE_PROJECT_DIR || datos.cwd || process.cwd());
  const relativo = path.relative(raiz, path.resolve(raiz, normalizar(archivo))).split(path.sep).join('/');

  const esPrueba =
    /\.spec\.ts$/i.test(relativo) ||
    /(^|\/)tests\//i.test(relativo) ||
    /^backend\/.*\/src\/test\//i.test(relativo);
  const esExcepcion =
    relativo === 'BDPostaMedica.sql' ||
    relativo.startsWith('docs/') ||
    relativo.startsWith('.claude/');
  if (esPrueba || esExcepcion) return;

  // Texto nuevo según la herramienta: Write (content), Edit (new_string), MultiEdit (edits[])
  const textoNuevo = [
    ti.content || '',
    ti.new_string || '',
    ...(ti.edits || []).map((e) => e.new_string || ''),
  ].join('\n');

  const encontrados = DATOS_DE_PRUEBA.filter((d) => textoNuevo.includes(d));
  if (encontrados.length > 0) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `El cambio incluye datos usados en las pruebas (${encontrados.join(', ')}) en ${relativo}`,
      },
    }));
  }
});
