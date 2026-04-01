import { Module } from '@nestjs/common';
import { ProductCore } from './product.core';
import { ProductController } from './product.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventBusModule } from '../../event-bus/event-bus.module';
import { HookService } from '../../plugin-engine/hooks/hook.service';
import { TenantModule } from '../../tenant/tenant.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
    imports: [PrismaModule, EventBusModule, TenantModule, ActivityModule],
    controllers: [ProductController],
    providers: [ProductCore, HookService],
    exports: [ProductCore],
})
export class ProductCoreModule { }
