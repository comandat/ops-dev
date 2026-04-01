import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContextService } from '../../tenant/tenant-context.service';

export type ActivityLevel = 'info' | 'warn' | 'error' | 'success';

export interface ActivityFilters {
    source?: string;
    level?: ActivityLevel | 'all';
    action?: string;
    page?: number;
    limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

@Injectable()
export class ActivityService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
    ) { }

    private get tenantId(): string {
        return this.tenantContext.getTenantId();
    }

    async log(
        source: string,
        action: string,
        details?: string,
        level: ActivityLevel = 'info',
    ) {
        try {
            await this.prisma.activityLog.create({
                data: {
                    tenantId: this.tenantId,
                    source,
                    action,
                    details: details ?? null,
                    level,
                },
            });
        } catch {
            // Never throw — logging must not break the caller
        }
    }

    async findAll(filters: ActivityFilters = {}) {
        const page = filters.page ?? DEFAULT_PAGE;
        const limit = filters.limit ?? DEFAULT_LIMIT;
        const skip = (page - 1) * limit;

        const where = this.buildWhereClause(filters);

        const [data, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.activityLog.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }

    async getRecentErrors(limit = 10) {
        return this.prisma.activityLog.findMany({
            where: { tenantId: this.tenantId, level: 'error' },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private buildWhereClause(filters: ActivityFilters): Prisma.ActivityLogWhereInput {
        const where: Prisma.ActivityLogWhereInput = { tenantId: this.tenantId };

        if (filters.source) {
            where.source = { contains: filters.source };
        }

        if (filters.level && filters.level !== 'all') {
            where.level = filters.level;
        }

        if (filters.action) {
            where.action = { contains: filters.action };
        }

        return where;
    }
}
