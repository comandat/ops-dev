import { Module } from '@nestjs/common';
import { OfferCore } from './offer.core';
import { OfferController } from './offer.controller';
import { OfferTemplateService } from './offer-template.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
    imports: [PrismaModule, TenantModule, ActivityModule],
    controllers: [OfferController],
    providers: [OfferCore, OfferTemplateService],
    exports: [OfferCore, OfferTemplateService],
})
export class OfferModule { }
