import { test, expect } from '@playwright/test';

test('Medico Dashboard - Full Flow: Pendiente -> Aprobada -> Cancelada', async ({ page }) => {
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

  // --- TEST ACCEPT FLOW ---

  // 2. Go to Citas Pendientes
  await page.click('a:has-text("Citas Pendientes")');
  await expect(page).toHaveURL(/\/medico-dashboard\/citas-pendientes/);

  // Check for "Maria Lopez Quispe"
  const mariaRow = page.locator('tr:has-text("Maria Lopez Quispe")');
  await expect(mariaRow).toBeVisible();

  // Accept "Maria Lopez Quispe"
  await mariaRow.locator('button.btn-accept').click();
  await page.click('button.btn-confirm-accept');

  // Verify removed from Pendientes
  await expect(page.locator('tr:has-text("Maria Lopez Quispe")')).not.toBeVisible();

  // 3. Go to Citas Aprobadas
  await page.click('a:has-text("Citas Aprobadas")');
  await expect(page).toHaveURL(/\/medico-dashboard\/citas-aprobadas/);

  // Verify "Maria Lopez Quispe" is here and status is "Aprobada"
  await expect(page.locator('tr:has-text("Maria Lopez Quispe")')).toBeVisible();
  await expect(page.locator('tr:has-text("Maria Lopez Quispe") >> span.badge-success')).toHaveText('Aprobada');

  // --- TEST CANCEL FLOW ---

  // 4. Go back to Citas Pendientes
  await page.click('a:has-text("Citas Pendientes")');

  // Check for "Luis Torres Paz"
  const luisRow = page.locator('tr:has-text("Luis Torres Paz")');
  await expect(luisRow).toBeVisible();

  // Cancel "Luis Torres Paz"
  await luisRow.locator('button.btn-cancel').click();
  await page.click('button.btn-confirm-cancel');

  // Verify removed from Pendientes
  await expect(page.locator('tr:has-text("Luis Torres Paz")')).not.toBeVisible();

  // 5. Go to Citas Canceladas
  await page.click('a:has-text("Citas Canceladas")');
  await expect(page).toHaveURL(/\/medico-dashboard\/citas-canceladas/);

  // Verify "Luis Torres Paz" is here and status is "Cancelada"
  await expect(page.locator('tr:has-text("Luis Torres Paz")')).toBeVisible();
  await expect(page.locator('tr:has-text("Luis Torres Paz") >> span.badge-danger')).toHaveText('Cancelada');

});
