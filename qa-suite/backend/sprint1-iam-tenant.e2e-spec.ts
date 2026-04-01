import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
// @ts-ignore
import { App } from 'supertest/types';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { AppModule } from '../../backend/src/app.module';
import { PrismaService } from '../../backend/src/prisma/prisma.service';

/**
 * QA AUTOMATION SCRIPT - SPRINT 1: IAM & Multi-Tenancy Core
 * This suite executes BVA, Equivalent Partitioning, Negative Testing, and Security Checks.
 */
describe('Sprint 1: IAM & Multi-Tenancy (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Test Data
    const validTenant1User = { email: 'tenant1@qa.local', password: 'ValidPassword123!', name: 'T1 Owner' };
    const validTenant2User = { email: 'tenant2@qa.local', password: 'ValidPassword123!', name: 'T2 Owner' };
    let t1SessionCookie: string;
    let t2SessionCookie: string;
    let t1ProductId: string;

    beforeAll(async () => {
        // Ensure Database URL and SaaS mode are available for tests
        process.env.DATABASE_URL = "file:C:/Users/titam/Documents/Zebra Printer Test/OpenSales/backend/prisma/test.db";
        process.env.OPENSALES_MODE = 'saas';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // We expect the app to have global validation pipes to prevent garbage data
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

        await app.init();

        prisma = app.get<PrismaService>(PrismaService);
        // QA Sandbox Reset - Safe check
        if (prisma && prisma.user) {
            await prisma.user.deleteMany({ where: { email: { contains: '@qa.local' } } });
        }
        if (prisma && prisma.product) {
            await prisma.product.deleteMany({ where: { name: { contains: 'QA_ISOLATION' } } });
        }
    });

    afterAll(async () => {
        if (prisma && prisma.user) {
            try { await prisma.user.deleteMany({ where: { email: { contains: '@qa.local' } } }); } catch (e) { }
        }
        if (prisma && prisma.product) {
            try { await prisma.product.deleteMany({ where: { name: { contains: 'QA_ISOLATION' } } }); } catch (e) { }
        }
        if (app) {
            await app.close();
        }
    });

    describe('1. Registration - Boundary Value Analysis (BVA) & Validation', () => {
        it('[Negative] should reject missing email (Null data check)', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ password: 'valid', name: 'No Email' });

            // Expected 400 Bad Request if DTO is robust
            expect(res.status).toBe(400);
        });

        it('[Negative] should reject extremely short password (BVA < 8 chars)', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'short@qa.local', password: '123', name: 'Short' });

            expect(res.status).toBe(400);
        });

        it('[Negative] should reject malformed email - Injection attempt', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'admin" OR 1=1--', password: 'ValidPassword123!', name: 'Hacker' });

            expect(res.status).toBe(400);
        });
    });

    describe('2. Security Checks - Object Assignment & Business Logic', () => {
        it('[Happy Path] should register successfully with valid data', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .send(validTenant1User);

            expect(res.status).toBe(201);
            // Ensure session is set
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('[Negative] Mass Assignment: Should ignore role elevation', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                    email: 'hacker@qa.local',
                    password: 'ValidPassword123!',
                    name: 'Hacker',
                    role: 'SUPER_ADMIN', // Attempting to elevate privilege
                    tenantId: 'admin_tenant'
                });

            expect(res.status).toBe(201);

            // We check DB directly to see if the vulnerability was exploited
            const user = await prisma.user.findUnique({ where: { email: 'hacker@qa.local' } });
            expect(user!.role).not.toBe('SUPER_ADMIN');
            expect(user!.tenantId).not.toBe('admin_tenant'); // Expect system to override malicious input
        });
    });

    describe('3. Multi-Tenancy Isolation (BOLA/IDOR check)', () => {
        beforeAll(async () => {
            console.log("Logging in T1...");
            // Login T1
            const res1 = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: validTenant1User.email, password: validTenant1User.password });
            t1SessionCookie = res1.headers['set-cookie'][0];
            console.log("T1 Logged in.", t1SessionCookie);

            console.log("Registering T2...");
            // Register & Login T2
            await request(app.getHttpServer()).post('/auth/register').send(validTenant2User);
            console.log("Logging in T2...");
            const res2 = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: validTenant2User.email, password: validTenant2User.password });
            t2SessionCookie = res2.headers['set-cookie'][0];
            console.log("T2 Logged in.", t2SessionCookie);

            console.log("T1 creating product...");
            // T1 creates a product
            const prodRes = await request(app.getHttpServer())
                .post('/api/products')
                .set('Cookie', t1SessionCookie)
                .send({
                    name: 'QA_ISOLATION_PRODUCT',
                    sku: 'QA-123',
                    price: 100,
                    type: 'standard',
                    status: 'active'
                });
            console.log("Product created with status:", prodRes.status);
            t1ProductId = prodRes.body.id;
        });

        it('[Happy Path] T1 should see their own product', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/products')
                .set('Cookie', t1SessionCookie);

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual(expect.arrayContaining([
                expect.objectContaining({ id: t1ProductId })
            ]));
        });

        it('[Security BOLA] T2 should NOT see T1s product in list', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/products')
                .set('Cookie', t2SessionCookie);

            expect(res.status).toBe(200);
            const findProduct = res.body.data.find((p: any) => p.id === t1ProductId);
            // T2 accessing list should completely filter out T1 data
            expect(findProduct).toBeUndefined();
        });

        it('[Security IDOR] T2 should NOT be able to request T1s product directly by ID', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/products/${t1ProductId}`)
                .set('Cookie', t2SessionCookie);

            // Product isolated. System should act like it doesn't exist
            expect(res.status).toBe(404);
        });

        it('[Security IDOR] T2 should NOT be able to delete T1s product', async () => {
            const res = await request(app.getHttpServer())
                .delete(`/api/products/${t1ProductId}`)
                .set('Cookie', t2SessionCookie);

            // Unauthorized or Not Found. Any success is critical failure.
            expect(res.status).not.toBe(200);
        });
    });
});
