import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductCore } from '../product/product.core';
import { OrderCore } from '../order/order.core';
import { TenantContextService } from '../../tenant/tenant-context.service';

/**
 * DashboardController — Returns aggregated stats for the frontend dashboard.
 *
 * GET /api/dashboard/stats → KPIs, recent orders, revenue chart data
 */
@Controller('api/dashboard')
export class DashboardController {
    constructor(
        private prisma: PrismaService,
        private productCore: ProductCore,
        private orderCore: OrderCore,
        private tenantContext: TenantContextService,
    ) { }

    @Get('stats')
    async getStats() {
        const tenantId = this.tenantContext.getTenantId();

        const [
            totalProducts,
            lowStockCount,
            totalOrders,
            statusCounts,
            recentOrdersResult,
            syncedMappings,
            todayOrders,
        ] = await Promise.all([
            this.productCore.countAll(),
            this.productCore.countLowStock(),
            this.prisma.order.count({ where: { tenantId } }),
            this.orderCore.countByStatus(),
            this.orderCore.findAll({ page: 1, limit: 5, sortBy: 'createdAt', sortDir: 'desc' }),
            this.prisma.externalProductMapping.count({ where: { tenantId } }),
            this.prisma.order.count({
                where: {
                    tenantId,
                    createdAt: { gte: this.startOfToday() },
                },
            }),
        ]);

        // Revenue last 7 days
        const revenue7d = await this.getRevenue7d(tenantId);

        return {
            kpis: {
                newOrdersToday: todayOrders,
                totalProducts,
                lowStockProducts: lowStockCount,
                syncedMappings,
                totalOrders,
            },
            statusBreakdown: statusCounts,
            recentOrders: recentOrdersResult.data,
            revenue7d,
        };
    }

    private startOfToday(): Date {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }

    private async getRevenue7d(tenantId: string) {
        const days: Array<{ date: string; total: number; count: number }> = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const start = new Date(date); start.setHours(0, 0, 0, 0);
            const end = new Date(date); end.setHours(23, 59, 59, 999);

            const result = await this.prisma.order.aggregate({
                where: { tenantId, createdAt: { gte: start, lte: end } },
                _sum: { total: true },
                _count: true,
            });

            days.push({
                date: start.toISOString().split('T')[0],
                total: result._sum?.total ?? 0,
                count: result._count ?? 0,
            });
        }

        return days;
    }
}
