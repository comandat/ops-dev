import { Module } from '@nestjs/common';
import { CustomerCore } from './customer.core';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
    imports: [PrismaModule, TenantModule],
    providers: [CustomerCore],
    exports: [CustomerCore],
})
export class CustomerCoreModule { }
