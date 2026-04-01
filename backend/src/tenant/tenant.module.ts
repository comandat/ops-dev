import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantContextService } from './tenant-context.service';
import { TenantBootstrapService } from './tenant-bootstrap.service';
import { TenantMiddleware } from './tenant.middleware';
import { TenantController } from './tenant.controller';

@Module({
  imports: [
    PrismaModule,
    // JwtModule needed by TenantMiddleware to decode tokens in SaaS mode
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'opensales-dev-secret',
    }),
  ],
  controllers: [TenantController],
  providers: [TenantContextService, TenantBootstrapService, TenantMiddleware],
  exports: [TenantContextService, TenantBootstrapService, TenantMiddleware],
})
export class TenantModule { }
