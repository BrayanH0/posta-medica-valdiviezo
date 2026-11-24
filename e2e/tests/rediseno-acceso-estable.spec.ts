import { test, expect } from '@playwright/test';

// E04 (RFC-019, Parte 1, corrección visual): al cambiar de rol (Paciente, Médico, Administrador) el selector de rol,
// el primer campo y el botón de envío empiezan siempre a la misma altura: el formulario no salta.
// Además, el panel de marca y el formulario mantienen una proporción equilibrada (el panel entre 40 % y 55 % del ancho)
// y el contenido del panel está centrado en horizontal y en vertical. (Decisión del usuario, 2026-11-23: esta prueba medía
// "panel ≤ 640 px a 1920 px"; se cambió a una proporción 50/50 como la guía de diseño. Ver RFC-019 y docs/BITACORA.md.)
const FE = 'http://localhost:4200';
const LOGINS = ['/login-paciente', '/login-medico', '/login-admin'];

for (const [ancho, alto] of [[360, 740], [768, 1024], [1280, 800], [1920, 1080]]) {
  test(`el formulario no salta al cambiar de rol a ${ancho}px`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    const posiciones: number[][] = [];
    for (const ruta of LOGINS) {
      await page.goto(FE + ruta);
      await expect(page.locator('input').first()).toBeVisible();
      posiciones.push(
        await page.evaluate(() =>
          ['.auth-roles', 'input', 'button[type="submit"]'].map((s) => Math.round(document.querySelector(s)!.getBoundingClientRect().top))
        )
      );
    }
    expect(posiciones[1], 'médico frente a paciente').toEqual(posiciones[0]);
    expect(posiciones[2], 'administrador frente a paciente').toEqual(posiciones[0]);
  });
}

for (const [ancho, alto] of [[1280, 800], [1920, 1080]]) {
  test(`el panel de marca ocupa entre 40 % y 55 % del ancho y su contenido está centrado a ${ancho}px`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    await page.goto(`${FE}/login-paciente`);
    await expect(page.locator('.auth-brand')).toBeVisible();
    const m = await page.evaluate(() => {
      const panel = document.querySelector('.auth-brand')!.getBoundingClientRect();
      const bloques = [...document.querySelectorAll('.auth-brand__top, .auth-brand__body')].map((e) => e.getBoundingClientRect());
      const izq = Math.min(...bloques.map((b) => b.left)) - panel.left;
      const der = panel.right - Math.max(...bloques.map((b) => b.right));
      const arriba = Math.min(...bloques.map((b) => b.top)) - panel.top;
      const abajo = panel.bottom - Math.max(...bloques.map((b) => b.bottom));
      return { proporcion: panel.width / window.innerWidth, izq, der, arriba, abajo };
    });
    expect(m.proporcion).toBeGreaterThanOrEqual(0.4);
    expect(m.proporcion).toBeLessThanOrEqual(0.55);
    expect(Math.abs(m.izq - m.der), 'centrado horizontal').toBeLessThanOrEqual(2);
    expect(Math.abs(m.arriba - m.abajo), 'centrado vertical').toBeLessThanOrEqual(2);
  });
}

// El registro no se mueve con ninguno de sus mensajes de error y su bloque empieza a la misma altura que el del login.
for (const [ancho, alto] of [[901, 800], [1280, 800], [1920, 1080]]) {
  test(`el registro no salta con ningún mensaje de error ni respecto al login a ${ancho}px`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    const tops = () =>
      page.evaluate(() => ['.auth-panel', 'h1', '#nombres', '#dni'].map((s) => Math.round(document.querySelector(s)!.getBoundingClientRect().top)));
    const enviar = async () => { await page.click('button[type="submit"]'); await expect(page.locator('.error-message')).toBeVisible(); };

    await page.goto(`${FE}/login-paciente`);
    const panelLogin = await page.evaluate(() => Math.round(document.querySelector('.auth-panel')!.getBoundingClientRect().top));

    await page.goto(`${FE}/registro`);
    const base = await tops();
    expect(base[0], 'borde superior del bloque frente al login').toBe(panelLogin);
    await enviar(); // nombres vacíos
    expect(await tops(), 'error de nombres').toEqual(base);
    await page.fill('#nombres', 'Ana'); await page.fill('#apellidos', 'Ruiz'); await page.fill('#dni', '123');
    await enviar(); // DNI inválido
    expect(await tops(), 'error de DNI').toEqual(base);
    await page.fill('#dni', '12345678'); await page.fill('#clave', 'abc');
    await enviar(); // contraseña débil (el más largo)
    expect(await tops(), 'error de contraseña').toEqual(base);
    await page.fill('#clave', 'Abc123!');
    await enviar(); // fecha de nacimiento inválida
    expect(await tops(), 'error de fecha').toEqual(base);
  });
}
