import { test, expect } from '@playwright/test';

/**
 * UI AUTOMATION - SPRINT 2: Catalog & Inventory
 * Verifies navigation to the product list and basic filtering/search functionality.
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Catalog UI Management', () => {

    test.beforeEach(async ({ page }) => {
        // login
        await page.goto(`${FRONTEND_URL}/login`);
        await page.getByPlaceholder('nume@exemplu.com').fill('catalog_qa@qa.local');
        await page.getByPlaceholder('••••••••').fill('ValidPassword123!');
        await page.getByRole('button', { name: 'Autentificare' }).click();
        await expect(page).toHaveURL(`${FRONTEND_URL}/`);
    });

    test('should display the product list correctly', async ({ page }) => {
        await page.goto(`${FRONTEND_URL}/products`);

        // Verify header title
        await expect(page.locator('h2')).toContainText('Produse & Stoc');

        // Verify presence of specific headers
        await expect(page.getByRole('columnheader', { name: 'SKU' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Produs' })).toBeVisible();
    });

    test('should narrow down results when searching', async ({ page }) => {
        await page.goto(`${FRONTEND_URL}/products`);

        const searchInput = page.getByPlaceholder('Caută produse, SKU...');
        await searchInput.fill('NON_EXISTENT_SKU_PATTERN');

        // The UI should show "Niciun rezultat pentru filtrele selectate."
        await expect(page.locator('text=Niciun rezultat pentru filtrele selectate.')).toBeVisible();
    });

    test('should handle stock filters', async ({ page }) => {
        await page.goto(`${FRONTEND_URL}/products`);

        // Click on "Fără stoc" filter
        await page.getByRole('button', { name: 'Fără stoc' }).click();

        // Check if the filter button looks active (based on class indigo-50)
        await expect(page.getByRole('button', { name: 'Fără stoc' })).toHaveClass(/bg-indigo-50/);
    });
});
