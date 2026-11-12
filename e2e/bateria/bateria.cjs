// Batería P01–P28 de docs/PRUEBAS.md (EC-19). Uso (lo llama correr.cjs; ver LEEME.md):
//   node bateria.cjs <carpeta_salida> on   -> todo lo que necesita el backend encendido, en el orden del documento
//   node bateria.cjs <carpeta_salida> off  -> P11 (parte apagado) y P18, con el backend APAGADO
// Historia: reescrita en la tarea 19 (los scripts de LB-8/LB-9 se perdieron con el scratchpad); P22 cambió en la
// tarea 25 (opción 1 de RFC-012); en la tarea 26 (RFC-011) pasó al repositorio y cada llamada a la API envía el
// token del rol que puede hacerla (lo que verifica cada prueba no cambió); P28 es nueva.
// Las credenciales se leen de docs/PRUEBAS.md. Nunca se imprime una clave ni un token completo.
// Necesita: DB_PASSWORD (cliente mysql) y, para P28, el mismo JWT_SECRET que usa el backend.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..', '..');
const { chromium } = require(path.join(RAIZ, 'e2e', 'node_modules', 'playwright'));
const API = 'http://localhost:8080';
const FE = 'http://localhost:4200';
const OUT = process.argv[2];
const FASE = process.argv[3] || 'on';
fs.mkdirSync(OUT, { recursive: true });
const salida = path.join(OUT, FASE === 'on' ? 'bateria.txt' : 'bateria-apagado.txt');
fs.writeFileSync(salida, '');
// Un token nunca se escribe completo: solo sus primeros 10 caracteres
const enmascarar = (s) => String(s).replace(/(eyJ[A-Za-z0-9_-]{7})[A-Za-z0-9_.-]+/g, '$1…');
const log = (s) => { const l = enmascarar(s); fs.appendFileSync(salida, l + '\n'); console.log(l); };
const hora = () => log('# hora ' + new Date().toTimeString().slice(0, 8));

// Credenciales desde PRUEBAS.md
const doc = fs.readFileSync(path.join(RAIZ, 'docs', 'PRUEBAS.md'), 'utf8');
const m = doc.match(/paciente `(\d{8})` \/ `([^`]+)` · médico `(\d{8})` \/ `[^`]+` · admin `(\d{8})`/);
const DNI_P = m[1], CLAVE = m[2], DNI_M = m[3], DNI_A = m[4];
const DNI_X = doc.match(/escribir `(\d{8})` \(no existe\)/)[1];

// Lo que se interpola en las consultas son DNIs de 8 dígitos (leídos con \d{8}) e ids numéricos;
// se comprueba aquí para que el script falle en lugar de armar una consulta con otro texto.
for (const d of [DNI_P, DNI_M, DNI_A, DNI_X]) if (!/^\d{8}$/.test(d)) throw new Error('DNI de prueba no válido en PRUEBAS.md');
const entero = (v) => { const n = Number(v); if (!Number.isInteger(n)) throw new Error('Se esperaba un número: ' + v); return n; };

function sql(q) {
  return execFileSync('mysql', ['-uroot', '-N', '-B', 'posta_medica_valdiviezo', '-e', q],
    { env: { ...process.env, MYSQL_PWD: process.env.DB_PASSWORD }, encoding: 'utf8' }).trim();
}

// RFC-011: token por DNI (POST /login), guardado durante la corrida
const tokens = {};
async function tokenDe(dni) {
  if (!tokens[dni]) {
    const r = await fetch(API + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dni, clave: CLAVE }) });
    tokens[dni] = (await r.json()).token;
  }
  return tokens[dni];
}
const dniPaciente = (id) => sql(`SELECT dni FROM Paciente WHERE idPaciente=${entero(id)}`);
const dniMedico = (id) => sql(`SELECT dni FROM Medico WHERE id_medico=${entero(id)}`);
const cabeceras = async (dni) => (dni ? { Authorization: 'Bearer ' + (await tokenDe(dni)) } : {});

async function get(ruta, dni) {
  const r = await fetch(API + ruta, { headers: await cabeceras(dni) });
  const buf = Buffer.from(await r.arrayBuffer());
  return { status: r.status, text: buf.toString('utf8'), size: buf.length };
}
async function enviar(metodo, ruta, cuerpo, dni) {
  const r = await fetch(API + ruta, { method: metodo, headers: { 'Content-Type': 'application/json', ...(await cabeceras(dni)) }, body: JSON.stringify(cuerpo) });
  return { status: r.status, text: await r.text() };
}
const json = (t) => { try { return JSON.parse(t); } catch { return null; } };
const tieneClave = (t) => /"clave"\s*:/.test(t);
// Contenido del token (no es secreto: es base64 sin cifrar); se usa para mostrar id, rol y duración
const contenidoToken = (t) => json(Buffer.from(String(t).split('.')[1] || '', 'base64url').toString('utf8')) || {};

async function pagina(browser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const red = [];
  const dialogos = [];
  page.on('response', (r) => {
    if (r.url().startsWith(API)) { const u = new URL(r.url()); red.push(`${r.status()} ${r.request().method()} ${u.pathname}${u.search}`); }
  });
  page.on('requestfailed', (r) => { if (r.url().startsWith(API)) red.push(`FALLIDA ${r.method()} ${r.url()} ${r.failure()?.errorText}`); });
  page.on('dialog', (d) => { dialogos.push(d.message()); d.accept(); });
  return { ctx, page, red, dialogos };
}
const ls = (page) => page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort())));
const ruta = (page) => new URL(page.url()).pathname;
const mensaje = async (page) => ((await page.locator('.error-message').allInnerTexts()).join(' | ')).trim();

async function login(page, rutaLogin, dni, clave) {
  await page.goto(FE + rutaLogin);
  await page.fill(rutaLogin === '/login-admin' ? '#usuario' : '#dni', dni);
  await page.fill('#clave', clave);
  const espera = page.waitForResponse((r) => r.url() === API + '/login', { timeout: 6000 }).catch(() => null);
  await page.click('button[type=submit]');
  await espera;
  await page.waitForTimeout(1500);
}

// Llena "Registrar Cita" hasta mostrar las horas; devuelve la lista de horas ofrecidas
async function prepararCita(page, motivo, fecha = '2026-10-26') {
  await page.goto(FE + '/paciente/registrar-cita');
  await page.waitForSelector('select[name=especialidad] option', { state: 'attached' });
  const esp = await page.$eval('select[name=especialidad]', (s) => [...s.options].find((o) => o.text.includes('Medicina General')).value);
  await page.selectOption('select[name=especialidad]', esp);
  await page.waitForFunction(() => document.querySelectorAll('select[name=medico] option').length > 0);
  const med = await page.$eval('select[name=medico]', (s) => [...s.options].find((o) => o.text.includes('Jorge Santos Ruiz')).value);
  await page.selectOption('select[name=medico]', med);
  await page.fill('input[name=fecha]', fecha);
  await page.$eval('input[name=fecha]', (e) => e.dispatchEvent(new Event('change')));
  await page.waitForTimeout(1500);
  if (motivo) await page.fill('textarea[name=motivo]', motivo);
  return page.$$eval('button.rounded-pill', (bs) => bs.map((b) => b.textContent.trim()));
}

async function filas(page) {
  await page.waitForTimeout(1500);
  return page.$$eval('table tbody tr', (trs) => trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => td.textContent.trim()).filter((x) => x && x !== 'Aceptar Cancelar' && !/^Aceptar\s+Cancelar$/.test(x)).join(' | ')));
}

async function fase_on() {
  hora();
  // P01 (RFC-011: token de admin; historia y evolución solo las pide un paciente -> token del paciente de prueba)
  const p01 = ['/api/cie', '/api/cita', '/api/disponibilidad_medico', '/api/especialidad', '/api/estado_cita', '/api/estado_paciente',
    '/api/evolucion_clinica', '/api/historia_clinica', '/api/medico', '/api/medico/conEspecialidad', '/api/medico/especialidad/1',
    '/api/paciente', '/api/ubigeo', '/usuarios'];
  const delPaciente = (r) => r.startsWith('/api/historia_clinica') || r.startsWith('/api/evolucion_clinica');
  for (const r of p01) { const x = await get(r, delPaciente(r) ? DNI_P : DNI_A); log(`P01 ${r} ${x.status} ${x.size}B clave:${tieneClave(x.text)}`); }
  { const sin = []; for (const r of p01) sin.push(`${r}=${(await get(r)).status}`); log(`P01 sin-token: ${sin.join(' ')}`); }
  // P02 (admin; /fecha la pide el médico 1, dueño)
  for (const r of ['/api/reportes/dashboard', '/api/reportes/resumen', '/api/reportes/ingresosMensuales', '/api/cita/porEstado',
    '/api/cita/porEspecialidad', '/api/citas/medico/1/fecha/2023-07-01']) {
    const x = await get(r, r.includes('/fecha/') ? DNI_M : DNI_A); log(`P02 ${r} ${x.status}` + (r.includes('porEstado') || r.includes('fecha') ? ' ' + x.text : ''));
  }
  // P03 (admin; historia/evolución con el paciente de prueba)
  for (const r of ['/api/cita/1', '/api/medico/codigo/1', '/api/paciente/codigo/1', '/api/cie/1', '/api/especialidad/1',
    '/api/historia_clinica/1', '/api/evolucion_clinica/1', '/api/ubigeo/1', '/api/estado_cita/1', '/api/disponibilidad_medico/1',
    '/api/disponibilidad_medico/medico/1']) {
    const x = await get(r, delPaciente(r) ? DNI_P : DNI_A);
    const extra = r.includes('/codigo/1') ? ` campos:${Object.keys(json(x.text) || {}).join(',')} clave:${tieneClave(x.text)}` : '';
    log(`P03 ${r} ${x.status}${extra}`);
  }
  // P04
  { const x = await get('/api/medico/resumenMedico', DNI_A); log(`P04 ${x.status} ${x.text.slice(0, 110)}`); }

  const browser = await chromium.launch();
  // P05–P07
  for (const [id, rl, dni] of [['P05', '/login-paciente', DNI_P], ['P06', '/login-medico', DNI_M], ['P07', '/login-admin', DNI_A]]) {
    const { ctx, page, red } = await pagina(browser);
    await login(page, rl, dni, CLAVE);
    log(`${id} red:${red.filter((x) => x.includes('/login')).join(',')} url:${ruta(page)} ls:${await ls(page)}`);
    if (id === 'P05') {
      await page.goto(FE + '/paciente/mis-citas'); await page.waitForTimeout(2000);
      log(`P05 mis-citas: ${(await page.$$eval('h5', (h) => h.map((x) => x.textContent.trim()))).join(' ; ')}`);
    }
    await ctx.close();
  }
  // P08
  for (const [rl, dni] of [['/login-paciente', DNI_P], ['/login-medico', DNI_M], ['/login-admin', DNI_A]]) {
    const { ctx, page, red } = await pagina(browser);
    await login(page, rl, dni, 'malaclave');
    log(`P08 ${rl} red:${red.join(',')} url:${ruta(page)} ls:${await ls(page)} msg:${await mensaje(page)}`);
    await ctx.close();
  }
  // P09 (RFC-011: además se muestra el contenido del token: id, rol y duración)
  for (const [dni, cl] of [[DNI_P, CLAVE], [DNI_M, CLAVE], [DNI_A, CLAVE], ['00000000', 'x']]) {
    const r = await fetch(API + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dni, clave: cl }) });
    const t = await r.text(); const j = json(t) || {};
    const c = j.token ? contenidoToken(j.token) : null;
    log(`P09 ${dni === '00000000' ? 'invalido' : j.tipo} ${r.status} ${JSON.stringify(Object.fromEntries(Object.entries(j).sort()))}` +
      (c ? ` token{sub:${c.sub},rol:${c.rol},duracion_s:${c.exp - c.iat}}` : ''));
  }
  // P10
  { const { ctx, page, red } = await pagina(browser);
    await login(page, '/login-paciente', DNI_X, CLAVE);
    log(`P10 red:${red.join(',')} url:${ruta(page)} ls:${await ls(page)} msg:${await mensaje(page)}`); await ctx.close(); }
  hora();
  // P12 y P13 (pestaña B abierta antes de guardar)
  const A = await pagina(browser); await login(A.page, '/login-paciente', DNI_P, CLAVE);
  const B = await pagina(browser); await login(B.page, '/login-paciente', DNI_P, CLAVE);
  const horasB = await prepararCita(B.page, null);
  log(`P13 pestanaB-antes ofrece 10:00: ${horasB.includes('10:00')}`);
  const horasA = await prepararCita(A.page, 'Prueba LB-0: control general');
  log(`P12 horas ofrecidas incluye 10:00: ${horasA.includes('10:00')}`);
  await A.page.$$eval('button.rounded-pill', (bs) => bs.find((b) => b.textContent.trim() === '10:00').click());
  await A.page.waitForTimeout(300);
  await A.page.$eval('button[type=submit]', (b) => b.click());
  await A.page.waitForTimeout(2500);
  log(`P12 red:${A.red.filter((x) => x.includes('POST /api/cita')).join(',')} alerta:${A.dialogos.join('|')} url:${ruta(A.page)}`);
  log(`P12 BD: ${sql('SELECT idCita,id_paciente,id_medico,fecha_cita,hora_cita,motivo,estado_cita FROM Cita ORDER BY idCita DESC LIMIT 3').replace(/\n/g, ' // ')}`);
  await A.page.goto(FE + '/paciente/mis-citas'); await A.page.waitForTimeout(2000);
  log(`P12 mis-citas contiene 2026-10-26: ${(await A.page.content()).includes('2026-10-26 - 10:00')}`);
  await A.ctx.close(); await B.ctx.close();
  { const N = await pagina(browser); await login(N.page, '/login-paciente', DNI_P, CLAVE);
    const h = await prepararCita(N.page, null); log(`P13 pestana-nueva ofrece 10:00: ${h.includes('10:00')}`); await N.ctx.close(); }
  { const r = await enviar('POST', '/api/cita', { id_paciente: 1, id_medico: 1, fecha_cita: '2026-10-26', hora_cita: '10:00:00', motivo: 'Prueba LB-0: doble reserva (pestana B)', estado_cita: 1 }, DNI_P);
    const j = json(r.text) || {};
    log(`P13 POST duplicado ${r.status} idCita:${j.idCita}`);
    log(`P13 BD reservas: ${sql("SELECT COUNT(*) FROM Cita WHERE id_medico=1 AND fecha_cita='2026-10-26' AND hora_cita='10:00:00'")}`); }
  // P14, P15 (RFC-011: con el token del paciente de prueba, que es el paciente 1)
  { const c = json((await get('/api/cita', DNI_P)).text);
    log(`P14 total=${c.length} paciente1=${c.filter((x) => x.id_paciente === 1).length} distintos=${new Set(c.map((x) => x.id_paciente)).size} BD=${sql('SELECT COUNT(*), SUM(id_paciente=1) FROM Cita').replace('\t', '|')}`); }
  { const h = json((await get('/api/historia_clinica', DNI_P)).text);
    log(`P15 total=${h.length} paciente1=${h.filter((x) => x.id_paciente === 1).length} BD=${sql('SELECT COUNT(*), SUM(id_paciente=1) FROM Historia_Clinica').replace('\t', '|')}`); }
  // P16
  { const P = await pagina(browser); await login(P.page, '/login-paciente', DNI_P, CLAVE);
    P.red.length = 0;
    const resp = P.page.waitForResponse((r) => r.url() === API + '/api/cita');
    await P.page.goto(FE + '/paciente/mis-citas'); const body = await (await resp).json(); await P.page.waitForTimeout(2500);
    const cuenta = {}; P.red.forEach((x) => (cuenta[x] = (cuenta[x] || 0) + 1));
    log(`P16 recibidas=${body.length} delPaciente1=${body.filter((x) => x.id_paciente === 1).length} tarjetas=${(await P.page.$$('h5')).length} peticiones=${P.red.length} ${JSON.stringify(Object.fromEntries(Object.entries(cuenta).sort()))}`);
    await P.ctx.close(); }
  hora();
  // P17 (3 roles)
  for (const [rl, dni] of [['/login-paciente', DNI_P], ['/login-medico', DNI_M], ['/login-admin', DNI_A]]) {
    const { ctx, page } = await pagina(browser);
    await login(page, rl, dni, CLAVE);
    const antes = await ls(page);
    await page.evaluate(() => { const e = [...document.querySelectorAll('a,button')].find((x) => x.textContent.trim() === 'Cerrar Sesión'); e.click(); });
    await page.waitForTimeout(1500);
    let extra = '';
    if (rl === '/login-paciente') { await page.goto(FE + '/paciente/mis-citas'); await page.waitForTimeout(1500); extra = ` mis-citas->${ruta(page)}`; }
    log(`P17 ${rl} antes:${antes} despues-url:${extra ? '(ver)' : ruta(page)} despues-ls:${await ls(page)}${extra}`);
    await ctx.close();
  }
  // P19
  for (const [rl, dni] of [['/login-paciente', DNI_M], ['/login-paciente', DNI_A], ['/login-medico', DNI_P], ['/login-medico', DNI_A], ['/login-admin', DNI_P], ['/login-admin', DNI_M]]) {
    const { ctx, page, red } = await pagina(browser);
    await login(page, rl, dni, CLAVE);
    log(`P19 ${rl} con ${dni === DNI_P ? 'paciente' : dni === DNI_M ? 'medico' : 'admin'} red:${red.filter((x) => x.includes('/login')).join(',')} url:${ruta(page)} ls:${await ls(page)} msg:${await mensaje(page)}`);
    await ctx.close();
  }
  // P20–P22
  const M = await pagina(browser); await login(M.page, '/login-medico', DNI_M, CLAVE);
  await M.page.goto(FE + '/medico-dashboard/citas-pendientes');
  log(`P20 pantalla: ${(await filas(M.page)).join(' // ')}`);
  log(`P20 SELECT: ${sql("SELECT c.idCita, CONCAT(p.nombres,' ',p.apellidos), p.dni, c.fecha_cita, c.hora_cita, c.motivo FROM Cita c JOIN Paciente p ON p.idPaciente=c.id_paciente JOIN Estado_Cita e ON e.id_estado_cita=c.estado_cita WHERE c.id_medico=1 AND e.nombre_estado='Pendiente' ORDER BY c.idCita").replace(/\t/g, ' | ').replace(/\n/g, ' // ')}`);
  for (let [id, idCita, accion, pantalla] of [['P21', 22, 'Aceptar', 'citas-aprobadas'], ['P22', null, 'Cancelar', 'citas-canceladas']]) {
    // t25 (opción 1 del usuario): P22 crea su propia cita pendiente del médico 1 y cancela esa (el id lo da el servidor)
    if (id === 'P22') {
      const r = await enviar('POST', '/api/cita', { id_paciente: 1, id_medico: 1, fecha_cita: '2026-10-26', hora_cita: '10:20:00', motivo: 'Prueba P22: cita para cancelar', estado_cita: 1 }, DNI_P);
      const j = json(r.text) || {};
      idCita = j.idCita;
      log(`P22 crear ${r.status} idCita:${idCita}`);
      log(`P22 BD antes: ${sql(`SELECT c.idCita,c.id_medico,c.estado_cita,e.nombre_estado,c.motivo FROM Cita c JOIN Estado_Cita e ON e.id_estado_cita=c.estado_cita WHERE c.idCita=${Number(idCita) || 0}`).replace(/\t/g, ' | ')}`);
    }
    M.red.length = 0;
    await M.page.goto(FE + '/medico-dashboard/citas-pendientes'); await M.page.waitForTimeout(1500);
    const hay = await M.page.$$eval('table tbody tr', (trs, [idc, acc]) => {
      const tr = trs.find((t) => t.querySelector('td')?.textContent.trim() === String(idc));
      if (!tr) return false;
      [...tr.querySelectorAll('button')].find((b) => b.textContent.trim() === acc).click();
      return true;
    }, [idCita, accion]);
    if (!hay) {
      log(`${id} NO EJECUTABLE: la cita ${idCita} no está en Citas Pendientes`);
      log(`${id} BD: ${sql(`SELECT COUNT(*) FROM Cita WHERE idCita=${Number(idCita) || 0}`)} filas con idCita=${idCita}`);
      continue;
    }
    await M.page.waitForTimeout(500);
    const modal = (await M.page.locator('.modal-content').innerText()).replace(/\s+/g, ' ').trim();
    await M.page.$eval('.modal-footer button:last-child', (b) => b.click());
    await M.page.waitForTimeout(2000);
    log(`${id} modal: ${modal}`);
    log(`${id} red: ${M.red.filter((x) => x.startsWith('200 PUT') || x.includes('PUT')).join(',')}`);
    log(`${id} pendientes: ${(await filas(M.page)).join(' // ')}`);
    log(`${id} BD: ${sql(`SELECT c.idCita,c.id_medico,c.estado_cita,e.nombre_estado,c.motivo FROM Cita c JOIN Estado_Cita e ON e.id_estado_cita=c.estado_cita WHERE c.idCita=${entero(idCita)}`).replace(/\t/g, ' | ')}`);
    await M.page.goto(FE + '/medico-dashboard/' + pantalla); await M.page.reload();
    log(`${id} ${pantalla} tras recargar: ${(await filas(M.page)).join(' // ')}`);
  }
  await M.ctx.close();
  await browser.close();
  hora();
  // P23 (RFC-011: cada médico pide lo suyo con su propio token)
  let iguales = 0, total = 0;
  for (const med of [1, 2, 3, 6, 10]) for (const est of ['Pendiente', 'Confirmada', 'Cancelada', 'Atendida']) {
    const a = json((await get(`/api/citas/medico/${med}?estado=${est}`, dniMedico(med))).text).map((x) => x.idCita).sort((x, y) => x - y).join(',');
    const b = sql(`SELECT IFNULL(GROUP_CONCAT(c.idCita ORDER BY c.idCita),'') FROM Cita c JOIN Estado_Cita e ON e.id_estado_cita=c.estado_cita WHERE c.id_medico=${med} AND e.nombre_estado='${est}'`).replace('NULL', '');
    total++; if (a === b) iguales++;
    log(`P23 medico ${med} ${est}: API [${a}] BD [${b}] ${a === b ? 'igual' : 'DISTINTO'}`);
  }
  log(`P23 ${iguales}/${total} iguales`);
  { const a = json((await get('/api/citas/medico/1/pacientes', DNI_M)).text).map((x) => x.idPaciente);
    log(`P23 pacientes medico 1: API ${a.join(',')} BD ${sql('SELECT GROUP_CONCAT(DISTINCT id_paciente ORDER BY id_paciente) FROM Cita WHERE id_medico=1')}`); }
  // P24
  for (const r of ['/api/citas/medico/1?estado=Atendida', '/api/citas/medico/1/pacientes']) {
    const x = await get(r, DNI_M); const j = json(x.text);
    log(`P24 ${r} campos:${Object.keys(j[0] || {}).join(',')} clave:${/clave|password|contrase/i.test(x.text)} texto-clave-prueba:${x.text.includes('"' + CLAVE + '"')}`);
  }
  // P25 (preflight sin token, como el navegador; GET /api/especialidad es público)
  hora();
  const nulo = process.platform === 'win32' ? 'NUL' : '/dev/null';
  const cors = (args) => execFileSync('curl', ['-s', '-i', ...args], { encoding: 'utf8' }).split(/\r?\n/)
    .filter((l) => /^HTTP|^Access-Control|^Vary/i.test(l) || (l && !l.includes(':') )).map((l) => l.trim()).filter(Boolean).join(' ; ');
  for (const origen of ['http://localhost:4200', 'http://otro-origen.example']) {
    for (const [met, r] of [['POST', '/login'], ['GET', '/api/especialidad'], ['POST', '/api/cita'], ['PUT', '/api/citas/medico/1/1/estado'], ['DELETE', '/api/paciente/999'], ['GET', '/usuarios']]) {
      log(`P25 ${origen} OPTIONS ${met} ${r}: ${cors(['-X', 'OPTIONS', '-H', 'Origin: ' + origen, '-H', 'Access-Control-Request-Method: ' + met, '-H', 'Access-Control-Request-Headers: content-type', API + r])}`);
    }
    const g = execFileSync('curl', ['-s', '-o', nulo, '-w', '%{http_code}', '-H', 'Origin: ' + origen, API + '/api/especialidad'], { encoding: 'utf8' });
    log(`P25 ${origen} GET /api/especialidad: ${g}`);
  }
  hora();
  // P26 (RFC-012): 10 reservas simultáneas al mismo horario; cada una con el token del paciente que reserva
  {
    const ids = [...Array(10).keys()].map((i) => 1 + (i % 5));
    for (const id of new Set(ids)) await tokenDe(dniPaciente(id));
    const rs = await Promise.all(ids.map((idp, i) => enviar('POST', '/api/cita',
      { id_paciente: idp, id_medico: 1, fecha_cita: '2026-11-30', hora_cita: '11:00:00', motivo: 'Prueba P26: concurrencia ' + i, estado_cita: 1 }, dniPaciente(idp))
      .then((r) => ({ s: r.status, t: r.text }))));
    const cuenta = {}; rs.forEach((r) => (cuenta[r.s] = (cuenta[r.s] || 0) + 1));
    const conflicto = rs.find((r) => r.s !== 200);
    log(`P26 codigos ${JSON.stringify(Object.fromEntries(Object.entries(cuenta).sort()))}`);
    log(`P26 cuerpo-no-200: ${conflicto ? conflicto.t.slice(0, 160) : '(ninguno)'}`);
    log(`P26 texto-SQL-en-respuestas: ${rs.some((r) => /sql|duplicate|constraint|insert into|jdbc|hibernate/i.test(r.t))}`);
    log(`P26 BD filas: ${sql("SELECT COUNT(*) FROM Cita WHERE id_medico=1 AND fecha_cita='2026-11-30' AND hora_cita='11:00:00'")}`);
  }
  // P27 (RFC-012): cancelar una cita libera el horario; reserva el paciente 2, cancela el médico 1
  {
    const post = (motivo) => enviar('POST', '/api/cita', { id_paciente: 2, id_medico: 1, fecha_cita: '2026-11-30', hora_cita: '11:40:00', motivo, estado_cita: 1 }, dniPaciente(2))
      .then((r) => ({ s: r.status, j: json(r.text) || {} }));
    const a = await post('Prueba P27: original');
    log(`P27 crear ${a.s} idCita:${a.j.idCita}`);
    const b = await post('Prueba P27: duplicado antes de cancelar');
    log(`P27 duplicado-antes-de-cancelar ${b.s}`);
    const c = await enviar('PUT', `/api/citas/medico/1/${a.j.idCita}/estado`, { estado: 'Cancelada' }, DNI_M);
    log(`P27 cancelar ${c.status}`);
    const br = await chromium.launch();
    const N = await pagina(br); await login(N.page, '/login-paciente', DNI_P, CLAVE);
    const h = await prepararCita(N.page, null, '2026-11-30');
    log(`P27 pantalla ofrece 11:40 tras cancelar: ${h.includes('11:40')}`);
    await N.ctx.close(); await br.close();
    const d = await post('Prueba P27: nueva reserva tras cancelar');
    log(`P27 reservar-de-nuevo ${d.s} idCita:${d.j.idCita}`);
    log(`P27 BD: ${sql("SELECT IFNULL(GROUP_CONCAT(estado_cita ORDER BY idCita),'') FROM Cita WHERE id_medico=1 AND fecha_cita='2026-11-30' AND hora_cita='11:40:00'")} (estados en orden de idCita)`);
  }
  hora();
  await p28();
  hora();
}

// P28 (nueva, RFC-011): matriz de autorización contra el backend real
async function p28() {
  const yoP = entero(sql(`SELECT idPaciente FROM Paciente WHERE dni='${DNI_P}'`));
  const yoM = entero(sql(`SELECT id_medico FROM Medico WHERE dni='${DNI_M}'`));
  const citaAjena = entero(sql(`SELECT MIN(idCita) FROM Cita WHERE id_paciente<>${yoP}`));
  const historiaAjena = entero(sql(`SELECT MIN(idhistoria_Clinica) FROM Historia_Clinica WHERE id_paciente<>${yoP}`));
  const otroMedico = entero(sql(`SELECT MIN(id_medico) FROM Medico WHERE id_medico<>${yoM}`));
  // Token vencido firmado con el mismo secreto del backend (HS256), para probar que el vencimiento se comprueba
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  let vencido = '(sin JWT_SECRET)';
  if (process.env.JWT_SECRET) {
    const ahora = Math.floor(Date.now() / 1000);
    const base = `${b64({ alg: 'HS256' })}.${b64({ sub: String(yoP), rol: 'paciente', iat: ahora - 7300, exp: ahora - 100 })}`;
    vencido = `${base}.${crypto.createHmac('sha256', process.env.JWT_SECRET).update(base).digest('base64url')}`;
  }
  const casos = [
    ['sin token', 'GET', '/api/cita', null, 401],
    ['sin token', 'GET', '/api/historia_clinica', null, 401],
    ['sin token', 'POST', '/usuarios/nuevo', null, 401],
    ['token inválido', 'GET', '/api/cita', 'TOKEN:no.es.valido', 401],
    ['token vencido', 'GET', '/api/cita', 'TOKEN:' + vencido, 401],
    ['paciente -> admin', 'GET', '/api/paciente', DNI_P, 403],
    ['paciente -> admin', 'GET', '/usuarios', DNI_P, 403],
    ['paciente -> reportes', 'GET', '/api/reportes/dashboard', DNI_P, 403],
    ['médico -> historia', 'GET', '/api/historia_clinica', DNI_M, 403],
    ['admin -> historia', 'GET', '/api/historia_clinica', DNI_A, 403],
    ['IDOR cita ajena', 'GET', `/api/cita/${citaAjena}`, DNI_P, 403],
    ['IDOR historia ajena', 'GET', `/api/historia_clinica/${historiaAjena}`, DNI_P, 403],
    ['IDOR otro médico', 'GET', `/api/citas/medico/${otroMedico}?estado=Atendida`, DNI_M, 403],
    ['propio', 'GET', `/api/paciente/codigo/${yoP}`, DNI_P, 200],
    ['propio', 'GET', `/api/citas/medico/${yoM}?estado=Atendida`, DNI_M, 200],
    ['público', 'GET', '/api/especialidad', null, 200],
  ];
  let ok = 0;
  for (const [nombre, met, r, quien, esperado] of casos) {
    const h = quien && quien.startsWith('TOKEN:') ? { Authorization: 'Bearer ' + quien.slice(6) } : await cabeceras(quien);
    const res = await fetch(API + r, { method: met, headers: { 'Content-Type': 'application/json', ...h }, body: met === 'GET' ? undefined : '{}' });
    const cuerpo = (await res.text()).slice(0, 60);
    if (res.status === esperado) ok++;
    log(`P28 ${nombre}: ${met} ${r} -> ${res.status} (esperado ${esperado}) ${res.status === esperado ? 'OK' : 'DISTINTO'} ${res.status >= 400 ? cuerpo : ''}`);
  }
  // /fecha/{f} para el paciente: solo hora_cita y estado_cita
  const f = sql(`SELECT CONCAT(id_medico,'/',fecha_cita) FROM Cita WHERE id_paciente<>${yoP} ORDER BY idCita LIMIT 1`);
  const x = json((await get(`/api/citas/medico/${f.split('/')[0]}/fecha/${f.split('/')[1]}`, DNI_P)).text) || [];
  const campos = [...new Set(x.flatMap((c) => Object.keys(c)))].sort().join(',');
  const okFecha = x.length > 0 && campos === 'estado_cita,hora_cita';
  if (okFecha) ok++;
  log(`P28 /fecha para paciente (medico/fecha ${f}): n=${x.length} campos=${campos} ${okFecha ? 'OK' : 'DISTINTO'}`);
  log(`P28 ${ok}/${casos.length + 1} como se esperaba`);
}

async function fase_off() {
  hora();
  const browser = await chromium.launch();
  // P11 con el backend apagado: sesión de médico cargada en localStorage (mismas claves que P06)
  { const { ctx, page } = await pagina(browser);
    await page.goto(FE + '/login-selection');
    await page.evaluate(() => { localStorage.setItem('userId', '1'); localStorage.setItem('userName', 'Jorge Santos Ruiz'); localStorage.setItem('userType', 'medico'); });
    for (const p of ['citas-pendientes', 'citas-aprobadas', 'citas-canceladas', 'pacientes']) {
      await page.goto(FE + '/medico-dashboard/' + p); await page.waitForTimeout(2500);
      log(`P11 apagado ${p}: msg:${await mensaje(page)} filas:${(await page.$$('table tbody tr td:not(.empty-message)')).length} tabla:${(await page.$$('table')).length}`);
    }
    await ctx.close(); }
  // P18
  { const { ctx, page, red } = await pagina(browser);
    await login(page, '/login-paciente', DNI_P, CLAVE);
    log(`P18 red:${red.join(',')} url:${ruta(page)} ls:${await ls(page)} msg:${await mensaje(page)}`); await ctx.close(); }
  await browser.close();
  hora();
}

(FASE === 'on' ? fase_on() : fase_off()).catch((e) => { log('ERROR DEL SCRIPT: ' + e.stack); process.exit(1); });
