import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Infrastructure
import { PrismaModule } from './prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { EventBusModule } from './event-bus/event-bus.module';

// Auth
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/auth.middleware';

// Tenant (multi-tenancy)
import { TenantModule } from './tenant/tenant.module';
import { TenantMiddleware } from './tenant/tenant.middleware';

// Core Modules (business logic, tenant-scoped)
import { ProductCoreModule } from './core/product/product.module';
import { OrderCoreModule } from './core/order/order.module';
import { CustomerCoreModule } from './core/customer/customer.module';
import { DashboardModule } from './core/dashboard/dashboard.module';
import { OfferModule } from './core/offer/offer.module';
import { ActivityModule } from './core/activity/activity.module';
import { StorageModule } from './core/storage/storage.module';
import { NotificationModule } from './core/notification/notification.module';
import { PricingModule } from './core/pricing/pricing.module';
import { ImportExportModule } from './core/import-export/import-export.module';

// Plugin Engine (auto-discovery, lifecycle, hooks)
import { PluginEngineModule } from './plugin-engine/plugin-engine.module';

// Developer API
import { DeveloperApiModule } from './developer-api/developer-api.module';

@Module({
  imports: [
    // ─── Infrastructure ────────────────────────────
    PrismaModule,
    // BullModule.forRoot({
    //   connection: {
    //     host: process.env.REDIS_HOST || 'localhost',
    //     port: parseInt(process.env.REDIS_PORT || '6379', 10),
    //     enableOfflineQueue: false, // Fail fast if Redis is disconnected, do not hang requests
    //   },
    // }),
    EventBusModule,

    // ─── Auth ──────────────────────────────────────
    AuthModule,

    // ─── Tenant (must come before Core Modules) ────
    TenantModule,

    // ─── Core Modules (tenant-scoped) ─────────────
    ProductCoreModule,
    OrderCoreModule,
    CustomerCoreModule,
    DashboardModule,
    OfferModule,
    ActivityModule,
    StorageModule,
    NotificationModule,
    PricingModule,
    ImportExportModule,

    // ─── Plugin Engine ─────────────────────────────
    PluginEngineModule,

    // ─── Developer API ─────────────────────────────
    DeveloperApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  /**
   * Register middlewares:
   * 1. AuthMiddleware (populates req.user from session)
   * 2. TenantMiddleware (sets tenantId based on req.user)
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, TenantMiddleware)
      .forRoutes('*');
  }
}
