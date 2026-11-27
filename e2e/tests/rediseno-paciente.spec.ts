import { test, expect, Page } from '@playwright/test';

// E05 (RFC-019, Parte 2): criterios de aceptación del módulo del paciente rediseñado.
//  - menú lateral con Inicio, Registrar cita, Mis citas, Historial médico y "Cerrar Sesión" en las 4 pantallas
//    (AUD-DIS-11), con el ítem de la pantalla actual marcado con aria-current="page";
//  - en celular el menú se despliega con un botón y "Cerrar Sesión" es alcanzable;
//  - los campos de Registrar cita tienen etiqueta asociada (AUD-DIS-04);
//  - lo que usan las pruebas anteriores sigue ahí: button.rounded-pill, button[type=submit] con el texto
//    "Confirmar Cita", un h5 por cita en Mis citas y el formato yyyy-MM-dd - HH:mm;
//  - sin desborde horizontal a 360 y 1280 px.
// Necesita backend (8080) y frontend (4200) con la BD cargada (el paciente de e2e/tests/sesion-token.spec.ts).
const FE = 'http://localhost:4200';
const PANTALLAS = ['/welcome', '/paciente/registrar-cita', '/paciente/mis-citas', '/paciente/historial-medico'];

async function entrar(page: Page) {
  await page.goto(`${FE}/login-paciente`);
  await page.fill('input[name="dni"]', '12345678');
  await page.fill('input[name="clave"]', '123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/welcome/);
}

test('las 4 pantallas del paciente tienen el menú lateral con el ítem activo y Cerrar Sesión', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await entrar(page);
  const etiquetas = ['Inicio', 'Registrar cita', 'Mis citas', 'Historial médico'];
  for (let i = 0; i < PANTALLAS.length; i++) {
    await page.goto(FE + PANTALLAS[i]);
    const menu = page.locator('nav.sidebar-nav');
    await expect(menu.getByRole('link')).toHaveText(etiquetas);
    await expect(menu.locator('a[aria-current="page"]')).toHaveText(etiquetas[i]);
    await expect(page.locator('button.logout-btn')).toHaveText('Cerrar Sesión');
  }
});

test('en celular el menú se despliega con un botón y se puede cerrar la sesión', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await entrar(page);
  await expect(page.locator('button.logout-btn')).toBeHidden();
  const boton = page.getByRole('button', { name: 'Menú' });
  await expect(boton).toHaveAttribute('aria-expanded', 'false');
  await boton.click();
  await expect(page.locator('button.logout-btn')).toBeVisible();
  await page.locator('button.logout-btn').click();
  await expect(page).toHaveURL(/\/login-selection/);
});

test('Registrar cita: campos con etiqueta, un solo botón de envío y sin desborde', async ({ page }) => {
  await entrar(page);
  for (const ancho of [360, 1280]) {
    await page.setViewportSize({ width: ancho, height: 800 });
    await page.goto(`${FE}/paciente/registrar-cita`);
    await expect(page.locator('select[name="especialidad"] option').first()).toBeAttached();
    const sinEtiqueta = await page.evaluate(() =>
      [...document.querySelectorAll('input, select, textarea')]
        .filter((c) => !(c as HTMLInputElement).labels || (c as HTMLInputElement).labels!.length === 0)
        .map((c) => (c as HTMLInputElement).name)
    );
    expect(sinEtiqueta, `campos sin etiqueta a ${ancho} px`).toEqual([]);
    await expect(page.locator('button[type="submit"]')).toHaveCount(1);
    await expect(page.locator('button[type="submit"]')).toHaveText('Confirmar Cita');
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(desborde, `desborde horizontal a ${ancho} px`).toBeLessThanOrEqual(0);
  }
});

test('Registrar cita: las horas siguen siendo button.rounded-pill y la elegida queda marcada', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await entrar(page);
  await page.goto(`${FE}/paciente/registrar-cita`);
  await page.selectOption('select[name="especialidad"]', { index: 0 });
  await page.waitForFunction(() => document.querySelectorAll('select[name="medico"] option').length > 0);
  await page.selectOption('select[name="medico"]', { index: 0 });
  // Un lunes futuro: el médico tiene horario ese día (o se usa el horario por defecto)
  const d = new Date();
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  await page.fill('input[name="fecha"]', d.toISOString().split('T')[0]);
  await page.dispatchEvent('input[name="fecha"]', 'change');
  const horas = page.locator('button.rounded-pill');
  await expect(horas.first()).toBeVisible();
  await horas.first().click();
  await expect(horas.first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('aside.rc-summary')).toContainText(((await horas.first().textContent()) || '').trim());
});

test('Mis citas: una tarjeta h5 por cita con el formato yyyy-MM-dd - HH:mm y sin desborde', async ({ page }) => {
  await entrar(page);
  for (const ancho of [360, 1280]) {
    await page.setViewportSize({ width: ancho, height: 800 });
    await page.goto(`${FE}/paciente/mis-citas`);
    await page.waitForTimeout(800);
    const titulos = await page.locator('h5').allTextContents();
    expect(titulos.length).toBeGreaterThan(0);
    for (const t of titulos) expect(t.trim()).toMatch(/^\d{4}-\d{2}-\d{2} - \d{2}:\d{2}/);
    await expect(page.locator('article.ui-card')).toHaveCount(titulos.length);
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(desborde, `desborde horizontal a ${ancho} px`).toBeLessThanOrEqual(0);
  }
});

test('Historial médico y bienvenida: sin desborde y con el saludo', async ({ page }) => {
  await entrar(page);
  for (const ancho of [360, 1280]) {
    await page.setViewportSize({ width: ancho, height: 800 });
    for (const ruta of ['/welcome', '/paciente/historial-medico']) {
      await page.goto(FE + ruta);
      await page.waitForTimeout(500);
      const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(desborde, `desborde horizontal en ${ruta} a ${ancho} px`).toBeLessThanOrEqual(0);
    }
  }
  await page.goto(`${FE}/welcome`);
  await expect(page.locator('h1')).toContainText(/^Hola, \S+/);
  await expect(page.getByRole('link', { name: 'Reservar cita' }).first()).toBeVisible();
});
