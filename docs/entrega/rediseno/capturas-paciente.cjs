// RFC-019, Parte 2: capturas del módulo del paciente a 360, 1280 y 1920 px.
// Uso (con el backend en 8080 y el frontend en 4200): node docs/entrega/rediseno/capturas-paciente.cjs
// Entra con el paciente de e2e/tests/sesion-token.spec.ts y guarda despues-paciente-<pantalla>-<ancho>.png junto a este archivo.
const path = require('path');
const { chromium } = require(path.resolve(__dirname, '..', '..', '..', 'e2e', 'node_modules', 'playwright'));

const FE = 'http://localhost:4200';
const PANTALLAS = [
  ['inicio', '/welcome'],
  ['registrar-cita', '/paciente/registrar-cita'],
  ['mis-citas', '/paciente/mis-citas'],
  ['historial-medico', '/paciente/historial-medico']
];
const ANCHOS = [[360, 740], [1280, 800], [1920, 1080]];

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
        // Estado con el formulario lleno: especialidad, médico, un día hábil futuro, una hora y un motivo
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
        const abrir = p.locator('.hm-item__btn').first();
        if (await abrir.count()) await abrir.click();
      }
      // El menú y el resumen son "sticky": con la página desplazada aparecerían a mitad de la captura
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.screenshot({ path: path.join(__dirname, `despues-paciente-${nombre}-${w}.png`), fullPage: true, animations: 'disabled' });
    }
    if (w === 360) {
      await p.goto(`${FE}/welcome`);
      await p.getByRole('button', { name: 'Menú' }).click();
      await p.screenshot({ path: path.join(__dirname, 'despues-paciente-menu-abierto-360.png'), fullPage: true });
    }
    await p.close();
  }
  await b.close();
})();
