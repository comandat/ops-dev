import { test, expect } from '@playwright/test';

/**
 * UI AUTOMATION - SPRINT 3: Sales & Operations
 * Verifies navigation, filtering, and interaction within the Orders Management UI.
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

test.describe('Orders UI Management', () => {

    test('Full Order Lifecycle: Create, List, Edit', async ({ page, request }) => {
        const uniqueSuffix = Date.now().toString();
        const testEmail = `orders_qa_${uniqueSuffix}@qa.local`;

        // 1. Register a new user via UI to establish an isolated Tenant session
        await page.goto(`${FRONTEND_URL}/register`);
        await page.getByPlaceholder('Ex: Ion Popescu').fill('Orders QA Manager');
        await page.getByPlaceholder('nume@exemplu.com').fill(testEmail);
        await page.getByPlaceholder('••••••••').fill('ValidPassword123!');
        await page.getByRole('button', { name: 'Creează Cont' }).click();
        await expect(page).toHaveURL(`${FRONTEND_URL}/`, { timeout: 15000 });

        // Extract cookie for subsequent API seeds
        const cookies = await page.context().cookies();
        const sessionCookie = cookies.find(c => c.name === 'auth_session');
        const authCookie = sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : '';

        // 2. Seed a Product
        const prodRes = await request.post(`${API_URL}/api/products`, {
            headers: { 'Cookie': authCookie },
            data: {
                sku: `SKU-ORD-${uniqueSuffix}`,
                name: 'UI Test Product',
                price: 150.00,
                stock: 10,
            }
        });
        const product = await prodRes.json();

        // 3. Seed an Order
        const orderRes = await request.post(`${API_URL}/api/orders`, {
            headers: { 'Cookie': authCookie },
            data: {
                orderNumber: `UI-ORD-${uniqueSuffix}`,
                sourcePlugin: 'manual',
                status: 'NEW',
                total: 150.00,
                customerEmail: 'buyer@test.local',
                customerName: 'UI Buyer',
                items: [
                    {
                        productId: product.id,
                        productName: 'UI Test Product',
                        quantity: 1,
                        unitPrice: 150.00,
                    }
                ],
            }
        });
        const order = await orderRes.json();
        const orderId = order.id;

        // 4. Navigate to Orders List
        await page.goto(`${FRONTEND_URL}/orders`);

        // Verify header
        await expect(page.locator('h2')).toContainText('Comenzi');

        // Check if the seeded order number is in the table
        await expect(page.locator(`text=UI-ORD-${uniqueSuffix}`)).toBeVisible();
        await expect(page.locator('text=UI Buyer')).toBeVisible();

        // 5. Navigate and edit order details
        await page.locator(`text=UI-ORD-${uniqueSuffix}`).click();

        // Ensure we navigated to the detail page
        await expect(page).toHaveURL(new RegExp(`${FRONTEND_URL}/orders/${orderId}`));

        // Check order details header
        await expect(page.locator('h2')).toContainText(`UI-ORD-${uniqueSuffix}`);

        // Verify products are listed
        await expect(page.locator('text=UI Test Product')).toBeVisible();

        // Add a note
        const noteArea = page.getByPlaceholder('Adaugă note interne despre această comandă...');
        await noteArea.fill('Test internal note via Playwright');
        await page.getByRole('button', { name: 'Salvează Note' }).click();

        await expect(page.locator('text=Test internal note via Playwright')).toBeVisible();

        // Change status from NEW to PROCESSING via the step button.
        const processingBtn = page.locator('button[title="Marchează ca PROCESSING"]');
        await processingBtn.click();

        // Wait for the status indicator to update to 'PROCESSING'
        await expect(page.locator('span', { hasText: 'PROCESSING' }).last()).toBeVisible();
    });
});
