import { test, expect } from '@playwright/test';

// RFC-003: login real del médico (sin simular el backend) y menú con estados reales
test('Medico Dashboard Flow', async ({ page }) => {
  // 1. Login real por formulario con el médico 1 de la base
  await page.goto('http://localhost:4200/login-medico');
  await page.fill('input[name="dni"]', '10000001');
  await page.fill('input[name="clave"]', '123456');
  await page.click('button:has-text("Iniciar Sesión")');

  // 2. Verify Redirection to Dashboard
  await expect(page).toHaveURL(/\/medico-dashboard/);
  await expect(page.locator('h2:has-text("Panel Médico")')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('userType'))).toBe('medico');

  // 3. Verify Sidebar Links (estado real "Confirmada", no "Aprobada")
  const links = [
    'Inicio',
    'Pacientes',
    'Citas Pendientes',
    'Citas Confirmadas',
    'Citas Canceladas'
  ];
  for (const link of links) {
    await expect(page.locator(`.sidebar-nav >> text=${link}`)).toBeVisible();
  }
  await expect(page.locator('.sidebar-nav >> text=Citas Aprobadas')).toHaveCount(0);

  // 4. Verify Logout Button
  const logoutBtn = page.locator('button.logout-btn');
  await expect(logoutBtn).toBeVisible();
  await expect(logoutBtn).toHaveText('Cerrar Sesión');

  // 5. Test Logout: vuelve a la selección y borra la sesión
  await logoutBtn.click();
  await expect(page).toHaveURL(/\/login-selection/);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
