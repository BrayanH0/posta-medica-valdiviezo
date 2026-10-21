import { test, expect, APIRequestContext } from '@playwright/test';

// RFC-003: flujo Pendiente -> Confirmada y Pendiente -> Cancelada con datos reales.
// La prueba crea sus propias citas pendientes por la API y las borra al terminar.
const API = 'http://localhost:8080';
const ID_MEDICO = 1;
const ID_PACIENTE = 1;
const creadas: number[] = [];

async function crearCitaPendiente(request: APIRequestContext, motivo: string, hora: string): Promise<number> {
  const estados = await (await request.get(`${API}/api/estado_cita`)).json();
  const pendiente = estados.find((e: any) => e.nombre_estado === 'Pendiente').id_estado_cita;
  const resp = await request.post(`${API}/api/cita`, {
    data: { id_paciente: ID_PACIENTE, id_medico: ID_MEDICO, fecha_cita: '2099-12-31', hora_cita: hora, motivo, estado_cita: pendiente }
  });
  const cita = await resp.json();
  creadas.push(cita.idCita);
  return cita.idCita;
}

test.afterAll(async ({ request }) => {
  for (const id of creadas) await request.delete(`${API}/api/cita/${id}`);
});

test('Medico Dashboard - Full Flow: Pendiente -> Confirmada -> Cancelada', async ({ page, request }) => {
  const sufijo = Date.now();
  const motivoConfirmar = `Playwright flujo confirmar ${sufijo}`;
  const motivoCancelar = `Playwright flujo cancelar ${sufijo}`;
  await crearCitaPendiente(request, motivoConfirmar, '09:00:00');
  await crearCitaPendiente(request, motivoCancelar, '09:20:00');

  // 1. Login real del médico 1
  await page.goto('http://localhost:4200/login-medico');
  await page.fill('input[name="dni"]', '10000001');
  await page.fill('input[name="clave"]', '123456');
  await page.click('button:has-text("Iniciar Sesión")');
  await expect(page).toHaveURL(/\/medico-dashboard/);

  // --- TEST ACCEPT FLOW ---

  // 2. Go to Citas Pendientes
  await page.click('a:has-text("Citas Pendientes")');
  await expect(page).toHaveURL(/\/medico-dashboard\/citas-pendientes/);

  const filaConfirmar = page.locator(`tr:has-text("${motivoConfirmar}")`);
  await expect(filaConfirmar).toBeVisible();
  await filaConfirmar.locator('button.btn-accept').click();
  await page.click('button.btn-confirm-accept');

  // Verify removed from Pendientes
  await expect(page.locator(`tr:has-text("${motivoConfirmar}")`)).not.toBeVisible();

  // 3. Go to Citas Confirmadas: la cita está y su estado es "Confirmada"
  await page.click('a:has-text("Citas Confirmadas")');
  await expect(page).toHaveURL(/\/medico-dashboard\/citas-aprobadas/);
  await expect(page.locator(`tr:has-text("${motivoConfirmar}")`)).toBeVisible();
  await expect(page.locator(`tr:has-text("${motivoConfirmar}") >> span.badge-success`)).toHaveText('Confirmada');

  // Sigue confirmada después de recargar (está guardada en la base)
  await page.reload();
  await expect(page.locator(`tr:has-text("${motivoConfirmar}") >> span.badge-success`)).toHaveText('Confirmada');

  // --- TEST CANCEL FLOW ---

  // 4. Go back to Citas Pendientes
  await page.click('a:has-text("Citas Pendientes")');
  const filaCancelar = page.locator(`tr:has-text("${motivoCancelar}")`);
  await expect(filaCancelar).toBeVisible();
  await filaCancelar.locator('button.btn-cancel').click();
  await page.click('button.btn-confirm-cancel');

  // Verify removed from Pendientes
  await expect(page.locator(`tr:has-text("${motivoCancelar}")`)).not.toBeVisible();

  // 5. Go to Citas Canceladas: la cita está y su estado es "Cancelada"
  await page.click('a:has-text("Citas Canceladas")');
  await expect(page).toHaveURL(/\/medico-dashboard\/citas-canceladas/);
  await expect(page.locator(`tr:has-text("${motivoCancelar}")`)).toBeVisible();
  await expect(page.locator(`tr:has-text("${motivoCancelar}") >> span.badge-danger`)).toHaveText('Cancelada');

  // Sigue cancelada después de recargar (está guardada en la base)
  await page.reload();
  await expect(page.locator(`tr:has-text("${motivoCancelar}") >> span.badge-danger`)).toHaveText('Cancelada');
});
