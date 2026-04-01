import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from './tenant-context.service';
import type { User } from 'lucia';
import './../auth/auth.lucia'; // Ensure module augmentation is loaded

/**
 * TenantMiddleware — Extracts tenantId from request and stores in TenantContextService.
 * Now uses req.user (populated by AuthMiddleware) instead of raw JWT parsing.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
    private readonly logger = new Logger(TenantMiddleware.name);
    private get isSaaS() {
        return process.env.OPENSALES_MODE === 'saas';
    }

    constructor(
        private tenantContext: TenantContextService,
    ) { }

    use(req: Request, res: Response, next: NextFunction) {
        let tenantId = 'default';

        if (this.isSaaS && req.user) {
            console.log("TenantMiddleware Debug:", { isSaaS: this.isSaaS, env: process.env.OPENSALES_MODE, user: req.user });
            // In SaaS mode, use the tenantId stored in the validated Lucia user object
            tenantId = (req.user as any).tenantId || 'default';
        }
        else {
            console.log("TenantMiddleware Debug (No SaaS or No User):", { isSaaS: this.isSaaS, env: process.env.OPENSALES_MODE, user: req.user });
        }

        // Run the rest of the request inside the tenant context
        this.tenantContext.run(tenantId, () => next());
    }
}
