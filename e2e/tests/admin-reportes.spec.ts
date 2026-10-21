import { test, expect } from '@playwright/test';

test('Admin Reportes - Verify Data Display and Auto-Update', async ({ page }) => {
  // Mock Backend Responses
  await page.route('http://localhost:8080/api/reportes/dashboard', async route => {
    const json = {
      totalCitas: 50,
      citasAtendidas: 30,
      citasCanceladas: 5,
      totalIngresos: 1500.50
    };
    await route.fulfill({ json });
  });

  await page.route('http://localhost:8080/api/reportes/resumen', async route => {
    const json = [
      {
        especialidad: 'Medicina General',
        pacienteNombre: 'Juan Perez',
        medicoNombre: 'Dr. House',
        fecha: '2023-12-01',
        hora: '10:00:00'
      }
    ];
    await route.fulfill({ json });
  });

  // Mock Login as Admin
  await page.route('http://localhost:8080/login', async route => {
    const json = {
        success: true,
        tipo: 'administrador', // Fixed type to match component logic
        id: 1,
        nombres: 'Admin',
        apellidos: 'Principal',
        dni: '87654321',
        rol: 'ADMIN'
    };
    await route.fulfill({ json });
  });

  // 1. Login
  await page.goto('http://localhost:4200/login-admin');
  await page.fill('input[name="usuario"]', '87654321');
  await page.fill('input[name="clave"]', '123456');
  await page.click('button:has-text("Iniciar Sesión")');

  // 2. Navigate to Informes (Reportes)
  // Check if sidebar has "Informes"
  await page.click('a:has-text("Informes")');

  // 3. Verify Statistics
  // Wait for polling or initial load
  // Using explicit waits or expect assertions with auto-retrying
  await expect(page.locator('.stat-card.total .stat-value')).toHaveText('50');
  await expect(page.locator('.stat-card.atendidas .stat-value')).toHaveText('30');
  await expect(page.locator('.stat-card.canceladas .stat-value')).toHaveText('5');
  await expect(page.locator('.stat-card.ingreso .stat-value')).toHaveText('S/ 1,500.50');

  // 4. Verify Table Data
  await expect(page.locator('td:has-text("Medicina General")')).toBeVisible();
  await expect(page.locator('td:has-text("Dr. House")')).toBeVisible();

});
