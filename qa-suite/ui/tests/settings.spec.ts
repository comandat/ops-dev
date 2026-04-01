import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.API_URL || 'http://localhost:3001';

test.describe('Settings & DataOps Verification', () => {
    // Generate valid credentials for isolation
    const uniqueEmail = `qa_tenant_settings_${Date.now()}@test.com`;
    const password = 'SuperSecretPassword123!';

    test('should register, login, and verify all tabs in Settings', async ({ page }) => {
        // 1. Register
        await page.goto(`${FRONTEND_URL}/register`);
        await page.fill('input[placeholder="Ex: Ion Popescu"]', 'Settings QA User');
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');

        // Verify successful registration and redirect to dashboard
        await expect(page).toHaveURL(`${FRONTEND_URL}/`);

        // 2. Explicitly login to ensure cookie is set cleanly in Playwright context
        await page.goto(`${FRONTEND_URL}/login`);
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${FRONTEND_URL}/`);

        // 3. Navigate to Settings
        await page.click('a[href="/settings"]');
        await expect(page).toHaveURL(`${FRONTEND_URL}/settings`);

        // 4. Verify Integrations Tab (default active)
        await expect(page.locator('text="Integrare API"').first()).toBeVisible();
        await expect(page.locator('h1')).toContainText('Integrari & Plugins');

        // 5. Verify Data Ops Tab
        await page.click('button:has-text("Data Ops (Import/Export)")');
        await expect(page.locator('h1')).toContainText('Data Ops');
        await expect(page.locator('text="Export Date"').first()).toBeVisible();
        await expect(page.locator('text="Export Produse"').first()).toBeVisible();
        await expect(page.locator('text="Export Comenzi"').first()).toBeVisible();
        await expect(page.locator('text="Import Produse"').first()).toBeVisible();

        // 6. Verify Activity Log Tab
        await page.click('button:has-text("Activity Log")');
        await expect(page.locator('h1')).toContainText('Activity Log');
        await expect(page.locator('text="Acțiune"').first()).toBeVisible();
        await expect(page.locator('text="Timp"').first()).toBeVisible();
        await expect(page.locator('text="Sursă"').first()).toBeVisible();
    });
});
