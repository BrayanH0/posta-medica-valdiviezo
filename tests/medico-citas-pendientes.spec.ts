import { test, expect, APIRequestContext } from '@playwright/test';

// RFC-003: las citas pendientes salen de la base y aceptar/cancelar se guardan en ella.
// La prueba crea sus propias citas pendientes por la API y las borra al terminar.
const API = 'http://localhost:8080';
const ID_MEDICO = 1;
const ID_PACIENTE = 1;
const creadas: number[] = [];

async function idEstado(request: APIRequestContext, nombre: string): Promise<number> {
  const estados = await (await request.get(`${API}/api/estado_cita`)).json();
  return estados.find((e: any) => e.nombre_estado === nombre).id_estado_cita;
}

async function crearCitaPendiente(request: APIRequestContext, motivo: string, hora: string): Promise<number> {
  const resp = await request.post(`${API}/api/cita`, {
    data: {
      id_paciente: ID_PACIENTE,
      id_medico: ID_MEDICO,
      fecha_cita: '2099-12-31',
      hora_cita: hora,
      motivo,
      estado_cita: await idEstado(request, 'Pendiente')
    }
  });
  const cita = await resp.json();
  creadas.push(cita.idCita);
  return cita.idCita;
}

test.afterAll(async ({ request }) => {
  for (const id of creadas) await request.delete(`${API}/api/cita/${id}`);
});

test('Medico Dashboard - Citas Pendientes Flow', async ({ page, request }) => {
  const sufijo = Date.now();
  const motivoAceptar = `Playwright aceptar ${sufijo}`;
  const motivoCancelar = `Playwright cancelar ${sufijo}`;
  const idAceptar = await crearCitaPendiente(request, motivoAceptar, '08:00:00');
  const idCancelar = await crearCitaPendiente(request, motivoCancelar, '08:20:00');

  // 1. Login real del médico 1
  await page.goto('http://localhost:4200/login-medico');
  await page.fill('input[name="dni"]', '10000001');
  await page.fill('input[name="clave"]', '123456');
  await page.click('button:has-text("Iniciar Sesión")');
  await expect(page).toHaveURL(/\/medico-dashboard/);

  // 2. Navigate to Citas Pendientes
  await page.click('a:has-text("Citas Pendientes")');
  await expect(page).toHaveURL(/\/medico-dashboard\/citas-pendientes/);

  // 3. Verify Table Headers
  await expect(page.locator('th:has-text("Paciente")')).toBeVisible();
  await expect(page.locator('th:has-text("Motivo")')).toBeVisible();

  // 4. La tabla muestra exactamente las citas pendientes del médico que devuelve el servidor
  const pendientes = await (await request.get(`${API}/api/citas/medico/${ID_MEDICO}?estado=Pendiente`)).json();
  await expect(page.locator('tbody tr:has(button.btn-accept)')).toHaveCount(pendientes.length);
  const fila = page.locator(`tr:has-text("${motivoAceptar}")`);
  await expect(fila).toContainText('Juan Perez Gomez');
  await expect(fila).toContainText('12345678');

  // 5. Test "Aceptar" Action
  await fila.locator('button.btn-accept').click();
  await expect(page.locator('.modal-header.header-accept')).toBeVisible();
  await expect(page.locator('h3:has-text("Aceptar Cita")')).toBeVisible();
  await expect(page.locator('.cita-summary')).toContainText('Juan Perez Gomez');
  await page.click('button.btn-confirm-accept');
  await expect(page.locator('.modal-content')).not.toBeVisible();
  await expect(page.locator(`td:has-text("${motivoAceptar}")`)).not.toBeVisible();

  // Se guardó en la base como "Confirmada"
  const aceptada = await (await request.get(`${API}/api/cita/${idAceptar}`)).json();
  expect(aceptada.estado_cita).toBe(await idEstado(request, 'Confirmada'));

  // 6. Test "Cancelar" Action
  const filaCancelar = page.locator(`tr:has-text("${motivoCancelar}")`);
  await expect(filaCancelar).toBeVisible();
  await filaCancelar.locator('button.btn-cancel').click();
  await expect(page.locator('.modal-header.header-cancel')).toBeVisible();
  await expect(page.locator('h3:has-text("Cancelar Cita")')).toBeVisible();
  await page.click('button.btn-confirm-cancel');
  await expect(page.locator(`td:has-text("${motivoCancelar}")`)).not.toBeVisible();

  // Se guardó en la base como "Cancelada"
  const cancelada = await (await request.get(`${API}/api/cita/${idCancelar}`)).json();
  expect(cancelada.estado_cita).toBe(await idEstado(request, 'Cancelada'));
});
