// Hook PreToolUse (Bash|PowerShell): bloquea comandos de Git que pueden borrar
// líneas base o publicar el repositorio.
const BLOQUEADOS = [
  { regla: /\bgit\s+push\b/i, nombre: 'git push' },
  { regla: /\bgit\s+reset\s+(.*\s)?--hard\b/i, nombre: 'git reset --hard' },
  { regla: /\bgit\s+tag\s+(.*\s)?(-d|--delete)\b/i, nombre: 'git tag -d / --delete' },
  { regla: /\bgit\s+checkout\s+--\s+\.(\s|$|;|&|\|)/i, nombre: 'git checkout -- .' },
  { regla: /\bgit\s+clean\b/i, nombre: 'git clean' },
];

let entrada = '';
process.stdin.on('data', (d) => (entrada += d));
process.stdin.on('end', () => {
  const datos = JSON.parse(entrada || '{}');
  const comando = (datos.tool_input && datos.tool_input.command) || '';
  const bloqueado = BLOQUEADOS.find((b) => b.regla.test(comando));
  if (bloqueado) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `Comando de Git bloqueado: puede borrar líneas base (${bloqueado.nombre})`,
      },
    }));
  }
});
