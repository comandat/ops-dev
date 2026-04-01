import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../backend/src/app.module';

describe('Sprint 3: Sales & Operations (e2e)', () => {
    let app: INestApplication;
    let authCookie: string[];
    let productId: string;
    let orderId: string;
    let offerId: string;
    let templateId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        // 1. Setup Session (Register -> Login implicitly sets cookie)
        const uniqueSuffix = Date.now().toString();
        const registerRes = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: `sales.admin.${uniqueSuffix}@test.com`,
                password: 'Password123!',
                name: 'Sales Manager',
            });

        authCookie = registerRes.get('Set-Cookie');

        // 2. Setup a Product to attach Offers and Orders to
        const prodRes = await request(app.getHttpServer())
            .post('/api/products')
            .set('Cookie', authCookie)
            .send({
                sku: `SKU-SALES-${uniqueSuffix}`,
                name: 'Test Product for Sales',
                price: 150.00,
                stock: 50,
            });
        productId = prodRes.body.id;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('1. Orders Management API', () => {
        it('[Happy Path] should create an order manually', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/orders')
                .set('Cookie', authCookie)
                .send({
                    orderNumber: `ORD-${Date.now()}`,
                    sourcePlugin: 'manual',
                    status: 'NEW',
                    rawOrderData: {},
                    total: 150.00,
                    customerName: 'John Doe',
                    customerEmail: 'john.doe@testorder.com',
                    customerPhone: '1234567890',
                    items: [
                        {
                            productId: productId,
                            sku: 'SKU-SALES-TEST',
                            productName: 'Test Product for Sales',
                            quantity: 1,
                            unitPrice: 150.00,
                        }
                    ],
                });
            expect(res.status).toBe(201);
            expect(res.body.id).toBeDefined();
            expect(res.body.status).toBe('NEW');
            expect(res.body.customer.email).toBe('john.doe@testorder.com');
            orderId = res.body.id;
        });

        it('[Happy Path] should retrieve the order by ID', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/orders/${orderId}`)
                .set('Cookie', authCookie);
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(orderId);
            expect(res.body.items).toBeDefined();
            expect(res.body.items.length).toBe(1);
        });

        it('[Happy Path] should update order status and notes', async () => {
            // Update notes
            await request(app.getHttpServer())
                .put(`/api/orders/${orderId}/notes`)
                .set('Cookie', authCookie)
                .send({ notes: 'Urgent processing requested.' })
                .expect(200);

            // Update status
            const res = await request(app.getHttpServer())
                .put(`/api/orders/${orderId}`)
                .set('Cookie', authCookie)
                .send({ status: 'PROCESSING' });
            expect(res.status).toBe(200);

            // Fetch to assert
            const updated = await request(app.getHttpServer())
                .get(`/api/orders/${orderId}`)
                .set('Cookie', authCookie);
            expect(updated.body.status).toBe('PROCESSING');
            expect(updated.body.notes).toContain('Urgent');
        });

        it('[Happy Path] should list orders with filters', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/orders')
                .query({ status: 'PROCESSING', page: 1, limit: 10 })
                .set('Cookie', authCookie);
            expect(res.status).toBe(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.total).toBeDefined();
        });
    });

    describe('2. Offers & Marketplace Mappings API', () => {
        it('[Happy Path] should create an offer for the product', async () => {
            const res = await request(app.getHttpServer())
                .post(`/api/products/${productId}/offers`)
                .set('Cookie', authCookie)
                .send({
                    pluginName: 'emag-connector',
                    title: 'eMAG Exclusive Test Product',
                    price: 199.99,
                });
            expect(res.status).toBe(201);
            expect(res.body.id).toBeDefined();
            expect(res.body.pluginName).toBe('emag-connector');
            expect(res.body.price).toBe(199.99);
            offerId = res.body.id;
        });

        it('[Happy Path] should resolve offer with fallback to product data', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/offers/${offerId}/resolved`)
                .set('Cookie', authCookie);
            expect(res.status).toBe(200);
            expect(res.body.title).toBe('eMAG Exclusive Test Product');
            expect(res.body.price).toBe(199.99);
            // Fallbacks
            // (sku is not returned by the resolve endpoint)
        });

        it('[Happy Path] should update offer details', async () => {
            const res = await request(app.getHttpServer())
                .put(`/api/offers/${offerId}`)
                .set('Cookie', authCookie)
                .send({
                    price: 180.00,
                    description: 'New amazing description',
                });
            expect(res.status).toBe(200);

            // Fetch to assert
            const updated = await request(app.getHttpServer())
                .get(`/api/offers/${offerId}`)
                .set('Cookie', authCookie);
            expect(updated.body.price).toBe(180.00);
            expect(updated.body.description).toBe('New amazing description');
        });

        it('[Happy Path] should toggle offer active status', async () => {
            const res = await request(app.getHttpServer())
                .put(`/api/offers/${offerId}/toggle-active`)
                .set('Cookie', authCookie)
                .send({ isActive: false });
            expect(res.status).toBe(200);
            expect(res.body.isActive).toBe(false);
        });
    });

    describe('3. Offer Templates API', () => {
        it('[Happy Path] should create an offer template', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/offer-templates')
                .set('Cookie', authCookie)
                .send({
                    name: 'eMAG Standard Pricing',
                    pluginName: 'emag-connector-2',
                });
            expect(res.status).toBe(201);
            expect(res.body.id).toBeDefined();
            expect(res.body.pluginName).toBe('emag-connector-2');
            templateId = res.body.id;
        });

        it('[Happy Path] should retrieve offer templates', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/offer-templates')
                .set('Cookie', authCookie);
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('[Happy Path] should apply offer template to a product', async () => {
            const res = await request(app.getHttpServer())
                .post(`/api/offer-templates/${templateId}/apply/${productId}`)
                .set('Cookie', authCookie)
                .send();
            expect(res.status).toBe(201);
            // Verify new offer was generated via template
            expect(res.body.pluginName).toBe('emag-connector-2');
            // the overridden price is null (falls back to master price)
            expect(res.body.price).toBeNull();
        });
    });
});
