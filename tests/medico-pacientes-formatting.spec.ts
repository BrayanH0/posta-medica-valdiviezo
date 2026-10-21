import { test, expect } from '@playwright/test';

test('Medico Dashboard - Pacientes View Formatting', async ({ page }) => {
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

  // 4. Verify Date Format (10/05/1990)
  // Juan Perez born 1990-05-10
  await expect(page.locator('td:has-text("10/05/1990")')).toBeVisible();

  // 5. Verify Sex Format (Masculino/Femenino)
  // Juan is M -> Masculino
  await expect(page.locator('tr:has-text("Juan") >> td:has-text("Masculino")')).toBeVisible();
  // Maria is F -> Femenino
  await expect(page.locator('tr:has-text("Maria") >> td:has-text("Femenino")')).toBeVisible();

  // 6. Verify Ubigeo Format (String)
  await expect(page.locator('td:has-text("Lima - San Juan de Lurigancho")')).toBeVisible();
  await expect(page.locator('td:has-text("Cusco - Cusco")')).toBeVisible();
});
