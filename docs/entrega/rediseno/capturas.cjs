// Capturas de las pantallas de acceso a 360 y 1280 px (RFC-019, Parte 1). Se corre con el frontend en http://localhost:4200
// (los logins y el registro no necesitan el backend). Uso, desde la raíz del repositorio:
//   node docs/entrega/rediseno/capturas.cjs <antes|despues> docs/entrega/rediseno
// Las capturas "antes" se tomaron sirviendo el código de LB-11 sin cambios (rama de la RFC-019 antes de editar el frontend).
// Chromium: variable CHROME_BIN, o el que instala Playwright por defecto.
const path = require('path');
const { chromium } = require(path.resolve(__dirname, '..', '..', '..', 'e2e', 'node_modules', 'playwright'));
const [, , fase, out] = process.argv;
if (!fase || !out) { console.error('Uso: node capturas.cjs <antes|despues> <carpeta_salida>'); process.exit(2); }
const PANTALLAS = [
  ['seleccion-rol', '/login-selection'],
  ['login-paciente', '/login-paciente'],
  ['login-medico', '/login-medico'],
  ['login-admin', '/login-admin'],
  ['registro', '/registro'],
];
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined });
  for (const w of [360, 1280]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w === 360 ? 740 : 800 } });
    for (const [nombre, ruta] of PANTALLAS) {
      const page = await ctx.newPage();
      await page.goto('http://localhost:4200' + ruta, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const f = path.join(out, `${fase}-${nombre}-${w}.png`);
      await page.screenshot({ path: f, fullPage: true });
      console.log(f, 'scrollWidth', await page.evaluate(() => document.documentElement.scrollWidth));
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
})();
