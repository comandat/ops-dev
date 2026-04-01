import { Controller, Get, Post, Body } from '@nestjs/common';
import { TenantBootstrapService } from './tenant-bootstrap.service';

/**
 * TenantController — Exposes tenant management endpoints.
 *
 * GET  /api/config          → Returns current mode and plan info (for frontend)
 * POST /api/tenants         → Create a new tenant (SaaS signup, guarded)
 */
@Controller()
export class TenantController {
    private readonly isSaaS = process.env.OPENSALES_MODE === 'saas';

    constructor(private bootstrap: TenantBootstrapService) { }

    /**
     * Frontend calls this on mount to know how to render.
     * Self-hosted: { mode: 'self-hosted', showBilling: false }
     * SaaS:        { mode: 'saas', showBilling: true }
     */
    @Get('api/config')
    getConfig() {
        return {
            mode: this.isSaaS ? 'saas' : 'self-hosted',
            showBilling: this.isSaaS,
            showTenantSwitcher: this.isSaaS,
            version: process.env.npm_package_version || '0.1.0',
        };
    }

    /**
     * SaaS: Create a new tenant during signup.
     * In self-hosted mode this is effectively a no-op (default tenant always exists).
     */
    @Post('api/tenants')
    createTenant(@Body() body: { name: string; plan?: string }) {
        return this.bootstrap.createTenant(body);
    }
}
