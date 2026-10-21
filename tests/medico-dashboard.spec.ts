import { test, expect } from '@playwright/test';

test('Medico Dashboard Flow', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

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

  // 1. Go directly to Login Medico (bypass selection for reliability)
  await page.goto('http://localhost:4200/login-medico');

  // 3. Fill Login Form
  await page.fill('input[name="dni"]', '87654321');
  await page.fill('input[name="clave"]', 'password123');
  await page.click('button:has-text("Iniciar Sesión")');

  // 4. Verify Redirection to Dashboard
  await expect(page).toHaveURL(/\/medico-dashboard/);
  await expect(page.locator('h2:has-text("Panel Médico")')).toBeVisible();

  // Take screenshot for user verification
  await page.screenshot({ path: 'medico_dashboard_preview.png', fullPage: true });

  // 5. Verify Sidebar Links
  const links = [
    'Inicio',
    'Pacientes',
    'Citas Pendientes',
    'Citas Aprobadas',
    'Citas Canceladas'
  ];
  for (const link of links) {
    await expect(page.locator(`.sidebar-nav >> text=${link}`)).toBeVisible();
  }

  // 6. Verify Logout Button
  const logoutBtn = page.locator('button.logout-btn');
  await expect(logoutBtn).toBeVisible();
  await expect(logoutBtn).toHaveText('Cerrar Sesión');

  // 7. Test Logout
  await logoutBtn.click();
  await expect(page).toHaveURL(/\/login-selection/);
});
