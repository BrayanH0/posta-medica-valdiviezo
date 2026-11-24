import { test, expect } from '@playwright/test';

// E-RFC019-1 (RFC-019, Parte 1): criterios de aceptación de las pantallas de acceso.
//  - el selector de rol navega a la ruta de cada login (no cambia el formulario en la misma página);
//  - el enlace "Registrarse" solo está en el login de paciente;
//  - cada campo tiene una etiqueta asociada;
//  - los mensajes de error y el aviso de sesión vencida se anuncian con role="alert";
//  - no hay desborde horizontal a 360 ni a 1280 px.
const FE = 'http://localhost:4200';
const LOGINS = ['/login-paciente', '/login-medico', '/login-admin'];

test('el selector de rol navega a cada login', async ({ page }) => {
  await page.goto(`${FE}/login-paciente`);
  const roles = page.locator('nav[aria-label="Tipo de usuario"]');
  await roles.getByRole('link', { name: 'Médico' }).click();
  await expect(page).toHaveURL(/\/login-medico$/);
  await roles.getByRole('link', { name: 'Administrador' }).click();
  await expect(page).toHaveURL(/\/login-admin$/);
  await roles.getByRole('link', { name: 'Paciente' }).click();
  await expect(page).toHaveURL(/\/login-paciente$/);
  await expect(roles.locator('a[aria-current="page"]')).toHaveText('Paciente');
});

test('el enlace de registro solo aparece en el login de paciente', async ({ page }) => {
  for (const ruta of LOGINS) {
    await page.goto(FE + ruta);
    await expect(page.locator('a[href="/registro"]')).toHaveCount(ruta === '/login-paciente' ? 1 : 0);
  }
});

test('cada campo de las pantallas de acceso tiene etiqueta asociada', async ({ page }) => {
  for (const ruta of [...LOGINS, '/registro']) {
    await page.goto(FE + ruta);
    const sinEtiqueta = await page.evaluate(() =>
      [...document.querySelectorAll('input, select, textarea')]
        .filter((c) => !(c as HTMLInputElement).labels || (c as HTMLInputElement).labels!.length === 0)
        .map((c) => (c as HTMLInputElement).id || (c as HTMLInputElement).name)
    );
    expect(sinEtiqueta, `campos sin etiqueta en ${ruta}`).toEqual([]);
  }
});

test('los errores y el aviso de sesión vencida se anuncian con role="alert"', async ({ page }) => {
  for (const ruta of LOGINS) {
    await page.goto(FE + ruta);
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toHaveAttribute('role', 'alert');
  }
  await page.goto(`${FE}/login-selection?sesion=expirada`);
  const aviso = page.locator('.aviso-sesion');
  await expect(aviso).toContainText('Su sesión expiró o no es válida');
  await expect(aviso).toHaveAttribute('role', 'alert');
});

test('sin desborde horizontal a 360 y a 1280 px', async ({ page }) => {
  for (const ancho of [360, 1280]) {
    await page.setViewportSize({ width: ancho, height: 800 });
    for (const ruta of ['/login-selection', ...LOGINS, '/registro']) {
      await page.goto(FE + ruta);
      const ancho_doc = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(ancho_doc, `${ruta} a ${ancho}px`).toBeLessThanOrEqual(ancho);
    }
  }
});
