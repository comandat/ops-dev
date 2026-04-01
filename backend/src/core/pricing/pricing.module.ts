import { Module, Global } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { TenantModule } from '../../tenant/tenant.module';

@Global()
@Module({
    imports: [TenantModule],
    providers: [PricingService],
    controllers: [PricingController],
    exports: [PricingService],
})
export class PricingModule { }
