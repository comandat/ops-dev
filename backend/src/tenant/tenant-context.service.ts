import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * TenantContextService — Provides the current tenantId scoped to the active request.
 *
 * Uses Node.js AsyncLocalStorage so the tenantId flows automatically
 * through all async calls within a single request, without constructor injection.
 *
 * Usage in any service:
 *   const tenantId = this.tenantContext.getTenantId();
 *
 * Self-hosted mode: always returns 'default'
 * SaaS mode: returns the tenantId extracted from the JWT by TenantMiddleware
 */
@Injectable()
export class TenantContextService {
    private readonly storage = new AsyncLocalStorage<string>();

    /**
     * Get the tenantId for the current request.
     * Falls back to 'default' if called outside a request context (e.g., cron jobs).
     */
    getTenantId(): string {
        return this.storage.getStore() ?? 'default';
    }

    /**
     * Run a function within a specific tenant context.
     * Called by TenantMiddleware for each request.
     */
    run<T>(tenantId: string, fn: () => T): T {
        return this.storage.run(tenantId, fn) as T;
    }
}
