import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * TenantBootstrapService — Ensures a 'default' tenant always exists.
 *
 * In self-hosted mode, runs once at startup and creates the default tenant
 * if it doesn't exist yet. This means fresh installs work out-of-the-box
 * with zero configuration.
 *
 * In SaaS mode this still runs but the 'default' tenant is ignored
 * (each real customer will have their own tenant created via signup).
 */
@Injectable()
export class TenantBootstrapService implements OnModuleInit {
    private readonly logger = new Logger(TenantBootstrapService.name);
    private readonly isSaaS = process.env.OPENSALES_MODE === 'saas';

    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit() {
        await this.ensureDefaultTenant();

        if (!this.isSaaS) {
            this.logger.log('[Bootstrap] Running in SELF-HOSTED mode. Single tenant: default');
        } else {
            this.logger.log('[Bootstrap] Running in SAAS mode. Multi-tenant active.');
        }
    }

    private async ensureDefaultTenant() {
        const exists = await this.prisma.tenant.findUnique({ where: { id: 'default' } });
        if (!exists) {
            await this.prisma.tenant.create({
                data: {
                    id: 'default',
                    name: 'Default',
                    plan: 'self-hosted',
                    isActive: true,
                },
            });
            this.logger.log('[Bootstrap] Created default tenant');
        }
    }

    /**
     * Create a new tenant (SaaS: called during customer signup).
     */
    async createTenant(data: { name: string; plan?: string }): Promise<{ id: string; name: string; plan: string }> {
        const tenant = await this.prisma.tenant.create({
            data: {
                name: data.name,
                plan: data.plan || 'free',
            },
        });
        this.logger.log(`[Bootstrap] Created tenant: ${tenant.id} (${tenant.name})`);
        return tenant;
    }
}
