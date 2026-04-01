import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('EasySales Migration Flow', () => {
    test('should register and complete migration', async ({ page }) => {
        // We will mock the backend route to prevent polluting the DB during the UI test.
        await page.route('**/*/api/auth/register', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, user: { id: 1, name: 'Test' } }) // some backends expect a body
            });
        });

        await page.route('**/*/api/import/easysales', async (route) => {
            // Add a small delay to see the loading state
            await new Promise(r => setTimeout(r, 1000));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, productsProcessed: 10, offersProcessed: 10 })
            });
        });

        // 1. Go to Register Page
        await page.goto('http://localhost:3000/register');

        // 2. Fill in registration details
        await page.fill('input[id="name"]', 'Test Company SRL');
        await page.fill('input[id="email"]', 'test@company.ro');
        await page.fill('input[id="password"]', 'SecurePass123!');

        // 3. Submit
        await page.click('button[type="submit"]');

        // 4. Modal should appear (increase timeout for React state/animation)
        await page.waitForSelector('text=Cum dorești să începi setup-ul contului tău OpenSales?', { state: 'visible', timeout: 10000 });
        await expect(page.locator('text=Cum dorești să începi setup-ul contului tău OpenSales?')).toBeVisible();

        // 5. Select Import EasySales
        await page.click('text=Import din EasySales (Recomandat)');

        // 6. Verify Dropzones are visible
        await expect(page.locator('text=1. Fișier Export Produse (Obligatoriu)')).toBeVisible();

        // 7. Upload Mocks
        const rootDir = process.cwd();
        const baseDir = path.resolve(rootDir, '../../'); // Resolve to OpenSales root
        const productsFile = path.resolve(baseDir, '130382-products-vs-export.xlsx');
        const emagFile = path.resolve(baseDir, '130386-offers-export.xlsx');
        const trendyolRoFile = path.resolve(baseDir, '130392-offers-export.xlsx');

        // Use setInputFiles on the correct input elements
        // The first input is for products, the second is for offers (multiple)
        const inputs = await page.locator('input[type="file"]').all();

        // Set Products (Input 0)
        await inputs[0].setInputFiles(productsFile);
        await expect(page.locator('text=130382-products-vs-export.xlsx')).toBeVisible();

        // Set Offers (Input 1)
        await inputs[1].setInputFiles([emagFile, trendyolRoFile]);
        await expect(page.locator('text=130386-offers-export.xlsx')).toBeVisible();
        await expect(page.locator('text=130392-offers-export.xlsx')).toBeVisible();

        // 8. Submit Migration
        await page.click('button:has-text("Finalizare și Migrare")');

        // 9. Should see loading state temporarily
        await expect(page.locator('text=Se procesează migrarea...')).toBeVisible();

        // 10. Should disappear after mock response and navigate to Dashboard
        await expect(page.locator('text=Cum dorești să începi setup-ul contului tău OpenSales?')).toBeHidden();

        // Wait for page to reach / (Dashboard)
        await expect(page).toHaveURL(/.*dashboard/); // Since it redirects to '/' but layout likely mounts Dashboard/Home
    });
});
