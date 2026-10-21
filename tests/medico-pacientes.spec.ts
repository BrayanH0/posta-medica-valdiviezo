import { test, expect } from '@playwright/test';

// RFC-003: la pantalla de pacientes muestra solo los pacientes del médico, con campos que existen en la base
const API = 'http://localhost:8080';
const ID_MEDICO = 1;

test('Medico Dashboard - Pacientes View', async ({ page, request }) => {
  const pacientes = await (await request.get(`${API}/api/citas/medico/${ID_MEDICO}/pacientes`)).json();
  expect(pacientes.length).toBeGreaterThan(0);

  // 1. Login real del médico 1
  await page.goto('http://localhost:4200/login-medico');
  await page.fill('input[name="dni"]', '10000001');
  await page.fill('input[name="clave"]', '123456');
  await page.click('button:has-text("Iniciar Sesión")');
  await expect(page).toHaveURL(/\/medico-dashboard/);

  // 2. Navigate to Pacientes
  await page.click('a:has-text("Pacientes")');
  await expect(page).toHaveURL(/\/medico-dashboard\/pacientes/);

  // 3. Verify Table Headers
  await expect(page.locator('th:has-text("Nombres")')).toBeVisible();
  await expect(page.locator('th:has-text("DNI")')).toBeVisible();
  await expect(page.locator('th:has-text("Acciones")')).toBeVisible();

  // 4. Exactamente los pacientes que devuelve el servidor para el médico
  await expect(page.locator('tbody tr:has(button.btn-resumen)')).toHaveCount(pacientes.length);
  for (const p of pacientes) {
    await expect(page.locator(`td:text-is("${p.dni}")`)).toBeVisible();
  }

  // 5. Test Modal "Resumen" con el primer paciente
  const primero = pacientes[0];
  await page.click(`tr:has(td:text-is("${primero.dni}")) >> button:has-text("Resumen")`);

  // 6. Verify Modal Content: datos reales y ningún campo que no exista en la base
  await expect(page.locator('.modal-content')).toBeVisible();
  await expect(page.locator('h3:has-text("Resumen del Paciente")')).toBeVisible();
  await expect(page.locator(`h2:has-text("${primero.nombres} ${primero.apellidos}")`)).toBeVisible();
  await expect(page.locator('.modal-body')).toContainText(`DNI: ${primero.dni}`);
  await expect(page.locator('.modal-body')).toContainText(primero.telefono);
  await expect(page.locator('.modal-body')).not.toContainText('Dirección');
  await expect(page.locator('.modal-body')).not.toContainText('Email');
  await expect(page.locator('.modal-body')).not.toContainText('Historial');

  // 7. Close Modal - Use specific selector to avoid matching "Cerrar Sesión"
  await page.click('button.btn-close-modal');

  // 8. Verify Modal Closed
  await expect(page.locator('.modal-content')).not.toBeVisible();
});
