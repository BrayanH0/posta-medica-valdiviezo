import { test, expect, Page } from '@playwright/test';

// E08 (RFC-019, Parte 2, ajuste pedido por el usuario): en celular el menú del paciente es un cajón que entra desde la
// izquierda sobre el contenido. Se prueba a 360 y 768 px, arriba y abajo de una página larga (Mis citas en una ventana baja):
//  - la barra superior con el botón "Menú" queda fija al hacer scroll;
//  - al abrir, el cajón es de posición fija, ocupa toda la altura de la ventana, hay un fondo oscuro y la página no se mueve;
//  - el foco va al cajón al abrir y vuelve al botón al cerrar;
//  - se cierra con la X ("Cerrar menú"), con el fondo oscuro, con Escape y al elegir una opción;
//  - mientras está abierto, la página de atrás no hace scroll y su contenido queda inerte;
//  - en escritorio el menú lateral sigue igual (sin barra superior ni X).
const FE = 'http://localhost:4200';

async function entrar(page: Page) {
  await page.goto(`${FE}/login-paciente`);
  await page.fill('input[name="dni"]', '12345678');
  await page.fill('input[name="clave"]', '123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/welcome/);
}

const botonMenu = (page: Page) => page.getByRole('button', { name: 'Menú', exact: true });
const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

// Ventanas bajas para que Mis citas (2 citas) sea una página larga también a 768 px, donde las tarjetas van en 2 columnas
for (const [ancho, alto] of [[360, 420], [768, 300]]) {
  for (const posicion of ['arriba', 'abajo']) {
    test(`cajón del menú a ${ancho} px con la página ${posicion}`, async ({ page }) => {
      await entrar(page);
      await page.setViewportSize({ width: ancho, height: alto });
      await page.goto(`${FE}/paciente/mis-citas`);
      await expect(page.locator('article.ui-card').first()).toBeVisible();
      if (posicion === 'abajo') {
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        expect(await scrollY(page), 'la página es lo bastante larga para desplazarse').toBeGreaterThan(30);
      }
      const antes = await scrollY(page);

      // Barra fija: queda pegada al borde superior aunque la página esté abajo
      expect(Math.round((await page.locator('.pl-topbar').boundingBox())!.y)).toBe(0);
      await expect(page.locator('#pl-cajon')).toBeHidden();

      // Abrir
      await botonMenu(page).click();
      await expect(botonMenu(page)).toHaveAttribute('aria-expanded', 'true');
      const cajon = page.locator('#pl-cajon');
      await expect(cajon).toBeVisible();
      await expect(page.locator('.pl-backdrop')).toBeVisible();
      await expect(cajon).toBeFocused();
      // Se espera a que termine la animación de entrada (0,25 s) antes de medir
      await expect.poll(async () => Math.round((await cajon.boundingBox())!.x), 'el cajón arranca en el borde izquierdo').toBe(0);
      const caja = (await cajon.boundingBox())!;
      expect(Math.round(caja.x), 'el cajón arranca en el borde izquierdo').toBe(0);
      expect(Math.round(caja.y), 'el cajón arranca arriba de la ventana').toBe(0);
      expect(Math.round(caja.height), 'el cajón ocupa toda la altura de la ventana').toBe(alto);
      expect(await cajon.evaluate((e) => getComputedStyle(e).position)).toBe('fixed');
      expect(await scrollY(page), 'abrir el menú no mueve la página').toBe(antes);

      // La página de atrás no hace scroll y su contenido queda inerte
      expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');
      await page.mouse.move(ancho - 5, alto / 2);
      await page.mouse.wheel(0, 300);
      expect(await scrollY(page), 'con el cajón abierto la página no hace scroll').toBe(antes);
      await expect(page.locator('main.pl-main')).toHaveAttribute('inert', '');

      // Cerrar con la X
      await page.locator('button.pl-close').click();
      await expect(cajon).toBeHidden();
      await expect(botonMenu(page)).toBeFocused();
      await expect(botonMenu(page)).toHaveAttribute('aria-expanded', 'false');
      expect(await scrollY(page), 'cerrar con la X no mueve la página').toBe(antes);
      expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');

      // Cerrar tocando el fondo oscuro (a la derecha del cajón)
      await botonMenu(page).click();
      await expect(cajon).toBeVisible();
      await page.mouse.click(ancho - 5, alto / 2);
      await expect(cajon).toBeHidden();
      await expect(botonMenu(page)).toBeFocused();
      expect(await scrollY(page), 'cerrar con el fondo no mueve la página').toBe(antes);

      // Cerrar con Escape
      await botonMenu(page).click();
      await expect(cajon).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(cajon).toBeHidden();
      await expect(botonMenu(page)).toBeFocused();
      expect(await scrollY(page), 'cerrar con Escape no mueve la página').toBe(antes);
    });
  }
}

test('al elegir una opción el cajón se cierra, se navega y el scroll queda libre', async ({ page }) => {
  await entrar(page);
  await page.setViewportSize({ width: 360, height: 420 });
  await page.goto(`${FE}/paciente/historial-medico`);
  await botonMenu(page).click();
  await expect(page.locator('#pl-cajon')).toBeVisible();
  await page.locator('nav.sidebar-nav').getByRole('link', { name: 'Mis citas' }).click();
  await expect(page).toHaveURL(/\/paciente\/mis-citas/);
  await expect(page.locator('#pl-cajon')).toBeHidden();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
});

test('en escritorio el menú lateral sigue igual: sin barra superior ni botón X y siempre visible', async ({ page }) => {
  await entrar(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${FE}/paciente/mis-citas`);
  await expect(page.locator('.pl-topbar')).toBeHidden();
  await expect(page.locator('button.pl-close')).toBeHidden();
  await expect(page.locator('.pl-backdrop')).toBeHidden();
  await expect(page.locator('nav.sidebar-nav')).toBeVisible();
  await expect(page.locator('button.logout-btn')).toBeVisible();
  const caja = (await page.locator('#pl-cajon').boundingBox())!;
  expect(Math.round(caja.width)).toBe(260);
  expect(await page.locator('#pl-cajon').evaluate((e) => getComputedStyle(e).position)).toBe('sticky');
});
