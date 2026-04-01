import { test, expect } from '@playwright/test';

/**
 * UI AUTOMATION - SPRINT 1: Identity & Access Management
 * Verifies the end-to-end browser flow for user registration and login.
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Authentication Flow', () => {
    const timestamp = Date.now();
    const testUser = {
        name: `QA User ${timestamp}`,
        email: `ui-test-${timestamp}@qa.local`,
        password: 'ValidPassword123!'
    };

    test('should register a new user successfully', async ({ page }) => {
        await page.goto(`${FRONTEND_URL}/register`);

        // Fill registration form
        await page.getByPlaceholder('Ex: Ion Popescu').fill(testUser.name);
        await page.getByPlaceholder('nume@exemplu.com').fill(testUser.email);
        await page.getByPlaceholder('••••••••').fill(testUser.password);

        // Click submit
        await page.getByRole('button', { name: 'Creează Cont' }).click();

        // Should redirect to dashboard (home page)
        await expect(page).toHaveURL(`${FRONTEND_URL}/`);

        // Optional: look for some element that confirms we are logged in
        // e.g., a logout button or user name if it exists on the home page
    });

    test('should login with existing credentials', async ({ page }) => {
        await page.goto(`${FRONTEND_URL}/login`);

        // Fill login form
        await page.getByPlaceholder('nume@exemplu.com').fill(testUser.email);
        await page.getByPlaceholder('••••••••').fill(testUser.password);

        // Click submit
        await page.getByRole('button', { name: 'Autentificare' }).click();

        // Should redirect to dashboard
        await expect(page).toHaveURL(`${FRONTEND_URL}/`);
    });

    test('should show error on invalid login', async ({ page }) => {
        await page.goto(`${FRONTEND_URL}/login`);

        await page.getByPlaceholder('nume@exemplu.com').fill('invalid@nonexistent.com');
        await page.getByPlaceholder('••••••••').fill('WrongPassword123!');
        await page.getByRole('button', { name: 'Autentificare' }).click();

        // Should stay on login and show error message
        await expect(page).toHaveURL(`${FRONTEND_URL}/login`);
        const errorMsg = page.locator('text=Email sau parolă incorectă');
        await expect(errorMsg).toBeVisible();
    });
});
