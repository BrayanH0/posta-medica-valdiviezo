import { test, expect } from '@playwright/test';

// E09 (RFC-019, Parte 2, ajuste pedido por el usuario): en Registrar cita el círculo numerado de cada paso va a la
// izquierda de su label, en la misma fila, centrado en vertical con el texto, a 10 px, y no se encoge si el label
// ocupa dos líneas. Se mide a 360 y 768 px. Necesita backend (8080) y frontend (4200) y el paciente de e2e/tests/sesion-token.spec.ts.
const FE = 'http://localhost:4200';

for (const [ancho, alto] of [[360, 740], [768, 1024]]) {
  test(`el círculo de cada paso queda a la izquierda de su label, centrado y a 10 px a ${ancho} px`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    await page.goto(`${FE}/login-paciente`);
    await page.fill('input[name="dni"]', '12345678');
    await page.fill('input[name="clave"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/welcome/);
    await page.goto(`${FE}/paciente/registrar-cita`);
    await expect(page.locator('.rc-step__head')).toHaveCount(5);

    const pasos = await page.evaluate(() =>
      [...document.querySelectorAll('.rc-step__head')].map((h) => {
        const n = h.querySelector('.rc-step__num')!.getBoundingClientRect();
        const l = h.querySelector('.ui-label')!.getBoundingClientRect();
        return { aLaIzquierda: n.right <= l.left, separacion: Math.round(l.left - n.right), difCentro: Math.abs(n.top + n.height / 2 - (l.top + l.height / 2)), ancho: Math.round(n.width), alto: Math.round(n.height) };
      })
    );
    for (const [i, p] of pasos.entries()) {
      expect(p.aLaIzquierda, `paso ${i + 1}: el círculo está a la izquierda del label`).toBeTruthy();
      expect(p.separacion, `paso ${i + 1}: separación`).toBe(10);
      expect(p.difCentro, `paso ${i + 1}: centrado en vertical con el texto`).toBeLessThanOrEqual(1);
      expect([p.ancho, p.alto], `paso ${i + 1}: tamaño del círculo`).toEqual([32, 32]);
    }

    // Con un label de dos líneas el círculo no se encoge y sigue centrado con el texto
    const largo = await page.evaluate(() => {
      const h = document.querySelector('.rc-step__head')!;
      const l = h.querySelector('.ui-label')!;
      l.textContent = 'Seleccione la especialidad médica que necesita para su consulta de este control general programado';
      const n = h.querySelector('.rc-step__num')!.getBoundingClientRect();
      const lb = l.getBoundingClientRect();
      return { ancho: Math.round(n.width), alto: Math.round(n.height), lineas: lb.height > 30, difCentro: Math.abs(n.top + n.height / 2 - (lb.top + lb.height / 2)) };
    });
    expect(largo.lineas, 'el label ocupa más de una línea').toBeTruthy();
    expect([largo.ancho, largo.alto]).toEqual([32, 32]);
    expect(largo.difCentro).toBeLessThanOrEqual(1);
  });
}
