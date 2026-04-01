import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProductCoreModule } from '../product/product.module';
import { OrderCoreModule } from '../order/order.module';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
    imports: [PrismaModule, ProductCoreModule, OrderCoreModule, TenantModule],
    controllers: [DashboardController],
})
export class DashboardModule { }
