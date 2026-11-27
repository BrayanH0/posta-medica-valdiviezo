import { test, expect, Page } from '@playwright/test';

// E06 (RFC-019, Parte 2, correcciones de la revisión de revisor-rediseno): una prueba por observación corregida.
//  1. la barra superior del celular no cambia de alto al abrir el menú (320 y 360 px);
//  4. Mis citas no pasa de 2 columnas (con 2 citas a 1920 px no queda una tercera columna vacía);
//  5. las horas de Registrar cita se alinean en columnas;
//  6. la tecla Escape cierra el menú del celular;
//  7. el texto del estado vacío del Historial queda centrado en vertical dentro de su caja;
//  8. en una ventana baja "Cerrar Sesión" sigue alcanzable (el menú se desplaza dentro de sí mismo).
// Necesita backend (8080) y frontend (4200) con la BD cargada (el paciente de e2e/tests/sesion-token.spec.ts).
const FE = 'http://localhost:4200';

async function entrar(page: Page) {
  await page.goto(`${FE}/login-paciente`);
  await page.fill('input[name="dni"]', '12345678');
  await page.fill('input[name="clave"]', '123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/welcome/);
}

test('la barra superior no cambia de alto al abrir el menú a 320 y 360 px', async ({ page }) => {
  await entrar(page);
  for (const ancho of [320, 360, 390]) {
    await page.setViewportSize({ width: ancho, height: 740 });
    await page.goto(`${FE}/welcome`);
    const alto = () => page.evaluate(() => Math.round(document.querySelector('.pl-topbar')!.getBoundingClientRect().height));
    const cerrada = await alto();
    await page.getByRole('button', { name: 'Menú' }).click();
    await expect(page.getByRole('button', { name: 'Menú' })).toHaveAttribute('aria-expanded', 'true');
    expect(await alto(), `alto de la barra a ${ancho} px`).toBe(cerrada);
  }
});

test('la tecla Escape cierra el menú del celular', async ({ page }) => {
  await entrar(page);
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(`${FE}/welcome`);
  const boton = page.getByRole('button', { name: 'Menú' });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(boton).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('button.logout-btn')).toBeHidden();
});

test('Mis citas usa 2 columnas como máximo a 1920 px', async ({ page }) => {
  await entrar(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${FE}/paciente/mis-citas`);
  await expect(page.locator('article.ui-card').first()).toBeVisible();
  const columnas = await page.evaluate(() => new Set([...document.querySelectorAll('article.ui-card')].map((a) => Math.round(a.getBoundingClientRect().left))).size);
  expect(columnas).toBeLessThanOrEqual(2);
  const grilla = await page.evaluate(() => getComputedStyle(document.querySelector('.mc-grid')!).gridTemplateColumns.split(' ').length);
  expect(grilla).toBe(2);
});

test('las horas de Registrar cita se alinean en columnas', async ({ page }) => {
  await entrar(page);
  for (const ancho of [360, 1280, 1920]) {
    await page.setViewportSize({ width: ancho, height: 900 });
    await page.goto(`${FE}/paciente/registrar-cita`);
    await page.selectOption('select[name="especialidad"]', { index: 0 });
    await page.waitForFunction(() => document.querySelectorAll('select[name="medico"] option').length > 0);
    await page.selectOption('select[name="medico"]', { index: 0 });
    const d = new Date();
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
    await page.fill('input[name="fecha"]', d.toISOString().split('T')[0]);
    await page.dispatchEvent('input[name="fecha"]', 'change');
    await expect(page.locator('button.rounded-pill').first()).toBeVisible();
    const m = await page.evaluate(() => {
      const bs = [...document.querySelectorAll('button.rounded-pill')].map((b) => b.getBoundingClientRect());
      const filas = new Map<number, number[]>();
      for (const r of bs) filas.set(Math.round(r.top), [...(filas.get(Math.round(r.top)) || []), Math.round(r.left)]);
      const lista = [...filas.values()];
      const completas = lista.slice(0, -1); // la última fila puede tener menos píldoras
      const ancho = new Set(bs.map((r) => Math.round(r.width))).size;
      const columnas = Math.max(...lista.map((f) => f.length));
      const alineadas = completas.every((f) => f.length === columnas && f.every((x, i) => x === lista[0][i]));
      const ultimaEnColumnas = lista[lista.length - 1].every((x, i) => x === lista[0][i]);
      return { alineadas, ultimaEnColumnas, ancho, filas: lista.length };
    });
    expect(m.alineadas, `filas completas alineadas a ${ancho} px`).toBeTruthy();
    expect(m.ultimaEnColumnas, `última fila en las mismas columnas a ${ancho} px`).toBeTruthy();
    expect(m.ancho, `todas las píldoras con el mismo ancho a ${ancho} px`).toBe(1);
  }
});

test('el texto del estado vacío del Historial queda centrado en vertical', async ({ page }) => {
  await entrar(page);
  await page.route('**/api/historia_clinica', (ruta) => ruta.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(`${FE}/paciente/historial-medico`);
  await expect(page.locator('.ui-empty')).toBeVisible();
  const m = await page.evaluate(() => {
    const caja = document.querySelector('.ui-empty')!.getBoundingClientRect();
    const p = document.querySelector('.ui-empty p')!.getBoundingClientRect();
    return { arriba: p.top - caja.top, abajo: caja.bottom - p.bottom };
  });
  expect(Math.abs(m.arriba - m.abajo)).toBeLessThanOrEqual(2);
});

test('en una ventana baja "Cerrar Sesión" sigue alcanzable porque el menú se desplaza', async ({ page }) => {
  await entrar(page);
  await page.setViewportSize({ width: 1024, height: 360 });
  await page.goto(`${FE}/welcome`);
  const m = await page.evaluate(() => {
    const menu = document.querySelector('.pl-sidebar') as HTMLElement;
    return { overflow: getComputedStyle(menu).overflowY, alto: menu.getBoundingClientRect().height, vista: window.innerHeight };
  });
  expect(m.overflow).toBe('auto');
  expect(m.alto).toBeLessThanOrEqual(m.vista);
  await page.locator('button.logout-btn').scrollIntoViewIfNeeded();
  const caja = await page.locator('button.logout-btn').boundingBox();
  expect(caja!.y + caja!.height).toBeLessThanOrEqual(360);
});
