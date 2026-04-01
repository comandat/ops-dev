import { Module, Global } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { TenantModule } from '../../tenant/tenant.module';

@Global()
@Module({
    imports: [TenantModule],
    providers: [NotificationGateway, NotificationService],
    exports: [NotificationService],
})
export class NotificationModule { }
