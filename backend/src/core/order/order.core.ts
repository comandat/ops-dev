import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EventBusService } from '../../event-bus/event-bus.service';
import { HookService } from '../../plugin-engine/hooks/hook.service';
import { TenantContextService } from '../../tenant/tenant-context.service';

// ─── Domain Types ────────────────────────────────────────────────────────────

export type OrderStatus =
    | 'NEW'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';

export interface CreateOrderInput {
    orderNumber: string;
    status: OrderStatus;
    total: number;
    sourcePlugin: string;
    externalId: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    items?: CreateOrderItemInput[];
}

export interface CreateOrderItemInput {
    productName: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    productId?: string;
}

export interface OrderFilters {
    search?: string;
    status?: OrderStatus;
    sourcePlugin?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;
const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_SORT_DIR = 'desc';
const INITIAL_ORDER_NOTE = 'Order created';

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class OrderCore {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventBus: EventBusService,
        private readonly hooks: HookService,
        private readonly tenantContext: TenantContextService,
    ) { }

    private get tenantId(): string {
        return this.tenantContext.getTenantId();
    }

    // ─── Queries ─────────────────────────────────────────────────────────────

    async findAll(filters: OrderFilters = {}) {
        const page = filters.page ?? DEFAULT_PAGE;
        const limit = filters.limit ?? DEFAULT_LIMIT;
        const skip = (page - 1) * limit;

        const where = this.buildOrderWhereClause(filters);
        const orderBy = this.buildOrderByClause(filters);

        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: { customer: true, items: true },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }

    async findById(id: string) {
        return this.prisma.order.findFirst({
            where: { id, tenantId: this.tenantId },
            include: {
                customer: true,
                items: { include: { product: true } },
                history: { orderBy: { createdAt: 'desc' } },
            },
        });
    }

    async existsByExternalId(externalId: string, pluginName: string): Promise<boolean> {
        const count = await this.prisma.order.count({
            where: { externalId, sourcePlugin: pluginName, tenantId: this.tenantId },
        });
        return count > 0;
    }

    async countByStatus(): Promise<Record<string, number>> {
        const groups = await this.prisma.order.groupBy({
            by: ['status'],
            where: { tenantId: this.tenantId },
            _count: true,
        });
        return Object.fromEntries(groups.map(g => [g.status, g._count]));
    }

    // ─── Mutations ───────────────────────────────────────────────────────────

    async create(input: CreateOrderInput) {
        const processed = await this.hooks.run('order.beforeCreate', input) as CreateOrderInput;

        const customerId = processed.customerEmail
            ? await this.upsertCustomerAndGetId(processed)
            : null;

        const order = await this.prisma.order.create({
            data: {
                tenantId: this.tenantId,
                orderNumber: processed.orderNumber,
                status: processed.status ?? 'NEW',
                total: processed.total,
                sourcePlugin: processed.sourcePlugin,
                externalId: processed.externalId,
                customerId,
                items: processed.items?.length
                    ? { create: processed.items.map(this.mapItemToCreateInput) }
                    : undefined,
            },
            include: { items: true, customer: true },
        });

        await this.decrementStockForOrderItems(processed.items ?? []);
        await this.logStatusHistory(order.id, order.status, INITIAL_ORDER_NOTE);

        await this.eventBus.emit('order.created', order);
        await this.hooks.run('order.afterCreate', order);
        return order;
    }

    async updateStatus(id: string, status: OrderStatus, note?: string) {
        await this.hooks.run('order.beforeStatusChange', { orderId: id, newStatus: status });

        if (status === 'CANCELLED') {
            await this.restoreStockForOrder(id);
        }

        await this.prisma.order.updateMany({
            where: { id, tenantId: this.tenantId },
            data: { status },
        });

        await this.logStatusHistory(id, status, note ?? null);

        await this.eventBus.emit('order.updated', { orderId: id, newStatus: status });
        await this.hooks.run('order.afterStatusChange', { orderId: id, newStatus: status });
    }

    async updateStatusBatch(ids: string[], status: OrderStatus) {
        for (const id of ids) {
            await this.updateStatus(id, status);
        }
    }

    async updateNotes(id: string, notes: string) {
        return this.prisma.order.updateMany({
            where: { id, tenantId: this.tenantId },
            data: { notes },
        });
    }

    async update(id: string, patch: Prisma.OrderUpdateInput) {
        const result = await this.prisma.order.updateMany({
            where: { id, tenantId: this.tenantId },
            data: patch,
        });

        if (patch.status) {
            await this.eventBus.emit('order.updated', { orderId: id, newStatus: patch.status });
        }

        return result;
    }

    async remove(id: string) {
        return this.prisma.order.deleteMany({
            where: { id, tenantId: this.tenantId },
        });
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private async upsertCustomerAndGetId(input: CreateOrderInput): Promise<string> {
        const displayName = input.customerName || input.customerEmail!;
        const customer = await this.prisma.customer.upsert({
            where: {
                tenantId_email: {
                    tenantId: this.tenantId,
                    email: input.customerEmail!,
                },
            },
            update: { name: displayName, phone: input.customerPhone },
            create: {
                tenantId: this.tenantId,
                email: input.customerEmail!,
                name: displayName,
                phone: input.customerPhone,
            },
        });
        return customer.id;
    }

    private mapItemToCreateInput(item: CreateOrderItemInput) {
        return {
            productName: item.productName,
            sku: item.sku ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            productId: item.productId ?? null,
        };
    }

    private async decrementStockForOrderItems(items: CreateOrderItemInput[]) {
        const linkedItems = items.filter(item => item.productId);
        await Promise.all(
            linkedItems.map(item =>
                this.prisma.product.updateMany({
                    where: { id: item.productId!, tenantId: this.tenantId },
                    data: { stock: { decrement: item.quantity } },
                }),
            ),
        );
    }

    private async restoreStockForOrder(orderId: string) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId: this.tenantId },
            include: { items: true },
        });

        const linkedItems = order?.items?.filter(item => item.productId) ?? [];
        await Promise.all(
            linkedItems.map(item =>
                this.prisma.product.updateMany({
                    where: { id: item.productId!, tenantId: this.tenantId },
                    data: { stock: { increment: item.quantity } },
                }),
            ),
        );
    }

    private async logStatusHistory(orderId: string, status: string, note: string | null) {
        await this.prisma.orderStatusHistory.create({
            data: { orderId, status, note },
        });
    }

    private buildOrderWhereClause(filters: OrderFilters): Prisma.OrderWhereInput {
        const where: Prisma.OrderWhereInput = { tenantId: this.tenantId };

        if (filters.status) where.status = filters.status;
        if (filters.sourcePlugin) where.sourcePlugin = filters.sourcePlugin;
        if (filters.search) {
            where.OR = [
                { orderNumber: { contains: filters.search } },
                { customer: { name: { contains: filters.search } } },
                { customer: { email: { contains: filters.search } } },
            ];
        }

        return where;
    }

    private buildOrderByClause(filters: OrderFilters): Prisma.OrderOrderByWithRelationInput {
        const field = filters.sortBy ?? DEFAULT_SORT_BY;
        const direction = filters.sortDir ?? DEFAULT_SORT_DIR;
        return { [field]: direction };
    }
}
