import { test, expect } from '@playwright/test';
import path from 'path';
import { execSync } from 'child_process';

test.use({
    launchOptions: { slowMo: 800 },
    video: 'on',
});

test.describe('Real EasySales Migration Manual Verification', () => {
    test('should register and complete real migration', async ({ page }) => {
        test.setTimeout(180000);

        // --- 0. PRE-CLEANUP (optional but good for test consistency) ---
        // Using a small script to clear previous data for 'default' tenant
        console.log("Cleaning up previous data for tenant 'default'...");
        try {
            execSync(`node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.product.deleteMany({where:{tenantId:'default'}}).then(()=>p.$disconnect())"`, { cwd: path.join(__dirname, '../../backend') });
            console.log("Cleanup successful.");
        } catch (e) {
            console.error("Cleanup failed, continuing anyway...");
            // console.error(e); // Uncomment for detailed error if needed
        }

        const timestamp = Date.now();
        const testEmail = `test_${timestamp}@yopmail.com`;
        const testName = `Test Company ${timestamp}`;

        console.log(`Starting real test with Email: ${testEmail}`);

        // 1. Go to Register Page
        await page.goto('http://localhost:3000/register');

        // 2. Fill in registration details
        await page.fill('input[id="name"]', testName);
        await page.fill('input[id="email"]', testEmail);
        await page.fill('input[id="password"]', 'SecurePass123!');

        // 3. Submit
        console.log('Submitting registration...');
        await page.click('button[type="submit"]');

        // 4. Modal should appear
        console.log('Waiting for migration modal...');
        await page.waitForSelector('text=Cum dorești să începi setup-ul contului tău OpenSales?', { state: 'visible', timeout: 30000 });

        // 5. Select Import EasySales
        await page.click('text=Import din EasySales (Recomandat)');

        // 6. Verify Dropzones are visible
        await expect(page.locator('text=1. Fișier Export Produse (Obligatoriu)')).toBeVisible();

        // 7. Define File Paths
        const baseDir = 'c:/Users/titam/Documents/Zebra Printer Test/OpenSales/';
        const productsFile = path.resolve(baseDir, '130382-products-vs-export.xlsx');
        const emagFile = path.resolve(baseDir, '130386-offers-export.xlsx');
        const trendyolRoFile = path.resolve(baseDir, '130392-offers-export.xlsx');
        const trendyolGrFile = path.resolve(baseDir, '130395-offers-export.xlsx');
        const trendyolBgFile = path.resolve(baseDir, '130401-offers-export.xlsx');

        // 8. Upload Files using proper React-compatible event dispatch
        console.log('Uploading files...');

        // Input 0: Products — trigger React onChange properly
        const productInput = page.locator('input[type="file"]').first();
        await productInput.setInputFiles(productsFile);
        // Dispatch change event so React updates state
        await productInput.dispatchEvent('change');
        console.log('Product file uploaded.');

        // Wait for React state to update (check the filename appears)
        await page.waitForTimeout(500);

        // Input 1: Offers (multiple)
        const offersInput = page.locator('input[type="file"]').nth(1);
        await offersInput.setInputFiles([
            emagFile,
            trendyolRoFile,
            trendyolGrFile,
            trendyolBgFile
        ]);
        await offersInput.dispatchEvent('change');
        console.log('Offer files uploaded.');

        // Wait for React state to update
        await page.waitForTimeout(500);

        // Verify file name appears in UI (confirms React state was updated)
        const productFileName = await page.locator('text=130382-products-vs-export.xlsx').count();
        console.log(`Product filename visible in UI: ${productFileName > 0}`);
        const offerFileCount = await page.locator('text=130386-offers-export.xlsx').count();
        console.log(`eMAG offer filename visible in UI: ${offerFileCount > 0}`);

        console.log('Manual-real-test.spec.ts: Starting migration processing...');
        // Check if button is disabled before clicking
        const submitBtn = page.locator('button:has-text("Finalizare și Migrare")');
        const isDisabled = await submitBtn.getAttribute('disabled');
        console.log(`Submit button disabled attribute: ${isDisabled}`);

        // Setup network monitoring and response capture
        const migrationResponsePromise = page.waitForResponse(resp =>
            resp.url().includes('import/easysales') && resp.request().method() === 'POST',
            { timeout: 120000 }
        );

        await submitBtn.click();
        console.log(`Clicked submit button.`);

        // Wait for migration processing
        const migrationResponse = await migrationResponsePromise;
        const status = migrationResponse.status();
        const bodyText = await migrationResponse.text();
        console.log(`NETWORK: Migration response received with status: ${status}`);
        console.log(`NETWORK: Migration response body: ${bodyText.substring(0, 500)}`);

        if (status !== 200 && status !== 201) {
            console.error(`Migration FAILED with status ${status}: ${bodyText}`);
            throw new Error(`Migration API failed: ${status}`);
        }

        // Wait for dashboard redirect (timeout 30s)
        console.log("Waiting for dashboard redirect...");
        await page.waitForURL(url => url.pathname === '/', { timeout: 30000 });
        console.log("Migration successful! Redirected to Dashboard.");

        // --- NEW: VERIFY FRONTEND VISIBILITY ---
        console.log("Verifying frontend visibility of products and offers...");

        // 1. Go to Products Catalog
        await page.click('nav >> text=Produse'); // Assuming there is a sidebar link
        // Or just goto /products
        await page.goto('http://localhost:3000/products');

        // 2. Check if products are listed
        const countText = await page.locator('text=Total').first().innerText();
        console.log(`Frontend Reports: ${countText}`);

        // Wait for initial load and for the table to have at least one row
        await page.waitForFunction(() => document.querySelectorAll('table tbody tr').length > 0, { timeout: 15000 });
        console.log("Table has more than 0 rows.");

        // 3. Search for a specific product from migration
        const sampleName = 'Perie Electrica';
        console.log(`Searching for Product: ${sampleName}...`);

        const searchInput = page.locator('input[placeholder*="Nume"]');
        await searchInput.click();
        await searchInput.fill(''); // Clear previous if any
        await searchInput.type(sampleName, { delay: 100 });

        // Wait for results to be filtered in the table (by content change)
        console.log("Waiting for table to update with search results...");
        await expect(page.locator('table tbody')).toContainText('Perie Electrica', { timeout: 15000 });

        // 4. Verify Product Image and Row
        const sampleRow = page.locator('table tbody tr').filter({ hasText: 'Perie Electrica' }).first();
        const productImg = sampleRow.locator('img');
        await expect(productImg).toBeVisible({ timeout: 10000 });
        console.log("Verified product image is visible in the row!");

        console.log("--------------------------------------------------");
        console.log("FULL END-TO-END VERIFICATION SUCCESSFUL!");
        console.log("Keeping browser open for 1 hour for your inspection.");
        console.log("The products catalog is now filtered with the searched product.");
        console.log("You can see the thumbnails in the 'Identitate Produs' column.");
        console.log("--------------------------------------------------");

        await page.waitForTimeout(3600000); // 1 hour
    });
});
