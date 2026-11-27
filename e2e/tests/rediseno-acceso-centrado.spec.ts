import { test, expect } from '@playwright/test';

// E07 (RFC-019, Parte 1, ajuste pedido por el usuario tras verlo a 2560 px): en los 3 logins y en el registro el formulario
// queda centrado en vertical y alineado con el bloque azul; el enlace "¿Ya tiene cuenta?" / "¿Aún no tiene cuenta?" queda
// junto al botón; y el formulario no se mueve al mostrar un error. No reemplaza a E03 ni a E04 (que siguen igual).
const FE = 'http://localhost:4200';
const RUTAS = ['/login-paciente', '/login-medico', '/login-admin', '/registro'];

for (const [ancho, alto] of [[1280, 800], [1920, 1080], [2560, 1440]]) {
  test(`el formulario queda centrado y alineado con el bloque azul a ${ancho}x${alto}`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    for (const ruta of RUTAS) {
      await page.goto(FE + ruta);
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      const medir = () =>
        page.evaluate(() => {
          const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
          const arriba = (document.querySelector('.auth-roles') ? r('.auth-roles') : r('h1')).top;
          const abajo = r('button[type="submit"]').bottom;
          const azul = [...document.querySelectorAll('.auth-brand__top, .auth-brand__body')].map((e) => e.getBoundingClientRect());
          const azulC = (Math.min(...azul.map((b) => b.top)) + Math.max(...azul.map((b) => b.bottom))) / 2;
          const enlace = document.querySelector('.auth-footer');
          return { formC: (arriba + abajo) / 2, azulC, arriba, abajo, hueco: enlace ? enlace.getBoundingClientRect().top - abajo : null };
        });
      const antes = await medir();
      expect(Math.abs(antes.formC - antes.azulC), `centro del formulario frente al del bloque azul en ${ruta}`).toBeLessThanOrEqual(2);
      expect(Math.abs(antes.formC - alto / 2), `centro del formulario frente al de la ventana en ${ruta}`).toBeLessThanOrEqual(2);
      if (antes.hueco !== null) expect(antes.hueco, `el enlace queda junto al botón en ${ruta}`).toBeLessThanOrEqual(32);

      await page.click('button[type="submit"]');
      await expect(page.locator('.error-message')).toBeVisible();
      const despues = await medir();
      expect(despues.arriba, `el formulario no sube ni baja con el error en ${ruta}`).toBe(antes.arriba);
      expect(despues.abajo, `el botón no se mueve con el error en ${ruta}`).toBe(antes.abajo);
    }
  });
}

test('en celular el aviso de error queda junto al botón, antes del enlace, y se ve en pantalla', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(`${FE}/login-paciente`);
  await page.click('button[type="submit"]');
  const m = await page.evaluate(() => {
    const boton = document.querySelector('button[type="submit"]')!.getBoundingClientRect();
    const aviso = document.querySelector('.error-message')!.getBoundingClientRect();
    const enlace = document.querySelector('.auth-footer')!.getBoundingClientRect();
    return { avisoTrasBoton: aviso.top - boton.bottom, avisoAntesDelEnlace: enlace.top >= aviso.bottom, abajo: aviso.bottom, alto: window.innerHeight };
  });
  expect(m.avisoTrasBoton).toBeLessThanOrEqual(24);
  expect(m.avisoAntesDelEnlace).toBeTruthy();
  expect(m.abajo).toBeLessThanOrEqual(m.alto);
});
