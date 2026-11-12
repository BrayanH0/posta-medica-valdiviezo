import { test, expect, Page, Browser } from '@playwright/test';
import { conToken } from './token';

// RFC-012 (tarea 24B): dos pestañas del paciente eligen el mismo horario.
// La segunda recibe el 409 y ve el mensaje; la lista de horas se actualiza. Al cancelar la cita, el horario vuelve.
// Usa una fecha propia (2099-12-29, martes) y borra sus citas al empezar y al terminar.
const API = 'http://localhost:8080';
const FE = 'http://localhost:4200';
const FECHA = '2099-12-29';
const HORA = '08:40';
const PREFIJO = 'Playwright RFC-012';

async function borrarCitasDePrueba(request: any) {
  const citas = await (await request.get(`${API}/api/citas/medico/1/fecha/${FECHA}`, { headers: await conToken(request, 'medico') })).json();
  for (const c of citas) if (String(c.motivo).startsWith(PREFIJO)) await request.delete(`${API}/api/cita/${c.idCita}`, { headers: await conToken(request, 'admin') });
}

async function pestanaPaciente(browser: Browser): Promise<{ page: Page; dialogos: string[] }> {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const dialogos: string[] = [];
  page.on('dialog', (d) => { dialogos.push(d.message()); d.accept(); });
  await page.goto(`${FE}/login-paciente`);
  await page.fill('#dni', '12345678');
  await page.fill('#clave', '123456');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(/\/welcome/);
  return { page, dialogos };
}

// Llena el formulario hasta que aparecen las horas; devuelve las horas ofrecidas
async function prepararCita(page: Page, motivo: string): Promise<string[]> {
  await page.bringToFront();
  await page.goto(`${FE}/paciente/registrar-cita`);
  await page.waitForSelector('select[name=especialidad] option', { state: 'attached' });
  const esp = await page.$eval('select[name=especialidad]', (s: any) => [...s.options].find((o: any) => o.text.includes('Medicina General')).value);
  await page.selectOption('select[name=especialidad]', esp);
  await page.waitForFunction(() => document.querySelectorAll('select[name=medico] option').length > 0);
  const med = await page.$eval('select[name=medico]', (s: any) => [...s.options].find((o: any) => o.text.includes('Jorge Santos Ruiz')).value);
  await page.selectOption('select[name=medico]', med);
  await page.fill('input[name=fecha]', FECHA);
  await page.$eval('input[name=fecha]', (e) => e.dispatchEvent(new Event('change')));
  await page.waitForSelector('button.rounded-pill');
  await page.fill('textarea[name=motivo]', motivo);
  return horas(page);
}

const horas = (page: Page) => page.$$eval('button.rounded-pill', (bs) => bs.map((b) => (b.textContent || '').trim()));

async function confirmar(page: Page, hora: string) {
  await page.bringToFront();
  await page.$$eval('button.rounded-pill', (bs, h) => (bs.find((b) => (b.textContent || '').trim() === h) as HTMLElement).click(), hora);
  const respuesta = page.waitForResponse((r) => r.url() === `${API}/api/cita` && r.request().method() === 'POST');
  await page.$eval('button[type=submit]', (b: any) => b.click());
  return respuesta;
}

test.beforeAll(async ({ request }) => borrarCitasDePrueba(request));
test.afterAll(async ({ request }) => borrarCitasDePrueba(request));

test('RFC-012: la segunda pestaña recibe 409 con mensaje, y cancelar libera el horario', async ({ browser, request }) => {
  const sufijo = Date.now();
  // Las dos pestañas cargan la lista antes de que nadie reserve
  const A = await pestanaPaciente(browser);
  const B = await pestanaPaciente(browser);
  expect(await prepararCita(A.page, `${PREFIJO} A ${sufijo}`)).toContain(HORA);
  expect(await prepararCita(B.page, `${PREFIJO} B ${sufijo}`)).toContain(HORA);

  // A reserva
  const rA = await confirmar(A.page, HORA);
  expect(rA.status()).toBe(200);
  const idCita = (await rA.json()).idCita;
  await expect.poll(() => A.dialogos).toContain('Cita registrada con éxito');

  // B, con la lista vieja, intenta el mismo horario
  const rB = await confirmar(B.page, HORA);
  expect(rB.status()).toBe(409);
  await expect.poll(() => B.dialogos).toContain('Ese horario ya fue reservado. Elija otra hora.');
  await expect(B.page).toHaveURL(/\/paciente\/registrar-cita/);
  await expect.poll(() => horas(B.page)).not.toContain(HORA);
  expect((await horas(B.page)).length).toBeGreaterThan(0);

  // En la BD hay una sola cita en ese horario
  const delDia = await (await request.get(`${API}/api/citas/medico/1/fecha/${FECHA}`, { headers: await conToken(request, 'medico') })).json();
  expect(delDia.filter((c: any) => c.hora_cita.startsWith(HORA)).length).toBe(1);

  // El médico cancela la cita de A: el horario vuelve a ofrecerse
  const cancelar = await request.put(`${API}/api/citas/medico/1/${idCita}/estado`, { headers: await conToken(request, 'medico'), data: { estado: 'Cancelada' } });
  expect(cancelar.status()).toBe(200);
  const C = await pestanaPaciente(browser);
  expect(await prepararCita(C.page, `${PREFIJO} C ${sufijo}`)).toContain(HORA);
  const rC = await confirmar(C.page, HORA);
  expect(rC.status()).toBe(200);
  await expect.poll(() => C.dialogos).toContain('Cita registrada con éxito');
});
