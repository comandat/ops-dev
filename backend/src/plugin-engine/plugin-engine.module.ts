import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { ProductCoreModule } from '../core/product/product.module';
import { OrderCoreModule } from '../core/order/order.module';
import { CustomerCoreModule } from '../core/customer/customer.module';
import { TenantModule } from '../tenant/tenant.module';
import { OfferModule } from '../core/offer/offer.module';

// Engine services
import { HookService } from './hooks/hook.service';
import { CoreContextFactory } from './context/core-context.factory';
import { PluginValidator } from './discovery/plugin-validator.service';
import { PluginDiscoveryService } from './discovery/plugin-discovery.service';
import { CapabilityRouter } from './lifecycle/capability-router.service';
import { EventProcessor } from './lifecycle/event-processor';
import { CronScheduler } from './lifecycle/cron-scheduler.service';
import { PluginEngineController } from './plugin-engine.controller';

@Module({
    imports: [
        PrismaModule,
        EventBusModule,
        ProductCoreModule,
        OrderCoreModule,
        CustomerCoreModule,
        TenantModule,
        OfferModule,
        // BullModule.registerQueue({ name: 'core-events' }),
    ],
    controllers: [PluginEngineController],
    providers: [
        // Layer 1: Hooks (synchronous, in-process)
        HookService,
        // Layer 2: Context factory (proxy to Core Modules)
        CoreContextFactory,
        // Layer 3: Capability-based event routing
        CapabilityRouter,
        // Layer 4: BullMQ worker — consumes events from Redis
        // EventProcessor,
        // Layer 5: Cron — calls getOrders() automatically
        CronScheduler,
        // Layer 6: Validation + Discovery
        PluginValidator,
        PluginDiscoveryService,
    ],
    exports: [PluginDiscoveryService, HookService, CapabilityRouter, CronScheduler],
})
export class PluginEngineModule { }
