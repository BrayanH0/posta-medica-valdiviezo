import { test, expect } from '@playwright/test';

// RFC-003: formato de la tabla de pacientes con los datos reales del médico 1
const API = 'http://localhost:8080';
const ID_MEDICO = 1;

function fechaDDMMYYYY(iso: string): string {
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
}

test('Medico Dashboard - Pacientes View Formatting', async ({ page, request }) => {
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

  // 3. Cada paciente del servidor aparece con fecha dd/MM/yyyy, sexo en palabras y ubigeo "departamento - distrito"
  await expect(page.locator('tbody tr:has(button.btn-resumen)')).toHaveCount(pacientes.length);
  for (const p of pacientes) {
    const fila = page.locator(`tr:has(td:text-is("${p.dni}"))`);
    await expect(fila).toContainText(fechaDDMMYYYY(p.fechaNacimiento));
    await expect(fila).toContainText(p.sexo === 'M' ? 'Masculino' : 'Femenino');
    await expect(fila).toContainText(`${p.departamento} - ${p.distrito}`);
    await expect(fila).toContainText(p.estadoPaciente);
  }
});
