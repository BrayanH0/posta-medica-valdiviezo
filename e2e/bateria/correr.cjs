// Regresión completa (EC-19; ver LEEME.md). Uso, desde la raíz del repositorio:
//   node e2e/bateria/correr.cjs <carpeta_salida>
// Secuencia: ng build, unitarias del frontend (caracterización y todas), BD + mvnw test, BD + backend y ng serve,
// Playwright, BD + batería P01–P28 (backend encendido), backend apagado + P11/P18, BD recargada al final.
// Variables de entorno: DB_PASSWORD (obligatoria). JWT_SECRET: si no está definida, se genera una aleatoria
// solo en memoria para esta corrida (no se imprime ni se escribe en ningún archivo).
// La carpeta de salida debe estar FUERA del repositorio (los registros del backend no son elementos de configuración).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..', '..');
const BATERIA = path.join(__dirname, 'bateria.cjs');
if (!process.argv[2]) { console.error('Uso: node e2e/bateria/correr.cjs <carpeta_salida>'); process.exit(2); }
const OUT = path.resolve(process.argv[2]);
if (!process.env.DB_PASSWORD) { console.error('Falta la variable de entorno DB_PASSWORD'); process.exit(2); }
const secretoGenerado = !process.env.JWT_SECRET;
if (secretoGenerado) process.env.JWT_SECRET = crypto.randomBytes(48).toString('base64');

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'resumen.txt'), '');
const hora = () => new Date().toTimeString().slice(0, 8);
const nota = (s) => { const l = `[${hora()}] ${s}`; fs.appendFileSync(path.join(OUT, 'resumen.txt'), l + '\n'); console.log(l); };
const CHROME = process.env.CHROME_BIN || path.join(process.env.LOCALAPPDATA || '', 'ms-playwright', 'chromium-1217', 'chrome-win64', 'chrome.exe');
const MVNW = process.platform === 'win32' ? '.\\mvnw.cmd' : './mvnw';

function run(nombre, cmd, cwd, env = {}) {
  nota(`inicio ${nombre}: ${cmd}`);
  const r = spawnSync(cmd, { cwd, shell: true, env: { ...process.env, ...env }, encoding: 'utf8', maxBuffer: 1 << 30 });
  fs.writeFileSync(path.join(OUT, `${nombre}.txt`), (r.stdout || '') + '\n--- stderr ---\n' + (r.stderr || ''));
  nota(`fin ${nombre} exit=${r.status}`);
  return r;
}
// Igual que desde la tarea 19 (mysql sin --default-character-set): el script declara su codificación (RFC-017)
function recargarBD() {
  const env = { ...process.env, MYSQL_PWD: process.env.DB_PASSWORD };
  spawnSync('mysql', ['-uroot', '-e', 'DROP DATABASE IF EXISTS posta_medica_valdiviezo'], { env });
  const r = spawnSync('mysql', ['-uroot'], { env, input: fs.readFileSync(path.join(RAIZ, 'database', 'BDPostaMedica.sql')) });
  const c = spawnSync('mysql', ['-uroot', '-N', '-B', 'posta_medica_valdiviezo', '-e', 'SELECT COUNT(*) FROM Cita'], { env, encoding: 'utf8' });
  nota(`BD recargada (exit=${r.status}, citas=${(c.stdout || '').trim()}${r.status ? ', stderr=' + r.stderr : ''})`);
}
async function esperar(url, seg) {
  for (let i = 0; i < seg; i++) {
    try { const r = await fetch(url); if (r.status < 500) return true; } catch {}
    await new Promise((s) => setTimeout(s, 1000));
  }
  return false;
}
function arrancar(nombre, cmd, cwd) {
  const out = fs.openSync(path.join(OUT, `${nombre}.log`), 'w');
  const p = spawn(cmd, { cwd, shell: true, stdio: ['ignore', out, out], env: process.env });
  nota(`${nombre} arrancado (pid ${p.pid})`);
  return p;
}
function detener(nombre, p) {
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F']);
  else p.kill('SIGTERM');
  nota(`${nombre} detenido (pid ${p.pid})`);
}

(async () => {
  const g = (a) => spawnSync('git', ['-C', RAIZ, ...a], { encoding: 'utf8' }).stdout.trim();
  nota(`rama ${g(['branch', '--show-current'])}, HEAD ${g(['rev-parse', '--short', 'HEAD'])}, cambios sin commit: ${g(['status', '--porcelain']).split('\n').filter(Boolean).length}`);
  nota(`JWT_SECRET: ${secretoGenerado ? 'generado para esta corrida (no se muestra)' : 'tomado del entorno (no se muestra)'}`);
  const FRONT = path.join(RAIZ, 'frontend');
  const BACK = path.join(RAIZ, 'backend');
  run('ng-build', 'npx ng build', FRONT);
  run('fe-32', 'npx ng test --watch=false --browsers=ChromeHeadless --ts-config=tsconfig.caracterizacion.json --include="src/app/**/*.caracterizacion.spec.ts"', FRONT, { CHROME_BIN: CHROME });
  run('fe-todas', 'npx ng test --watch=false --browsers=ChromeHeadless --ts-config=tsconfig.unitarias.json --include="src/app/**/*.caracterizacion.spec.ts" --include="src/app/**/*.unitaria.spec.ts"', FRONT, { CHROME_BIN: CHROME });
  recargarBD();
  run('mvn-test', `${MVNW} test`, BACK);

  recargarBD();
  const be = arrancar('backend', `${MVNW} spring-boot:run`, BACK);
  const fe = arrancar('frontend', 'npx ng serve --port 4200', FRONT);
  nota(`backend listo: ${await esperar('http://localhost:8080/api/especialidad', 240)}`);
  nota(`frontend listo: ${await esperar('http://localhost:4200/', 300)}`);
  run('playwright', 'npx playwright test tests/ --workers=1', path.join(RAIZ, 'e2e'));
  recargarBD();
  run('bateria-on', `node "${BATERIA}" "${OUT}" on`, OUT);
  detener('backend', be);
  await new Promise((s) => setTimeout(s, 3000));
  run('bateria-off', `node "${BATERIA}" "${OUT}" off`, OUT);
  detener('frontend', fe);
  recargarBD();
  nota('fin');
})();
