import { test, expect } from '@playwright/test';

test('Medico Dashboard - Citas Pendientes Flow', async ({ page }) => {
  // Mock Backend Login Response
  await page.route('http://localhost:8080/login', async route => {
      const json = {
          success: true,
          tipo: 'medico',
          id: 123,
          nombres: 'Doctor',
          apellidos: 'Prueba'
      };
      await route.fulfill({ json });
  });

  // 1. Login
  await page.goto('http://localhost:4200/login-medico');
  await page.fill('input[name="dni"]', '87654321');
  await page.fill('input[name="clave"]', 'password123');
  await page.click('button:has-text("Iniciar Sesión")');

  // 2. Navigate to Citas Pendientes
  await page.click('a:has-text("Citas Pendientes")');
  await expect(page).toHaveURL(/\/medico-dashboard\/citas-pendientes/);

  // 3. Verify Table Headers
  await expect(page.locator('th:has-text("Paciente")')).toBeVisible();
  await expect(page.locator('th:has-text("Motivo")')).toBeVisible();

  // 4. Verify Mock Data (Maria Lopez Quispe)
  await expect(page.locator('td:has-text("Maria Lopez Quispe")')).toBeVisible();
  await expect(page.locator('td:has-text("Dolor de cabeza persistente")')).toBeVisible();

  // 5. Test "Aceptar" Action
  // Click Accept for the first row
  await page.click('tr:has-text("Maria Lopez Quispe") >> button.btn-accept');

  // Verify Modal appears with "Aceptar Cita" header
  await expect(page.locator('.modal-header.header-accept')).toBeVisible();
  await expect(page.locator('h3:has-text("Aceptar Cita")')).toBeVisible();
  await expect(page.locator('p:has-text("Maria Lopez Quispe")')).toBeVisible();

  // Confirm Acceptance
  await page.click('button.btn-confirm-accept');

  // Verify Modal Closed
  await expect(page.locator('.modal-content')).not.toBeVisible();

  // Verify Item Removed from Table
  await expect(page.locator('td:has-text("Maria Lopez Quispe")')).not.toBeVisible();

  // 6. Test "Cancelar" Action on next item (Luis Torres Paz)
  await expect(page.locator('td:has-text("Luis Torres Paz")')).toBeVisible();
  await page.click('tr:has-text("Luis Torres Paz") >> button.btn-cancel');

  // Verify Modal appears with "Cancelar Cita" header
  await expect(page.locator('.modal-header.header-cancel')).toBeVisible();
  await expect(page.locator('h3:has-text("Cancelar Cita")')).toBeVisible();

  // Confirm Cancellation
  await page.click('button.btn-confirm-cancel');

  // Verify Item Removed
  await expect(page.locator('td:has-text("Luis Torres Paz")')).not.toBeVisible();
});
