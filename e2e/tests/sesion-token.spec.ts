import { test, expect, Page } from '@playwright/test';

// E02 (RFC-011, tarea 26): sesión con token en el navegador.
//  - el login guarda el token y cerrar sesión lo borra;
//  - cambiar userId en localStorage no da acceso a datos de otro paciente (AUD-PRI-02): el servidor usa el token;
//  - un token inválido hace que la API responda 401 y la app vuelva a la selección de login con un aviso;
//  - sin sesión, la guarda de ruta no deja abrir las pantallas del administrador (AUD-PRI-05).
const API = 'http://localhost:8080';
const FE = 'http://localhost:4200';

async function loginPaciente(page: Page) {
  await page.goto(`${FE}/login-paciente`);
  await page.fill('input[name="dni"]', '12345678');
  await page.fill('input[name="clave"]', '123456');
  await page.click('button:has-text("Iniciar Sesión")');
  await expect(page).toHaveURL(/\/welcome/);
}

test('el login guarda el token y cerrar sesión lo borra', async ({ page }) => {
  await loginPaciente(page);
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBeTruthy();
  expect(token!.split('.').length).toBe(3);

  await page.locator('text=Cerrar Sesión').first().evaluate((e: HTMLElement) => e.click());
  await expect(page).toHaveURL(/\/login-selection/);
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
});

test('cambiar userId en localStorage no muestra la historia de otro paciente', async ({ page }) => {
  await loginPaciente(page);
  const idPropio = Number(await page.evaluate(() => localStorage.getItem('userId')));
  await page.evaluate(() => localStorage.setItem('userId', '4'));

  const respuesta = page.waitForResponse((r) => r.url() === `${API}/api/historia_clinica`);
  await page.goto(`${FE}/paciente/historial-medico`);
  const historias = await (await respuesta).json();
  // El servidor responde con lo del dueño del token, no con lo del userId editado
  expect(historias.length).toBeGreaterThan(0);
  for (const h of historias) expect(h.id_paciente).toBe(idPropio);
  await expect(page.locator('body')).not.toContainText('VIH');
});

test('con un token inválido la API responde 401 y la app vuelve al login con un aviso', async ({ page }) => {
  await loginPaciente(page);
  await page.evaluate(() => localStorage.setItem('token', 'token.manipulado.invalido'));

  const respuesta = page.waitForResponse((r) => r.url() === `${API}/api/cita`);
  await page.goto(`${FE}/paciente/mis-citas`);
  expect((await respuesta).status()).toBe(401);
  await expect(page).toHaveURL(/\/login-selection\?sesion=expirada/);
  await expect(page.locator('.aviso-sesion')).toContainText('Su sesión expiró o no es válida');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('sin sesión, la guarda no abre las pantallas del administrador ni pide sus datos', async ({ page }) => {
  const pedidos: string[] = [];
  page.on('request', (r) => { if (r.url().startsWith(API)) pedidos.push(r.url()); });
  await page.goto(`${FE}/admin/pacientes`);
  await expect(page).toHaveURL(/\/login-admin/);
  expect(pedidos.filter((u) => u.includes('/api/paciente'))).toEqual([]);
});
