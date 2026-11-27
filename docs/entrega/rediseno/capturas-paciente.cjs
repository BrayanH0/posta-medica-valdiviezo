// RFC-019, Parte 2: capturas del módulo del paciente a 360, 768, 1280 y 1920 px, con sus estados.
// Uso (con el backend en 8080 y el frontend en 4200): node docs/entrega/rediseno/capturas-paciente.cjs
// Entra con el paciente de e2e/tests/sesion-token.spec.ts y guarda despues-paciente-<pantalla>[-estado]-<ancho>.png junto a este archivo.
// Los estados vacíos se muestran interceptando la respuesta del navegador (no se toca la BD ni el backend).
const path = require('path');
const { chromium } = require(path.resolve(__dirname, '..', '..', '..', 'e2e', 'node_modules', 'playwright'));

const FE = 'http://localhost:4200';
const PANTALLAS = [
  ['inicio', '/welcome'],
  ['registrar-cita', '/paciente/registrar-cita'],
  ['mis-citas', '/paciente/mis-citas'],
  ['historial-medico', '/paciente/historial-medico']
];
const ANCHOS = [[360, 740], [768, 1024], [1280, 800], [1920, 1080]];

async function captura(p, nombre, ancho) {
  // El menú y el resumen son "sticky": con la página desplazada aparecerían a mitad de la captura
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: path.join(__dirname, `despues-paciente-${nombre}-${ancho}.png`), fullPage: true, animations: 'disabled' });
}

(async () => {
  const b = await chromium.launch();
  for (const [w, h] of ANCHOS) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(`${FE}/login-paciente`);
    await p.fill('input[name="dni"]', '12345678');
    await p.fill('input[name="clave"]', '123456');
    await p.click('button[type="submit"]');
    await p.waitForURL(/welcome/);

    for (const [nombre, ruta] of PANTALLAS) {
      await p.goto(FE + ruta);
      await p.waitForTimeout(1200);
      if (nombre === 'registrar-cita') {
        // Estado inicial (sin elegir nada) y luego con el formulario lleno
        await captura(p, 'registrar-cita-vacio', w);
        await p.selectOption('select[name="especialidad"]', { index: 0 });
        await p.waitForFunction(() => document.querySelectorAll('select[name="medico"] option').length > 0);
        await p.selectOption('select[name="medico"]', { index: 0 });
        const d = new Date();
        d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
        await p.fill('input[name="fecha"]', d.toISOString().split('T')[0]);
        await p.dispatchEvent('input[name="fecha"]', 'change');
        await p.waitForSelector('button.rounded-pill');
        await p.locator('button.rounded-pill').nth(1).click();
        await p.fill('textarea[name="motivo"]', 'Control general');
        // La captura de página completa reinicia las transiciones de color; se espera a que terminen
        await p.mouse.move(5, 5);
        await p.waitForTimeout(600);
      }
      if (nombre === 'historial-medico') {
        // Primero con la lista cerrada y luego con todas las evoluciones abiertas
        await captura(p, 'historial-medico-cerrado', w);
        const botones = p.locator('.hm-item__btn');
        for (let i = 0; i < (await botones.count()); i++) await botones.nth(i).click();
        await p.mouse.move(5, 5);
        await p.waitForTimeout(300);
      }
      // Estado final de cada pantalla: formulario lleno (registrar-cita), evoluciones abiertas (historial) o lo normal
      await captura(p, nombre, w);
    }

    // Estados vacíos: se intercepta la respuesta del navegador, no se toca la BD
    await p.route((u) => u.pathname === '/api/cita', (r) => (r.request().method() === 'GET' ? r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }) : r.continue()));
    await p.goto(`${FE}/paciente/mis-citas`);
    await p.waitForSelector('.ui-empty');
    await captura(p, 'mis-citas-vacio', w);
    await p.unroute((u) => u.pathname === '/api/cita');
    await p.route('**/api/historia_clinica', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.goto(`${FE}/paciente/historial-medico`);
    await p.waitForSelector('.ui-empty');
    await captura(p, 'historial-medico-vacio', w);
    await p.unroute('**/api/historia_clinica');

    // Cajón del menú (en ≤ 900 px): arriba de la página y abajo de una página larga. Es de posición fija:
    // se captura solo la ventana (no la página completa) para ver lo que el usuario ve.
    if (w <= 900) {
      await p.goto(`${FE}/welcome`);
      await p.getByRole('button', { name: 'Menú', exact: true }).click();
      await p.waitForTimeout(500);
      await p.screenshot({ path: path.join(__dirname, `despues-paciente-menu-abierto-${w}.png`), animations: 'disabled' });
      await p.keyboard.press('Escape');
      await p.waitForTimeout(400);
      await p.goto(`${FE}/paciente/historial-medico`);
      await p.waitForSelector('.hm-item__btn');
      for (let i = 0; i < (await p.locator('.hm-item__btn').count()); i++) await p.locator('.hm-item__btn').nth(i).click();
      await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await p.waitForTimeout(300);
      await p.getByRole('button', { name: 'Menú', exact: true }).click();
      await p.waitForTimeout(500);
      await p.screenshot({ path: path.join(__dirname, `despues-paciente-menu-abierto-abajo-${w}.png`), animations: 'disabled' });
    }
    await p.close();
  }
  await b.close();
})();
