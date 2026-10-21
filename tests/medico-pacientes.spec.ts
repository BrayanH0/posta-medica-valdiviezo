import { test, expect } from '@playwright/test';

test('Medico Dashboard - Pacientes View', async ({ page }) => {
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

  // 1. Go to Login Medico
  await page.goto('http://localhost:4200/login-medico');

  // 2. Login
  await page.fill('input[name="dni"]', '87654321');
  await page.fill('input[name="clave"]', 'password123');
  await page.click('button:has-text("Iniciar Sesión")');
  await expect(page).toHaveURL(/\/medico-dashboard/);

  // 3. Navigate to Pacientes
  await page.click('a:has-text("Pacientes")');
  await expect(page).toHaveURL(/\/medico-dashboard\/pacientes/);

  // 4. Verify Table Headers
  await expect(page.locator('th:has-text("Nombres")')).toBeVisible();
  await expect(page.locator('th:has-text("DNI")')).toBeVisible();
  await expect(page.locator('th:has-text("Acciones")')).toBeVisible();

  // 5. Verify Mock Data Presence (Juan Perez Gomez)
  await expect(page.locator('td:has-text("Juan")')).toBeVisible();
  await expect(page.locator('td:has-text("Perez Gomez")')).toBeVisible();

  // 6. Test Modal "Resumen"
  await page.click('tr:has-text("Juan") >> button:has-text("Resumen")');

  // 7. Verify Modal Content
  await expect(page.locator('.modal-content')).toBeVisible();
  await expect(page.locator('h3:has-text("Resumen del Paciente")')).toBeVisible();
  await expect(page.locator('h2:has-text("Juan Perez Gomez")')).toBeVisible();
  await expect(page.locator('p:has-text("Av. Siempre Viva 123")')).toBeVisible();
  await expect(page.locator('li:has-text("Cita General")')).toBeVisible();

  // Take screenshot of the modal for verification
  await page.screenshot({ path: 'medico_pacientes_modal.png' });

  // 8. Close Modal - Use specific selector to avoid matching "Cerrar Sesión"
  await page.click('button.btn-close-modal');

  // 9. Verify Modal Closed
  await expect(page.locator('.modal-content')).not.toBeVisible();
});
