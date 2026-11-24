import { test, expect } from '@playwright/test';

// E04 (RFC-019, Parte 1, corrección visual): al cambiar de rol (Paciente, Médico, Administrador) el selector de rol,
// el primer campo y el botón de envío empiezan siempre a la misma altura: el formulario no salta.
// Además, el panel de marca no ocupa más de 640 px en un monitor ancho.
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

test('el panel de marca no pasa de 640 px en un monitor ancho', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${FE}/login-paciente`);
  const ancho = await page.evaluate(() => document.querySelector('.auth-brand')!.getBoundingClientRect().width);
  expect(ancho).toBeLessThanOrEqual(640);
});
