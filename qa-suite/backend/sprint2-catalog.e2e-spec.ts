import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../backend/src/app.module';
import { PrismaService } from '../../backend/src/prisma/prisma.service';

/**
 * QA AUTOMATION SCRIPT - SPRINT 2: Catalog & Inventory
 * This suite verifies the Product CRUD operations, inventory modifications, and ensures data validation.
 */
describe('Sprint 2: Catalog & Inventory Management (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    const validUser = { email: 'catalog_qa@qa.local', password: 'ValidPassword123!', name: 'Catalog Admin' };
    let sessionCookie: string;
    let testProductId: string;

    beforeAll(async () => {
        process.env.DATABASE_URL = "file:C:/Users/titam/Documents/Zebra Printer Test/OpenSales/backend/prisma/test.db";
        process.env.OPENSALES_MODE = 'saas';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
        await app.init();

        prisma = app.get<PrismaService>(PrismaService);

        // Reset Sandbox
        if (prisma && prisma.user) {
            await prisma.user.deleteMany({ where: { email: { contains: '@qa.local' } } });
        }
        if (prisma && prisma.product) {
            await prisma.product.deleteMany({ where: { name: { contains: 'QA_CATALOG' } } });
        }

        // Register & Login QA User
        await request(app.getHttpServer()).post('/auth/register').send(validUser);
        const loginRes = await request(app.getHttpServer()).post('/auth/login').send({ email: validUser.email, password: validUser.password });
        sessionCookie = loginRes.headers['set-cookie'][0];
    });

    afterAll(async () => {
        if (prisma && prisma.user) {
            try { await prisma.user.deleteMany({ where: { email: { contains: '@qa.local' } } }); } catch (e) { }
        }
        if (prisma && prisma.product) {
            try { await prisma.product.deleteMany({ where: { name: { contains: 'QA_CATALOG' } } }); } catch (e) { }
        }
        if (app) {
            await app.close();
        }
    });

    describe('1. Product Creation & Validation', () => {
        it('[Negative] should reject missing required fields', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/products')
                .set('Cookie', sessionCookie)
                .send({
                    name: 'QA_CATALOG_MISSING_PRICE'
                    // Missing price, sku
                });
            expect(res.status).toBe(400);
        });

        it('[Happy Path] should successfully create a valid product', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/products')
                .set('Cookie', sessionCookie)
                .send({
                    name: 'QA_CATALOG_PRODUCT_1',
                    sku: 'QA-CAT-001',
                    price: 250,
                    stock: 50,
                    description: 'A valid test product for the catalog QA suite.'
                });

            expect(res.status).toBe(201);
            expect(res.body.id).toBeDefined();
            expect(res.body.name).toBe('QA_CATALOG_PRODUCT_1');
            testProductId = res.body.id;
        });
    });

    describe('2. Catalog Read & Filtering Operations', () => {
        it('[Happy Path] should retrieve the created product by ID', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/products/${testProductId}`)
                .set('Cookie', sessionCookie);

            expect(res.status).toBe(200);
            expect(res.body.sku).toBe('QA-CAT-001');
        });

        it('[Happy Path] should retrieve the catalog list with pagination variables', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/products?page=1&limit=10')
                .set('Cookie', sessionCookie);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.meta).toBeDefined();
        });
    });

    describe('3. Product Updates & Inventory Modifications', () => {
        it('[Happy Path] should properly update the product price and stock', async () => {
            const res = await request(app.getHttpServer())
                .put(`/api/products/${testProductId}`)
                .set('Cookie', sessionCookie)
                .send({
                    price: 200,
                    stock: 45
                });

            expect(res.status).toBe(200);
            expect(res.body.count).toBe(1); // Prisma updateMany returns { count }

            // Verify changes persisted
            const verifyReq = await request(app.getHttpServer())
                .get(`/api/products/${testProductId}`)
                .set('Cookie', sessionCookie);
            expect(verifyReq.body.price).toBe(200);
            expect(verifyReq.body.stock).toBe(45);
        });

        it('[Negative] should return 404/Not Found for updates on invalid IDs', async () => {
            const res = await request(app.getHttpServer())
                .put('/api/products/invalid-or-unauthorized-id')
                .set('Cookie', sessionCookie)
                .send({ price: 999 });

            expect(res.status).toBe(404);
        });
    });

    describe('4. Deletion Workflows', () => {
        it('[Negative] should return 404 when attempting to delete a non-existent product', async () => {
            const res = await request(app.getHttpServer())
                .delete('/api/products/non-existent-12345')
                .set('Cookie', sessionCookie);

            expect(res.status).toBe(404);
        });

        it('[Happy Path] should properly delete the owned product', async () => {
            const res = await request(app.getHttpServer())
                .delete(`/api/products/${testProductId}`)
                .set('Cookie', sessionCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify it is gone
            const verifyDelete = await request(app.getHttpServer())
                .get(`/api/products/${testProductId}`)
                .set('Cookie', sessionCookie);

            expect(verifyDelete.status).toBe(404);
        });
    });
});
