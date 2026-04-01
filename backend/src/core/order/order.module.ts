import { Module } from '@nestjs/common';
import { OrderCore } from './order.core';
import { OrderController } from './order.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventBusModule } from '../../event-bus/event-bus.module';
import { HookService } from '../../plugin-engine/hooks/hook.service';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
    imports: [PrismaModule, EventBusModule, TenantModule],
    controllers: [OrderController],
    providers: [OrderCore, HookService],
    exports: [OrderCore],
})
export class OrderCoreModule { }
